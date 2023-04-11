const Discord = require('discord.js');
const { DisTube, Queue, QueueManager } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');
const client = new Discord.Client({
	intents: ['Guilds', 'GuildVoiceStates', 'GuildMessages', "MessageContent"],
});
const config = require("./config.json");
const responses = require("./commands.json");
const distube = new DisTube(client, {
	searchSongs: 5,
	searchCooldown: 30,
	leaveOnEmpty: true,
	leaveOnFinish: true,
	leaveOnStop: false,
});

client.on('ready', client => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {

	for (const key in responses) {
		if (message.content.toLowerCase() === key) {
			message.channel.send(responses[key]);
			return;
		}

	}
	if (message.author.bot || !message.inGuild()) return;
	const args = message.content.split(' ');
	if (args[0].toLowerCase === !config.prefix) return;

	const command = args[1];
	args.shift();
	args.shift();

	console.log(command);

	if (command == undefined) return;

	if (command === 'ayuda') {
		message.channel.send('Tienes diferentes opciones para comandos solo procura poner "sumi" antes de cada uno\n**play** Es un comando para poner musica en efecto, acepto nombres y links de youtube');
		message.channel.send('**para** o **stop** Como supiste? para la musica\n**sal** o **leave** En efecto me voy alv \n**pausa** o **pause** Sopresa pauso la musica');
		message.channel.send('**resume** o **sigue** Sigo con las rolitas \n**skip** Te tengo que decir? \n**lista** te doy la lista de musica actual');
		message.channel.send('Esto es todo por ahora dudas y sugerencias al creador porfavor, y si llego a morir favor de avisarle al creador asi me debuguea y arregla');
		return;
	}
	if (command === 'pon' || 'play') {
		distube
			.play(message.member.voice.channel, args.join(' '), {
				message,
				textChannel: message.channel,
				member: message.member,
			})
			.catch(err => {
				console.error(err.message);
				if (err.message === 'Expected \'BaseGuildVoiceChannel\' for \'voiceChannel\', but got null (object)') {
					message.channel.send('Tienes que estar en un canal, si no, no trabajo ^w^')
				}
			});
	}
	if (['repeat', 'loop'].includes(command)) {
		try {
			const mode = distube.setRepeatMode(message);
			message.channel.send(
				`Modo loop \`${mode
					? mode === 2
						? 'All Queue'
						: 'This Song'
					: 'Off'
				}\``,
			);
		} catch (error) {
			console.log(error)
		}

	}

	if (command === 'para' || command === 'stop') {
		try {
			distube.stop(message);
			message.channel.send('Pare!');
		} catch (error) {
			console.log(error);
		}

	}

	if (command === 'sal' || command === 'leave') {
		distube.voices.get(message)?.leave();
		message.channel.send('Ya me voy pues');
	}
	if (command === 'resume' || command === 'sigue') {
		try {
			distube.resume(message);
		} catch (error) {
			console.log(error);
		}

	}

	if (command === 'pause' || command === 'pausa' || command === 'espera') {
		try {
			distube.pause(message);
		} catch (error) {
			console.log(error)
		}
	}

	if (command === 'skip' || command === 'siguente') {
		try {
			const queue = distube.getQueue(message);
			console.log(queue.songs.length);
			if (queue.songs.length == 1) {
				distube.voices.get(message)?.leave();

			} else {
				distube.skip(message);
			}
		} catch (error) {
			console.log(error)
		}

	}

	if (command === 'queue' || command === 'lista') {
		const queue = distube.getQueue(message);
		if (!queue) {
			message.channel.send('No hay nada wey');
		} else {
			message.channel.send(
				`Lista actual:\n${queue.songs
					.map(
						(song, id) =>
							`**${id ? id : 'Reproduciendo'}**. ${song.name
							} - \`${song.formattedDuration}\``,
					)
					.slice(0, 10)
					.join('\n')}`,
			);
		}
	}

	if (
		[
			'3d',
			'bassboost',
			'echo',
			'karaoke',
			'nightcore',
			'vaporwave',
		].includes(command)

	) {
		const filter = distube.setFilter(message, command);
		message.channel.send(
			`Current queue filter: ${filter.join(', ') || 'Off'}`,
		);
	}


});
const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${'Off'
	}\` | Loop: \`${queue.repeatMode
		? queue.repeatMode === 2
			? 'All Queue'
			: 'This Song'
		: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

distube
	.on('playSong', (queue, song) =>
		queue.textChannel?.send(
			`Reproduciendo \`${song.name}\` - \`${song.formattedDuration
			}\`\nPedida por: ${song.user}\n${status(queue)}`,
		),
	)
	.on('addSong', (queue, song) =>
		queue.textChannel?.send(
			`Añadida ${song.name} - \`${song.formattedDuration}\` a la lista de reproduccion por el queridisimo ${song.user}`,
		),
	)
	.on('addList', (queue, playlist) =>
		queue.textChannel?.send(
			`Añadi \`${playlist.name}\` esa lista (${playlist.songs.length
			} songs) a la lista\n${status(queue)}`,
		),
	)
	.on('error', (textChannel, e) => {
		console.error(e);
		textChannel.send(
			`Encontre un error mandenle esto al creador: ${e.message.slice(0, 1000)}`,
		);
	})
	.on('finish', queue => queue.textChannel?.send('Termine toda la lista'))
	.on('finishSong', queue =>
		console.log('cancion finalizada')
	)
	.on('disconnect', queue =>
		queue.textChannel?.send('Me desconecte banda, pasen exelente dia ^w^'),
	)
	.on('empty', queue =>
		queue.textChannel?.send(
			'Se acabo como con tu ex....',
		),
	)
	// DisTubeOptions.searchSongs > 1
	.on('searchResult', (message, result) => {
		let i = 0;
		message.channel.send(
			`**Escoje una de la lista porfi**\n${result
				.map(
					song =>
						`**${++i}**. ${song.name} - \`${song.formattedDuration
						}\``,
				)
				.join(
					'\n',
				)}\n*Si no seleccionas nada en 30 segundo cancelo todo alv*`,
		);
	})
	.on('searchCancel', message =>
		message.channel.send('Ya lo cancele hijo de tu... mami c:'),
	)
	.on('searchInvalidAnswer', message =>
		message.channel.send('Pero responde bien imbe... usuario :D'),
	)
	.on('searchNoResult', message =>
		console.log('no encontre nada')
	)
	.on('searchDone', () => { });



client.login(config.token);