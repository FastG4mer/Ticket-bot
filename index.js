const { Client, Collection, Intents } = require('discord.js');
const handler = require("./handler/index");
const moment = require(`moment`)
const sourcebin = require('sourcebin_js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
});

const Discord = require('discord.js');

// Call .env file to get Token
require('dotenv').config()

module.exports = client;

// Global Variables
client.discord = Discord;
client.commands = new Collection();
client.slash = new Collection();
client.config = require('./config')
client.database = require("pro.db")
// Records commands and events
handler.loadEvents(client);
handler.loadCommands(client);
handler.loadSlashCommands(client);
let locked = false;

async function checkExpiredSubscriptions() {
  if (locked === false) {
    locked = true;

    const db = client.database;
    const guildID = client.config.guildID;
    const transcriptsChannel = client.channels.cache.get(client.config.ticketsTranscripts);

    for (const [channelID, channel] of client.channels.cache) {
      let q = db.get(`${channelID}_time`);
      if (!q) continue;

      const currentDateTime = moment();
      const targetDateTime = moment(q, 'YYYY-MM-DDTHH:mm:ss.SSSZ');

      if (currentDateTime.isAfter(targetDateTime)) {
        const a = await client.channels.cache.get(channelID);
        if (a) {
        locked = true
        let channe = ""
        channe = a
         await channe.messages.fetch().then(async (messages) => {
            const content = await messages.reverse().map(m => `${new Date(m.createdAt).toLocaleString('en-US')} - ${m.author.tag}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`).join('\n');

            let transcript = await sourcebin.create([{ name: `${channe.name}`, content: content, languageId: 'text' }], {
                title: `Chat transcript: ${channel.name}`,
                description: ' ',
            });
          const row = new client.discord.MessageActionRow()
          .addComponents(
              new client.discord.MessageButton()
              .setStyle("LINK")
              .setEmoji("📑")
              .setURL(`${transcript.url}`)
          );
          let check = db.get(`${channe.id}_claimed`) || "not Claimed"
          if(check.length > 12) check = "<@" + check + ">"
          const embed = new client.discord.MessageEmbed()
          .setTitle("Ticket Transcript")
          .addFields(
              { name: "Channel", value: `${channe.name}` },
              { name: "Claimed by", value: `${check}` },
              { name: "Deleted by", value: `auto delete` },
              { name: "Opend by", value: `<@!${channe.topic}>` },
              { name: "Direct Transcript", value: `[Direct Transcript](${transcript.url})` }
          )
          .setColor(client.config.embedColor)
          .setFooter({ text: `${client.config.embedfooterText}`, iconURL: `${client.user.displayAvatarURL()}` });
  
          await transcriptsChannel.send({ embeds: [embed], components: [row] });
          })
          await channe.delete();
          db.delete(`${channelID}_time`);
        }
      }
    }
  }

  locked = false;
}

// Error Handling

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception: " + err);
});
  
process.on("unhandledRejection", (reason, promise) => {
    console.log("[FATAL] Possibly Unhandled Rejection at: Promise ", promise, " reason: ", reason.message);
});
setInterval(() => {checkExpiredSubscriptions()}, 1000);
// Login Discord Bot Token
client.login(process.env.TOKEN);