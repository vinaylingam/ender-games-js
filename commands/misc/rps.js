const rps = require('./../../utils/rps.js');

module.exports = {
    name: 'rps',
    description: 'Rock Paper Scissors',
    usage: '<player>',
    args: true,
    guildOnly: true,
    cooldown: 5,
    async execute(message, conn, args) {

        const player1id = message.author.id;
        const player1 = await message.guild.members.fetch(player1id);
        const player2id = rps.getUserId(args[0]);
        const player2 = await message.guild.members.fetch(player2id);
        var matchFinished = false;

        if (player1id == player2id) {
            message.reply('You can\'t play with yourself :eyes:');
            return;
        }

        let player1Choice = null;
        let player2Choice = null;
        let player1Message = rps.playerMessages(player1, 1);
        let player2Message = rps.playerMessages(player2, 1);

        const vs = `**${rps.playerName(player1)}** vs **${rps.playerName(player2)}**\n`;

        const [ player1score, player2score ] = await rps.getScores(conn, player1id, player2id);
        const scoresMsg = `**${player1score}** - **${player2score}**\n`;

        const sentMessage = await message.channel.send({
            content: vs + scoresMsg + player1Message + player2Message, 
            components: [rps.row]
        });

        const collector = sentMessage.createMessageComponentCollector({ componentType: 'BUTTON', time: 20000 });

        collector.on('collect', choose => {
            choose.deferUpdate();
            if (choose.user.id == player1id) {
                player1Choice = !player1Choice ? choose.customId : player1Choice;
                player1Message = rps.playerMessages(player1, 2);
            } else if (choose.user.id == player2id) {
                player2Choice = !player2Choice ? choose.customId : player2Choice;
                player2Message = rps.playerMessages(player2, 2);
            }  

            sentMessage.edit({
                content: vs + scoresMsg + player1Message + player2Message,
                components: [rps.row]
            });

            if (player1Choice && player2Choice && !matchFinished) {
                matchFinished = true;
                rps.declareWinner(conn, player1Choice, player2Choice, sentMessage, player1, player2, vs, player1score, player2score);
            }
        });

        collector.on('end', () => {
            if (!player1Choice || !player2Choice) {
                sentMessage.edit({
                    content: vs + scoresMsg + 'guess, no one wants to play..!!'
                });
            }
        })
    }
}