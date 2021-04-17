const key_manager = require('./key_manager')

// ------------------------------------------------------ DATA

let args = process.argv.slice(2, 10000)

let commands = {
    'new': function (data) {
        console.log('creating new key')
        let obj = Object.fromEntries(data.map(dat => dat.split(':')))
        return key_manager.add_key(obj)
    },
    'delete': function ([key]) {
        console.log('removing key', key)
        return key_manager.remove_key(key) ? 'the key has been removed' : 'an error occured'
    },
    'ban': function ([key]) {
        console.log('banning key', key)
        return key_manager.ban(key)
    },
    'unban': function ([key]) {
        console.log('unbanning key', key)
        return key_manager.unban(key)
    },
    'admin': function ([key]) {
        console.log('admin-ing key', key)
        return key_manager.set_admin(key)
    },
    'unadmin': function ([key]) {
        console.log('unadmin-ing key', key)
        return key_manager.unadmin(key)
    },
    'find': function ([data]) {
        const [prop, value] = data.split(':')
        return Object.entries(key_manager.keys).find(key => key[1][prop] === value)
    },
    'all': function () {
        return key_manager.keys
    }
}

// ------------------------------------------------------ USAGE TEST

if (args.length < 1) {
    console.log('Usage: <command> <data>')
    console.log('\tcommands')
    for (let command in commands) console.log('\t\t- ', command)
    return
}

// ------------------------------------------------------ LAUNCHER

const [command, ...data] = args

console.log(commands[command](data))