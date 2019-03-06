//
// Status of a pomodoro
//

const Discord = require('discord.js')

module.exports = async ({ bot, message, util }) => {
	// Check if the user has a pomodoro already
	let pom = await util.getAssignedPom(message.author.id)

	// If he has, return the information
	if (pom) {
		// Check if the pom was started in this channel
		let pomStartedHere = pom.channelId === message.channel.id

		let pomInfo = util.getPomInformation(pom)

		// Get a list of users in the pom, with their profile data
		let pomUsers = await util.queryArray(
			bot.db
				.table('user_poms')
				.getAll(pom.id, { index: 'pomId' })
				.eqJoin('userId', bot.db.table('profiles'), { index: 'userId' })
				.zip()
		)

		// Filter out any profiles that are not in this server
		pomUsers = pomUsers.filter(
			(u) => u.serverId === (message.guild ? message.guild.id : '')
		)

		let embed = new Discord.RichEmbed()
			.setAuthor(message.author.username, message.author.avatarURL)
			.setColor(0xfc5d5d)
			.setDescription(
				`You are currently participating in a ${
					pom.length
				} minutes long pomodoro timer` +
					(pomUsers.length > 1
						? ` with ${pomUsers.length - 1} other ${
								pomUsers.length === 2 ? 'person' : 'people'
						  }`
						: '') +
					(!pomStartedHere ? ` somewhere else.` : '.')
			)
			.addField('Started at', pomInfo.startedAt, true)
			.addField('Time left', pomInfo.timeLeft, true)

		if (pomUsers.length > 1 && pomStartedHere) {
			embed.addField(
				'Participants',
				`(${pomUsers.length}) ` +
					pomUsers.map((u) => `**${u.tag}**`).join(', ')
			)
		}

		message.channel.send({
			embed
		})
	}

	// Send a notice that the user is not currently in a pomodoro timer
	else {
		message.channel.send(
			`You are not currently participating in a pomodoro timer. What's going on ? 🤔`
		)
	}
}
