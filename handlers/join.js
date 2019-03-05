//
// Join somebody in their pom
//

module.exports = async ({ bot, message, util }) => {
	// The user has to mention the user he wants to join
	// Extract that mention
	if (message.mentions.users.size === 0) {
		message.channel.send(
			`You need to mention the user you want to join. Usage: **${
				bot.config.prefix
			} join @user**`
		)
		return
	}

	// Then, check if this user is not *already* in a pom
	let pom = await util.getAssignedPom(message.author.id)

	if (pom) {
		message.channel.send(
			`Hey ! You're already in a pom. One thing at a time.`
		)
		return
	}

	// Why not ? Select a random user in the mentions
	// If there is only one mention, that one will always be selected anyway...
	// Nice easter egg or smth
	let mentionnedUser = message.mentions.users.random()

	// Find the pom that user is at
	pom = await util.getAssignedPom(mentionnedUser.id)

	if (!pom) {
		message.channel.send(
			`I'm sorry, that user is not in a pom right now... Maybe start one on your own ? Usage: **${
				bot.config.prefix
			} start**`
		)
		return
	}

	// Check that the channel is the same (required)
	if (pom.channelId !== message.channel.id) {
		message.channel.send(
			`I'd love for you to join that timer, but please do so in the channel the timer was started in.`
		)
		return
	}

	// Add user -> pom link
	let userPom = {
		userId: message.author.id,
		pomId: pom.id,
		joinedAt: Math.floor(Date.now() / 1000)
	}

	await bot.db
		.table('user_poms')
		.insert(userPom)
		.run(bot.conn)
}
