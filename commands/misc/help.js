import config from '../../config.js';

const name = 'help';
const description = 'Description of commands available';
const execute = (message, client, conn, args) => {
	const data = [];
	const { commands } = message.client;

	if (!args.length) {
		data.push('Here\'s a list of all my commands:\n');
		data.push(commands.map(command => command.name).join(', '));
		data.push(`\nYou can send \`${config.prefix}help [command name]\` to get info on a specific command!`);

		message.channel.send({ content: data.join('\n'), split: true });
		return;
		// return message.author.send(data, { split: true })
		// 	.then(() => {
		// 		if (message.channel.type === 'dm') return;
		// 		message.reply('I\'ve sent you a DM with all my commands!');
		// 	})
		// 	.catch(error => {
		// 		console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
		// 		message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
		// 	});
	}

	const name = args[0].toLowerCase();
	const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

	if (!command) {
		return message.reply('that\'s not a valid command!');
	}

	data.push(`**Name:** ${command.name}`);

	if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
	if (command.description) data.push(`**Description:** ${command.description}`);
	if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

	data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

	message.channel.send({ content: data.join('\n'), split: true });
};

export { name, description, execute };