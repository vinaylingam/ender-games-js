const helper = require('./helper.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const rpsDAO = require('./../DAO/rps.js');

module.exports = {
    ANSWER_RPS : {
            rock: "roll_of_paper",
            roll_of_paper: "scissors",
            scissors: "rock"
    },

    row : new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('rock')
            .setStyle('PRIMARY')
            .setLabel('Rock')
            .setEmoji('🪨'), // rock emote
        new MessageButton()
            .setCustomId('roll_of_paper')
            .setStyle('PRIMARY')
            .setLabel('Paper')
            .setEmoji('🧻'), // paper emote
        new MessageButton()
            .setCustomId('scissors')
            .setStyle('PRIMARY')
            .setLabel('Scissors')
            .setEmoji('✂️'), // scissor emote
    ),

    getUserId (user) {
        const userId = helper.getUserId(user);
        if (userId)  
            return userId; 
        throw new Error('InvalidArguments');
    },
    
    playerName (player) {
        return player.nickname ? player.nickname : player.user.username;
    },

    playerMessages (messageIdentifier, messageType, choice) {
        if (messageType == 1) {
            // player didn't choose yet.
            return `${this.playerName(messageIdentifier)} is choosing..\n`;
        } else if (messageType == 2) {
            // player choose the pick
            return `${this.playerName(messageIdentifier)} is ready\n`;
        } else if (messageType == 3) {
            // reveal
            return `${this.playerName(messageIdentifier)} chose :${choice}:\n`;
        }
    },

    async declareWinner (conn, firstChoice, secondChoice, messageObject, player1, player2, vs, p1Score, p2Score) {

        const winningResponse = this.ANSWER_RPS[firstChoice];
        let player1Message = this.playerMessages(player1, 3, firstChoice);
        let player2Message = this.playerMessages(player2, 3, secondChoice);
        const winText = ' and WON..!!! :tada:\n';

        if (firstChoice == secondChoice) {
            let tieMessage = "Look at y'all! You're like twinsies!\n";
            player2Message += tieMessage;
        } else if (secondChoice == winningResponse) {
            p2M = player2Message.substr(0, player2Message.length-1);
            player2Message = p2M + winText;
            await rpsDAO.updateWinner(conn, player2.id, player1.id);
            p2Score +=1;
        } else {
            p1M = player1Message.substr(0, player1Message.length-1);
            player1Message = p1M + winText;
            await rpsDAO.updateWinner(conn, player1.id, player2.id);
            p1Score +=1;
        }

        const scoresMsg = `**${p1Score}** - **${p2Score}**\n`;
        messageObject.edit({
            content: vs + scoresMsg + player1Message + player2Message
        })
    },

    async getScores(conn, p1Id, p2Id) {
        return [await rpsDAO.getScore(conn, p1Id, p2Id), await rpsDAO.getScore(conn, p2Id, p1Id)];
    }

}