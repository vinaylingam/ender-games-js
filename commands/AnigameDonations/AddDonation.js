import { logDonationInDb } from '../../utils/AnigameDonationsManager.js';
import { getAnigameDonationChannelByServer } from '../../DAO/AnigameDonationsDAO.js';
import { DonationTypes } from '../../utils/constants.js';
import { PermissionFlagsBits } from 'discord.js';
import { getNumbers, validateAmount, validateGuildMember } from '../../utils/helper.js';

const name = 'AddDonation';
const description = 'Add donation logs for a member';
const usage = 'h.AddDonation @member <amount>';
const permissions = PermissionFlagsBits.Administrator;
const execute = async (message, client, conn, args) => {

	const users = message?.mentions?.users;
	const numbers = getNumbers(args);

	if (users.size != 1 || numbers.length != 1) {
		message.reply('The proper usage would be: **h.adddonation <@user> <amount>**');
		return;
	}

	const amountValidation = validateAmount(numbers[0]);
	if (!amountValidation.valid) {
		message.reply(`The donation amount ${amountValidation.error}`);
		return;
	}
	const amount = amountValidation.amount;

	const [firstKey, firstValue] = users.entries().next().value;
	const memberValidation = await validateGuildMember(message.guild, firstKey);
	if (!memberValidation.valid) {
		message.reply(memberValidation.error);
		return;
	}

	const channelId = await getAnigameDonationChannelByServer(conn, message.guildId);

	try {
		await logDonationInDb(conn, message.guildId, channelId, message.id, 'server', firstKey, amount, DonationTypes.Admin);
		message.reply(`Donation for ${firstValue.displayName} successfully added`);
	}
	catch (ex) {
		message.reply('Error while adding donation.', ex.message);
	}
};

export { name, description, usage, permissions, execute };