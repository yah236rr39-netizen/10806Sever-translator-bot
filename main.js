const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');
const { translate } = require('google-translate-api-x');

// 維持 Hugging Face 運作
http.createServer((req, res) => {
  res.write('SUn 9-Channel Translator is Online!');
  res.end();
}).listen(process.env.PORT || 7860);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // 你有用到這個，一定要看下面的提醒！
  ],
  rest: { timeout: 60000 } // 👈 兄弟，加上這行救命草！
});

// 1. 這裡改成精確的 9 個頻道 ID (把簡繁合併成一個 zh 頻道)
const channels = {
  zh: '1500878218318708818', // 這裡放你預計給華語用戶使用的頻道
  en: '1500878218318708819',
  fr: '1500878564096999615',
  de: '1500879372369006706',
  ja: '1500878619873120358',
  vi: '1500878750194077717',
  ko: '1500878686038134895',
  es: '1500880083798462564',
  pt: '1500880147073728692'
};

// 2. 翻譯目標語言設定
const langConfig = {
  zh: { lang: 'zh-TW', emoji: '🇹🇼' }, // 預設翻成繁體，Google 能自動識別輸入的是簡是繁
  en: { lang: 'en',    emoji: '🇺🇸' },
  fr: { lang: 'fr',    emoji: '🇫🇷' },
  de: { lang: 'de',    emoji: '🇩🇪' },
  ja: { lang: 'ja',    emoji: '🇯🇵' },
  vi: { lang: 'vi',    emoji: '🇻🇳' },
  ko: { lang: 'ko',    emoji: '🇰🇷' },
  es: { lang: 'es',    emoji: '🇪🇸' },
  pt: { lang: 'pt',    emoji: '🇵🇹' }
};

async function translateText(text, target) {
  try {
    const res = await translate(text, { 
      to: target, 
      autoCorrect: true,
      fetchOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    });
    return res.text;
  } catch (e) {
    console.error(`❌ [${target}] 失敗:`, e.message);
    return null;
  }
}

client.on('ready', () => {
  console.log(`✅ 兄弟！SUn 9通道翻譯官 [${client.user.tag}] 上線！`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.content) return;

  // 偵測發言頻道
  const sourceKey = Object.keys(channels).find(key => channels[key] === msg.channel.id);
  if (!sourceKey) return;

  // 過濾掉發言頻道，剩下的就是目標
  const targets = Object.keys(channels).filter(key => key !== sourceKey);
  const senderName = msg.member ? msg.member.displayName : msg.author.username;

  // 同時發起 8 個翻譯請求
  await Promise.all(targets.map(async (langKey) => {
    const translation = await translateText(msg.content, langConfig[langKey].lang);
    if (translation) {
      const targetChannel = client.channels.cache.get(channels[langKey]);
      if (targetChannel) {
        try {
          await targetChannel.send(`${langConfig[sourceKey].emoji} **${senderName}**: ${translation}`);
        } catch (err) {
          console.error('發送失敗:', err.message);
        }
      }
    }
  }));
});

client.login(process.env.DISCORD_TOKEN);
