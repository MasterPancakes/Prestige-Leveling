const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let admin = false;

let server = await lib.discord.guilds['@0.1.0'].retrieve({
  guild_id: `${context.params.event.guild_id}`,
});

let roles = await lib.discord.guilds['@0.1.0'].roles.list({
  guild_id: `${context.params.event.guild_id}`,
});

let userRoles = roles.filter((role) =>
  context.params.event.member.roles.includes(role.id)
);

for (let i = 0; i < userRoles.length; i++) {
  let _role = userRoles[i];
  if (_role.permission_names.includes('ADMINISTRATOR')) {
    admin = true;
    break;
  }
}

let owner = server.owner_id;

if (owner === context.params.event.member.user.id) {
  admin = true;
}

if (admin === false) {
  return await lib.discord.interactions['@1.0.1'].responses.ephemeral.create({
    token: `${context.params.event.token}`,
    response_type: 'CHANNEL_MESSAGE_WITH_SOURCE',
    content: '',
    tts: false,
    embeds: [
      {
        type: 'rich',
        title: `Error`,
        description: `This command requires the **ADMINISTRATOR** permission`,
        color: 0xffb300,
      },
    ],
  });
}

let rawUser = context.params.event.data.options[0].value;

let levels = context.params.event.data.options[1].value;

let newXp = Math.floor(levels * 100);

console.log(newXp);

let user = await lib.discord.users['@0.2.1'].retrieve({
  user_id: `${rawUser}`,
});

let database = await lib.googlesheets.query['@0.3.0'].select({
  range: `A:D`,
  bounds: 'FIRST_EMPTY_ROW',
  where: [
    {
      ID__icontains: `${rawUser}`,
    },
  ],
  limit: {
    count: 0,
    offset: 0,
  },
});

try {
  if (database.rows.length === 0) {
    await lib.googlesheets.query['@0.3.0'].insert({
      range: `A:D`,
      fieldsets: [
        {
          ID: `${rawUser}`,
          Username: `${user.username}`,
          Level: levels,
          XP: newXp,
        },
      ],
    });
  } else {
    let currentXP = database.rows[0].fields.XP;
    let currentLevel = database.rows[0].fields.Level;
    await lib.googlesheets.query['@0.3.0'].update({
      range: `A:D`,
      bounds: 'FULL_RANGE',
      where: [
        {
          ID__icontains: `${rawUser}`,
        },
      ],
      limit: {
        count: 0,
        offset: 0,
      },
      fields: {
        Username: `${user.username}`,
        Level: parseInt(currentLevel) + parseInt(levels),
        XP: parseInt(currentXP) + parseInt(newXp),
      },
    });
    let newStuff = parseInt(currentLevel) + parseInt(levels);
    if (parseInt(currentLevel) + parseInt(levels) > 10) {
      if (currentLevel <= 10) {
        await lib.discord.interactions['@1.0.1'].followups.create({
          token: `${context.params.event.token}`,
          response_type: 'CHANNEL_MESSAGE_WITH_SOURCE',
          content: `<@!${rawUser}>`,
          tts: false,
          embeds: [
            {
              type: 'rich',
              title: `Level 10 Mark Passed`,
              description: `WOAH ${user.username}, ${context.params.event.member.user.username} has given you **${levels}** level/levels. Your new level is **${newStuff}** making you reach the **Level 10 Mark.** As a treat, you will get the <@&${process.env.LEVEL10_ROLE_ID}>`,
              color: 0xffb300,
              footer: {
                text: `Thanks for using Prestige Leveling. Be sure to check out other apps on https://autocode.com/apps/`,
              },
            },
          ],
        });
      }
      await lib.discord.guilds['@0.2.4'].members.roles.update({
        role_id: `${process.env.LEVEL10_ROLE_ID}`,
        user_id: `${rawUser}`,
        guild_id: `${context.params.event.guild_id}`,
      });
    } else {
      await lib.discord.interactions['@1.0.1'].followups.create({
        token: `${context.params.event.token}`,
        response_type: 'CHANNEL_MESSAGE_WITH_SOURCE',
        content: `<@!${rawUser}>`,
        tts: false,
        embeds: [
          {
            type: 'rich',
            title: `Level up`,
            description: `Congrats ${user.username}, ${context.params.event.member.user.username} has given you **${levels}** level/levels. Your new level is **${newStuff}**`,
            color: 0xffb300,
            footer: {
              text: `Thanks for using Prestige Leveling. Be sure to check out other apps on https://autocode.com/apps/`,
            },
          },
        ],
      });
    }
  }
} catch (e) {
  console.log(e);
  await lib.discord.interactions['@1.0.1'].followups.ephemeral.create({
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
