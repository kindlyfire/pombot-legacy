//
// Leaderboard display
//

const Discord = require('discord.js')

module.exports = async ({ bot, message, util }) => {
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

		let timeHours = Math.floor(profile.pomsTotalTime / 3600)
		let timeMinutes = Math.floor(
			(profile.pomsTotalTime - timeHours * 3600) / 60
		)

		let timeStr =
			timeHours > 0 ? `${timeHours}h ${timeMinutes}m` : `${timeMinutes}m`

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
