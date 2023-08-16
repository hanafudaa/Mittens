const { Client, Events, hyperlink, hideLinkEmbed, GatewayIntentBits, WebhookClient, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, ActivityType, Activity, TextChannel, Options, Presence, Partials, Message, ChannelType, CategoryChannel, ButtonInteraction, InteractionResponse, Webhook, GuildMember, AutoModerationRule, Collection } = require('discord.js');

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

const UserProfile = require('./schemas/UserProfile');

const dailyAmount = 1000;

const presenceAmount = 25000;

const calculateLevelXp = require('./utils/calculateLevelXp')

const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const owoify = require('owoifyx');
const mongoose = require('mongoose');

const config = require('./config.json');
const { default: owofify } = require('owoifyx');

const moderationWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1141127321588355228/lIgewq8dy5UivxOfVFsNpbYeSOu80Srr1mtS-EgZmy8cY_ky_IB3w95ExOL2hsOT4_dR' });


// ------------------------------------------------------------------------------------------------------------------------

client.on('debug', console.log).on('warn', console.log);

client.on('error', async (error) => { console.log(error) });

client.rest.on('rateLimited', (ratelimit) => { // sends webhook message to rates channel with certain rate information
    const rateLimitWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1136757641322963055/cV2aSTmO4N67eXd7GebHix95q-_VfpHwDvbEw00NFCCsjwzei3bwKzjbucXnA5Dg6J9x' });
    rateLimitWH.send({
        content: `# rate logged\n## method\`\`\`${ratelimit.method}\`\`\`\n## url \`\`\`${ratelimit.url}\`\`\`\n## route\`\`\`${ratelimit.route}\`\`\`\n## request limit\`\`\`${ratelimit.limit}\`\`\`\n## global?\`\`\`${ratelimit.global}\`\`\`\n## reset after\`\`\`${ratelimit.timeToReset}\`\`\`\n## hash\`\`\`${ratelimit.hash}\`\`\`\n## majorParameter\`\`\`${ratelimit.majorParameter}\`\`\``
    }).catch((err) => console.error(err));
});

client.once('ready', async () => {
    console.log(`${client.user.username} is online`)
    client.user.setActivity({ name: `${day}/${month}/${year}`, type: ActivityType.Watching });
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

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const memberState = newPresence.member.presence.activities.find(activity => activity.state)
    if (memberState == null) return;
    if (memberState.state.includes('/malena')) {
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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    await interaction.guild.autoModerationRules.fetch()

    if (interaction.commandName === 'automod-spam-remove') {
        await interaction.deferReply();

        const malenaRule = interaction.guild.autoModerationRules.cache.find(AutoModerationRule => AutoModerationRule.creatorId === `${config.clientId}`);

        if (!malenaRule) return interaction.editReply({ content: `Couldn't find an Automoderation rule made by malena` }).catch((err) => console.log(err));

        interaction.guild.autoModerationRules.delete(malenaRule).then(interaction.editReply({ content: `Automod rule spam messages made by melane has been removed` })).catch((err) => console.log(err));
    }

    if (interaction.commandName === 'automod-spam') {
        await interaction.deferReply();

        const rule1 = await interaction.guild.autoModerationRules.create({
            name: 'Prevent spam messages by malena',
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
                        customMessage: `Message was blocked by malena through auto moderation`
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
        const amount = interaction.options.getNumber('amount');

        if (amount < 50) {
            interaction.reply({ content: 'You must gamble atleast **$50**' });
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

        const didWin = Math.random() > 0.4; // 40% chance to win

        if (!didWin) {
            userProfile.balance -= amount;
            await userProfile.save();

            var formattedAmount = amount.toLocaleString("en-US");

            interaction.reply(`You lost the gamble **-$${formattedAmount}**. Unlucky!`);
            return;
        }

        const amountWon = Number((amount * (Math.random() + 0.55)).toFixed(0)); // something not giving me more than i gambled for

        userProfile.balance += amountWon;
        await userProfile.save();

        var formattedAmountWon = amountWon.toLocaleString("en-US");

        interaction.reply(`You won **+$${formattedAmountWon}**!`);
    }

    if (interaction.commandName === 'balance') {
        const targetUserId = interaction.options.getUser('user')?.id || interaction.user.id;

        const targetMember = interaction.guild.members.cache.get(targetUserId);

        await interaction.deferReply();

        try {
            let userProfile = await UserProfile.findOne({ userid: targetUserId });

            if (!userProfile) {
                userProfile = new UserProfile({ userid: targetUserId });
            }

            const balanceAmount = userProfile.balance;
            var formattedBalance = balanceAmount.toLocaleString("en-US");

            interaction.editReply(
                targetUserId === interaction.user.id ? `Your account balance is **$${formattedBalance}**` : `${targetMember.user.displayName}'s account balance is **$${formattedBalance}**`
            )
        } catch (error) {
            console.log(`error handling /balance: ${error}`);
        }
    }

    if (interaction.commandName === 'level') {
        const targetUserId = interaction.options.getUser('user')?.id || interaction.user.id;

        await interaction.deferReply();

        try {
            let userProfile = await UserProfile.findOne({ userid: targetUserId });

            if (!userProfile) {
                userProfile = new UserProfile({ userid: targetUserId });
            }

            const levelNumber = userProfile.level;
            var formattedLevel = levelNumber.toLocaleString("en-US");

            interaction.editReply(
                targetUserId === interaction.user.id ? `Your account level is **${formattedLevel}**` : `<@${targetUserId}>'s account level is **${formattedLevel}**`
            )
        } catch (error) {
            console.log(`error handling /level: ${error}`);
        }
    }

    if (interaction.commandName === 'daily') {
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

            interaction.editReply(
                `You claimed **$${dailyAmount}** from daily reward!`
            )
        } catch (error) {
            console.log(`error handling /daily: ${error}`);
        }
    }

    if (interaction.commandName === 'avatar') {
        const avataruser = interaction.options.get('user').user;
        const avatarEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`${avataruser.displayName}'s avatar`)
            .setImage(`https://cdn.discordapp.com/avatars/${avataruser.id}/${avataruser.avatar}.jpeg`)
        interaction.reply({ embeds: [avatarEmbed] }).catch((err) => console.error(err));
    }

    if (interaction.commandName === 'report-message') {
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
        const user = interaction.options.get('user').user;
        const reason = interaction.options.getString('reason');
        const reportWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1139265242732429333/x9AYlXKZwZTAj5xZ9ZKTrWyVEcwXnac__cELa7vGPmalpN1Gv08g7QboKAFEvSrlJ6Sp' });
        const reportEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(`## <@&1138452951191539853>\n### reporter: \n${interaction.member.user.displayName} ||${interaction.member.user.id}||\n### reported user:\n${user.username} ||${user.id}||\n### reason:\n"${reason}"`)
        await interaction.reply({ content: 'Report sent.', ephemeral: true }).catch((err) => console.error(err));
        reportWH.send({ embeds: [reportEmbed] }).catch((err) => console.error(err));
    }

    if (interaction.commandName === 'softban') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'I don\'t have the permission **ban members**.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('member').user;
        const reason = interaction.options.getString('reason');
        const banMember = interaction.guild.members.cache.get(user.id);
        if (banMember == null) return interaction.reply({ content: `Member not found`, ephemeral: true }).catch((err) => console.error(err));
        if (!banMember.manageable) return interaction.reply({ content: `I can\'t manage ${user.displayName}.`, ephemeral: true }).catch((err) => console.error(err));
        if (user.id == client.user.id) return;
        if (interaction.guild.id === config.server) {
            if (!reason) return (await interaction.reply({ content: `You must provide a reason for softbanning.`, ephemeral: true }));
            await moderationWH.send({ content: `**${banMember.user.username}** was softbanned by <@${interaction.member.id}>\n## reason:\n"${reason}".` }).catch((err) => console.log(err));
        }
        await banMember.ban({ deleteMessageSeconds: 604800 }).then(banMember => interaction.guild.members.unban(banMember.id)).then(interaction.reply({
            content: `${banMember.user.username} was softbanned`,
            ephemeral: true,
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

    if (message.guild == config.server) { // if message contains gg/ in my server it gets deleted unless the member has flower
        if (message.content.includes('gg/')) {
            if (message.member.roles.cache.has(config.flower)) return;
            message.delete();
        } else {
            if (message) {
                if (message.author.bot) return;
                const luckyRole = message.guild.roles.cache.get('1138557022070132807');
                var randomRoll = Math.floor((Math.random() * 1000) + 1); // 1 = 0.1% && 10 = 1% && 100 = 10%
                if (randomRoll == 1) return message.reply('You stumbled across an **ultra-rare Gem!**').then(message.react('<:ur_gem:1139986189542244383>')).then(message.member.roles.add(luckyRole.id)).catch((err) => console.error(err));
            }
        }
    } else {
        if (message.author.bot) return;
        var randomRoll = Math.floor((Math.random() * 1000) + 1);
        if (randomRoll >= 990 && randomRoll <= 1000) return message.reply('You found **Golden bars!**').then(message.react('<:gold_bars:1139951448189313044>')).then(console.log(`${message.author.displayName} found gold bars`));
    }

    if (message.author.bot) return; // if a bot creates a message client will return

    const xpToGive = getRandomXp(5, 10);

    const query = {
        userid: message.author.id,
    };

    try {
        const level = await UserProfile.findOne(query);

        if (level) {
            level.xp += xpToGive;

            if (level.xp > calculateLevelXp(level.level)) {
                level.xp = 0;
                level.level += 1;

                message.channel.send(`${message.author} leveled up! You are now level **${level.level}**.`);
            }

            await level.save().catch((err) => {
                console.log(`error saving updated level ${err}`);
                return;
            })
        }

        // if (!level)
        else {
            // create new level
            const newLevel = new UserProfile({
                userid: message.author.id,
                xp: xpToGive,
            });

            await newLevel.save();
        }
    } catch (error) {
        console.log(`error when handling xp ${error}`);
    }

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
                const menuEmbed = new EmbedBuilder()
                    .setColor(config.color)
                    .setFooter({ text: 'flower only works in malena com discord server. additional flower commands and features being worked on' })
                    .setTitle('flower menu')
                    .setDescription(`### commands: \n\`\`\`$rules (displays rules message)\n$send <channel name> "message" (sends a message through malena bot to a certain channel)\n$message <user id> "message" (sends a message to a member through direct message)\`\`\`\n### features: \n- Allowed to post invite links in malena com`)
                message.author.send({ embeds: [menuEmbed] }).catch((err) => console.error(err));
            }
            break;

                case 'roll': // some sort of gambling command
                    var randomRoll = Math.floor((Math.random() * 1000) + 1);
                    console.log(randomRoll)
                    if (randomRoll >= 1 && randomRoll <= 100) return console.log('this is the range')
                    if (randomRoll == 1) return console.log('wow 0.1 percent chance')
                    break;

        case 'rules':// rules message
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.flower)) return;
            message.delete();
            const termsURL = '<https://discord.com/terms>';
            const terms = hyperlink('**Terms**', termsURL);
            const guideURL = '<https://discord.com/guidelines>';
            const guide = hyperlink('**Guidelines**', guideURL);
            message.channel.send(`# Server Rules\n## 1. Behave\n- No spam, advertising, NSFW content.\n- Try not to talk about controversal topics.\n- Take drama elsewhere.\n- Be mindful and be kind.\n## 2. Please keep chat in English\n# malena bot support\n- You can find <#1139257049155391589> and <#1136703763760021514> if you have an inquiry about malena.\n# Contacting Staff\nYou can use </report-user:1139322106069393468> and </report-message:1139319218165272618> to contact staff quietly.\n- If you need immediate staff attention, mention <@&1138452951191539853> role instead of individual staff.\n- Creating false reports may lead to moderation actions against you.\n# Follow Discord ${terms} and ${guide}`);
            break;

        case 'roleofstaff':
            if (message.author.id != config.master) return;
            message.delete()
            const roleofstaffEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`The Role of Staff`)
                .setDescription(`- Delete any unwanted or inaproppriate messages and report it to Discord when they are agains't Community Guidelines or Terms of Service.\n- Moderate users appropriately.\n- Support with responding to questions or queries.\n- Any suspicious user activity that could effect user experience will need urgent moderation.\n- Use malena bot to issue moderation.`)
                .setFooter({ text: 'refer to #questions to channel if you have any questions' })
            message.channel.send({ embeds: [roleofstaffEmbed] });
            break;

        case 'message': // sends a message to the user mentioned
            if (message.channel.type === ChannelType.DM) return;
            if (!message.member.roles.cache.has(config.flower)) return;
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
            if (!message.member.roles.cache.has(config.flower)) return;
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

(async () => {
    await mongoose.connect(config.mongoDB_URI);
    console.log('Connected to the database.')

    client.login(config.token);
})();