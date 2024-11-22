import { findMemberInDonations, getDonations } from '../../DAO/AnigameDonationsDAO.js';
import { EmbedBuilder } from 'discord.js';

const name = 'viewAnigameDonations';
const description = 'view members and remaining donation amount after the weekly deduction';
const execute = async (message, client, conn, args) => {
    const commandBy = message.author.id;
    
    const isPart = await isPartOfAnyClan(conn, commandBy);
    if(isPart) {
        const donations = await getDonations(conn, message.guild.id);
        const members = donations.AnigameDonations[0].Members;
        buildDonationsViewEmbed(message, members);
    }
    else {
        message.reply(`You don't have access to this command, you are not part of any anigame clan..!`);
    }
}

const isPartOfAnyClan = async (conn, id) => {
    const members = await findMemberInDonations(conn, id, 'server');
    if(members.length > 0) {
        return true;
    }
    return false;
}

const buildDonationsViewEmbed = (message, members) => {
    console.log(message);

    const viewAdvDonations = viewTemplateForDonations(members);
    const viewDueDonations = viewTemplateForDonations(members, true);

    const view = `${viewAdvDonations + (viewAdvDonations != '' ? '\n\n\n' : '') + viewDueDonations}`
    const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Anigame Donations')
	.setAuthor({ name: `${message.author.displayName}`, iconURL: `${message.author.displayAvatarURL()}` })
	.setDescription(view);

    message.reply({ embeds: [exampleEmbed] });
}

const viewTemplateForDonations = (members, getDue = false) => {
    let viewTemplate = '';
    members.forEach((x, index) => {
        if((getDue && x.amount < 0) || (!getDue && x.amount >= 0)) {
            viewTemplate += `**${index+1}**`;
            viewTemplate += ` | `;
            viewTemplate += `<@` + x.Id + '>\n';
            viewTemplate += `   donation: ${formatAmount(x.amount)}\n`;
        }
    });
    return viewTemplate;
}

const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
}

export {name, description, execute};