import { EmbedBuilder } from 'discord.js';
import { findMemberInDonations, resetWeeklyDonation as resetweeklydonationDAO, getAnigameDonationChannelByServer } from '../DAO/AnigameDonationsDAO.js';
import { formatAmount } from './helper.js';
import { DonationTypes } from './constants.js';

const AnigameBotId = '571027211407196161';
const summonerAndGoldRegex = /Summoner \*\*(.+?)\*\*, you have donated \*\*([\d,]+)\*\* Gold.*/;

const logDonation = async (message, client, conn) => {
	const isDonationSuccess = message.embeds.length > 0 && message.embeds[0].data.title.indexOf('Success') > -1;
	let user;
	if (message.author.id == AnigameBotId && isDonationSuccess) {
		const match = message.embeds[0].data.description.match(summonerAndGoldRegex);
		if (match) {
			const summonerName = match[1];
			const goldDonatedRaw = match[2];

			const channel = client.channels.cache.get(message.channelId);

			const goldDonated = goldDonatedRaw.replace(/,/g, '');
			if (message.guild) {
				user = await message.guild.members.fetch({ query: summonerName, limit: 1 });
			}

			if (user) {
				let userId;
				user.forEach(x => {
					userId = x.id;
				});
				await logDonationInDb(conn, message.guildId, message.channelId, message.Id, 'server', userId, goldDonated, DonationTypes.Self);
			}
			channel.send(`**${summonerName}** has donated **${goldDonatedRaw}** gold`);
		}
	}
};

// Usage
const logDonationInDb = async (conn, serverId, channelId, messageId, collection, memberId, amount, type = DonationTypes.Self) => {
	await updateMemberOrAddNew(
		conn,
		collection,
		serverId,
		channelId,
		memberId,
		amount,
		{
			Date: new Date().toISOString(),
			Amount: parseInt(amount, 10),
			Link: `https://discord.com/channels/${serverId}/${channelId}/${messageId}`,
			type: type,
		},
	);
};

const updateMemberOrAddNew = async (conn, collectionName, serverId, channelId, memberId, incrementAmount, newLog) => {
	const collection = conn.collection(collectionName);

	// update donation amount in AnigameDonations
	await collection.updateOne(
		{
			'ServerId': serverId,
			'AnigameDonations.Channel': channelId,
		},
		{
			$inc: {
				'AnigameDonations.$.Amount': parseInt(incrementAmount, 10),
			},
		},
	);

	const filter = {
		'ServerId': serverId,
		'AnigameDonations.Channel': channelId,
		'AnigameDonations.Members.Id': memberId,
	};

	const update = {
		$inc: {
			'AnigameDonations.$[donation].Members.$[member].amount': parseInt(incrementAmount, 10),
		},
		$push: {
			'AnigameDonations.$[donation].Members.$[member].Logs': newLog,
		},
	};

	const options = {
		arrayFilters: [
			{ 'donation.Channel': channelId },
			{ 'member.Id': memberId },
		],
	};

	const result1 = await collection.updateOne(filter, update, options);

	if (result1 == null || result1?.matchedCount === 0) {
		const newMember = {
			Id: memberId,
			amount: parseInt(incrementAmount, 10),
			Logs: [newLog],
		};

		await insertNewMemberDonation(conn, collectionName, serverId, channelId, newMember);
	}
};

const insertNewMemberDonation = async (conn, collectionName, serverId, channelId, newMember) => {

	const collection = conn.collection(collectionName);
	await collection.updateOne(
		{
			'ServerId': serverId,
			'AnigameDonations.Channel': channelId,
		},
		{
			$push: {
				'AnigameDonations.$.Members': newMember,
			},
		},
	);
};

const isPartOfAnyClan = async (conn, id) => {
	const members = await findMemberInDonations(conn, id, 'server');
	if (members.length > 0) {
		return true;
	}
	return false;
};

const buildDonationsViewEmbed = (message, members) => {

	const viewAdvDonations = viewTemplateForDonationsOrDues(members);
	const viewDueDonations = viewTemplateForDonationsOrDues(members, true);

	const view = `${viewAdvDonations} ${(viewAdvDonations != '' ? '\n\n' : '')} ${viewDueDonations != '' ? '**Due Members**\n' : ''} ${viewDueDonations}`;
	const exampleEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Anigame Donations')
		.setAuthor({ name: `${message.author.displayName}`, iconURL: `${message.author.displayAvatarURL()}` })
		.setDescription(view);

	message.reply({ embeds: [exampleEmbed] });
};

const viewTemplateForDonationsOrDues = (members, getDue = false) => {
	let viewTemplate = '';
	let count = 0;
	members.forEach((x) => {
		if ((getDue && x.amount < 0) || (!getDue && x.amount >= 0)) {
			viewTemplate += `**${count + 1}**`;
			viewTemplate += ' | ';
			viewTemplate += `<@${x.Id}> (${x.Id})\n`;
			viewTemplate += `   donation: **${formatAmount(x.amount)}**\n`;
			count += 1;
		}
	});
	return viewTemplate;
};


const resetWeeklyDonation = async (conn, collectionName, message, reduceAmount) => {
	const newLog = {
		Date: new Date().toISOString(),
		Amount: parseInt(reduceAmount, 10),
		By: message.author.id,
	};
	const channelId = await getAnigameDonationChannelByServer(conn, message.guildId);
	await resetweeklydonationDAO(conn, collectionName, message.guildId, channelId, reduceAmount, newLog);
};

export { logDonation, logDonationInDb, isPartOfAnyClan, buildDonationsViewEmbed, viewTemplateForDonationsOrDues, resetWeeklyDonation };