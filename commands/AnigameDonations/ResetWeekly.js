import { PermissionFlagsBits } from 'discord.js';
import { getNumbers } from '../../utils/helper.js';
import { resetWeeklyDonation } from '../../utils/AnigameDonationsManager.js';

const name = 'ResetWeekly';
const description = 'Reset weekly donation';
const usage = 'h.resetweekly <amount>';
const permissions = PermissionFlagsBits.Administrator;
const execute = async (message, client, conn, args) => {
    const numbers = getNumbers(args);
        
    if (numbers.length != 1) {
		message.reply(`The proper usage would be: **${usage}**`);
		return;
	}

    await resetWeeklyDonation(conn, 'server', message, numbers[0]);
    message.reply('Successfully reset this weeks donation');
};

export { name, description, usage, permissions, execute };