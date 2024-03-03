const { Client, Events, hyperlink, ReactionEmoji, ReactionCollector, ReactionManager, ReactionUserManager, hideLinkEmbed, GatewayIntentBits, WebhookClient, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, Activity, TextChannel, Options, Presence, Partials, Message, ChannelType, CategoryChannel, ButtonInteraction, InteractionResponse, Webhook, GuildMember, AutoModerationRule, Collection, ButtonComponent, Colors, DMChannel, MessageReaction } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User
    ],
    makeCache: Options.cacheWithLimits({
        DMMessageManager: 200,
        GuildMessageManager: 200,
    }),
});

const mongoose = require('mongoose');

const config = require('./config.json');
const { default: owofify } = require('owoifyx');

const UserProfile = require('./schemas/UserProfile');

const dailyAmount = 1000;

const presenceAmount = 1000000000;

const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();

const { createAudioResource, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, getVoiceConnection, entersState, AudioPlayerStatus, VoiceConnectionStatus, AudioPlayer } = require('@discordjs/voice');

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

const moderationWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1141127321588355228/lIgewq8dy5UivxOfVFsNpbYeSOu80Srr1mtS-EgZmy8cY_ky_IB3w95ExOL2hsOT4_dR' });

const enter_exit_wh = new WebhookClient({ url: 'https://discord.com/api/webhooks/1211661132075634738/QXXt0vjCz55YSqW3KGcjXE5c9gaWMEVQDUQfY85HVZk1v1Izpmlxz5hgAU5iH2mRvqvF' });

const messageLogWh = new WebhookClient({ url: 'https://discord.com/api/webhooks/1212510144500338789/Dr5x8jyfpcBmRiXMpW7y2sf4ukOS46NgjM8xa-YT1gtPXK9tzXEEFnDystXnTsZKsN_r' });

const bot_enter_exit_wh = new WebhookClient({ url: 'https://discord.com/api/webhooks/1213866513153523833/Xp6WBdXYmFmXnA91nDMya4qEYhRd3xSirY2ecvBB0Ax8cCXm9xeK3-gflCDkBnGoviMd' });

// ------------------------------------------------------------------------------------------------------------------------

/*
const express = require('express');

const app = express();

app.get('/', (request, response) => {
    return response.sendFile('index.html', { root: '.' });
});

app.listen(config.port, () => console.log(`App listening at http://localhost:${config.port}`));*/

// ------------------------------------------------------------------------------------------------------------------------

client.on('interactionCreate', async (interaction) => {

    const confirm = new ButtonBuilder()
        .setCustomId('confirmNuke')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    if (interaction.isButton()) {
        const intMessage = interaction.channel.messages.cache.get(interaction.message.id);
        if (interaction.component.customId == 'confirmNuke') {
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'I don\'t have the permission **"manage channels"**.', ephemeral: true });
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'You don\'t have the permission **"manage channels"**.', ephemeral: true });
            const nukeChannel = interaction.guild.channels.cache.get(interaction.channel.id);
            if (nukeChannel.id == interaction.guild.publicUpdatesChannelId) return interaction.channel.send({ content: 'I can\'t nuke community update channel.' }).then(intMessage.delete()).catch((err) => console.log(err))
            if (nukeChannel.id == interaction.guild.rulesChannelId) return interaction.channel.send({ content: 'I can\'t nuke rule channel.' }).then(intMessage.delete()).catch((err) => console.log(err));
            if (nukeChannel.id == interaction.guild.safetyAlertsChannelId) return interaction.channel.send({ content: 'I can\'t nuke safety notifications channel.' }).then(intMessage.delete()).catch((err) => console.log(err));
            try {
                nukeChannel.delete();
                await nukeChannel.clone();
                const thisChannel = interaction.guild.channels.cache.find(channel => channel.name == nukeChannel.name);
                await thisChannel.send('https://tenor.com/view/will-smith-shades-mib-men-in-black-neuralyzer-gif-17328155');
            } catch (error) {
                console.log(`error handling button interaction confirm nuke - ${error}`);
            }
        }
        if (interaction.component.customId == 'cancel') {
            try {
                intMessage.delete();
            } catch (error) {
                console.log(`error cancelling interaction - ${error}`);
            }
        }
    }

    if (interaction.commandName === 'nuke') { // clones the channel and deletes the original
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        try {
            const nukeRow = new ActionRowBuilder()
                .addComponents(cancel, confirm);

            await interaction.reply({ content: `Are you sure you want to nuke this channel?`, components: [nukeRow] });
        } catch (error) {
            console.log('error handling /nuke - ' + error)
        }
    };


    if (interaction.commandName === "Report message") {
        const msg = interaction.channel.messages.cache.get(interaction.targetMessage.id)
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (msg.member.user.id == client.user.id) return interaction.reply({ content: `You cannot report me.`, ephemeral: true }).catch((err) => console.error(err));
        if (msg.member.user.id == interaction.member.id) return interaction.reply({ content: `You cannot report yourself.`, ephemeral: true }).catch((err) => console.error(err));
        try {
            const reportWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1139265242732429333/x9AYlXKZwZTAj5xZ9ZKTrWyVEcwXnac__cELa7vGPmalpN1Gv08g7QboKAFEvSrlJ6Sp' });
            const reportEmbed = new EmbedBuilder()
                .setColor(config.color)
                .addFields(
                    { name: 'Reporter', value: `${interaction.member.user.username}`, inline: true },
                    { name: 'Message link', value: `${msg.url}`, inline: true },
                    { name: 'Reported user', value: `**${msg.member.user.username}** ||${msg.member.user.id}||`, inline: true },
                    { name: 'Message content', value: `\`\`\`${msg.content}\`\`\``, inline: false })

            reportWH.send({ embeds: [reportEmbed] }).catch((err) => console.error(err));
            interaction.reply({ content: `Report has been sent.`, ephemeral: true });
        } catch (error) {
            console.log(`error handling "Report message" Message App Command ${error}`);
        }
    }

    if (interaction.commandName === "uwuify") {
        const msg = interaction.channel.messages.cache.get(interaction.targetMessage.id)
        const text = msg.content
        const owoified = owofify(`${text}`)
        interaction.reply(owoified).catch((err) => console.error(err));
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'stop') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        try {
            interaction.reply({ content: 'Stopping the song from playing.' });
            var getConnection = getVoiceConnection(interaction.guild.id);
            player.stop();
            getConnection.destroy();
        } catch (error) {
            console.log(`error handling /stop command ${error}`)
        }
    }

    if (interaction.commandName === 'play') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        const file = interaction.options.getAttachment('file');

        try {
            let userProfile = await UserProfile.findOne({
                userid: interaction.member.id
            });

            if (!userProfile) {
                userProfile = new UserProfile({ userid: interaction.member.id });
            }

            interaction.reply({ content: `Playing **${file.name}**` });

            const fileURL = createAudioResource(`${file.proxyURL}`);

            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            var getConnection = getVoiceConnection(interaction.guild.id);

            player.play(fileURL);

            const subscription = getConnection.subscribe(player);

            getConnection.on(VoiceConnectionStatus.Ready, () => {
                console.log('The connection has entered the Ready state - ready to play audio!');
            });

            player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
                console.log('Audio player is in the Playing state!');
            });

            player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
                console.log('Audio player is in the idle state!');
                player.stop();
                if (connection !== null) return getConnection.destroy();
            });
        } catch (error) {
            console.log(`error handling /play command ${error}`)
        }
    }

    if (interaction.commandName === 'transfer') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('user').user;
        const amount = interaction.options.getNumber('amount');

        let userProfile = await UserProfile.findOne({
            userid: user.id,
        });

        if (!userProfile) {
            userProfile = new UserProfile({
                userid: user.id,
            });
        }

        let AuthorUser = await UserProfile.findOne({
            userid: interaction.user.id,
        });

        if (!AuthorUser) {
            AuthorUser = new UserProfile({
                userid: interaction.user.id,
            });
        }

        if (user.bot) return interaction.reply({ content: 'You can\'t transfer your money to a bot', ephemeral: true });

        if (amount > AuthorUser.balance) {
            interaction.reply({ content: `You don't have enough money to transfer this much.`, ephemeral: true });
            return;
        }

        if (amount <= 0) return interaction.reply({ content: 'Please enter an amount greater than zero', ephemeral: true });

        try {
            AuthorUser.balance -= amount;
            userProfile.balance += amount;
            await AuthorUser.save();
            await userProfile.save();

            var formattedAmount = amount.toLocaleString("en-US");

            return interaction.reply(`# TRANSFER\nSuccessfully transferred **¥${formattedAmount}** to **${user.displayName}**`)

        } catch (error) {
            console.log('error handling /transfer command ' + error);
        }
    }

    if (interaction.commandName === 'owoify') {
        const text = interaction.options.getString('text');
        const owoified = owofify(`${text}`)
        interaction.reply(owoified).catch((err) => console.error(err));
    }

    if (interaction.commandName === 'gamble') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        const amount = interaction.options.getNumber('amount');

        try {
            if (amount < 50) {
                interaction.reply({ content: 'You must gamble atleast **¥50**' })
                return;
            }

            let userProfile = await UserProfile.findOne({
                userid: interaction.user.id,
            });

            if (!userProfile) {
                userProfile = new UserProfile({
                    userid: interaction.user.id,
                });
            }

            if (amount > userProfile.balance) {
                interaction.reply({ content: `You don't have enough money to gamble this much.`, ephemeral: true });
                return;
            }

            const didWin = Math.random() > 0.5; // 50% chance to win

            if (!didWin) {
                userProfile.balance -= amount;
                await userProfile.save();

                var formattedAmount = amount.toLocaleString("en-US");

                interaction.reply(`# GAMBLE\nYou gambled and lost **¥${formattedAmount}**. Unlucky!`);
                return;
            }

            const amountWon = Number((amount * (Math.floor(1) + 0.5)).toFixed(0));

            userProfile.balance += amountWon;
            await userProfile.save();

            var formattedAmount = amount.toLocaleString("en-US");
            var formattedAmountWon = amountWon.toLocaleString("en-US");

            interaction.reply(`# GAMBLE\nYou gambled **¥${formattedAmount}** and won **¥${formattedAmountWon}**. Lucky!`);
        } catch (err) {
            console.log('error handling /gamble - ' + err);
        }
    }

    if (interaction.commandName === 'balance') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'Can\'t use command in DMs', ephemeral: true })
        const targetUserId = interaction.options.getUser('user')?.id || interaction.user.id;

        const targetMember = interaction.guild.members.cache.get(targetUserId);

        await interaction.deferReply();

        try {
            let userProfile = await UserProfile.findOne({ userid: targetUserId });

            if (!userProfile) {
                userProfile = new UserProfile({ userid: targetUserId });
            }

            var balanceAmount = userProfile.balance;
            var formattedBalance = balanceAmount.toLocaleString("en-US");


            if (targetMember.user.id === client.user.id) return interaction.editReply({ content: `**${targetMember.user.displayName}'s** account balance is **-¥${formattedBalance}**.` })
            if (targetMember.user.bot) return interaction.editReply({ content: 'You can\'t see a bot\'s balance' })

            interaction.editReply(
                targetUserId === interaction.user.id ? `Your account balance is **¥${formattedBalance}**.` : `**${targetMember.user.displayName}'s** account balance is **¥${formattedBalance}**.`
            )
        } catch (error) {
            console.log(`error handling /balance: ${error}`);
        }
    }

    if (interaction.commandName === 'daily') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        try {
            await interaction.deferReply();

            let userProfile = await UserProfile.findOne({
                userid: interaction.member.id,
            });

            if (userProfile) {
                const lastDailyDate = userProfile.lastDailyCollected?.toDateString();
                const currenDate = new Date().toDateString();

                if (lastDailyDate === currenDate) {
                    interaction.editReply('You have already claimed your daily reward for today. Try again tomorrow.').catch((err) => console.error(err));
                    return;
                }
            } else {
                userProfile = new UserProfile({
                    userid: interaction.member.id,
                });
            }

            userProfile.balance += dailyAmount;
            userProfile.lastDailyCollected = new Date();

            await userProfile.save();

            var formattedDailyAmount = dailyAmount.toLocaleString("en-US");

            interaction.editReply(
                `You claimed **¥${formattedDailyAmount}** from daily reward!`
            )
        } catch (error) {
            console.log(`error handling /daily: ${error}`);
        }
    }

    if (interaction.commandName === 'avatar') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        const avataruser = interaction.options.get('user').user;
        const avatarEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`${avataruser.displayName}'s avatar`)
            .setImage(`https://cdn.discordapp.com/avatars/${avataruser.id}/${avataruser.avatar}.png?size=1024`)
        interaction.reply({ embeds: [avatarEmbed] }).catch((err) => console.error(err));
    }

    if (interaction.commandName === 'ban') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'I don\'t have the permission **ban members**.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('user').user;
        const reason = interaction.options.getString('reason');
        const banMember = interaction.guild.members.cache.get(user.id);
        if (!banMember) return interaction.reply({ content: `Member not found`, ephemeral: true }).catch((err) => console.error(err));
        if (!banMember.manageable) return interaction.reply({ content: `I can\'t manage ${user.displayName}.`, ephemeral: true }).catch((err) => console.error(err));
        if (user.id == config.clientId) return;
        if (interaction.guild.id === config.server) {
            if (!reason) return (await interaction.reply({ content: `You must provide a reason for ban.`, ephemeral: true }));
            await moderationWH.send({ content: `**${banMember.user.username}** was banned by <@${interaction.member.id}>\n## reason:\n"${reason}".` }).catch((err) => console.log(err));
        }
        await banMember.ban({ reason: `${reason}` }).then(interaction.reply({
            content: `${banMember.user.username} was banned.`
        })).catch((err) => console.log(err));
    }

    if (interaction.commandName === 'kick') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: 'I don\'t have the permission **kick members**.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('user').user;
        const reason = interaction.options.getString('reason');
        const kickMember = interaction.guild.members.cache.get(user.id);
        if (!kickMember) return interaction.reply({ content: `Member not found`, ephemeral: true }).catch((err) => console.error(err));
        if (!kickMember.manageable) return interaction.reply({ content: `I can\'t manage ${user.displayName}.`, ephemeral: true }).catch((err) => console.error(err));
        if (user.id == config.clientId) return;
        if (interaction.guild.id === config.server) {
            if (!reason) return (await interaction.reply({ content: `You must provide a reason for kick.`, ephemeral: true }));
            await moderationWH.send({ content: `**${kickMember.user.username}** was kicked by <@${interaction.member.id}>\n## reason:\n"${reason}".` }).catch((err) => console.log(err));
        }
        await kickMember.kick({ reason: `${reason}` }).then(interaction.reply({
            content: `${kickMember.user.username} was kicked.`
        })).catch((err) => console.log(err));
    }

    if (interaction.commandName === 'softban') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'I don\'t have the permission **ban members**.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('member').user;
        const reason = interaction.options.getString('reason');
        const banMember = interaction.guild.members.cache.get(user.id);
        if (!banMember) return interaction.reply({ content: `Member not found`, ephemeral: true }).catch((err) => console.error(err));
        if (!banMember.manageable) return interaction.reply({ content: `I can\'t manage ${user.displayName}.`, ephemeral: true }).catch((err) => console.error(err));
        if (user.id == config.clientId) return;
        if (interaction.guild.id === config.server) {
            if (!reason) return (await interaction.reply({ content: `You must provide a reason for softbanning.`, ephemeral: true }));
            await moderationWH.send({ content: `**${banMember.user.username}** was softbanned by <@${interaction.member.id}>\n## reason:\n"${reason}".` }).catch((err) => console.log(err));
        }
        await banMember.ban({ deleteMessageSeconds: 604800 }).then(banMember => interaction.guild.members.unban(banMember.id)).then(interaction.reply({
            content: `${banMember.user.username} was softbanned.`
        })).catch((err) => console.log(err));
    }

    if (interaction.commandName === 'roleveryone') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'I don\'t have the permission **administrator**.', ephemeral: true }).catch((err) => console.error(err));
        const role = interaction.options.get('role').role;
        interaction.guild.members.cache.forEach(member => member.roles.add(role.id));
        interaction.reply({
            content: `All members now have ${role}`,
            ephemeral: true,
        }).catch((err) => console.error(err));
    }
});

// ------------------------------------------------------------------------------------------------------------------------

client.on("messageReactionAdd", async (messageReaction, User) => {
    const ruleChannel = messageReaction.message.guild.channels.cache.get('1212002654616555540');
    const memberRole = messageReaction.message.guild.roles.cache.get('1211647374196351047');
    const guildMember = messageReaction.message.guild.members.cache.get(User.id);
    const tryouterRole = messageReaction.message.guild.roles.cache.get('1211632162328289302');
    const pkRole = messageReaction.message.guild.roles.cache.get('1212767763328663682');

    if (messageReaction.message.id == '1212050818619019266') { // member verification
        messageReaction.users.remove(User.id);
        guildMember.roles.add(memberRole.id);
        ruleChannel.send(`${User}`).then(msg => msg.delete());
    }
    if (messageReaction.message.id == '1211998774378111016') { // tryouter reaction
        messageReaction.users.remove(User.id);
        guildMember.roles.add(tryouterRole.id);
    }

    const fiveH = messageReaction.message.guild.roles.cache.get('1212804959079501834')
    const tenH = messageReaction.message.guild.roles.cache.get('1212804778506190878')
    const twentH = messageReaction.message.guild.roles.cache.get('1210990907461996634')
    const thirtH = messageReaction.message.guild.roles.cache.get('1210990598266294312')

    const fiveB = messageReaction.message.guild.roles.cache.get('1212805029774229635')
    const tenB = messageReaction.message.guild.roles.cache.get('1212804387198472232')
    const twentB = messageReaction.message.guild.roles.cache.get('1212792247263830036')
    const thirtB = messageReaction.message.guild.roles.cache.get('1212792260744192071')

    const crewRole = messageReaction.message.guild.roles.cache.get('1212801646388715541')

    if (messageReaction.message.guild.id == '1199088499647852695') {
        try {
            if (messageReaction.message.id == '1213102823156351006') { // marine
                messageReaction.users.remove(User.id);
                if (messageReaction.emoji.name == '🛡️') {
                    guildMember.roles.add(fiveH.id)
                    if (guildMember.roles.cache.has(fiveH.id)) return guildMember.roles.remove(fiveH.id)
                }
                if (messageReaction.emoji.name == '⚔️') {
                    guildMember.roles.add(tenH.id)
                    if (guildMember.roles.cache.has(tenH.id)) return guildMember.roles.remove(tenH.id)
                }
                if (messageReaction.emoji.name == '🗿') {
                    guildMember.roles.add(twentH.id)
                    if (guildMember.roles.cache.has(twentH.id)) return guildMember.roles.remove(twentH.id)
                }
                if (messageReaction.emoji.name == '💎') {
                    guildMember.roles.add(thirtH.id)
                    if (guildMember.roles.cache.has(thirtH.id)) return guildMember.roles.remove(thirtH.id)
                }
            }
            if (messageReaction.message.id == '1213102818160812062') { // pirate
                messageReaction.users.remove(User.id);
                if (messageReaction.emoji.name == '🛡️') {
                    guildMember.roles.add(fiveB.id)
                    if (guildMember.roles.cache.has(fiveB.id)) return guildMember.roles.remove(fiveB.id)
                }
                if (messageReaction.emoji.name == '⚔️') {
                    guildMember.roles.add(tenB.id)
                    if (guildMember.roles.cache.has(tenB.id)) return guildMember.roles.remove(tenB.id)
                }
                if (messageReaction.emoji.name == '🗿') {
                    guildMember.roles.add(twentB.id)
                    if (guildMember.roles.cache.has(twentB.id)) return guildMember.roles.remove(twentB.id)
                }
                if (messageReaction.emoji.name == '💎') {
                    guildMember.roles.add(thirtB.id)
                    if (guildMember.roles.cache.has(thirtB.id)) return guildMember.roles.remove(thirtB.id)
                }
            }
            if (messageReaction.message.id == '1213102826948001792') { // crew
                messageReaction.users.remove(User.id);
                guildMember.roles.add(crewRole.id)
                if (guildMember.roles.cache.has(crewRole.id)) return guildMember.roles.remove(crewRole)
            }
        } catch (err) {
            console.log(err)
        }
    }
});

// ------------------------------------------------------------------------------------------------------------------------

client.on('messageCreate', async (message) => {

    if (message.author.bot) return; // if a bot creates a message client will return

    if (message.content.indexOf(config.prefix) !== 0) return; // if message does not contain prefix than return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g); // removing prefix from message content
    const command = args.shift().toLowerCase(); // tolowercase meaning $PING will work / args array becomes arg1, arg2, arg3

    const oneServer = client.guilds.cache.get('1136702073400983612');
    const councilRole = oneServer.roles.cache.get('1138512076021714954');

    switch (command) {

        case 'this':
            const channelll = message.guild.channels.cache.get(message.channel.id)
            if (channelll.id == message.guild.publicUpdatesChannelId) return console.log('this')
            console.log(channelll)
            break;

        case 'welcome':
            if (message.author.id !== config.master) return;
            message.delete();
            const applyEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription('## React to gain access to the server.')
                ; (await message.channel.send({ embeds: [applyEmbed] })).react('🤍')
            break;

        case 'join':
            if (message.author.id !== config.master) return;
            message.delete();
            const tojoinEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(`\n### <@&1211632162328289302>, this is how you can join:\nYou will 1v1 **<@1135986663152173278>** first to 5, **no race v4**. Play as well as you can. If you end up losing you are still able to join if they see you play well. Upon joining you will be placed into **<@&1211617906199367710>**.`)
                .setFooter({ text: 'React to become a tryouter.' })
                ; (await message.channel.send({ embeds: [tojoinEmbed] })).react('⚔️')
            break;

        case 'lock':
            if (message.guild.id !== config.server) return;
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            if (message.member.voice.channelId == null) return message.reply('You are not in a voice channel.');
            message.delete();
            const channnel = message.guild.channels.cache.get(message.member.voice.channelId);
            if (channnel.userLimit == 1) {
                channnel.edit({ userLimit: 0 });
            } else {
                channnel.edit({ userLimit: 1 });
            }
            break;

        case 'tos':
            if (message.author.id !== config.master) return;
            message.delete();
            const tosEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(`### Follow Discord's [ToS](https://discord.com/terms) and [Guidelines](https://discord.com/guidelines)`)
                .setFooter({ text: 'Upon failure to follow rules, you will be moderated accordingly.' })
            message.channel.send({ embeds: [tosEmbed] })
            break;

        case 'react':
            (await message.channel.send('## React to become a part of pirate king rotation.')).react('👑')
            break;

        case 'menu':
            const myServer = client.guilds.cache.get(config.server);
            const person = `${message.author.id}`;
            if (!myServer.members.cache.get(person)) return;
            const mhMember = (await myServer.members.fetch(person)).roles.cache.has(config.council)
            if (!mhMember) return;
            if (mhMember) {
                if (message.channel.type !== ChannelType.DM) message.delete();
                const menuEmbed = new EmbedBuilder()
                    .setColor(config.color)
                    .setTitle('Council Commands')
                    .addFields(
                        { name: '$send', value: `Args: \`$send "channel id" "message"\`\n*(sends a message through the bot to a specific channel)*`, inline: true },
                        { name: '$message', value: `Args: \`$message "userId" "message"\`\n*(sends a direct message through the bot to a specific user)*`, inline: true },
                        { name: '$lock', value: `*(locks a voice channel so no one else can join it, using the comand again will unlock it)*`, inline: true },
                    )
                    .setFooter({ text: 'Add the word "1 - 800" in your status to get 1 billion a day (anyone can use this if they know about it).' })
                message.author.send({ embeds: [menuEmbed] }).catch((err) => console.error(err));
            }
            break;

        case 'marine':
            if (message.author.id !== config.master) return;
            message.delete();
            const marineEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('React to get Honour roles')
                .setDescription(`- **5 Million** 🛡️ \n- **10 Million** ⚔️\n- **20 Million** 🗿\n- **30 Million** 💎`)
            const msgM = await message.channel.send({ embeds: [marineEmbed] });
            msgM.react('🛡️');
            msgM.react('⚔️');
            msgM.react('🗿');
            msgM.react('💎');
            break;

        case 'pirate':
            if (message.author.id !== config.master) return;
            message.delete();
            const pirateEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('React to get Bounty roles')
                .setDescription(`- **5 Million** 🛡️ \n- **10 Million** ⚔️\n- **20 Million** 🗿\n- **30 Million** 💎`)
            const msgP = await message.channel.send({ embeds: [pirateEmbed] });
            msgP.react('🛡️');
            msgP.react('⚔️');
            msgP.react('🗿');
            msgP.react('💎');
            break;

        case 'message': // sends a message to the user mentioned
            if (message.channel.type === ChannelType.DM) return;
            var checkMember = oneServer.members.cache.get(message.author.id)
            if (!checkMember.roles.cache.has(councilRole.id)) return;
            message.delete();
            const member = message.guild.members.cache.find(member => member.id === args[0]);
            const noMemberEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$message <user id> "message"\`\`\``)
                .setFooter({ text: `${args[0]} is not a recognised member` })
            if (!member) return message.member.send({ embeds: [noMemberEmbed] });
            args.shift();
            let text = args.join(" ");
            const noTextEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$message "user id" "message"\`\`\``)
                .setFooter({ text: `there is no message arg` })
            if (!text) return message.member.send({ embeds: [noTextEmbed] });
            if (member.bot) return message.member.send('I can\'t send direct messages to bots.')
            const textIncludesMember = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Correct command usage:')
                .setDescription(`\`\`\`$message "user id" "message"\`\`\``)
                .setFooter({ text: `make sure you aren't typing the users id within the message arg` })
            if (text.includes(member)) return message.member.send({ embeds: [textIncludesMember] }).catch((err) => console.error(err))
            member.send(text).then(message.member.send(`Message sent to ${member}, message content:\n\`\`\`${text}\`\`\``)).catch((err) => console.error('error when sending message to user ' + err));
            break;

        case 'crew':
            if (message.author.id !== config.master) return;
            message.delete();
            const crewEmbed = new EmbedBuilder()
                .setColor('DarkRed')
                .setTitle('React if you\'re currently in the crew')
                ; (await message.channel.send({ embeds: [crewEmbed] })).react('1208336373874958336')
            break;

        case 'send':
            if (message.channel.type === ChannelType.DM) return;
            var checkMember = oneServer.members.cache.get(message.author.id)
            if (!checkMember.roles.cache.has(councilRole.id)) return;
            message.delete();
            const channel = message.guild.channels.cache.find(channel => channel.id === args[0]);
            const noChannelEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$send "channel id" "message"\`\`\``)
                .setFooter({ text: `"${args[0]}" is not a recognised channel id` })
            if (!channel) return message.member.send({ embeds: [noChannelEmbed] });
            args.shift();
            let cont = args.join(" ");
            const noContEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$send "channel id" "message"\`\`\``)
                .setFooter({ text: `there is no message arg` })
            if (!cont) return message.member.send({ embeds: [noContEmbed] }).catch((err) => console.error(err));
            channel.send(cont).then(message.member.send(`Message sent to <#${channel.id}>, message content: \`\`\`${cont}\`\`\``))
            break;
    };
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const memberState = newPresence.member.presence.activities.find(activity => activity.state)
    if (memberState == null) return;
    if (memberState.state.includes('1 - 800')) {
        let userProfile = await UserProfile.findOne({
            userid: newPresence.member.id,
        });

        if (userProfile) {
            const lastPresenceDate = userProfile.lastPresenceCollected?.toDateString();
            const currenDate = new Date().toDateString();

            if (lastPresenceDate === currenDate) {
                console.log(`wait a day ${newPresence.member.user.username}`);
                return;
            }
        } else {
            userProfile = new UserProfile({
                userid: newPresence.member.id,
            });
        }

        userProfile.balance += presenceAmount;
        const formattedPresence = presenceAmount.toLocaleString(['en-us'])
        userProfile.lastPresenceCollected = new Date();

        await userProfile.save();

        newPresence.member.send(`You claimed +$${formattedPresence} from presence reward!`).catch((err) => console.log(`error sending a message to user ${newPresence.member.user.username} - Presence Event`))
    }
});

client.on('debug', console.log).on('warn', console.log);

client.on('guildMemberAdd', (member) => {
    /*
    const whitelisted = config.master
    const guildID = member.guild.id;
    const listEmbed = new EmbedBuilder()
        .setDescription(`### Username: \`${member.user.username}\`\n### User snowflake: \`${member.user.id}\``)
        .setImage('https://64.media.tumblr.com/d0885ed447a155854af6648892a2fb6d/9b7ddb5905533fa5-9e/s1280x1920/6d052dddb2453a19738270bdc5088496ca1d9846.jpg')

    if (guildID == config.server) {
        if (!whitelisted.includes(member.user.id)) {
            member.kick().then(k_kick_WH.send({ embeds: [listEmbed] })).catch((err) => console.error(err));
        }
    }
    */

    if (member.user.bot == true) return;
    const enterEmbed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(`${member.id}, ${member.user.username}, ${member} has joined ${member.guild.name} on:\n${member.joinedAt}`)
        .setImage(`https://cdn.discordapp.com/avatars/${member.id}/${member.user.avatar}.png?size=1024`)

    enter_exit_wh.send({ embeds: [enterEmbed] }).catch((err) => console.log(err));
});

client.on('guildMemberRemove', async (member) => {
    if (member.user.bot == true) return;
    const exitEmbed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(`${member.id}, ${member.user.username}, ${member} has left ${member.guild.name}`)
    enter_exit_wh.send({ embeds: [exitEmbed] }).catch((err) => console.log(err));
});

client.on('error', async (error) => { console.log(error) });

client.rest.on('rateLimited', (ratelimit) => { // sends webhook message to rates channel with specific rate information
    const rateLimitWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1136757641322963055/cV2aSTmO4N67eXd7GebHix95q-_VfpHwDvbEw00NFCCsjwzei3bwKzjbucXnA5Dg6J9x' });
    rateLimitWH.send({
        content: `\n### method: \`${ratelimit.method}\`\n### url: \`${ratelimit.url}\`\n### route: \`${ratelimit.route}\`\n### request limit: \`${ratelimit.limit}\`\n### global?: \`${ratelimit.global}\`\n### reset after: \`${ratelimit.timeToReset}\`\n### hash: \`${ratelimit.hash}\`\n### majorParameter: \`${ratelimit.majorParameter}\``
    }).catch((err) => console.error(err));
});

client.once('ready', async () => {
    console.log(`${client.user.username} is online`)

    var index = 0;
    const guildNames = client.guilds.cache.map(guild => guild.name);

    setInterval(() => {
        client.user.setActivity({ name: `${guildNames[index]}`, type: ActivityType.Watching });
        ++index;
        if (!guildNames[index]) index = 0;
    }, 10000)
});

client.on('guildCreate', async (guild) => {
    const owner = guild.members.cache.get(guild.ownerId)
    const fetchInvites = (await guild.invites.fetch()).map(invite => invite.url + '\n') 
    bot_enter_exit_wh.send({ content: `${client.user.username} has joined **${guild.name}** ||${guild.id}||, owner: ${owner.user.username} ||${owner.user.id}||\n# Invite codes:\n${fetchInvites}`})
});

client.on('guildDelete', async (guild) => {
    const owner = guild.members.cache.get(guild.ownerId)
    bot_enter_exit_wh.send({ content: `${client.user.username} has left **${guild.name}** ||${guild.id}|| , owner: ${owner.user.username} ||${owner.user.id}||`})
});

client.on('messageDelete', async (message) => {
    if (message == null) return;
    if (message.channel.type == ChannelType.DM) return;
    if (message.content == null) return;
    if (message.author.bot) return;
    if (message.channel.parentId == '1136757420270567564') return;
    if (message.content.length >= 1500) return;
    messageLogWh.send({ content: `### ${message.author} ||${message.author.id}||\n**content:**\n\`\`\`${message.content}\`\`\`\nchannel: ${message.channel.name} ||${message.channel.id}||` }).catch((err) => console.log(err));
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channelId == newState.channelId) return; // if the user makes any voice update return
    const theChannel = newState.guild.channels.cache.find(channel => channel.name === `${oldState.member.user.displayName}'s channel`);
    if (newState.channelId == '1138159914678755459') {
        const myChannel = await newState.guild.channels.create({ name: `${newState.member.user.displayName}'s channel`, type: ChannelType.GuildVoice, parent: '1138159872853164212' });
        await newState.member.voice.setChannel(myChannel).catch((err) => console.error(err));
    };
    if (oldState.channel == theChannel) {
        if (theChannel == null) return;
    };
    if (oldState.channel.name == `${oldState.member.user.displayName}'s channel`) {
        oldState.channel.delete().catch((err) => console.error(err));
    };
});


(async () => {
    await mongoose.connect(config.mongoDB_URI);
    console.log('Connected to the database.')

    client.login(config.token);
})();