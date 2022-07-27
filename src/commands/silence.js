import { channelMention, SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import { Logger } from "../utils/Logger.js";
import silenceManager from "../utils/SilenceManager.js";
import contains from "../utils/Utils.js";

const lg = new Logger("Silence");

export default {
    data: new SlashCommandBuilder()
        .setName("silence")
        .setDescription("Silences a channel and deletes all new incoming messages.")
        .addChannelOption(option => 
            option.setName("channel")
                .setDescription("The channel to be silenced. (By default the channel you are sending this from)")
                .setRequired(false)
        ),

    execute: async function execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "Admin")) {
            await interaction.deferReply({ ephemeral: true });

            await interaction.editReply({ embeds: [new MessageEmbed()
                .setDescription("You don't have the permission to silence this channel")
                .setColor("RED")] });
            return;
        }

        var channel = interaction.options.getChannel("channel");
        if (channel == null || channel == undefined) {
            channel = interaction.channel;
        }
        
        await interaction.deferReply({ ephemeral: true });

        await interaction.editReply({ embeds: [new MessageEmbed()
            .setDescription("Checking the database for the channel")
            .setColor("YELLOW")]});

        if (silenceManager.contains(interaction.channelId)) {
            silenceManager.remove(interaction.channelId);
            lg.info(`Unsilenced ${channelMention(interaction.channelId)}`);
            await interaction.editReply({ embeds: [new MessageEmbed()
                .setDescription(`Removed ${channelMention(interaction.channelId)} from the list of channels`)
                .setColor("RED")]});
            
        } else {
            silenceManager.add(interaction.channelId);
            lg.info(`Silenced ${interaction.channelId}`);
            await interaction.editReply({ embeds: [new MessageEmbed()
                .setDescription(`Added ${channelMention(interaction.channelId)} to the list of channels`)
                .setColor("GREEN")]});
        }
    },
    register: true
};
