//
// Actual bot implementation
//

module.exports = {
	// Configuration
	config: null,

	// RethinkDB
	db: null,

	// RethinkDB connection
	conn: null,

	// Discord.js Client
	client: null,

	// Run when the database and the client is connected
	run() {
		// Add listener for Discord messages
		this.client.on('message', (message) => this.handleMessage(message))
	},

	// Handle a message from Discord.js
	handleMessage(message) {
		// Check if the message starts with the required prefix
		if (!message.content.startsWith(this.config.prefix)) {
			return
		}

		// Create an array of arguments passed to the bot
		let args = message.content.split(' ').slice(1)

		// If no arguments are present, imply the "start" action
		if (args.length === 0) {
			args = ['start']
		}

		// Run the right message handler
		let handler = this.handlers.find((h) => h.commands.includes(args[0]))

		// If no handler was found, run the special 404 handler
		if (!handler) {
			handler = this.handlers.find((h) => h.commands.includes('404'))
		}

		// Run the handler
		handler.handler(message)
	},

	// Handlers for different main commands
	handlers: [
		// Handler run when a command has not been found
		{
			commands: ['404'],
			handler(message) {
				message.channel.send('That command does not exist !')
			}
		},

		// Start a pomodoro timer
		{
			commands: ['start'],
			handler(message) {
				message.channel.send('Start pomodoro !')
			}
		}
	]
}
