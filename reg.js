const { REST, Routes, ApplicationCommandOptionType, PermissionsBitField, ApplicationCommandOptionWithChoicesAndAutocompleteMixin } = require('discord.js');
const config = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { application } = require('express');

const commands = [
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
        description: 'Text to owoify',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: 'stop',
    description: 'Stop the audio player from playing',
  },
  {
    name: 'play',
    description: 'Play an audio file in your voice channel',
    options: [
      {
        name: 'file',
        description: 'Upload a file to play',
        type: ApplicationCommandOptionType.Attachment,
        required: true,
      },
    ],
  },
  {
    name: 'daily',
    description: 'Collect your daily reward!',
  },
  {
    name: 'balance',
    description: 'Displays your account balance',
    options: [
      {
        name: 'user',
        description: 'Display specfic user\'s account balance',
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },
  {
    name: 'transfer',
    description: 'Transfer money to another user',
    options: [
      {
        name: 'user',
        description: 'The user you want to transfer money to',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'amount',
        description: 'The amount of money you want to transfer',
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  {
    name: '50-50',
    description: 'Gamble for 50/50 chance to win money',
    options: [
      {
        name: 'amount',
        description: 'The amount you want to gamble',
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  {
    name: 'nuke',
    description: 'Clones the channel and deletes the original',
    default_member_permissions: PermissionsBitField.Flags.ManageChannels.toString(),
  },
  {
    name: 'ban',
    description: 'Ban a member from the server',
    default_member_permissions: PermissionsBitField.Flags.BanMembers.toString(),
    options: [
      {
        name: 'user',
        description: 'The user to ban',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason for banning this user',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  {
    name: 'kick',
    description: 'Kick a member from the server',
    default_member_permissions: PermissionsBitField.Flags.KickMembers.toString(),
    options: [
      {
        name: 'user',
        description: 'The user to kick',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'The reason for kicking this user',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  {
    name: 'softban',
    description: 'Bans a user, deleting their messages from the past 7 days than unbans them',
    default_member_permissions: PermissionsBitField.Flags.BanMembers.toString(),
    options: [
      {
        name: 'member',
        description: 'Member to softban',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for softban',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  {
    name: 'roleveryone',
    description: 'Gives a specific role to everyone in the server',
    default_member_permissions: PermissionsBitField.Flags.Administrator.toString(),
    options: [
      {
        name: 'role',
        description: 'Role to add',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },
  {
    name: 'avatar',
    description: 'Display a user\'s avatar',
    options: [
      {
        name: 'user',
        description: 'The user\'s avatar to display',
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
    name: 'deal-with-the-devil',
    description: 'You have a 1/3 chance to win and double your money, or lose half',
  }
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