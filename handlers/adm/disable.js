//
// Enable the pomodoro bot in this channel
//

module.exports = async ({ bot, message, util }) => {
	let isEnabled = await util.checkBotEnabledIn(message.channel.id)

	if (!isEnabled) {
		let msg = await message.channel.send(
			'✅ Pombot is already disabled in this channel'
		)

		util.scheduleDeletion([msg, message])
		return
	}

	await bot.db
		.table('channels')
		.getAll(message.channel.id, { index: 'channelId' })
		.delete()
		.run(bot.conn)

	let msg = await message.channel.send(
		'✅ Pombot is has been disabled in this channel'
	)
	util.scheduleDeletion([msg, message])
}
