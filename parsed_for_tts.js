module.exports = (message) => {
    message = message
        .replace(/\.\n/g, 'PPOINT\n')
        .replace(/PPOINT\n/g, '.\n')
        .replace(/\*/g, '')
        .replace(/\@all/g, 'Message pour tout le monde,')
        .replace(/\@/g, '')
        .replace(/http(s)?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, '')
    while (message.includes('\n\n')) {
        message = message.replace(/\n\n/g, '\n')
    }
    return message
}