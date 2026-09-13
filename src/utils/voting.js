// Oyuncunun görünen adı; ad girilmemişse "Oyuncu 3" gibi numaralı ad kullanılır.
export const getPlayerName = (player, t) =>
  player?.name || `${t('game.player')} ${player?.id}`;

// votes: { [oyVerenId]: oyAlanId }
// outcome: 'groupWins' | 'innocentEliminated' | 'tie' | 'troll'
export const calculateVoteResult = (players, votes, isTrollRound) => {
  const counts = Object.fromEntries(players.map(p => [p.id, 0]));
  Object.values(votes).forEach(targetId => {
    if (counts[targetId] !== undefined) {
      counts[targetId] += 1;
    }
  });

  const maxVotes = Math.max(0, ...Object.values(counts));
  const topIds =
    maxVotes > 0
      ? players.filter(p => counts[p.id] === maxVotes).map(p => p.id)
      : [];

  // Tek bir en çok oy alan yoksa beraberlik sayılır ve kimse elenmez.
  const isTie = topIds.length !== 1;
  const eliminated = isTie ? null : players.find(p => p.id === topIds[0]);

  let outcome;
  if (isTrollRound) {
    outcome = 'troll';
  } else if (eliminated?.isImposter) {
    outcome = 'groupWins';
  } else if (isTie) {
    outcome = 'tie';
  } else {
    outcome = 'innocentEliminated';
  }

  const ranking = [...players].sort((a, b) => counts[b.id] - counts[a.id]);

  return { counts, topIds, isTie, eliminated, outcome, ranking };
};
