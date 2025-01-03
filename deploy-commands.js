const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildIds, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('reminders').setDescription('Shows reminders panel!'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

guildIds.forEach(guildId => {
	rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
});
