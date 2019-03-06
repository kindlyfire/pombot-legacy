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
		this.loadPoms()
	},

	// Handle a message from Discord.js
	handleMessage(message) {
		let args = message.content.split(' ')

		// Check if the message starts with the required prefix
		if (args[0] !== this.config.prefix) {
			return
		}

		// Create an array of arguments passed to the bot
		args = args.slice(1)

		// If no arguments are present, imply the "status" action
		if (args.length === 0) {
			args = ['status']
		}

		// Run the right message handler
		let handler = this.handlers.find((h) => h.commands.includes(args[0]))

		// If no handler was found, run the special 404 handler
		if (!handler) {
			handler = this.handlers.find((h) => h.commands.includes('404'))
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
					} help**.`
				)

				// Delete the message after 12 seconds
				setTimeout(() => {
					m.delete()
				}, 12000)
			}
		},

		// Status of the currently assigned pom
		{
			commands: ['status'],
			handler: require('../handlers/status')
		},

		// Start a new pom (for this user)
		{
			commands: ['start'],
			handler: require('../handlers/start')
		},

		// Stop a pom (for this user)
		{
			commands: ['stop', 'leave'],
			handler: require('../handlers/stop')
		},

		// Join a pom (from another usr)
		{
			commands: ['join'],
			handler: require('../handlers/join')
		},

		// Help
		{
			commands: ['help'],
			handler: require('../handlers/help')
		},

		// Leaderboard
		{
			commands: ['lb', 'leaderboard'],
			handler: require('../handlers/leaderboard')
		},

		// Stats
		{
			commands: ['stats'],
			handler: require('../handlers/stats')
		}
	]
}
