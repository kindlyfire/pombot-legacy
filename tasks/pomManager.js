//
// Update a channel pomodoro
//

const Discord = require('discord.js')

module.exports = async ({ channelId, bot }) => {
	let { util } = bot

	let pom = await util.queryArray(
		bot.db.table('poms').getAll(channelId, { index: 'channelId' })
	)

	if (pom.length === 0) {
		await startPom({ channelId, bot, util })

		return
	}

	// The pom will be the first in the array (getAll was used)
	pom = pom[0]

	console.log(pom)
}

const startPom = async ({ channelId, bot, util }) => {
	let channel = bot.client.channels.get(channelId)

	if (!channel) {
		return
	}

	let embed = new Discord.RichEmbed()
		.setTitle('🍅 KOA Group Pomodoro')
		.setDescription(
			`There is nobody active in the pomodoro channel at the moment.`
		)
		.setFooter('Start by pressing the 🔵 emoji')

	let msg = await channel.send({ embed })

	// Create entry inside "poms" table
	let pom = {
		startTimestamp: util.timeNowUTC(),
		length: 25,
		channelId,
		serverId: channel.guild.id,
		messageId: msg.id
	}

	let res = await bot.db
		.table('poms')
		.insert(pom)
		.run(bot.conn)
	pom.id = res.generated_keys[0]

	await msg.react('🔵')
	await msg.react('🔴')

	addReactionListeners({ channelId, bot, util, msg, pom })
}

const updatePom = async ({ channelId, bot, util, pom }) => {
	let channel = bot.client.channels.get(pom.channelId)

	if (!channel) {
		return
	}

	message = await channel.fetchMessage(pom.messageId)

	if (!message) {
		return
	}

	let usersInPom = await util.queryArray(
		bot.db
			.table('user_poms')
			.getAll(pom.id, { index: 'pomId' })
			.eqJoin('userId', bot.db.table('profiles'), { index: 'userId' })
	)

	let embed = new Discord.RichEmbed()
		.setTitle('🍅 KOA Group Pomodoro')
		.setDescription('There is a pomodoro timer ongoing !')
		.setFooter('Start by pressing the 🔵 emoji')

	message.edit({ embed })
}

// If there is already a listener for a message, indexed by message ID
let hasListener = {}

const addReactionListeners = ({ channelId, bot, util, msg, pom }) => {
	if (hasListener[msg.id]) {
		return
	}

	hasListener[msg.id] = true

	bot.client.on('messageReactionAdd', async (reaction, user) => {
		if (user.bot) {
			return
		}

		// Add user to pom
		await addUserToPom({ user, channelId, bot, pom, guildId: msg.guild.id })

		// Update pom display
		await updatePom({ channelId, bot, util, pom })
	})

	bot.client.on('messageReactionRemove', (reaction, user) => {
		if (user.bot) {
			return
		}

		console.log('removed', user.tag)
	})
}

const addUserToPom = async ({ user, channelId, bot, pom, guildId }) => {
	// Ensure there is a profile for this user
	let profile = await bot.util.getUserProfile(channelId, guildId, user)

	// Create user -> pom link
	let userPom = {
		userId: user.id,
		pomId: pom.id,
		joinedAt: bot.util.timeNowUTC()
	}

	let res = await bot.db
		.table('user_poms')
		.insert(userPom)
		.run(bot.conn)
	userPom.id = res.generated_keys[0]
}
