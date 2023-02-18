module.exports = router = async (option, msg, callback) => {
    let text, chatId
    if (msg.id) {
        text = msg.data
        chatId = msg.message.chat.id
    }
    else {
        text = msg.text
        chatId = msg.chat.id
        if (text === option) {
            return callback(chatId)
        }
    }
    const command = await text.split(' ')[0]
    const data = await text.replace(command + " ", "")
    if (command === option) {
        return callback(chatId, data)
    }
}