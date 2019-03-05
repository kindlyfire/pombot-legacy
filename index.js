//
// Discord Pomodoro bot
//

const Discord = require('discord.js')
const db = require('rethinkdb')

const client = new Discord.Client()
const config = require('./config')
const bot = require('./bot')

const run = async () => {
	const conn = await db.connect(config.db)
	conn.use(config.db.db)

	bot.config = config
	bot.db = db
	bot.conn = conn
	bot.client = client

	client.once('ready', () => {
		bot.run()
	})

	client.login(config.token)
}

// Run and catch any error
;(async () => {
	try {
		await run()
	} catch (e) {
		console.error(e)
	}
})()
