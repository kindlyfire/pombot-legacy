//
// Status of a pomodoro
//

const Discord = require('discord.js')
const handlePomDone = require('../tasks/done')

module.exports = async ({ bot, message, util, args }) => {
	// Check if the user has a pomodoro already
	let pom = await util.getAssignedPom(message.author.id)

	// Get profile
	let profile = await util.getUserProfile(
		message.author.id,
		message.guild ? message.guild.id : '',
		message.author
	)

	// If he has, yell at him for overworking
	if (pom) {
		message.channel.send(
			`❌ You are already participating in a pomodoro timer. Don't get overworked ! 🙃`
		)
		return
	}

	// Check for requested pom length (or default 25)
	let pomLength = args.length > 1 ? parseInt(args[1]) : 25

	// And some nice error messages ;)
	if (isNaN(pomLength) || pomLength < 5 || pomLength > 25) {
		let msg

		if (isNaN(pomLength)) {
			msg = `❌ Give me some real time ! Can't work with NaNs.`
		} else if (pomLength < 5) {
			msg =
				'❌ Less than five minutes is too short. Why bother pomming for this ? Do it right away !'
		} else if (pomLength > 25) {
			msg = `❌ Woah there ! You'll perform better if you split that task and make every part take less than 25 minutes.`
		}

		await message.channel.send(msg)

		return
	}

	// Save the pom
	pom = {
		startTimestamp: util.timeNowUTC(),
		length: pomLength,
		channelId: message.channel.id,
		serverId: message.guild ? message.guild.id : ''
	}

	let res = await bot.db
		.table('poms')
		.insert(pom)
		.run(bot.conn)
	pom.id = res.generated_keys[0]

	let userPom = {
		userId: message.author.id,
		pomId: pom.id,
		joinedAt: util.timeNowUTC()
	}

	res = await bot.db
		.table('user_poms')
		.insert(userPom)
		.run(bot.conn)

	console.log(profile)

	// Increment user stat pomsStarted
	await bot.db
		.table('profiles')
		.get(profile.id)
		.update({
			pomsStarted: bot.db
				.row('pomsStarted')
				.default(0)
				.add(1)
		})
		.run(bot.conn)

	// Set completion timeout
	setTimeout(() => handlePomDone({ bot, pom }), pomLength * 60 * 1000)

	// Send the user a confirmation message
	let pomInfo = util.getPomInformation(pom)
	let embed = new Discord.RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setColor(0xfc5d5d)
		.setDescription(
			`You started a ${pom.length} minutes long pomodoro timer.`
		)
		.addField('Started at', pomInfo.startedAt, true)
		.addField('Time left', pomInfo.timeLeft, true)
		.setFooter(
			`Want to join in ? React with 👊 or type ${
				bot.config.prefix
			} join @${message.author.tag}`
		)

	let msg = await message.channel.send({ embed })
	await msg.react('👊')

	console.log(
		`[START] User ${
			message.author.tag
		} started a ${pomLength} minutes long pom.`
	)
}
