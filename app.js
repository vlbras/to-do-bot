const TelegramApi = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const express = require('express')
require('dotenv').config()

const router = require('./router')
const user = require('./user')
const task = require('./task')

const app = express()
app.get('/', (req, res) => res.send('Hello World')).listen(process.env.PORT || 7000)

mongoose
    .set('strictQuery', false) // WTF
    .connect(process.env.MongoURL)
    .then(console.log("Connected to DB"))
    .catch(err => console.log('Failed to connect to MongoDB\n', err))

const bot = new TelegramApi(process.env.TOKEN, { polling: true })

bot.on('message', msg =>{
    router('/start', msg, user.start)
    router('Add Task ➕', msg, user.command)
    router('/add', msg, task.add)
    router('Delete Task 🗑', msg, task.remove)
    router('Ny Tasks ▶', msg, task.open)
    router('Profile 👤', msg, user.profile)
})

bot.on('callback_query', msg => {
    bot.answerCallbackQuery(msg.id)
    router('remove', msg, task.remove)
    router('points', msg, task.open)
    router('add', msg, user.add)
    router('subtract', msg, user.subtract)
})