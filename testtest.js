// Require MongoDB language driver
import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './test-config.js';

const { prefix: _prefix, token: _token, database } = config;
const uri = database.URI;
let conn;
const dbClient = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: false,
		deprecationErrors: true,
	},
},
);

async function run() {
	// Connect the client to the server (optional starting in v4.7)
	await dbClient.connect();
	// Send a ping to confirm a successful connection
	await dbClient.db(database.DB).command({ ping: 1 });
	conn = dbClient.db(database.DB);
	console.log('Pinged your deployment. You successfully connected to MongoDB!');
}

await run().catch(console.dir);

// server
const collection = conn.collection('server');

// insert
const _sampleserver = {
	serverid: '3',
	staff: [],
	AnigameDonations: [],
};
// let result = await collection.insertOne(sampleserver);

// update
const _sampleDonation = {
	IdOrName: 'b',
	Channel: '124',
	Members: [],
};

const _sampleMember = {
	id: 'm1',
	amount: 10,
	logs: [],
};

// donation
// let result = await collection.updateOne(
//     {
//         serverid: '1'
//     },
//     {
//         $push: {
//             "AnigameDonations": sampleDonation
//         }
//     }
// );

// update donation
// let result = await collection.updateOne(
//     {
//         "AnigameDonations.Channel": "123" // Filter for the array element
//     },
//     {
//         $set:
//             {
//                 "AnigameDonations.$.IdOrName": "aa" // Update the specific field
//             }
//     }
// );

const _member = {
	Id: '123456',
	amount: 1,
	Logs: [],
};
// push member
// let result = await collection.updateOne(
//     {
//         "AnigameDonations.Channel": "123" // Filter for the array element
//     },
//     {
//         $push:
//             {
//                 "AnigameDonations.$.Members": member // Update the specific field
//             }
//     }
// );

// update member
const log = {
	Date: new Date().toISOString(),
	Amount: 500,
	Link: 'https://discord.com/channels/qwer/rtye/nxfgh',
};
const result = await collection.updateOne(
	{
		'AnigameDonations.Channel': '123', // Match the specific Channel
		'AnigameDonations.Members.Id': '123456', // Match the specific member by Id
	},
	{
		//   $set: {
		//     "AnigameDonations.$[donation].Members.$[member]": { // Replace with the new member object
		//       Id: "123456",
		//       amount: 10,
		//       Logs: []
		//     }
		//   }
		$inc: {
			'AnigameDonations.$[donation].Members.$[member].amount': 101,
		},
		$push: {
			'AnigameDonations.$[donation].Members.$[member].Logs': log,
		},
	},
	{
		arrayFilters: [
			{ 'donation.Channel': '123' }, // Array filter for AnigameDonations
			{ 'member.Id': '123456' }, // Array filter for Members
		],
	},
);
//
console.log(result);