const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reminders')
		.setDescription('Shows reminders panel!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};