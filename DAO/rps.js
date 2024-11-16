const rpsDAO = {
    async getScore (conn, playerId, opponentId) {
        const rpsCol = conn.collection('rps');

        var query = { player : playerId };
        var scoreDoc = await rpsCol.findOne(query);
        if (!scoreDoc) {
             await rpsCol.updateOne(
                query, 
                { 
                    $set : {
                        'opponent' : [ 
                            {
                                'id' : opponentId,
                                'score' : 0 
                            }
                        ]
                    } 
                }, 
                { upsert : true}
            )
             return 0;
        }
        
        query = { 
            player : playerId,
            'opponent.id' : opponentId
        };
        var scores = await rpsCol.findOne(query);
        if (!scores) {
            await rpsCol.updateOne({ player : playerId }, { $push : {'opponent' : {'id': opponentId, 'score':0 }} }, {upsert : true});
            return 0;
        }

        var pScore = scores.opponent.find( (opp) => opp.id == opponentId);
            if (pScore) {
                return pScore.score;
            }
        return 0;

    },

    async updateWinner (conn, winner, looser) {
        const rpsCol = conn.collection('rps');
        const query = { player : winner, 'opponent.id' : looser};
        const update = {  $inc : { 'opponent.$.score' : 1} };
        
        rpsCol.updateOne(query, update, { upsert : true});
    }
}

export { rpsDAO };