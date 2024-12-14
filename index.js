
import fs from 'node:fs';
import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import config from './config.js';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { logDonation } from './utils/AnigameDonationsManager.js';
import {getAnigameDonationChannels } from './DAO/AnigameDonationsDAO.js';

const { prefix, token, database } = config;
const uri = database.URI;
let conn;
const dbClient = new MongoClient(uri,  {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: false,
		deprecationErrors: true,
	}
	}
);

async function run() {
	  // Connect the client to the server (optional starting in v4.7)
	  await dbClient.connect();
	  // Send a ping to confirm a successful connection
	  await dbClient.db(database.DB).command({ ping: 1 });
	  conn = dbClient.db(database.DB);
	  console.log("Pinged your deployment. You successfully connected to MongoDB!");
};

await run().catch(console.dir);

let anigameDonationChannels = await getAnigameDonationChannels(conn);

// Create a new client instance
const client = new Client({ 
	intents: 
	[GatewayIntentBits.Guilds,  
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildIntegrations,
	GatewayIntentBits.GuildWebhooks,
	GatewayIntentBits.GuildInvites,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildPresences,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildMessageTyping,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.DirectMessageReactions,
	GatewayIntentBits.DirectMessageTyping,
	GatewayIntentBits.MessageContent 
]});
client.commands = new Collection();
client.cooldowns = new Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const commandInFile = await import(`./commands/${folder}/${file}`);
		client.commands.set(commandInFile.name && commandInFile.name.toLowerCase(), commandInFile);
	}
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async message => {

	if (anigameDonationChannels.includes(message.channelId)) {
		logDonation(message, client, conn);
	}

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	var command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;
	command = client.commands.get(command);

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !(authorPerms.has(command.permissions))) {
			return message.reply('You can not do this!');
		}
	}

	if (command.haveArgs && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
	
		return message.channel.send(reply);
	}

	const { cooldowns } = client;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 0) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		await command.execute(message, client, conn, args);
	} catch (error) {
		console.log(error);
		switch(error.message) {
			case 'InvalidArguments':
				if (command.usage) {
					message.reply(`The proper usage would be: \`${prefix}${command.name} ${command.usage}\``);
				}
				break;
			default:
				message.reply('there was an error trying to execute that command!');
		}	
	}
});

// Login to Discord with your client's token
client.login(token);