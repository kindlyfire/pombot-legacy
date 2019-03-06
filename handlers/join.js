//
// Join somebody in their pom
//

const Discord = require('discord.js')

module.exports = async ({ bot, message, util }) => {
	// It's not possible to use !join in a DM channel
	// Prevent that
	if (
		message.author.dmChannel &&
		message.author.dmChannel.id === message.channel.id
	) {
		message.channel.send(
			`❌ It's not possible to join somebody in a DM channel.`
		)
		return
	}

	// The user has to mention the user he wants to join
	// Extract that mention
	if (message.mentions.users.size === 0) {
		message.channel.send(
			`❌ You need to mention the user you want to join. Usage: **${
				bot.config.prefix
			} join @user**`
		)
		return
	}

	// Get profile
	let profile = await util.getUserProfile(
		message.author.id,
		message.guild.id,
		message.author
	)

	// Then, check if this user is not *already* in a pom
	let pom = await util.getAssignedPom(message.author.id)

	if (pom) {
		message.channel.send(
			`❌ Hey ! You're already in a pom. One thing at a time.`
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
			`❌ I'm sorry, that user is not in a pom right now... Maybe start one on your own ? Usage: **${
				bot.config.prefix
			} start**`
		)
		return
	}

	// Check that the channel is the same (required)
	if (pom.channelId !== message.channel.id) {
		message.channel.send(
			`❌ I'd love for you to join that timer, but please do so in the channel the timer was started in.`
		)
		return
	}

	// Add user -> pom link
	let userPom = {
		userId: message.author.id,
		pomId: pom.id,
		joinedAt: util.timeNowUTC()
	}

	await bot.db
		.table('user_poms')
		.insert(userPom)
		.run(bot.conn)

	// Send a confirmation message
	let pomInfo = util.getPomInformation(pom)

	// Get a list of users in the pom, with their profile data
	let pomUsers = await util.queryArray(
		bot.db
			.table('user_poms')
			.getAll(pom.id, { index: 'pomId' })
			.eqJoin('userId', bot.db.table('profiles'), { index: 'userId' })
			.zip()
	)

	let embed = new Discord.RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setColor(0xfc5d5d)
		.setDescription(
			`You joined a ${pom.length} minutes long pomodoro timer` +
				(pomUsers.length > 1
					? ` with ${pomUsers.length - 1} other ${
							pomUsers.length === 2 ? 'person' : 'people'
					  }.`
					: '.')
		)
		.addField('Started at', pomInfo.startedAt, true)
		.addField('Time left', pomInfo.timeLeft, true)
		.addField(
			'Participants',
			`(${pomUsers.length}) ` +
				pomUsers.map((u) => `**${u.tag}**`).join(', ')
		)

	message.channel.send({ embed })
}
