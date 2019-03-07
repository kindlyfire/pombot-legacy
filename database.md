# Database

The database is RethinkDB. The connection can be configured in `config.js` (`db` key). Because it's a document-based database, the data schema is unclear. This document details each table and what it contains, trying to use TypeScript interfaces (I didn't check them to be valid though). There's an interface for every table, indexes are specified

```ts
// Channel pomodoros
//
// @indexes: channelId, serverId
interface poms {
	startTimestamp: number
	length: number
	channelId: string // Discord Channel ID
	serverId: string // Discord Guild ID
	messageId: string // Discord Message ID
}

// Link between Discord users and poms
//
// @indexes: userId, pomId
interface user_poms {
	userId: string // Discord User ID
	pomId: string // -> poms.id
	joinedAt: number
}

// User profiles
//
// @indexes: userId, serverId
interface profiles {
	userId: string // Discord User ID
	serverId?: string // Discord Server ID
	tag: string // Discord User tag
	avatarURL: string // Discord User avatarURL
	pomsStarted: number
	pomsFinished: number
	pomsTotalTime: number
}

// Channels the bot is turned on
//
// @indexes: channelId, serverId
interface channels {
	channelId: string
	serverId: string
}
```
