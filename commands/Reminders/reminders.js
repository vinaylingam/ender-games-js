import { SlashCommandBuilder } from '@discordjs/builders';

const name = 'reminders';
const description = 'show reminders';
const data = new SlashCommandBuilder()
	.setName('reminders')
	.setDescription('Shows reminders panel!');

const execute = async (interaction) => {
	await interaction.reply('Pong!');
};

export { name, description, data, execute };
