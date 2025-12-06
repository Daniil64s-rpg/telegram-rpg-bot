const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// ===== НАСТРОЙКИ =====
const BOT_TOKEN = process.env.8278271054:AAHTphiseS6mMHm_vpVDJ2nrrziye4eDzbg;
const GAME_URL = process.env.GAME_URL || 'https://my-telegram-game-hcvwbobrf-daniils-projects-0a0875d5.vercel.app';

// Проверка токена
if (!BOT_TOKEN) {
    console.error('❌ ОШИБКА: BOT_TOKEN не найден!');
    console.log('📝 Добавьте в Railway переменную BOT_TOKEN');
    process.exit(1);
}

console.log('🚀 Инициализация Telegram бота...');
console.log('🎮 Ссылка на игру:', GAME_URL);

// ===== СОЗДАНИЕ БОТА =====
const bot = new TelegramBot(BOT_TOKEN, {
    polling: {
        interval: 300,          // Интервал опроса (мс)
        autoStart: true,
        params: {
            timeout: 10,        // Таймаут запроса
            allowed_updates: ['message', 'callback_query']
        }
    }
});

// ===== ОБРАБОТЧИКИ СООБЩЕНИЙ =====

// 1. Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Игрок';
    
    console.log(`👋 Приветствие для ${userName} (${chatId})`);
    
    const welcomeText = `🎮 *RPG Adventure*\n\n` +
        `Привет, ${userName}! Добро пожаловать в мир приключений!\n\n` +
        `*Нажмите кнопку ниже, чтобы начать игру:*`;
    
    bot.sendMessage(chatId, welcomeText, {
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
    });
});

// 2. Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpText = `📖 *Помощь по RPG Adventure*\n\n` +
        `*Как играть:*\n` +
        `1. Нажмите кнопку "🎮 ОТКРЫТЬ RPG ИГРУ"\n` +
        `2. Игра откроется прямо в Telegram\n` +
        `3. Выбирайте действия:\n` +
        `   ⚔️ *Атаковать* - сражение с монстрами\n` +
        `   ❤️ *Лечиться* - восстановление здоровья\n` +
        `   🗺️ *Исследовать* - поиск сокровищ\n` +
        `   💾 *Сохранить* - сохранение прогресса\n\n` +
        `*Советы:*\n` +
        `• Сохраняйтесь перед выходом\n` +
        `• Лечитесь при низком здоровье\n` +
        `• Приглашайте друзей!\n\n` +
        `*Удачной игры!* 🎯`;
    
    bot.sendMessage(chatId, helpText, {
        parse_mode: 'Markdown'
    });
});

// 3. Обработка ЛЮБОГО сообщения
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userName = msg.from.first_name || 'Игрок';
    
    // Пропускаем команды
    if (text && text.startsWith('/')) {
        return;
    }
    
    // Если нажали кнопку игры
    if (text === '🎮 ОТКРЫТЬ RPG ИГРУ') {
        console.log(`🎮 ${userName} открывает игру`);
        return;
    }
    
    // Для ЛЮБОГО другого сообщения - показываем кнопку
    if (text) {
        console.log(`📩 Сообщение от ${userName}: "${text}"`);
        
        const responses = [
            `Готовы к приключениям, ${userName}? 🎮`,
            `Монстры ждут своего героя! ⚔️`,
            `Время собирать сокровища! 💰`,
            `Новые земли ждут исследования! 🗺️`
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

// ===== ОБРАБОТКА ОШИБОК =====
bot.on('polling_error', (error) => {
    console.error('❌ Ошибка polling:', error.message);
    
    // Автоперезапуск при конфликте
    if (error.message.includes('409 Conflict')) {
        console.log('⚠️ Обнаружен конфликт. Перезапуск через 10 секунд...');
        setTimeout(() => {
            console.log('🔄 Перезапуск бота...');
            process.exit(1); // Railway автоматически перезапустит
        }, 10000);
    }
});

// ===== HEALTH CHECK =====
// Railway требует health check эндпоинт
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'telegram-rpg-bot',
            timestamp: new Date().toISOString(),
            game_url: GAME_URL
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Health check доступен на порту ${PORT}`);
    console.log(`🌐 Откройте: http://localhost:${PORT}/health`);
    console.log('🤖 Бот запущен и готов к работе!');
    console.log('📱 Тестируйте в Telegram: /start');
});