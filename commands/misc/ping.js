module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, conn, args) {
		message.channel.send('Pong.');
	},
};