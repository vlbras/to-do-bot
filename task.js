const TelegramApi = require('node-telegram-bot-api')
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const bot = new TelegramApi(process.env.TOKEN)

const taskSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    chatId: {
        type: String,
        require: true,
    }
})

const Task = mongoose.model('Task', taskSchema)

class TaskController {
    async add(chatId, name) {
        if (!name) {
            return bot.sendMessage(chatId, `❗️Name is ${name}`)
        }
        if (await Task.findOne({ name, chatId })) {
            return bot.sendMessage(chatId, `❗️${name} already created`)
        }
        const task = new Task({ name, chatId })
        await task.save()
        return bot.sendMessage(chatId, `✅ ${name} added`)
    }
    async remove(chatId, _id) {
        if (!_id) {
            let option = 'remove'
            return taskOptins(chatId, option)
        }
        if (!await Task.findById(_id)){
            return
        }
        const task = await Task.findById(_id)
        await task.delete()
        return bot.sendMessage(chatId, `✅ ${task.name} deleted`)
    }
    async open(chatId) {
        let option = 'points'
        return taskOptins(chatId, option, `Select Folder:\n❗️All Words in 🗂 will also be deleted`)
    }
}

let matrix = []
let obj = {}

const taskOptins = async (chatId, option) => {
    const tasks = await Task.find({ chatId })
    if (!tasks.length) {
        return bot.sendMessage(chatId, `❗️No Task created`, { parse_mode: "HTML" })
    }
    if (option === 'remove') {
        matrix[0] = []
        for (let i = 0; i < tasks.length; i++) {
            obj.text = tasks[i].name
            obj.callback_data = option + ' ' + tasks[i]._id
            matrix[0].push(obj)
            obj = {}
        }
    }
    else {
        for (let i = 0; i < tasks.length; i++) {
            matrix[i] = []
            obj.text = tasks[i].name
            obj.callback_data = option
            matrix[i].push(obj)
            obj = {}
            obj.text = '👍'
            obj.callback_data = 'add ' + tasks[i].name
            matrix[i].push(obj)
            obj = {}
            obj.text = '👎'
            obj.callback_data = 'subtract '+ tasks[i].name
            matrix[i].push(obj)
            obj = {}
        }
    }
    await bot.sendMessage(chatId, 'Select Tasks:', {
        reply_markup: JSON.stringify({
            inline_keyboard: matrix
        })
    })
    return matrix = []
}

module.exports = new TaskController()