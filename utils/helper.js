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

const validateAmount = (amountStr) => {
	if (!amountStr || !/^-?\d+$/.test(amountStr)) {
		return { valid: false, error: 'must be a valid whole number!' };
	}
	const amount = parseInt(amountStr, 10);
	if (isNaN(amount)) {
		return { valid: false, error: 'must be a valid whole number!' };
	}
	if (amount < -1000000000 || amount > 1000000000) {
		return { valid: false, error: 'must be between -1,000,000,000 and 1,000,000,000!' };
	}
	return { valid: true, amount };
};

const validateGuildMember = async (guild, userId) => {
	if (!guild) {
		return { valid: false, error: 'This command can only be used in a server!' };
	}
	const targetMember = guild.members.cache.get(userId) || await guild.members.fetch(userId).catch(() => null);
	if (!targetMember) {
		return { valid: false, error: 'The specified user is not a member of this server!' };
	}
	return { valid: true, member: targetMember };
};

export { getUserId, formatAmount, getNumbers, validateAmount, validateGuildMember };