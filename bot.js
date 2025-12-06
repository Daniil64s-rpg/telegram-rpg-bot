const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// ===== НАСТРОЙКИ =====
const BOT_TOKEN = process.env.BOT_TOKEN;
const GAME_URL = process.env.GAME_URL;

// Проверка токена
if (!BOT_TOKEN) {
    console.error('❌ ОШИБКА: BOT_TOKEN не найден!');
    console.log('📝 Добавьте переменную BOT_TOKEN в настройках Render');
    process.exit(1);
}

console.log('================================');
console.log('🚀 Telegram RPG Bot запускается...');
console.log('🎮 Игра:', GAME_URL);
console.log('================================');

// ===== СОЗДАНИЕ БОТА =====
const bot = new TelegramBot(BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10,
            allowed_updates: ['message']
        }
    }
});

// ===== ОБРАБОТЧИКИ =====

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Игрок';
    
    console.log(`👋 /start от ${userName}`);
    
    bot.sendMessage(chatId, 
        `🎮 *RPG Adventure*\n\n` +
        `Привет, ${userName}! Готовы к приключениям?\n\n` +
        `*Нажмите кнопку, чтобы начать игру:*`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: '🎮 ОТКРЫТЬ RPG ИГРУ',
                            web_app: { url: GAME_URL }
                        }
                    ]
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            }
        }
    );
});

// Обработка всех сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userName = msg.from.first_name || 'Игрок';
    
    // Пропускаем команды
    if (text && text.startsWith('/')) return;
    
    // Пропускаем нажатие кнопки
    if (text === '🎮 ОТКРЫТЬ RPG ИГРУ') {
        console.log(`🎮 ${userName} открывает игру`);
        return;
    }
    
    // Для любого другого сообщения
    if (text) {
        console.log(`📩 ${userName}: "${text}"`);
        
        const responses = [
            `Готовы к приключениям? 🎮`,
            `Мир RPG ждет героя! ⚔️`,
            `Сокровища не найдут себя сами! 💰`,
            `Новые монстры в лесу! 🐉`
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        bot.sendMessage(chatId, randomResponse, {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: '🎮 ОТКРЫТЬ RPG ИГРУ',
                            web_app: { url: GAME_URL }
                        }
                    ]
                ],
                resize_keyboard: true
            }
        });
    }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('❌ Ошибка polling:', error.message);
});

// ===== HEALTH CHECK ДЛЯ RENDER =====
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'telegram-rpg-bot',
            timestamp: new Date().toISOString(),
            game: 'RPG Adventure',
            platform: 'Render.com'
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log('🤖 Бот запущен и готов к работе!');
    console.log('📱 Тестируйте: /start в Telegram');
});