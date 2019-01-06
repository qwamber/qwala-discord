let discordJS = require('discord.js');
let urlRegExp = require('url-regex')({ strict: false });
let qwala = require('qwala');
let config = require('./config.json');

let client = new discordJS.Client();

let introText = (
    'Hi there! I am Qwala Bot, and I can help you shorten links.\n\nTo shorten '
        + 'a URL with Qwala Bot, simply use the `qwala!` command. I can detect all '
        + 'all of the links in your message and turn them into Qwala links!\n\n'
        + 'For example, `qwala! example.com` would make me shorten the URL `example.com`.\n\n'
        + 'Go ahead, give it a try!'
);

client.on('ready', () => {
    console.log('Bot is running!');
});

client.on('message', async (message) => {
    let content = message.content;

    if (message.isMentioned(client.user) || content === config.command) {
        message.reply(introText);
        return;
    }

    if (content.startsWith(config.command)) {
        let urls = content.match(urlRegExp);

        if (!urls || urls.length === 0) {
            message.reply('Sorry, no URLs were found in your message!');
            return;
        }

        let currentResponse = '';

        let shortLinkIDs = await Promise.all(urls.map(async (url) => {
            let shortLinkID;

            try {
                shortLinkID = await qwala.shorten(url);
            } catch (error) {
                return url + ' → Error: ' + error;
            };

            return url + ' → ' + config.urlPrefix + shortLinkID;
        }));

        message.reply(shortLinkIDs.join('\n'));
    }
});

client.login(config.token);
