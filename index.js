const { Client, Events, hyperlink, hideLinkEmbed, GatewayIntentBits, WebhookClient, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, Activity, TextChannel, Options, Presence, Partials, Message, ChannelType, CategoryChannel, ButtonInteraction, InteractionResponse, Webhook, GuildMember, AutoModerationRule, Collection, ButtonComponent, Colors } = require('discord.js');

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
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message
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

/*
const DiscordRPC = require('discord-rpc');
const RPC = new DiscordRPC.Client({ transport: 'ipc' });

DiscordRPC.register('1142613870985363517');

async function setActivity() {
    if (!RPC) return;
    RPC.setActivity({
        details: 'Kanye West',
        largeImageKey: `i_wonder_album_cover`
    })
}
RPC.on('ready', async () => {
    setActivity();

    setInterval(() => {
        setActivity();
    }, 15 * 1000);
});
RPC.login({ clientId: `1142613870985363517` });
*/

const dailyAmount = 1000;

const presenceAmount = 25000;

const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();

const { createAudioResource, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, getVoiceConnection, entersState, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

const moderationWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1141127321588355228/lIgewq8dy5UivxOfVFsNpbYeSOu80Srr1mtS-EgZmy8cY_ky_IB3w95ExOL2hsOT4_dR' });


// ------------------------------------------------------------------------------------------------------------------------

client.on('interactionCreate', async (interaction) => {
    /*
        const filter = i => i.customId === 'accept';
    
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
    
        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return interaction.followUp({ content: 'You can\'t accept your own invite', ephemeral: true })
            await i.update({ content: `**${interaction.member.displayName}** has accepted the game invite!`, components: [] });
        });
    
        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    
        if (interaction.commandName === 'rock-paper-scissors') {
            const amount = interaction.options.getNumber('amount');
    
            let userProfile = await UserProfile.findOne({
                userid: interaction.user.id,
            });
    
            if (!userProfile) {
                userProfile = new UserProfile({
                    userid: interaction.user.id,
                });
            }
    
            const accept = new ButtonBuilder()
                .setCustomId('accept')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Danger);
    
            const rpsRow = new ActionRowBuilder()
                .addComponents(accept);
    
            if (amount > userProfile.balance) return interaction.editReply({ content: `You can't wager for an amount greater than your balance` });
    
            var formattedAmount = amount.toLocaleString("en-US");
            interaction.reply({ content: `**${interaction.user.displayName}** has sent an invitiation to play rock paper scissors for **$${formattedAmount}**`, components: [rpsRow] });
        }*/

    if (!interaction.isChatInputCommand()) return;

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

            return interaction.reply(`Successfully transferred **¥${formattedAmount}** to **${user.displayName}**`)

        } catch (error) {
            console.log('error handling /transfer command ' + error);
        }
    }

    if (interaction.commandName === 'automod-spam-remove') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        await interaction.guild.autoModerationRules.fetch()
        await interaction.deferReply();

        const spamRule = interaction.guild.autoModerationRules.cache.find(AutoModerationRule => AutoModerationRule.creatorId === `${config.clientId}`);

        if (!spamRule) return interaction.editReply({ content: `Couldn't find an Automoderation rule made by kuromi` }).catch((err) => console.log(err));

        interaction.guild.autoModerationRules.delete(spamRule).then(interaction.editReply({ content: `Automod rule spam messages made by kuromi has been removed` })).catch((err) => console.log(err));
    }

    if (interaction.commandName === 'automod-spam') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        await interaction.deferReply();

        const rule1 = await interaction.guild.autoModerationRules.create({
            name: 'Prevent spam messages by kuromi',
            creatorId: `${config.clientId}`,
            enabled: true,
            eventType: 1,
            triggerType: 3,
            triggerMetadata: {
                mentionTotalLimit: 3
            },
            actions: [
                {
                    type: 1,
                    metadata: {
                        channel: interaction.channel,
                        durationSeconds: 10,
                        customMessage: `Message was blocked by kuromi through auto moderation`
                    }
                }
            ]
        }).catch(async err => {
            setTimeout(async () => {
                console.log(err);
                await interaction.editReply({ content: `${err}` });
            }, 2000);
        })

        setTimeout(async () => {
            if (!rule1) return;

            await interaction.editReply({ content: `Automod rule has been created. All spam messages will now be deleted` });
        }, 3000);
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

        const didWin = Math.random() > 0.4; // 40% chance to wi

        if (!didWin) {
            userProfile.balance -= amount;
            await userProfile.save();

            var formattedAmount = amount.toLocaleString("en-US");

            interaction.reply(`You gambled and lost **¥${formattedAmount}**. Unlucky!`);
            return;
        }

        const amountWon = Number((amount * (Math.random() + 1.2)).toFixed(0)); // something not giving me more than i gambled for

        userProfile.balance += amountWon;
        await userProfile.save();

        var formattedAmount = amount.toLocaleString("en-US");
        var formattedAmountWon = amountWon.toLocaleString("en-US");

        interaction.reply(`You gambled **¥${formattedAmount}** and won **¥${formattedAmountWon}**. Lucky!`);
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


            if (targetMember.user.id === client.user.id) return interaction.editReply({ content: `${targetMember.user.displayName}'s account balance is **-¥${formattedBalance}**` })
            if (targetMember.user.bot) return interaction.editReply({ content: 'You can\'t see a bot\'s balance' })

            interaction.editReply(
                targetUserId === interaction.user.id ? `Your account balance is **¥${formattedBalance}**` : `${targetMember.user.displayName}'s account balance is **¥${formattedBalance}**`
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

    if (interaction.commandName === 'report-message') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        const msgLink = interaction.options.getString('message_link');
        const reason = interaction.options.getString('reason');
        const reportWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1139265242732429333/x9AYlXKZwZTAj5xZ9ZKTrWyVEcwXnac__cELa7vGPmalpN1Gv08g7QboKAFEvSrlJ6Sp' });
        const reportEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(`## <@&1138452951191539853>\n### reporter: \n${interaction.member.user.displayName} ||${interaction.member.user.id}||\n### message link:\n${msgLink}\n### reason:\n"${reason}"`)
        await interaction.reply({ content: 'Report sent.', ephemeral: true }).catch((err) => console.error(err));
        reportWH.send({ embeds: [reportEmbed] }).catch((err) => console.error(err));
    }

    if (interaction.commandName === 'report-user') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('user').user;
        const reason = interaction.options.getString('reason');
        const reportWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1139265242732429333/x9AYlXKZwZTAj5xZ9ZKTrWyVEcwXnac__cELa7vGPmalpN1Gv08g7QboKAFEvSrlJ6Sp' });
        const reportEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(`## <@&1138452951191539853>\n### reporter: \n${interaction.member.user.displayName} ||${interaction.member.user.id}||\n### reported user:\n${user.username} ||${user.id}||\n### reason:\n"${reason}"`)
        await interaction.reply({ content: 'Report sent.', ephemeral: true }).catch((err) => console.error(err));
        reportWH.send({ embeds: [reportEmbed] }).catch((err) => console.error(err));
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

    if (interaction.commandName === 'nuke') { // clones the channel and deletes the original
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'I don\'t have the permission **"manage channels"**.', ephemeral: true }).catch((err) => console.error(err));
        interaction.channel.clone().catch((err) => console.error(err));
        interaction.channel.delete().catch((err) => console.error(err));
    };
});

// ------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------

client.on('messageCreate', async (message) => {

    if (message.guild == config.server) { // if message contains gg/ in my server it gets deleted unless the member has council
        if (message.content.includes('gg/')) {
            if (message.member.roles.cache.has(config.council)) return;
            message.channel.send(`${message.author} shut up`)
            message.delete();
        } else {
            if (message) {
                if (message.author.bot) return;
                const luckyRole = message.guild.roles.cache.get('1138557022070132807');
                var randomRoll = Math.floor((Math.random() * 3) + 1); // 1 = 0.1% && 10 = 1% && 100 = 10%
                if (message.content == randomRoll) return message.reply('You got the number!').then(message.react('<:ur_gem:1139986189542244383>')).then(message.member.roles.add(luckyRole.id)).catch((err) => console.error(err));
                console.log(randomRoll)
            }
        }
    }

    if (message.author.bot) return; // if a bot creates a message client will return

    if (message.content.indexOf(config.prefix) !== 0) return; // if message does not contain prefix than return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g); // removing prefix from message content amongst other things
    const command = args.shift().toLowerCase(); // tolowercase meaning $PING will work / array becomes arg1, arg2, arg3

    switch (command) {

        case 'menu':
            const myServer = client.guilds.cache.get(config.server);
            const person = `${message.author.id}`;
            if (!myServer.members.cache.get(person)) return;
            const mhMember = (await myServer.members.fetch(person)).roles.cache.has('1138512076021714954')
            if (!mhMember) return;
            if (mhMember) {
                if (message.channel.type !== ChannelType.DM) message.delete();
                const menuEmbed = new EmbedBuilder()
                    .setColor(config.color)
                    .setFooter({ text: 'Council commands and features only work in the discord server. additional commands and features being worked on' })
                    .setDescription(`# Council Menu\n### commands: \n\`\`\`$rules (sends rules message)\n$roleofmods (sends role of mods embed message)\n$send <channel name> "message" (sends a message through the bot to a specific channel)\n$message <user id> "message" (sends a message to a member through direct message)\`\`\`\n### features: \n- Allowed to post invite links in the discord server`)
                message.author.send({ embeds: [menuEmbed] }).catch((err) => console.error(err));
            }
            break;

        case 'stop':
            if (!message.member.roles.cache.has('1181226544878862346')) return;
            message.reply({ content: 'Stopping Inkspots' });
            var getConnection = getVoiceConnection(message.guild.id);
            player.stop();
            getConnection.destroy();
            break;

        case 'ink':
            if (!message.member.roles.cache.has('1181226544878862346')) return;
            message.reply({ content: 'Playing Inkspots' });
            const inkspots = createAudioResource('./inkspots.mp3');
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            var getConnection = getVoiceConnection(message.guild.id);
            player.play(inkspots);

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
                getConnection.destroy();
            });
            break;

        case 'rules':// rules message
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            message.delete();
            const termsURL = '<https://discord.com/terms>';
            const terms = hyperlink('**Terms**', termsURL);
            const guideURL = '<https://discord.com/guidelines>';
            const guide = hyperlink('**Guidelines**', guideURL);
            message.channel.send(`# Server Rules\n## 1. Behave\n- No spam, advertising, NSFW content.\n- Try not to talk about controversal topics.\n- Take drama elsewhere.\n- Be mindful and be kind.\n## 2. Please keep chat in English\n# Bot Support\n- You can find <#1139257049155391589> and <#1136703763760021514> if you have an inquiry about <@1136001498728386610>.\n# Contacting Moderators\nYou can use </report-user:1139322106069393468> and </report-message:1139319218165272618> to contact mods quietly.\n- If you need immediate moderator attention, mention <@&1138452951191539853> role instead of individual moderators.\n- Creating false reports may lead to moderation actions against you.\n# Follow Discord ${terms} and ${guide}`);
            break;

        case 'roleofmods':
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            message.delete()
            const roleofmodsEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`The Role of Mods`)
                .setDescription(`- Delete any unwanted or inaproppriate messages and report it to Discord when they are agains't Community Guidelines or Terms of Service.\n- Moderate users appropriately.\n- Support with responding to questions or queries.\n- Any suspicious user activity that could effect user experience will need urgent moderation.\n- Use <@1136001498728386610> to issue moderation.`)
                .setFooter({ text: 'refer to #questions to channel if you have any questions' })
            message.channel.send({ embeds: [roleofmodsEmbed] });
            break;

        case 'message': // sends a message to the user mentioned
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
                .setDescription(`\`\`\`$message <user id> "message"\`\`\``)
                .setFooter({ text: `there is no message arg` })
            if (!text) return message.reply({ embeds: [noTextEmbed] });
            if (member.bot) return message.reply('I can\'t send direct messages to bots.')
            const textIncludesMember = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Correct command usage:')
                .setDescription(`\`\`\`$message <user id> "message"\`\`\``)
                .setFooter({ text: `make sure you aren't typing the users id within the message arg` })
            if (text.includes(member)) return message.reply({ embeds: [textIncludesMember] }).catch((err) => console.error(err))
            member.send(text).then(message.reply(`Message sent to ${member}, message content:\n\`\`\`${text}\`\`\``)).catch((err) => console.error('error when sending message to user ' + err));
            break;

        case 'send':
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.council)) return;
            const channel = message.guild.channels.cache.find(channel => channel.name === args[0]);
            const noChannelEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$send <channel name> "message"\`\`\``)
                .setFooter({ text: `"${args[0]}" is not a recognised channel name` })
            if (!channel) return message.reply({ embeds: [noChannelEmbed] });
            args.shift();
            let cont = args.join(" ");
            const noContEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`Correct command usage:`)
                .setDescription(`\`\`\`$send <channel name> "message"\`\`\``)
                .setFooter({ text: `there is no message arg` })
            if (!cont) return message.reply({ embeds: [noContEmbed] }).catch((err) => console.error(err));
            channel.send(cont).then(message.reply(`Message sent to <#${channel.id}>, message content: \`\`\`${cont}\`\`\``))
            break;
    };
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const memberState = newPresence.member.presence.activities.find(activity => activity.state)
    if (memberState == null) return;
    if (memberState.state.includes('kuromi')) {
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
        userProfile.lastPresenceCollected = new Date();

        await userProfile.save();

        console.log(`${newPresence.member.user.username} claimed +$${presenceAmount} from presence reward!`);
    }
});

client.on('debug', console.log).on('warn', console.log);

client.on('guildMemberAdd', (member) => {
    let k_kick_WH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1181747821733494854/bjycCtqi6SaLvT_WVYXDFNBoHDyomKiRMZRVD78MroxXvDLEvOJ3fdpwgGmSyh7FMNPI' });
    const whitelisted = ['1135986663152173278', '249300259694575616', '949735611286319154', '713470317070385192']
    const guildID = member.guild.id;

    if (guildID !== config.server) return;
    if (!whitelisted.includes(member.user.id)) {
        member.kick();
    }
});

client.on('error', async (error) => { console.log(error) });

client.on('guildAuditLogEntryCreate', (auditLogEntry, guild) => {
    const WListed = ['1136001498728386610', '1135986663152173278']
    const LogEntryRole = auditLogEntry.targetType == 'Role'
    const logEntryDelete = auditLogEntry.actionType == 'Delete'
    const logeEntryChannel = auditLogEntry.targetType == 'Channel'
    const logEntryExecuter = guild.members.cache.get(auditLogEntry.executorId)

    if (guild.id !== config.server) return;
    if (!WListed.includes(logEntryExecuter.user.id)) return logEntryExecuter.kick();
});


client.rest.on('rateLimited', (ratelimit) => { // sends webhook message to rates channel with specific rate information
    const rateLimitWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1136757641322963055/cV2aSTmO4N67eXd7GebHix95q-_VfpHwDvbEw00NFCCsjwzei3bwKzjbucXnA5Dg6J9x' });
    rateLimitWH.send({
        content: `# rate logged\n## method\`\`\`${ratelimit.method}\`\`\`\n## url \`\`\`${ratelimit.url}\`\`\`\n## route\`\`\`${ratelimit.route}\`\`\`\n## request limit\`\`\`${ratelimit.limit}\`\`\`\n## global?\`\`\`${ratelimit.global}\`\`\`\n## reset after\`\`\`${ratelimit.timeToReset}\`\`\`\n## hash\`\`\`${ratelimit.hash}\`\`\`\n## majorParameter\`\`\`${ratelimit.majorParameter}\`\`\``
    }).catch((err) => console.error(err));
});

client.once('ready', async () => {
    console.log(`${client.user.username} is online`)
    client.user.setActivity({ name: `dumb bitch`, type: ActivityType.Custom });
});

client.on('voiceStateUpdate', async (oldState, newState) => {

    if (oldState.channelId == newState.channelId) return;
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