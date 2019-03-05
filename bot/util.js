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
		let currentTimestamp = Math.floor(Date.now() / 1000)
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
					: `${timeLeftSeconds}s`
		}
	},

	// Runs a RethinkDB query, and transforms it into an array
	async queryArray(query) {
		let res = await query.run(bot.conn)

		return await res.toArray()
	},

	// Clamp a number between min and max
	clamp(n, min, max) {
		return Math.min(Math.max(min, n), max)
	}
})
