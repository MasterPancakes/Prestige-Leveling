const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await lib.discord.commands['@0.0.0'].create({
  guild_id: process.env.GUILD_ID,
  name: 'level',
  description: "Gets your or another user's level",
  options: [
    {
      type: 6,
      name: 'user',
      description: 'The user ton get the level from.',
      required: true,
    },
  ],
});

await lib.discord.commands['@0.0.0'].create({
  guild_id: process.env.GUILD_ID,
  name: 'leaderboard',
  description: 'Views the level leaderboard',
  options: [],
});

await lib.discord.commands['@0.0.0'].create({
  guild_id: process.env.GUILD_ID,
  name: 'give-level',
  description: 'Gives someone levels.',
  options: [
    {
      type: 6,
      name: 'user',
      description: 'The user to give levels too.',
      required: true,
    },
    {
      type: 4,
      name: 'levels',
      description: 'The number of levels for them to receive.',
      required: true,
    },
  ],
});
