//
// Utility functions
//

module.exports = (bot) => ({
	// Get the pomodoro assigned to the user
	// Either a group pomodoro or a user pomodoro
	async getAssignedPom(userId) {
		let res = await this.queryArray(
			bot.db.table('user_poms').getAll(userId, { index: 'userId' })
		)

		userPom = res.find((userPom) => !!userPom)

		if (userPom) {
			let pom = await bot.db
				.table('poms')
				.get(userPom.pomId)
				.run(bot.conn)

			// If there is no pom associated with the userPom,
			//  delete userPom
			if (!pom) {
				await bot.db
					.table('user_poms')
					.get(userPom.id)
					.delete()
					.run(bot.conn)

				return null
			}

			return pom
		}

		return null
	},

	// Get nicelly formatted start time and time left for pom
	// { startedAt: '15:32 UTC', timeLeft: '6m 28s' }
	getPomInformation(pom) {
		let currentTimestamp = this.timeNowUTC()
		let startDate = new Date(pom.startTimestamp * 1000)

		let timeDiff = currentTimestamp - pom.startTimestamp
		let timeLeft = 60 * pom.length - timeDiff
		let timeLeftMinutes = this.clamp(Math.floor(timeLeft / 60), 0, 25)
		let timeLeftSeconds = this.clamp(timeLeft % 60, 0, 60)

		return {
			startedAt: `${startDate.getHours()}:${startDate.getMinutes()} UTC`,
			timeLeft:
				timeLeftMinutes > 0
					? `${timeLeftMinutes}m ${timeLeftSeconds}s`
					: `${timeLeftSeconds}s`,
			timeLeftInt: timeLeft
		}
	},

	// Get the user profile associated with a user
	// If the Discord.js user is passed, we can also create a profile
	//  if there is none
	async getUserProfile(userId, serverId, user = null) {
		// Get the profile if there is one
		let res = await this.queryArray(
			bot.db
				.table('profiles')
				.getAll(userId, { index: 'userId' })
				.filter({
					serverId
				})
		)

		if (res && res.length > 0) {
			return res[0]
		}

		if (!user) {
			return null
		}

		// Create the profile
		let profile = {
			userId,
			serverId,
			tag: user.tag,
			avatarURL: user.avatarURL,

			// Number of poms started
			pomsStarted: 0,

			// Number of poms finished
			pomsFinished: 0,

			// Total time spent in poms
			pomsTotalTime: 0
		}

		res = await bot.db
			.table('profiles')
			.insert(profile)
			.run(bot.conn)

		profile.id = res.generated_keys[0]

		return profile
	},

	// Runs a RethinkDB query, and transforms it into an array
	async queryArray(query) {
		let res = await query.run(bot.conn)

		return await res.toArray()
	},

	// Clamp a number between min and max
	clamp(n, min, max) {
		return Math.min(Math.max(min, n), max)
	},

	// Returns the current UTC time
	// In seconds from unix epoch
	timeNowUTC() {
		return (
			Math.floor(Date.now() / 1000) + new Date().getTimezoneOffset() * 60
		)
	},

	// Format a number of seconds (eg 605) into a nice string
	//  like 10m 5s
	formatSeconds(s) {
		let hours = Math.floor(s / 3600)
		s = s % 3600

		let minutes = Math.floor(s / 60)
		s = s % 60

		let str = ''

		if (hours) {
			str = `${hours}h`
		}

		if (minutes) {
			str += `${minutes}m `
		}

		if (s || (!hours && !minutes)) {
			str += `${s}s`
		}

		return str.trim()
	}
})
