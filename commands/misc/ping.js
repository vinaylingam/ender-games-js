const name = 'ping';
const description = 'Ping!';
const execute = (message, _client, _conn, _args) => {
	message.channel.send('Pong.');
};

export { name, description, execute };