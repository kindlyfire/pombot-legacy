//
// Sends a help message in PM !
//

const Discord = require('discord.js')

module.exports = async ({ bot, message }) => {
	let embed = new Discord.RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setColor(0xfc5d5d)
		.addField(
			bot.config.prefix,
			`Equivalent to **!pom status**. Will tell you the pom you're in, time started and time left.`
		)
		.addField(
			`${bot.config.prefix} start`,
			`Start a new pomorodo timer of 25 minutes. You may also indicate another length between 5 and 25 minutes.`
		)
		.addField(
			`${bot.config.prefix} stop`,
			`Stop the pomodoro timer or leave a group timer. Any time spent in the pom will be lost.` +
				`\nAlias: **!pom leave**`
		)
		.addField(
			`${bot.config.prefix} join @user`,
			`Join another user in his pomodoro adventure !`
		)

	await message.author.send({ embed })

	// Don't show "Helo has come" message if the command came through DM's
	if (message.channel !== message.author.dmChannel) {
		await message.channel.send('Help has come ! Check your DMs 🚑')
	}
}
