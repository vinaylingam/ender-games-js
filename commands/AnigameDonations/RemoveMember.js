import { removeMemberDonationRecord } from '../../utils/AnigameDonationsManager.js';
import { PermissionFlagsBits } from 'discord.js';
import { formatAmount } from '../../utils/helper.js';

const name = 'RemoveMember';
const description = 'Remove a member from the donations list';
const usage = 'h.RemoveMember <@user | userId>';
const permissions = PermissionFlagsBits.Administrator;
const aliases = ['removemember', 'removedonation'];

const execute = async (message, client, conn, args) => {
	if (args.length !== 1) {
		message.reply(`The proper usage would be: **${usage}**`);
		return;
	}

	let targetId = null;
	const users = message?.mentions?.users;
	if (users && users.size === 1) {
		targetId = users.first().id;
	}
	else if (/^\d{17,20}$/.test(args[0])) {
		targetId = args[0];
	}

	if (!targetId) {
		message.reply(`The proper usage would be: **${usage}**`);
		return;
	}

	try {
		const removedAmount = await removeMemberDonationRecord(conn, message.guildId, targetId, message.author.id);
		if (removedAmount === null) {
			message.reply('User is not in the donations list for this server.');
		}
		else {
			message.reply(`Successfully removed <@${targetId}> from donations list. Recorded final donation amount: **${formatAmount(removedAmount)}** gold.`);
		}
	}
	catch (ex) {
		message.reply(`Error while removing member: ${ex.message}`);
	}
};

export { name, description, usage, permissions, aliases, execute };
