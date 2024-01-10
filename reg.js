const { REST, Routes, ApplicationCommandOptionType, PermissionsBitField, ApplicationCommandOptionWithChoicesAndAutocompleteMixin } = require('discord.js');
const config = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [
  {
    name: 'stop',
    description: 'stop the audio player from playing.',
  },
  {
    name: 'play',
    description: 'play an audio file in your voice channel',
    options: [
      {
        name: 'file',
        description: 'upload a file to play',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
      },
    ],
  },
  {
    name: 'convert',
    description: 'convert your yen into something',
    options: [
      {
        name: 'k-coins',
        description: 'convert your yen into k-coins',
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  {
    name: 'daily',
    description: 'collect your daily reward!',
  },
  {
    name: 'balance',
    description: 'displays your account balance',
    options: [
      {
        name: 'user',
        description: 'display users account balance',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },
  {
    name: 'transfer',
    description: 'transfer money to another user',
    options: [
      {
        name: 'user',
        description: 'the user you want to transfer money to',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'amount',
        description: 'the amount of money you want to transfer',
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  {
    name: 'gamble',
    description: 'gamble your money',
    options: [
      {
        name: 'amount',
        description: 'the amount you want to gamble',
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  {
    name: 'nuke',
    description: 'clones the channel and deletes the original',
    default_member_permissions: PermissionsBitField.Flags.ManageChannels.toString(),
  },
  {
    name: 'ban',
    description: 'ban a member from the server',
    default_member_permissions: PermissionsBitField.Flags.BanMembers.toString(),
    options: [
      {
        name: 'user',
        description: 'the user to ban',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'the reason for banning this user',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  {
    name: 'kick',
    description: 'kick a member from the server',
    default_member_permissions: PermissionsBitField.Flags.KickMembers.toString(),
    options: [
      {
        name: 'user',
        description: 'the user to kick',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'the reason for kicking this user',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  {
    name: 'softban',
    description: 'bans a user, deleting their messages from the past 7 days than unbans them',
    default_member_permissions: PermissionsBitField.Flags.BanMembers.toString(),
    options: [
      {
        name: 'member',
        description: 'member to softban',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'reason for softban',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  {
    name: 'roleveryone',
    description: 'gives a specific role to everyone in the server',
    default_member_permissions: PermissionsBitField.Flags.Administrator.toString(),
    options: [
      {
        name: 'role',
        description: 'role to add',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },
  {
    name: 'avatar',
    description: 'display a user\'s avatar',
    options: [
      {
        name: 'user',
        description: 'the user\'s avatar to display',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },
];

const exclusivecommands = [
  {
    name: 'Report message',
    type: 3
  },
  {
    name: 'uwuify',
    type: 3
  },
  {
    name: 'owoify',
    description: 'owoifies text',
    options: [
      {
        name: 'text',
        description: 'text to owoify',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
];

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.server), { body: exclusivecommands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();