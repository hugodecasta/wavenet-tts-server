const key_manager = require('./key_manager')

// ------------------------------------------------------ DATA

let args = process.argv.slice(2, 10000)

let commands = {
    'new': function (data) {
        console.log('creating new key')
        return key_manager.add_key(data)
    },
    'revoke': function (key) {
        console.log('removing key', key)
        return key_manager.remove_key(key) ? 'the key has been removed' : 'an error occured'
    },
    'all': function (key) {
        return key_manager.keys
    }
}

// ------------------------------------------------------ USAGE TEST

if (args.length < 1) {
    console.log('Usage: <command> <data>')
    console.log('\tcommands')
    for (let command in commands) console.log('\t\t- ', command)
}

// ------------------------------------------------------ LAUNCHER

const [command, ...data] = args

console.log(commands[command](data))