const textToSpeech = require('@google-cloud/text-to-speech');
const parsed_for_tts = require('./parsed_for_tts.js')
const fs = require('fs');

//--------------------------------------------------------------------------------------- DATA

// --------------------------- CREDENTIALS
process.env.GOOGLE_APPLICATION_CREDENTIALS = __dirname + '/google_credentials.json'

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

// --------------------------- SAVE DATA
const audio_dir = __dirname + '/audio_data'
if (!fs.existsSync(audio_dir)) fs.mkdirSync(audio_dir)

// --------------------------- CLIENT
const client = new textToSpeech.TextToSpeechClient();

//--------------------------------------------------------------------------------------- METHODS

async function tts(text, voice) {
    const request = {
        input: { text },
        voice: { ...voice, languageCode: voice.languageCodes[0] },
        audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent
}

async function create_tts_file(text, voice_name, lang) {
    const voice = used_voices[voice_name][lang]
    const sent_text = parsed_for_tts(text)
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

module.exports = { create_tts_file, init_eraser, audio_dir, used_voices }