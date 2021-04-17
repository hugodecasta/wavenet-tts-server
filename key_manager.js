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
    fs.writeFileSync(key_file_path, '{}')
}

let keys = JSON.parse(fs.readFileSync(key_file_path))

// ------------------------------------------------------ METHODS

// ---------------- FILE SYSTEM

function load() {
    const r_keys = JSON.parse(fs.readFileSync(key_file_path))
    Object.entries(r_keys).forEach(([key, data]) => keys[key] = data)
    Object.keys(keys).filter(key => !Object.keys(r_keys).includes(key))
        .forEach(key => delete keys[key])
}

function save() {
    fs.writeFileSync(key_file_path, JSON.stringify(keys))
}

// ---------------- BASIC

function add_key(data = {}) {
    load()
    let key = uuid()
    keys[key] = data
    save()
    return key
}

function remove_key(key) {
    load()
    if (!key_exists(key)) return false
    delete keys[key]
    save()
    return true
}

function key_exists(key) {
    load()
    return keys[key] !== undefined
}

function key_working(key) {
    return key_exists(key) && !is_banned(key)
}

// ---------------- PROPS

function set_prop(key, prop, value) {
    load()
    if (!key_exists(key)) return false
    keys[key][prop] = value
    save()
    return true
}

function get_prop(key, prop) {
    load()
    return keys[key][prop]
}

function remove_prop(key, prop) {
    load()
    if (!key_exists(key)) return false
    delete keys[key][prop]
    save()
    return true
}

// ---------------- SPECIFIC

function is_admin(key) {
    return get_prop(key, 'admin') === true
}

function set_admin(key) {
    return set_prop(key, 'admin', true)
}

function unadmin(key) {
    if (!is_admin(key)) return false
    return remove_prop(key, 'admin')
}

function is_banned(key) {
    return get_prop(key, 'banned') === true
}

function ban(key) {
    return set_prop(key, 'banned', true)
}

function unban(key) {
    if (!is_banned(key)) return false
    return remove_prop(key, 'banned')
}

// ------------------------------------------------------ EXPORTS

module.exports = {
    add_key, remove_key, key_exists,
    set_prop, get_prop,
    is_admin, set_admin, unadmin,
    is_banned, ban, unban,
    key_working,
    keys
}
