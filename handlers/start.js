//
// Status of a pomodoro
//

const Discord = require('discord.js')

module.exports = async ({ bot, message, util, args }) => {
	// Check if the user has a pomodoro already
	let pom = await util.getAssignedPom(message.author.id)

	// If he has, yell at him for overworking
	if (pom) {
		message.channel.send(
			`You are already participating in a pomodoro timer. Don't get overworked ! 🙃`
		)
	}

	// Fine, add a timer
	else {
		// Check for requested pom length (or default 25)
		let pomLength = args.length > 1 ? parseInt(args[1]) : 25

		// And some nice error messages ;)
		if (isNaN(pomLength) || pomLength < 5 || pomLength > 25) {
			let msg

			if (isNaN(pomLength)) {
				msg = `Give me some real time, bro ! Can't work with NaNs.`
			} else if (pomLength < 5) {
				msg =
					'Less than five minutes is too short. Why bother pomming for this ? Do it right away !'
			} else if (pomLength > 25) {
				msg = `Woah there ! You'll perform better if you split that task and make every part take less than 25 minutes.`
			}

			await message.channel.send(msg)

			return
		}

		// Save the pom
		let pom = {
			startTimestamp: Math.floor(Date.now() / 1000),
			length: pomLength,
			channelId: message.channel.id
		}

		let res = await bot.db
			.table('poms')
			.insert(pom)
			.run(bot.conn)

		let userPom = {
			userId: message.author.id,
			pomId: res.generated_keys[0],
			joinedAt: Math.floor(Date.now() / 1000)
		}

		res = await bot.db
			.table('user_poms')
			.insert(userPom)
			.run(bot.conn)

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

		message.channel.send({ embed })

		console.log(
			`[START] User ${
				message.author.tag
			} started a ${pomLength} minutes long pom.`
		)
	}
}
