const TelegramApi = require('node-telegram-bot-api')
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const bot = new TelegramApi(process.env.TOKEN)

const userSchema = new Schema({
    points: {
        type: Number,
        require: true
    },
    chatId: {
        type: String,
        require: true,
    }
})

const User = mongoose.model('User', userSchema)

class UserController {
    async start(chatId) {
        if (!await User.findOne({ chatId })) {
            const user = new User({ 'points': 0, chatId })
            await user.save()
        }
        return bot.sendSticker(chatId, "https://cdn.tlgrm.app/stickers/552/b31/552b31fc-5e93-4360-b2c2-9ee1e43a236e/192/5.webp", userOptions)
    }
    async command(chatId) {
        return bot.sendMessage(chatId, `💬 Command:\n<code>/add</code> Name ... - to add task`, { parse_mode: "HTML" })
    }
    async add(chatId, name) {
        const user = await User.findOne({ chatId })
        let points = user.points + 1
        await user.updateOne({ points })
        if (points % 10 == 0) {
            await bot.sendMessage(chatId, `✅ +1 exp for ${name}`)
            return bot.sendMessage(chatId, `🥳 You level is ${points / 10 + 1}`)
        }
        return bot.sendMessage(chatId, `✅ +1 exp for ${name}`)
    }
    async subtract(chatId, name) {
        const user = await User.findOne({ chatId })
        let points = user.points - 1
        await user.updateOne({ points })
        return bot.sendMessage(chatId, `🚫 -1 exp for ${name}`)
    }
    async profile(chatId) {
        const user = await User.findOne({ chatId })
        process.env["NTBA_FIX_350"] = 1; // WTF
        let progress = ''
        for (let i = 0; i < 10; i++) {
            if (i < user.points % 10) {
                progress += '🟩'
            }
            else {
                progress += '⬜️'
            }
        }
        return bot.sendPhoto(chatId, 'ava.jpg', { 'caption': `Name: Vlad\nLevel: ${Math.floor(user.points / 10 + 1)}\nYour progress:\n\n${progress}` })
    }
}

const userOptions = {
    "reply_markup": {
        "keyboard": [
            ["Ny Tasks ▶"],
            ["Add Task ➕", "Delete Task 🗑"],
            ["Profile 👤"]
        ],
        "resize_keyboard": true
    }
}

module.exports = new UserController()