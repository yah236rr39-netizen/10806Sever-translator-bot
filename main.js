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
    GatewayIntentBits.GuildMembers,
  ],
  // 👈 強制拉長連線等待時間，專治 ConnectTimeoutError
  rest: { 
    timeout: 60000,
    connectTimeout: 60000 
  } 
});

// 1. 頻道 ID 設定
const channels = {
  zh: '1500878218318708818',
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
  zh: { lang: 'zh-TW', emoji: '🇹🇼' },
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

  const sourceKey = Object.keys(channels).find(key => channels[key] === msg.channel.id);
  if (!sourceKey) return;

  const targets = Object.keys(channels).filter(key => key !== sourceKey);
  const senderName = msg.member ? msg.member.displayName : msg.author.username;

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

// 3. 死纏爛打登入邏輯 (放在最下面)
async function loginWithRetry() {
  try {
    console.log('🚀 正在嘗試連線至 Discord...');
    await client.login(process.env.DISCORD_TOKEN);
  } catch (err) {
    console.error('❌ 連線失敗，原因：', err.message);
    console.log('🔄 5 秒後自動發起重新連線...');
    setTimeout(loginWithRetry, 5000);
  }
}

loginWithRetry();
