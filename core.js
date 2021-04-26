const textToSpeech = require('@google-cloud/text-to-speech');
const parsed_for_tts = require('./parsed_for_tts.js')
// const translator = require('deepl')
const translator = require('./deepL')
const fs = require('fs');

//--------------------------------------------------------------------------------------- DATA

// --------------------------- CREDENTIALS
process.env.GOOGLE_APPLICATION_CREDENTIALS = __dirname + '/google_credentials.json'
const { auth_key } = require('./deepL_credentials.json')

// --------------------------- VOICES
const voices = require('./voices.json')
const langs = ['fr-FR', 'en-US']
const used_voices = Object.fromEntries([...'ABCDE'].map(name => [
    name,
    Object.fromEntries(langs.map(lang => [
        lang,
        voices.find(v => v.name.includes(`${lang}-Wavenet-${name}`))
    ]))
]))
const deepl_lang_map = {
    'fr-FR': 'FR',
    'en-US': 'EN'
}
// --------------------------- SAVE DATA
const audio_dir = __dirname + '/audio_data'
if (!fs.existsSync(audio_dir)) fs.mkdirSync(audio_dir)

const quotas_dir = __dirname + '/quotas_data'
if (!fs.existsSync(quotas_dir)) fs.mkdirSync(quotas_dir)

// --------------------------- CLIENT
const client = new textToSpeech.TextToSpeechClient();

//--------------------------------------------------------------------------------------- METHODS

function quotas_path(key) {
    return `${quotas_dir}/${key}.json`
}

function set_quotas(key, text, force_translate) {
    const length = text.length
    const path = quotas_path(key)
    if (!fs.existsSync(path)) fs.writeFileSync(path, '[]')
    const quotas_data = JSON.parse(fs.readFileSync(path))
    quotas_data.push({ key, length, force_translate, date: Date.now() })
    fs.writeFileSync(path, JSON.stringify(quotas_data))
}

function get_quotas(key) {
    const path = quotas_path(key)
    return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : []
}

async function tts(text, voice) {
    const request = {
        input: { text },
        voice: { ...voice, languageCode: voice.languageCodes[0] },
        audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent
}

async function translate(text, lang) {
    const target_lang = deepl_lang_map[lang]
    const results = await translator({ free_api: true, text, target_lang, auth_key })
    // return results.data.translations[0].text
    return results
}

async function create_tts_file(text, voice_name, lang, force_translate, key) {
    const voice = used_voices[voice_name][lang]
    let sent_text = parsed_for_tts(text)
    if (force_translate) sent_text = await translate(sent_text, lang)
    set_quotas(key, sent_text, force_translate)
    const sound_bin = await tts(sent_text, voice)
    const file_name = `${Date.now() + '-' + parseInt(Math.random() * 100000)}.mp3`
    const path = `${audio_dir}/${file_name}`
    fs.writeFileSync(path, sound_bin)
    return file_name
}

function init_eraser(time_to_delete_ms, time_to_check = time_to_delete_ms) {
    function erase() {
        const now = Date.now()
        const sound_files = fs.readdirSync(audio_dir)
        sound_files
            .filter(file => (now - parseInt(file.split('-').shift())) > time_to_delete_ms)
            .forEach(file => fs.unlinkSync(`${audio_dir}/${file}`))
    }
    setInterval(erase, time_to_check)
}

//--------------------------------------------------------------------------------------- EXPORTS

module.exports = { create_tts_file, init_eraser, get_quotas, audio_dir, used_voices }