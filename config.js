const config = {
	'prefix': process.env.BOT_PREFIX,
	'clientId': process.env.CLIENT_ID,
	'guildId': process.env.GUILD_ID,
	'token': process.env.BOT_TOKEN,
	'database': {
		'URI': process.env.DATABASE_URI,
		'DB': process.env.DATABASE_NAME,
	},
};

export default config;