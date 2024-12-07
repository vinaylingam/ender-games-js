const name = 'ping';
const description = 'Ping!';
const execute = (message, client, conn, args) => {
	message.channel.send('Pong.');
};

export { name, description, execute };