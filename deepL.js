const fetch = require('node-fetch')

const lang_map = {
    'fr-FR': 'FR',
    'en-US': 'EN'
}

async function translate({ auth_key, text, lang_target }) {
    const target_lang = lang_map[lang_target] ?? 'EN'
    const euc = encodeURIComponent
    const data = { auth_key, text, target_lang };
    const form = Object.keys(data).map(k => euc(k) + '=' + euc(data[k])).join('&')
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form
    }
    const url = 'https://api-free.deepl.com/v2/translate'
    const resp = await fetch(url, options)
    const response = await resp.json()
    return response.translations[0].text
}

module.exports = translate