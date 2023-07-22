const { user } = require("../..");
const config = require(`../../config`);
const moment = require("moment")
const sourcebin = require('sourcebin_js');
module.exports = {
    name: 'interactionCreate',

    /**
     * @param {ButtonInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        const db = client.database
        if (interaction.customId === 'ticket-close') {
            const cata = config.ticketsCloseCategory
            const channel = interaction.channel;
            const member = interaction.guild.members.cache.get(channel.topic);
           
            const rowPanel = new client.discord.MessageActionRow()
            .addComponents(
                new client.discord.MessageButton()
                .setStyle("DANGER")
                .setEmoji("🔒")
                .setDisabled(true)
                .setCustomId("ticket-close")
            );
            
            await interaction.message.edit({ components: [rowPanel] });
            
            const rowDeleteFalse = new client.discord.MessageActionRow()
            .addComponents(
                new client.discord.MessageButton()
                .setStyle("DANGER")
                .setEmoji("🗑️")
                .setDisabled(true)
                .setCustomId("ticket-delete")
            );

            const rowDeleteTrue = new client.discord.MessageActionRow()
            .addComponents(
                new client.discord.MessageButton()
                .setStyle("DANGER")
                .setEmoji("🗑️")
                .setDisabled(false)
                .setCustomId("ticket-delete")
            );
            
            const embed = new client.discord.MessageEmbed()
            .setTitle("Close Ticket!")
            .setDescription(`Ticket closed by <@!${interaction.user.id}>!\n\n**Press the 🗑️ button to delete the ticket!**`)
            .setColor(client.config.embedColor)
            .setFooter({ text: `${client.config.embedfooterText}`, iconURL: `${client.user.displayAvatarURL()}` });
            let qr = interaction.channel.name.split("تذكرة-").join("")
            interaction.reply({ embeds: [embed], components: [rowDeleteFalse] }).then(async () => setTimeout( async() => {
                interaction.editReply({ components: [rowDeleteTrue] });
                interaction.channel.setParent(cata)
                interaction.channel.edit({ name: `close-${qr}` });
                const expirationDate = moment().add(1, 'day');
                db.set(`${interaction.channel.id}_time`, expirationDate)
                let userdata = await db.get(interaction.channel.id)
                if(userdata.by){
                    db.set(userdata.by, "false")
                }
            }, 2000));
            const user = await db.get(interaction.channel.id)
            let tm = user.date
          //  const be = moment(user)
          let tq = moment(tm)
          let rt = Math.floor(tq / 1000)
            console.log(rt)
            const embed5 = new client.discord.MessageEmbed({
                title: 'Ticket Information',
                fields: [
                  { name: 'Opened by', value: member.toString(), inline: true },
                  { name: 'Closed by', value: interaction.member.toString(), inline: true },
                  { name: 'Claimed by', value: db.get(`${interaction.channel.id}_claimed`) || "not claimed", inline: true },
                  { name: 'Created at', value: `<t:${rt}:R>`, inline: true },
                ],
                // You can also set the color of the embed if desired
                // For example, setting it to the default "PRIMARY" color
            
              }).setImage(`https://media.discordapp.net/attachments/1131204163922034761/1132038608908451961/infos_support.png?width=1200&height=250`)
              .setThumbnail(interaction.guild.iconURL());
              await channel.messages.fetch().then(async (messages) => {
                const content = await messages.reverse().map(m => `${new Date(m.createdAt).toLocaleString('en-US')} - ${m.author.tag}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`).join('\n');

                let transcript = await sourcebin.create([{ name: `${channel.name}`, content: content, languageId: 'text' }], {
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
            const user1 = await client.users.cache.get(user.by)
            user1.send({ embeds: [embed5], components: [row]})
                })
            interaction.channel.permissionOverwrites.edit(member, {
                VIEW_CHANNEL: false
            });
        }
    }
}