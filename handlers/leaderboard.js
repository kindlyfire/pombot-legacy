//
// Leaderboard display
//

const Discord = require('discord.js')

module.exports = async ({ bot, message, util }) => {
	// It's not possible to use "leaderboard" in a DM channel
	// Prevent that
	if (
		message.author.dmChannel &&
		message.author.dmChannel.id === message.channel.id
	) {
		message.channel.send(`❌ There is no leaderboard for DM channels`)
		return
	}

	// Get all profiles belonging to this server/guild,
	//  order by pomsTotalTime, limit to 10
	let profiles = await util.queryArray(
		bot.db
			.table('profiles')
			.getAll(message.guild.id, { index: 'serverId' })
			.orderBy(bot.db.desc('pomsTotalTime'))
	)
	let topProfiles = profiles.slice(0, 10)

	let profileList = []

	// Special pomodoro message for the first three !
	// for (let profile of topProfiles.slice(0, 3)) {
	// 	profileList.push(
	// 		`:tomato: **${profile.tag}** (${profile.pomsTotalTime})`
	// 	)
	// }

	for (let [i, profile] of topProfiles.entries()) {
		let profileTagStr =
			profile.userId === message.author.id
				? `**${profile.tag}**`
				: profile.tag

		let timeStr = util.formatSeconds(profile.pomsTotalTime)

		profileList.push(`**${i + 1}.** ${profileTagStr} • ${timeStr}`)
	}

	// Calculate user position in leaderboard

	let userPosition = profiles.findIndex((p) => p.userId === message.author.id)
	let userPositionStr =
		userPosition !== -1 ? `#${userPosition + 1}` : 'unknown'

	let embed = new Discord.RichEmbed()
		.setAuthor('🍅 Pomodoro Leaderboard', '')
		.setDescription(profileList.join('\n'))
		.setFooter(`Your position is: ${userPositionStr}`)

	await message.channel.send({ embed })
}
