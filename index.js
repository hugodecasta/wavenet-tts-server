const { create_tts_file, init_eraser, get_quotas, audio_dir, used_voices } = require('./core')
const key_manager = require('./key_manager')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')

// ------------------------------------------------------ DATA

const port = process.env.PORT
const app = express()

// ------------------------------------------------------ USES

var jsonParser = bodyParser.json()
app.use(cors())
app.use('/sounds', express.static(audio_dir));

app.get('/wavenet-server.js', async (req, res) => {
    res.sendFile(__dirname + '/lib.js')
})

// ------------------------------------------------------ AUTH MIDDLEWARE

function check_auth(headers) {
    const key = headers['wns-apikey']
    return key_manager.key_exists(key)
}

function auth_test(req, res, next) {
    if (check_auth(req.headers)) {
        req.auth_key = req.headers['wns-apikey']
        return next()
    }
    res.status(403)
    res.jsonp({ error: 'forbidden' })
}

// ------------------------------------------------------ API ROUTES

app.get('/api/voices', auth_test, async (req, res) => {
    res.json(used_voices)
})

app.get('/api/quotas', auth_test, async (req, res) => {
    let key = req.auth_key
    res.json(get_quotas(key))
})

app.post('/api/tts', auth_test, jsonParser, async (req, res) => {
    let { text, voice_name, lang } = req.body
    let key = req.auth_key
    try {
        res.jsonp(await create_tts_file(text, voice_name, lang, key))
    } catch (e) {
        console.log('ERROR', e)
        res.status(400)
        res.send(e)
    }
})

// ------------------------------------------------------ INIT "CRON" erase old sound files

init_eraser(1000 * 60 * 2, 1000 * 60)

// ------------------------------------------------------ LISTEN

const infos = require('./package.json')
app.listen(port, () => {
    console.log(`Starting wavenet server v${infos.version} on`, port)
})