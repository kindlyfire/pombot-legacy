# Database

The database is RethinkDB. The connection can we configured in `config.js` (`db` key). Because it's a document-based database, the data schema is unclear. This document details each table and what it contains, trying to use TypeScript interfaces (I didn't check them to be valid though). There's an interface for every table, indexes are specified

```ts
// Indexes: channelId, serverId
interface poms {
	startTimestamp: number
	length: number
	channelId: string // Discord Channel ID
	serverId?: string // Discord Guild ID
}

// Indexes: userId, pomId
interface user_poms {
	userId: string // Discord User ID
	pomId: string // -> poms.id
	joinedAt: number
}

// Indexes: userId
interface profiles {
	userId: string // Discord User ID
	tag: string // Discord User tag
	avatarURL: string // Discord User avatarURL
	pomsStarted: number
	pomsFinished: number
	pomsTotalTime: number
}
```
