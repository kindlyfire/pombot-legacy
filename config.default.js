//
// Discord pomodoro bot configuration file
//

module.exports = {
	// Discord bot token
	token: '',

	// Bot command prefix
	// NO SPACE at the end
	prefix: '!pom',

	// RethinkDB database information
	db: {
		host: 'localhost',
		port: 28015,
		db: 'test',
		user: 'admin',
		password: ''
	}
}
