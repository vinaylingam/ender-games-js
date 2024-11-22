const findMemberInDonations = async (conn, memberId) => {
    const collection = conn.collection('server');

    const members = await collection.find({
        'AnigameDonations.Members.Id' : memberId
    }).toArray();
    return members;
}

const getDonations = async (conn, serverId) => {
    const collection = conn.collection('server');

    const donations = await collection.find({
        'ServerId': serverId
    }).toArray();

    return donations[0];
}

export { findMemberInDonations, getDonations };