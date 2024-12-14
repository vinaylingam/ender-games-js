import { getDonations } from '../../DAO/AnigameDonationsDAO.js';
import { buildDonationsViewEmbed, isPartOfAnyClan } from '../../utils/AnigameDonationsManager.js';

const name = 'Donations';
const description = 'view members and remaining donation amount after the weekly deduction';
const aliases = ['donations'];
const execute = async (message, client, conn, args) => {
	const commandBy = message.author.id;

	const isPart = await isPartOfAnyClan(conn, commandBy);
	if (isPart) {
		const donations = await getDonations(conn, message.guild.id);
		const members = donations.AnigameDonations[0].Members;
		buildDonationsViewEmbed(message, members);
	}
	else {
		message.reply('You don\'t have access to this command, you are not part of any anigame clan..!');
	}
};

export { name, description, aliases, execute };