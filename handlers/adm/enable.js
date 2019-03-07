//
// Enable the pomodoro bot in this channel
//

const taskPomManager = require('../../tasks/pomManager')

module.exports = async ({ bot, message, util }) => {
	let isEnabled = await util.checkBotEnabledIn(message.channel.id)

	if (isEnabled) {
		let msg = await message.channel.send(
			'✅ Pombot is already enabled in this channel'
		)

		util.scheduleDeletion([msg, message])
		return
	}

	// Add the channel to the list of channels
	let channel = {
		serverId: message.guild.id,
		channelId: message.channel.id,
		enabledAt: util.timeNowUTC()
	}

	await bot.db
		.table('channels')
		.insert(channel)
		.run(bot.conn)

	let msg = await message.channel.send(
		'✅ Pombot is has been enabled in this channel. First pom will be launched in 5 seconds.'
	)
	util.scheduleDeletion([msg, message])

	setTimeout(() => {
		taskPomManager({
			channelId: message.channel.id,
			bot
		})
	}, 5000)
}
