const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let database = await lib.googlesheets.query['@0.3.0'].select({
  range: `A:D`,
  bounds: `FIRST_EMPTY_ROW`,
});

database.rows.sort((a, b) => {
  return parseInt(b.fields.XP) - parseInt(a.fields.XP);
});

let leaderBoard = [];
database.rows.slice(0, 10).forEach((row) => {
  let user = row.fields.Username;
  let stats = `**Level:** ${row.fields.Level} **XP:** ${row.fields.XP}`;
  leaderBoard.push({name: user, value: stats});
});

try {
  await lib.discord.channels['@0.3.2'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: '',
    embed: {
      title: 'Leaderboard',
      type: 'rich',
      color: 0xffa200,
      description: '',
      fields: leaderBoard,
    },
  });
} catch (e) {
  console.log(e);
  await lib.discord.interactions['@1.0.1'].responses.ephemeral.create({
    token: `${context.params.event.token}`,
    content: '',
    tts: false,
    embeds: [
      {
        type: 'rich',
        title: `Error`,
        description: `${e}`,
        color: 0xffb300,
      },
    ],
  });
}

