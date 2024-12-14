import { MessageMentions } from 'discord.js';

const getUserId = (user) => {
	const userId = user.matchAll(MessageMentions).next().value;
	return (userId) ? userId[1] : null ;
};

const formatAmount = (amount) => {
	return new Intl.NumberFormat('en-US').format(amount);
};

const getNumbers = (args) => {
	const nums = [];
	args.forEach(x => {
		if (!isNaN(parseInt(x))) {
			nums.push(x);
		}
	});
	return nums;
};

export { getUserId, formatAmount, getNumbers };