//
// Status of a pomodoro
//

const Discord = require('discord.js')

module.exports = async ({ bot, message, util }) => {
	// Check if the user has a pomodoro already
	let pom = await util.getAssignedPom(message.author.id)

	// If he has, return the information
	if (pom) {
		let pomInfo = util.getPomInformation(pom)

		let pomUsers = await util.queryArray(
			bot.db.table('user_poms').getAll(pom.id, { index: 'pomId' })
		)

		let embed = new Discord.RichEmbed()
			.setAuthor(message.author.username, message.author.avatarURL)
			.setColor(0xfc5d5d)
			.setDescription(
				`You are currently participating in a ${
					pom.length
				} minutes long pomodoro timer` +
					(pomUsers.length > 1
						? ` with ${pomUsers.length - 1} other people.`
						: '.')
			)
			.addField('Started at', pomInfo.startedAt, true)
			.addField('Time left', pomInfo.timeLeft, true)

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
