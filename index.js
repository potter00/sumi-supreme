const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
const config = require("./config.json");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

    const command = args.shift().toLowerCase();

    // comando de prueba 'ping'
    if (command === 'ping') {
      message.reply({ content: 'Pong!' });
    }
  });

client.login(config.token);
