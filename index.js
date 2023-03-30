const Discord = require('discord.js');
const { Client, GatewayIntentBits, Intents } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Pause,
	},
});
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
});


const config = require("./config.json");
const commands = require("./commands.json");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

    const command = args.shift().toLowerCase();

    //Recorre el objeto commands en busca para dar respuesta
    for (const cmd in commands) {
        //si el comando existe dara una respuesta y se cerrara el ciclo
        if (cmd === command) {
            res = commands[cmd];
            message.reply({ content: res });
            break;
        }
    }
    //Reproductor de musica
    if (command === 'pon') {
        if (!message.member.voice.channel) {
            return message.reply('¡Debes estar en un canal de voz para reproducir música!');
        }
            const voiceChannel = message.member.voice.channel;
            if (voiceChannel) {
              const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
              });
              console.log(`Conectado al canal de voz ${voiceChannel.name}`);
            } else {
              console.log('¡Debes estar en un canal de voz para utilizar este comando!');
            }
          


    }


});

client.login(config.token);
