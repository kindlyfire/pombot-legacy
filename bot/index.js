//
// Actual bot implementation
//

const util = require('./util')
const handlePomDone = require('../tasks/done')

module.exports = {
	// Configuration
	config: null,

	// RethinkDB
	db: null,

	// RethinkDB connection
	conn: null,

	// Discord.js Client
	client: null,

	// Utilities
	util: null,

	// Run when the database and the client is connected
	run() {
		// Instanciate utilities
		this.util = util(this)

		// Add listener for Discord messages
		this.client.on('message', (message) => this.handleMessage(message))

		// Load timeouts for poms in database
		// this.loadPoms()

		console.log('[INFO] Bot has loaded')
	},

	// Handle a message from Discord.js
	async handleMessage(message) {
		let args = message.content.split(' ')

		// Check bot prefix
		let isFullSeparator =
			this.config.prefix[this.config.prefix.length - 1] === ' '

		// Sep is like "!pom " (notice the space)
		if (isFullSeparator) {
			if (args[0] !== this.config.prefix.trim()) {
				return
			}
		}

		// Sep is like "!": no space
		//  and command is glued to prefix
		else {
			if (!args[0].startsWith(this.config.prefix)) {
				return
			}

			args = [
				this.config.prefix,
				args[0].slice(this.config.prefix.length),
				...args.slice(1)
			]
		}

		// Create an array of arguments passed to the bot
		args = args.slice(1)

		// If no arguments are present, imply the "status" action
		if (args.length === 0) {
			args = ['status']
		}

		// Run the right message handler
		let handler = this
		let oldHandler
		let i = 0

		while (handler && handler.handlers) {
			oldHandler = handler
			handler = handler.handlers.find((h) => h.commands.includes(args[i]))
			i += 1
		}

		// If no handler was found, run the special 404 handler
		if (!handler) {
			if (oldHandler.handler) {
				handler = oldHandler
			} else {
				handler = this.handlers.find((h) => h.commands.includes('404'))
			}
		}

		// Check if the handler *should* be run (the 'botEnabled' flag)
		if (handler.flags && handler.flags.includes('botEnabled')) {
			let isEnabled = await this.util.checkBotEnabledIn(
				message.channel.id
			)

			if (!isEnabled) {
				await message.channel.send('not enabled')
				return
			}
		}

		// Run the handler
		handler.handler({
			bot: this,
			util: this.util,
			args,
			message
		})
	},

	// Load poms from database
	async loadPoms() {
		let poms = await this.util.queryArray(this.db.table('poms'))

		for (let pom of poms) {
			let pomInfo = this.util.getPomInformation(pom)

			setTimeout(
				() => handlePomDone({ bot: this, pom }),
				pomInfo.timeLeftInt * 1000
			)
		}

		console.log(`Loaded ${poms.length} poms from the database.`)
	},

	// Handlers for different main commands
	handlers: [
		// Handler run when a command has not been found
		{
			commands: ['404'],
			async handler({ bot, message }) {
				let m = await message.channel.send(
					`❌ That command does not exist. Get the full list of commands right in your inbox with **${
						bot.config.prefix
					}help**.`
				)

				// Delete the message after 12 seconds
				// setTimeout(() => {
				// 	m.delete()
				// }, 12000)
			}
		},

		// Admin commands
		{
			commands: ['admin'],
			handlers: [
				{
					commands: ['enable'],
					handler: require('../handlers/adm/enable')
				},
				{
					commands: ['disable'],
					handler: require('../handlers/adm/disable')
				}
			]
		},

		// Leave the channel pom
		{
			flags: ['botEnabled'],
			commands: ['stop', 'leave'],
			handler: require('../handlers/leave')
		},

		// Join the channel pom
		{
			flags: ['botEnabled'],
			commands: ['join'],
			handler: require('../handlers/join')
		},

		// Help
		{
			flags: ['botEnabled'],
			commands: ['help'],
			handler: require('../handlers/help')
		},

		// Leaderboard
		{
			flags: ['botEnabled'],
			commands: ['lb', 'leaderboard'],
			handler: require('../handlers/leaderboard')
		},

		// Stats
		{
			flags: ['botEnabled'],
			commands: ['stats'],
			handler: require('../handlers/stats')
		}
	]
}
