module.exports = {
    name: 'interactionCreate',

    /**
     * @param {ButtonInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
const db = client.database
        if (interaction.customId === 'create-ticket') {
            db.add("count", 1)
            let ticketName = `تذكرة-${db.get("count")}`.toLowerCase();
            let supportRoles = await client.config.ticketsSupportRoles.map(x => {
                return {
                    id: x,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "EMBED_LINKS", "MANAGE_MESSAGES"]
                }
            });

            await interaction.reply({ content: `Creating ticket...`, ephemeral: true });

            if (db.get(interaction.member.user.id) == "true") return interaction.editReply({ content: `You have already created a ticket!`, ephemeral: true });
            
            const createdChannel = await interaction.guild.channels.create(ticketName, {
                type: "text",
                topic: `${interaction.user.id}`,
                parent: client.config.ticketsOpenCategory,
                permissionOverwrites: [
                    {
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "EMBED_LINKS"],
                        id: interaction.user.id,
                    },
                    {
                        deny: "VIEW_CHANNEL",
                        id: interaction.guild.id,
                    },
                    ...supportRoles
                ],
            });
            
            db.set(createdChannel.id, {
                by: interaction.member.user.id,
                date: new Date()
            })
            await interaction.editReply({ content: `Ticket created successfully in ${createdChannel}!` , ephemeral: true });

            db.set(interaction.member.user.id, "true")

            const row = new client.discord.MessageActionRow()
            .addComponents(
                new client.discord.MessageButton()
                .setStyle("SECONDARY")
                .setEmoji("🔒")
                .setCustomId("ticket-close"),
                new client.discord.MessageButton()
                .setStyle("SUCCESS")
                .setLabel("Claim")
                //.setEmoji("🔒")
                .setCustomId("ticket-claim")
            );

            const embed = new client.discord.MessageEmbed()
            .setTitle("New Ticket!")
            .setDescription(`Hello <@!${interaction.user.id}>, a staff will assist you shortly!\n\n**Press the 🔒 button to close the ticket!**`)
            .setColor(client.config.embedColor)
            .setFooter({ text: `${client.config.embedfooterText}`, iconURL: `${client.user.displayAvatarURL()}` });

            await createdChannel.send({ content: `${client.config.ticketsSupportRoles.map((m) => `<@&${m}>`).join(", ")}. New Ticket!`, embeds: [embed], components: [row] });
        }
    }
}