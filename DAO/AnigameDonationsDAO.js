const findMemberInDonations = async (conn, memberId) => {
	const collection = conn.collection('server');

	const members = await collection.find({
		'AnigameDonations.Members.Id' : memberId,
	}).toArray();
	return members;
};

const getDonations = async (conn, serverId) => {
	const collection = conn.collection('server');

	const donations = await collection.find({
		'ServerId': serverId,
	}).toArray();

	return donations[0];
};

const getAnigameDonationChannelByServer = async (conn, serverId) => {
	let channel = '';
	const collection = conn.collection('server');
	const servers = collection.find();
	await servers.forEach(x => {
		if (x != null && x['AnigameDonations'] != null && x['ServerId'] == serverId) {
			if (channel == '') {
				const anigameDonations = x['AnigameDonations'];
				anigameDonations.forEach(y => {
					channel = y['Channel'];
				});
			}
		}
	});
	return channel;
};

const getAnigameDonationChannels = async (conn) => {
	const channelIds = [];
	const collection = conn.collection('server');
	const servers = collection.find();
	await servers.forEach(x => {
		if (x != null && x['AnigameDonations'] != null) {
			const anigameDonations = x['AnigameDonations'];
			anigameDonations.forEach(y => {
				channelIds.push(String(y['Channel']));
			});
		}
	});
	return channelIds;
};

const resetWeeklyDonation = async (conn, collectionName, serverId, channelId, reduceAmount, newLog) => {
	const collection = conn.collection(collectionName);

	const filter = {
		'ServerId': serverId,
		'AnigameDonations.Channel': channelId,
	};

	const update = {
		$inc: {
			'AnigameDonations.$[donation].Members.$[].amount': -1 * parseInt(reduceAmount, 10),
		},
		$push: {
			'AnigameDonations.$[donation].Logs': newLog,
		},
	};

	const options = {
		arrayFilters: [
			{ 'donation.Channel': channelId },
		],
	};

	await collection.updateOne(filter, update, options);
};

export { findMemberInDonations, getDonations, getAnigameDonationChannelByServer, getAnigameDonationChannels, resetWeeklyDonation };