import { SlashCommandBuilder } from '@discordjs/builders';


const data = new SlashCommandBuilder()
	.setName('reminders')
	.setDescription('Shows reminders panel!');

const execute = async (interaction) => {
	await interaction.reply('Pong!');
}

export { data, execute };
