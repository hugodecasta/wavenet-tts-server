const fs = require('fs')
const { v4: uuid } = require('uuid');

// ------------------------------------------------------ DATA

let key_dir = __dirname + '/key_data'
let key_file_path = key_dir + '/keys.json'

// ------------------------------------------------------ INIT

if (!fs.existsSync(key_dir)) {
    fs.mkdirSync(key_dir)
}
if (!fs.existsSync(key_file_path)) {
    fs.writeFileSync(key_file_path, '[]')
}

let keys = JSON.parse(fs.readFileSync(key_file_path))

// ------------------------------------------------------ METHODS

function load() {
    keys = JSON.parse(fs.readFileSync(key_file_path))
}

function save() {
    fs.writeFileSync(key_file_path, JSON.stringify(keys))
}

function add_key() {
    load()
    let key = uuid()
    keys.push(key)
    save()
    return key
}

function remove_key(key) {
    load()
    if (!key_exists(key)) return false
    keys.splice(keys.indexOf(key), 1)
    save()
    return true
}

function key_exists(key) {
    load()
    return keys.includes(key)
}

// ------------------------------------------------------ EXPORTS

module.exports = { add_key, remove_key, key_exists, keys }
