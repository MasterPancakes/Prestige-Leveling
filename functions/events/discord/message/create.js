const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let database = await lib.googlesheets.query['@0.3.0'].select({
  range: `A:D`,
  bounds: 'FIRST_EMPTY_ROW',
  where: [
    {
      ID__icontains: `${context.params.event.author.id}`,
    },
  ],
  limit: {
    count: 0,
    offset: 0,
  },
});

let startingLevel = 0;
let xp = 1;
let level = 0;
if (database.rows.length !== 0) {
  startingLevel = database.rows[0].fields.Level;
  xp = parseInt(database.rows[0].fields.XP) + parseInt(1);
  level = Math.floor(xp / 100);
}

if (database.rows.length === 0) {
  await lib.googlesheets.query['@0.3.0'].insert({
    range: `A:D`,
    fieldsets: [
      {
        ID: `${context.params.event.author.id}`,
        Username: `${context.params.event.author.username}`,
        Level: `0`,
        XP: `1`,
      },
    ],
  });
} else {
  await lib.googlesheets.query['@0.3.0'].update({
    range: `A:D`,
    bounds: 'FULL_RANGE',
    where: [
      {
        ID__icontains: `${context.params.event.author.id}`,
      },
    ],
    limit: {
      count: 0,
      offset: 0,
    },
    fields: {
      Username: `${context.params.event.author.username}`,
      Level: level,
      XP: xp,
    },
  });
  if (level > startingLevel) {
    if (xp === 1000) {
      await lib.discord.channels['@0.3.0'].messages.create({
        channel_id: `${context.params.event.channel_id}`,
        content: `<@!${context.params.event.author.id}>`,
        tts: false,
        embeds: [
          {
            type: 'rich',
            title: `Level 10`,
            description: `WOAH ${context.params.event.author.username}, you've actually done it! You have gotten all the way to **Level 10** and received the <@&${process.env.LEVEL10_ROLE_ID}> role. Thanks for being active.`,
            color: 0xffb300,
            footer: {
              text: `Thanks for using Prestige Leveling. Be sure to check out other apps on https://autocode.com/apps/`,
            },
          },
        ],
      });
      await lib.discord.guilds['@0.2.4'].members.roles.update({
        role_id: `${process.env.LEVEL10_ROLE_ID}`,
        user_id: `${context.params.event.author.id}`,
        guild_id: `${context.params.event.guild_id}`
      });
    } else {
      await lib.discord.channels['@0.3.0'].messages.create({
        channel_id: `${context.params.event.channel_id}`,
        content: `<@!${context.params.event.author.id}>`,
        tts: false,
        embeds: [
          {
            type: 'rich',
            title: `Level Up`,
            description: `Wow ${context.params.event.author.username}, I didn't know you were **__THIS__** active. You just moved up to **Level ${level}**\n\nKeep chatting to move up more levels.`,
            color: 0xffb300,
            footer: {
              text: `Thanks for using Prestige Leveling. Be sure to check out other apps on https://autocode.com/apps/`,
            },
          },
        ],
      });
    }
  }
}
