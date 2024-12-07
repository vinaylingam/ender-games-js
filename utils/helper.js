import { MessageMentions } from 'discord.js';

const getUserId = (user) => {
	const userId = user.matchAll(MessageMentions).next().value;
	return (userId) ? userId[1] : null ;
};

const formatAmount = (amount) => {
	return new Intl.NumberFormat('en-US').format(amount);
};


export { getUserId, formatAmount };