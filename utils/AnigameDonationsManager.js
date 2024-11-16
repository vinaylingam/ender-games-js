const AnigameBotId = '571027211407196161';
const summonerAndGoldRegex = /Summoner \*\*(.+?)\*\*, you have donated \*\*([\d,]+)\*\* Gold.*/;

const getAnigameDonationChannels = async (conn) => {
    let channelIds = [];
    let collection = conn.collection('server');
    let servers = collection.find();
    await servers.forEach(x => {
        if (x != null && x['AnigameDonations'] != null && x['AnigameDonations'] != '') {
            let anigameDonations = x['AnigameDonations']
            anigameDonations.forEach(y => {
                channelIds.push(String(y['Channel']));
            })
        }
    })
    return channelIds;
}; 

const logDonation = async (message, client, conn) => {
    const isDonationSuccess = message.embeds.length > 0 && message.embeds[0].data.title.indexOf('Success') > -1;
    let user;
    if (message.author.id == AnigameBotId && isDonationSuccess) {
        const match = message.embeds[0].data.description.match(summonerAndGoldRegex);
        if (match) {
            const summonerName = match[1];
            const goldDonatedRaw = match[2];

            const channel = client.channels.cache.get(message.channelId);
            channel.send(`**${summonerName}** has donated **${goldDonatedRaw}** gold`);

            const goldDonated = goldDonatedRaw.replace(/,/g, '');
            if (message.guild) {
                user = await message.guild.members.fetch({ query: summonerName, limit: 1 });
            }

            if (user) {
                let userId;
                user.forEach(x => {
                    userId = x.id;
                });
                await logDonationInDb(conn, message, 'server', userId, goldDonated);
            }
        }
    }
} 

// Usage
const logDonationInDb = async (conn, message, collection, memberId, amount) => {
  await updateMemberOrAddNew(
      conn,
      collection,
      message.guildId,
      message.channelId,
      memberId,  // memberIds
      amount, // amount to add
      { 
          Date: new Date().toISOString(), 
          Amount: parseInt(amount, 10), 
          Link: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` 
      }  // newLog
  );
}

const updateMemberOrAddNew = async (conn, collectionName, serverId, channelId, memberId, incrementAmount, newLog) => {
    const collection = conn.collection(collectionName);

    // update donation amount in AnigameDonations
    await collection.updateOne(
        {
            "ServerId": serverId,
            "AnigameDonations.Channel": channelId
        },
        {
            $inc: {
                "AnigameDonations.$.Amount": parseInt(incrementAmount, 10)
            }
        }
    );

    const filter = {
        "ServerId": serverId,
        "AnigameDonations.Channel": channelId,
        "AnigameDonations.Members.Id": memberId
    };

    const update = {
        $inc: {
        "AnigameDonations.$[donation].Members.$[member].amount": parseInt(incrementAmount, 10)
        },
        $push: {
            "AnigameDonations.$[donation].Members.$[member].Logs": newLog
        }
    };

    const options = {
        arrayFilters: [
            { "donation.Channel": channelId }, // Array filter for AnigameDonations
            { "member.Id": memberId }      // Array filter for Members
          ]
    };

    let result1 = await collection.updateOne(filter, update, options);

    if (result1 == null || result1?.matchedCount === 0) {
        const newMember = {
            Id: memberId,
            amount: parseInt(incrementAmount, 10),
            Logs: [newLog]
        };

        await insertNewMemberDonation(conn, collectionName, serverId, channelId, newMember);
    }
}

const insertNewMemberDonation = async (conn, collectionName, serverId, channelId, newMember) => {

    const collection = conn.collection(collectionName);
    var result = await collection.updateOne(
        { 
            "ServerId": serverId,
            "AnigameDonations.Channel": channelId
        },
        {
            $push: {
            "AnigameDonations.$.Members": newMember
            }
        }
    );
}
  

export { getAnigameDonationChannels, logDonation };