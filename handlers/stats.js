//
// Show statistics about the poms
//

const Discord = require('discord.js')

module.exports = async ({ bot, message, util }) => {
	// It's not possible to use "stats" in a DM channel
	// Prevent that
	if (
		message.author.dmChannel &&
		message.author.dmChannel.id === message.channel.id
	) {
		message.channel.send(`❌ There are no statistics for DM channels`)
		return
	}

	let usersCount = await bot.db
		.table('profiles')
		.getAll(message.guild.id, { index: 'serverId' })
		.count()
		.run(bot.conn)

	let totalTimeTracked = await bot.db
		.table('profiles')
		.getAll(message.guild.id, { index: 'serverId' })
		.sum('pomsTotalTime')
		.run(bot.conn)

	let embed = new Discord.RichEmbed()
		.setAuthor('🍅 Pomodoro Statistics', '')
		.setDescription(`Statistics from this server.`)
		.addField('Pom users', usersCount, true)
		.addField('Time tracked', util.formatSeconds(totalTimeTracked), true)

	message.channel.send({ embed })
}
