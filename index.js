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

const k_kick_WH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1181747821733494854/bjycCtqi6SaLvT_WVYXDFNBoHDyomKiRMZRVD78MroxXvDLEvOJ3fdpwgGmSyh7FMNPI' });

// ------------------------------------------------------------------------------------------------------------------------
const express = require('express');

const app = express();

app.get('/', (request, response) => {
    return response.sendFile('index.html', { root: '.' });
});

app.listen(config.port, () => console.log(`App listening at http://localhost:${config.port}`));

// make a message reaction that edits the message when the user reacts and edits the message to something like "war going on in @users lobby" and ping and delete message

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
        if (interaction.component.customId == 'confirmNuke') {
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'I don\'t have the permission **"manage channels"**.', ephemeral: true });
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'you don\'t have the permission **"manage channels"**.', ephemeral: true });
            const nukeChannel = interaction.guild.channels.cache.get(interaction.channel.id);
            try {
                nukeChannel.delete()
                await nukeChannel.clone()
                const thisChannel = interaction.guild.channels.cache.find(channel => channel.name == nukeChannel.name);
                await thisChannel.send('https://tenor.com/view/will-smith-shades-mib-men-in-black-neuralyzer-gif-17328155');
            } catch (error) {
                console.log(`error handling button interaction confirm nuke - ${error}`);
            }
        }
        if (interaction.component.customId == 'cancel') {
            const cancelMessage = interaction.channel.messages.cache.get(interaction.message.id);
            try {
                cancelMessage.delete();
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

        if (amount < 50) {
            interaction.reply({ content: 'You must gamble atleast **¥50**' });
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


            if (targetMember.user.id === client.user.id) return interaction.editReply({ content: `${targetMember.user.displayName}'s account balance is **-¥${formattedBalance}**.` })
            if (targetMember.user.bot) return interaction.editReply({ content: 'You can\'t see a bot\'s balance' })

            interaction.editReply(
                targetUserId === interaction.user.id ? `Your account balance is **¥${formattedBalance}**.` : `${targetMember.user.displayName}'s account balance is **¥${formattedBalance}**.`
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
            .setImage(`https://cdn.discordapp.com/avatars/${avataruser.id}/${avataruser.avatar}.jpeg`)
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
    const notiRole = messageReaction.message.guild.roles.cache.get("1208173219819814912")
    const memberToRole = messageReaction.message.guild.members.cache.get(User.id)

    if (messageReaction.message.id !== "1208183611212431390") return;
    if (messageReaction.emoji.name == "🎴") {
        messageReaction.users.remove(memberToRole.id);
        if (!memberToRole.roles.cache.has(notiRole.id)) {
            memberToRole.roles.add(notiRole.id).then(memberToRole.send('I gave you the "War Notification" role.')).catch((err) => console.log(err));
        } else {
            memberToRole.roles.remove(notiRole.id).then(memberToRole.send('I removed your "War Notification" role.')).catch((err) => console.log(err));
        }
    }
});

// ------------------------------------------------------------------------------------------------------------------------

client.on('messageCreate', async (message) => {

    if (message.author.bot) return; // if a bot creates a message client will return

    if (message.content.indexOf(config.prefix) !== 0) return; // if message does not contain prefix than return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g); // removing prefix from message content amongst other things
    const command = args.shift().toLowerCase(); // tolowercase meaning $PING will work / array becomes arg1, arg2, arg3

    switch (command) {

        case 'war':
            if (message.guild.id !== config.server) return;
            message.react('🌺')
            let role = message.guild.roles.cache.find(r => r.name === "War Notification");
            if (message.member.nickname) {
                role.members.forEach(member => member.send(`A war is going on! Alert sent from ${message.member.nickname}.`).catch((err) => console.log(err)))
            } else {
                role.members.forEach(member => member.send(`A war is going on! Alert sent from ${message.member.displayName}.`).catch((err) => console.log(err)))
            }
            break;

        case 'welcome':
            if (message.author.id !== config.master) return;
            message.delete();
            const welcomeEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Welcome to Polyphia')
                .setDescription('- <#1202324130259808307>')
                .setImage('https://media1.tenor.com/m/cKDNmPxVN0gAAAAC/demon-slayer-rengoku.gif')
            message.channel.send({ embeds: [welcomeEmbed] });
            break;

        case 'footer':
            if (message.author.id !== config.master) return;
            message.delete();
            const footerEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setFooter({ text: 'Members can challenge any of the twelve kizuki to a 1v1 in order to claim their rank.' })
            message.channel.send({ embeds: [footerEmbed] });
            break;

        case 'upper':
            if (message.author.id !== config.master) return;
            message.delete();
            const upperEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setImage('https://media1.tenor.com/m/iHXIzCUw8HAAAAAC/akaza-kokushibo.gif')
                .addFields(
                    { name: 'Upper 1', value: `<@818948986374193193>`, inline: true },
                    { name: 'Upper 2', value: `<@944655950260879371>`, inline: true },
                    { name: 'Upper 3', value: `<@1071452294450774118>`, inline: true },
                    { name: 'Upper 4', value: `<@753951863342104669>`, inline: true },
                    { name: 'Upper 5', value: `none`, inline: true },
                    { name: 'Upper 6', value: `none`, inline: true },
                )
                .setDescription('## <@&1196136343328264382>')
            message.channel.send({ embeds: [upperEmbed] });
            break;

        case 'lower':
            if (message.author.id !== config.master) return;
            message.delete();
            const lowerEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setImage('https://media1.tenor.com/m/KwNbxtAZ7rwAAAAC/kimetsu-no-yaiba-mugen-train.gif')
                .addFields(
                    { name: 'Lower 1', value: `none`, inline: true },
                    { name: 'Lower 2', value: `none`, inline: true },
                    { name: 'Lower 3', value: `none`, inline: true },
                    { name: 'Lower 4', value: `none`, inline: true },
                    { name: 'Lower 5', value: `none`, inline: true },
                    { name: 'Lower 6', value: `none`, inline: true },
                )
                .setDescription(`## <@&1203154889413365790>`)
            message.channel.send({ embeds: [lowerEmbed] });
            break;

        case 'lock':
            if (message.guild.id !== config.server) return;
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            if (message.member.voice.channelId == null) return message.reply('You are not in a voice channel.')
            message.delete();
            const channnel = message.guild.channels.cache.get(message.member.voice.channelId);
            if (channnel.userLimit == 1) {
                channnel.edit({ userLimit: 0 })
            } else {
                channnel.edit({ userLimit: 1 });
            }
            break;

        case 'move':
            if (message.guild.id !== config.server) return;
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            message.delete();
            const userr = message.mentions.users.first();
            const memberr = message.guild.members.cache.get(userr.id);
            const channell = message.guild.channels.cache.find(channel => channel.name === args[1]);
            const noArgsEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$move "user mention" "channel name"\`\`\``)
                .setFooter({ text: `Please make sure you're entering the args correctly.` })
            if (!userr || !channell) return message.reply({ embeds: [noArgsEmbed] });
            if (userr.bot) return message.reply('I can\'t move bots.');
            if (memberr.voice.channelId == null) return message.reply(`User is not connected to a voice channel.`)
            if (channell.type == ChannelType.GuildVoice) {
                memberr.voice.setChannel(channell)
            }
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
                    .setTitle('Council Commands and Features')
                    .setDescription(`### features: \n- Allowed to create invite links.\n- Able to edit server without getting kicked.`)
                    .addFields(
                        { name: '$send', value: `Args: \`$send "channel name" "message"\`\n*(sends a message through the bot to a specific channel)*`, inline: true },
                        { name: '$message', value: `Args: \`$message "userId" "message"\`\n*(sends a direct message through the bot to a specific user)*`, inline: true },
                        { name: '$move', value: `Args: \`$move "user mention" "channel name"\`\n*(moves a user who is already in a voice channel into another one)*`, inline: true },
                        { name: '$lock', value: `*(locks a voice channel so no one else can join it, using the comand again will unlock it)*`, inline: true },
                    )
                    .setFooter({ text: 'Add the word "Polyphia" in your status to get 1 billion a day (anyone can use this if they know about it).' })
                message.author.send({ embeds: [menuEmbed] }).catch((err) => console.error(err));
            }
            break;

        case 'message': // sends a message to the user mentioned
            if (message.guild.id !== config.server) return;
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            const member = message.guild.members.cache.find(member => member.id === args[0]);
            const noMemberEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$message <user id> "message"\`\`\``)
                .setFooter({ text: `${args[0]} is not a recognised member` })
            if (!member) return message.reply({ embeds: [noMemberEmbed] });
            args.shift();
            let text = args.join(" ");
            const noTextEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$message "user id" "message"\`\`\``)
                .setFooter({ text: `there is no message arg` })
            if (!text) return message.reply({ embeds: [noTextEmbed] });
            if (member.bot) return message.reply('I can\'t send direct messages to bots.')
            const textIncludesMember = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Correct command usage:')
                .setDescription(`\`\`\`$message "user id" "message"\`\`\``)
                .setFooter({ text: `make sure you aren't typing the users id within the message arg` })
            if (text.includes(member)) return message.reply({ embeds: [textIncludesMember] }).catch((err) => console.error(err))
            member.send(text).then(message.reply(`Message sent to ${member}, message content:\n\`\`\`${text}\`\`\``)).catch((err) => console.error('error when sending message to user ' + err));
            break;

        case 'send':
            if (message.guild.id !== config.server) return;
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            const channel = message.guild.channels.cache.find(channel => channel.name === args[0]);
            const noChannelEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$send "channel name" "message"\`\`\``)
                .setFooter({ text: `"${args[0]}" is not a recognised channel name` })
            if (!channel) return message.reply({ embeds: [noChannelEmbed] });
            args.shift();
            let cont = args.join(" ");
            const noContEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$send "channel name" "message"\`\`\``)
                .setFooter({ text: `there is no message arg` })
            if (!cont) return message.reply({ embeds: [noContEmbed] }).catch((err) => console.error(err));
            channel.send(cont).then(message.reply(`Message sent to <#${channel.id}>, message content: \`\`\`${cont}\`\`\``))
            break;
    };
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const memberState = newPresence.member.presence.activities.find(activity => activity.state)
    if (memberState == null) return;
    if (memberState.state.includes('Polyphia')) {
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
                userid: interaction.member.id,
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
    const whitelisted = config.master
    const guildID = member.guild.id;
    const listEmbed = new EmbedBuilder()
        .setDescription(`### Username: \`${member.user.username}\`\n### User snowflake: \`${member.user.id}\``)
        .setImage('https://64.media.tumblr.com/d0885ed447a155854af6648892a2fb6d/9b7ddb5905533fa5-9e/s1280x1920/6d052dddb2453a19738270bdc5088496ca1d9846.jpg')

    if (guildID !== config.server) return;
    if (!whitelisted.includes(member.user.id)) {
        member.kick().then(k_kick_WH.send({ embeds: [listEmbed] })).catch((err) => console.error(err));
    }
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
    client.user.setActivity({ name: `Polyphia`, type: ActivityType.Watching });
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