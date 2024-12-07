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

export { findMemberInDonations, getDonations, getAnigameDonationChannelByServer };