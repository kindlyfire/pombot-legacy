//
// Stop a personnal pom or leave a group pom
//

module.exports = async ({ bot, message, util }) => {
	// Check if the user has a pomodoro already
	let pom = await util.getAssignedPom(message.author.id)

	// Stop the pom if there is one
	if (pom) {
		// Get number of users in the pom
		// If > 1, we should only remove the link between
		//  the user and the pom, not the pom entirely
		let usersInPom = await bot.db
			.table('user_poms')
			.getAll(pom.id, { index: 'pomId' })
			.count()
			.run(bot.conn)

		// Remove the user -> pom link
		// A user can only have one link at the same time
		//  so we can just delete without filtering for pomId
		await bot.db
			.table('user_poms')
			.getAll(message.author.id, { index: 'userId' })
			.delete()
			.run(bot.conn)

		if (usersInPom === 1) {
			await bot.db
				.table('poms')
				.get(pom.id)
				.delete()
				.run(bot.conn)
		}

		let pomInfo = util.getPomInformation(pom)

		// Show messages
		// For single-user pom
		if (usersInPom === 1) {
			message.channel.send(
				`You stopped the timer ${pomInfo.timeLeft} before its end.`
			)

			console.log(
				`[STOP] User ${message.author.tag} stopped his pomodoro ${
					pomInfo.timeLeft
				} before its end.`
			)
		}

		// For group poms
		else {
			message.channel.send(
				`You left the timer ${pomInfo.timeLeft} before its end.`
			)

			console.log(
				`[LEAVE] User ${message.author.tag} left a pomodoro ${
					pomInfo.timeLeft
				} before its end.`
			)
		}
	}

	// Message if the user is not in a pom
	else {
		message.channel.send(
			`❌ You're not currently participating in any timer.`
		)
	}
}
