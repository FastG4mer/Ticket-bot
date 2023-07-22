// const { config } = require("dotenv");
const config = require(`../../config`);

module.exports = {
  name: 'interactionCreate',

  /**
   * @param {ButtonInteraction} interaction 
   * @param {Client} client 
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    const db = client.database
    if (interaction.customId === 'ticket-claim') {
      const channel = interaction.channel;
      const member = interaction.guild.members.cache.get(channel.topic);
      const adminRoleID = config.ticketsSupportRoles[0];

      // Check if the user has the admin role
      if (interaction.member.roles.cache.has(adminRoleID)) {
        // User has the admin role, allow them to send messages from admin role
        channel.permissionOverwrites.edit(interaction.member, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true,
        });

        // Update the button to "unclaim" and change its color to red
        const newButton = new client.discord.MessageButton()
          .setCustomId('ticket-unclaim') // Use a new customId for the unclaim button
          .setLabel('Unclaim')
          .setStyle('DANGER'); // Set the style to 'DANGER' for a red button

        // Modify the original reply with the updated button
        interaction.message.edit({
          components: [new client.discord.MessageActionRow().addComponents(new client.discord.MessageButton()
            .setStyle("SECONDARY")
            .setEmoji("🔒")
            .setDisabled(false)
            .setCustomId("ticket-close"), newButton)],
        });
        interaction.message.reply(`Claimed by ${interaction.member}`)
       await interaction.channel.permissionOverwrites.edit(interaction.member, {
          VIEW_CHANNEL: true,
          SEND_MESSAGES: true
      });
      await interaction.channel.permissionOverwrites.edit(adminRoleID, {
        VIEW_CHANNEL: false,
        SEND_MESSAGES: false
    });
    db.set(`${interaction.channel.id}_claimed`, interaction.member.user.id)
   // await interaction.channel.setName(interaction.member.user.username)
      } else {
        interaction.reply({content: `ليس لديك الصلاحية لستلام التذكرة`, ephemeral: true })
       
      }
    }
  }
};
