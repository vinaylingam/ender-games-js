const { MessageMentions: { USERS_PATTERN } } = require('discord.js')
module.exports = {
    getUserId (user) {
        const userId = user.matchAll(USERS_PATTERN).next().value;
        return (userId)? userId[1] : null ;
    }
}