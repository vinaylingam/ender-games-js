const name = 'ping';
const description = 'Ping!';
const execute = (message, conn, args) => {
	message.channel.send('Pong.');
}

export { name, description, execute };