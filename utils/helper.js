import { MessageMentions} from 'discord.js';

const helper = {
    getUserId (user) {
        const userId = user.matchAll(MessageMentions).next().value;
        return (userId)? userId[1] : null ;
    }
}

export { helper };