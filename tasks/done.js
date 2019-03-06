//
// Run when a pom is finished
//

const Discord = require('discord.js')

module.exports = async ({ bot, pom }) => {
	let { util } = bot

	// First, check that the pom still exists
	//  return if not
	let tmpPom = await bot.db
		.table('poms')
		.get(pom.id)
		.run(bot.conn)

	if (!tmpPom) {
		return
	}

	// Get all users in this pom
	let pomUsers = await util.queryArray(
		bot.db.table('user_poms').getAll(pom.id, { index: 'pomId' })
	)

	// Find the right channel to send the message to
	if (!bot.client.channels.has(pom.channelId)) {
		console.error('Could not find channel to end pom in.')
		return
	}

	let channel = bot.client.channels.get(pom.channelId)

	// Construct a string containing a mention for every user in the pom
	let pomUsersMention = pomUsers
		.map((pomUser) => `<@${pomUser.userId}>`)
		.join(' ')

	let embed = new Discord.RichEmbed()
		.setAuthor(bot.client.user.username, bot.client.user.avatarURL)
		.setColor(0xfc5d5d)
		.setDescription(
			`The ${
				pom.length
			} minutes long pomodoro has ended ! Congratulations !`
		)

	// Send both the mentions and the embed
	await channel.send(`⏰ ${pomUsersMention}  ⏰`)
	await channel.send({
		embed
	})

	// Log in console
	console.log(
		`[DONE] Pom of length ${pom.length} minutes finished with ${
			pomUsers.length
		} users.`
	)

	// Remove the pom, and pom links
	await bot.db
		.table('poms')
		.get(pom.id)
		.delete()
		.run(bot.conn)

	await bot.db
		.table('user_poms')
		.getAll(pom.id, { index: 'pomId' })
		.delete()
		.run(bot.conn)
}
