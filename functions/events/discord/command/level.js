const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const jimp = require('jimp');

module.exports = async (event, context) => {
  let member = event.data.options[0].value;
  let database = await lib.googlesheets.query['@0.3.0'].select({
    range: `A:D`,
    bounds: 'FULL_RANGE',
    where: [
      {
        ID__icontains: `${member}`,
      },
    ],
    limit: {
      count: 0,
      offset: 0,
    },
  });
  let xp = 0;
  let level = 0;
  if (database.rows.length !== 0) {
    xp = parseInt(database.rows[0].fields.XP) + parseInt(1);
    level = database.rows[0].fields.Level;
  }
  let user = await lib.discord.users['@0.1.4'].retrieve({
    user_id: `${member}`,
  });
  let img = await jimp.read(
    'https://media.discordapp.net/attachments/970429916497715332/972891531629453342/Prestige--Leveling.png'
  );
  console.log(user.username)
  console.log(img)
  console.log(user.avatar_url)
  let avatar_jimp;
  if (!user.avatar_url) {
    avatar_jimp = await jimp.read(`https://cdn.discordapp.com/embed/avatars/0.png`);
  } else {
    avatar_jimp = await jimp.read(user.avatar_url);
  }
  avatar_jimp.circle();
  avatar_jimp.resize(275, 275);
  img.composite(avatar_jimp, 75, 75);
  await jimp.loadFont(jimp.FONT_SANS_64_BLACK).then((font) => {
    img.print(
      font,
      550,
      67,
      {
        text: `${level}`,
        alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: jimp.VERTICAL_ALIGN_CENTER
      },
      550,
      400
    );
  });
  await jimp.loadFont(jimp.FONT_SANS_64_BLACK).then((font) => {
    img.print(
      font,
      550,
      202,
      {
        text: `${xp}`,
        alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: jimp.VERTICAL_ALIGN_CENTER
      },
      550,
      400
    );
  });
  await jimp.loadFont(jimp.FONT_SANS_64_BLACK).then((font) => {
    img.print(
      font,
      175,
      475,
      {
        text: `${user.username}#${user.discriminator}`,
      },
      450,
      300
    );
  });
  let buffer = await img.getBufferAsync(jimp.MIME_PNG);
  console.log(buffer)
  await lib.discord.channels['@0.3.2'].messages.create({
    channel_id: `${event.channel_id}`,
    content: `Here is ${user.username}'s level.`,
    attachments: [
      {
        'file': buffer,
        'filename': `PrestigeLeveling-2.png`
      }
    ]
  });
}
