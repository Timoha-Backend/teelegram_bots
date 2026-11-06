const { Telegraf, Markup } = require('telegraf');

// 1. ПОДКЛЮЧЕНИЕ И ЛОКАЛЬНАЯ БАЗА ДАННЫХ
const bot = new Telegraf(''); 

// Вставь сюда свой ID из @userinfobot
const ADMIN_ID = ; 

// Твой личный юзернейм в Телеграме без собачки , чтобы бот дал ссылку на тебя
const ADMIN_USERNAME = ''; 

// Коробка для хранения данных участников (теперь храним объекты: и ID, и username)
let participants = []; 

// 2. ВХОДНАЯ ТОЧКА ЮЗЕРА (КОМАНДА /START)
bot.start((ctx) => {
    return ctx.reply(
        `Привет, ${ctx.from.first_name}! Чтобы участвовать в розыгрыше 100 рублей, ты должен быть подписан на наш ТГ-канал!`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🎉 Участвовать в розыгрыше', 'check_sub')]
        ])
    );
});

// 3. АСИНХРОННЫЙ ОБРАБОТЧИК КЛИКА ПО КНОПКЕ "УЧАСТВОВАТЬ"
bot.action('check_sub', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username ? `@${ctx.from.username}` : 'Нет юзернейма';

    try {
        // Проверка на дубликат (ищем ID внутри наших объектов)
        const isExist = participants.some(p => p.id === userId);
        if (isExist) {
            return ctx.reply('❌ Ошибка: Ты уже участвуешь в розыгрыше!');
        }

        // ЗАМЕНИ НА ИМЯ СВОЕГО ТЕСТОВОГО КАНАЛА С СОБАЧКОЙ (например, '@timoha_test')
        const member = await ctx.telegram.getChatMember('@Жески проверка крутого бота розыгрыш е', userId);
        
        if (member.status !== 'left' && member.status !== 'kicked') {
            
            // Записываем в массив сразу и ID, и тег @username человека
            participants.push({ id: userId, username: username });
            const ticketNumber = participants.length; 

            return ctx.reply(`✅ Проверка пройдена!\n🎫 Номер твоего лотерейного билета: №${ticketNumber} 🎉`);
        } else {
            return ctx.reply('❌ Ошибка: Ты не подписан на канал! Подпишись и попробуй снова.');
        }

    } catch (error) {
        console.error('[БЭКЕНД-ОШИБКА]', error);
        return ctx.reply('Ошибка сервера. Убедись, что бот добавлен в админы канала!');
    }
});

// 4. СКРЫТАЯ АДМИН-КОМАНДА ДЛЯ ОПРЕДЕЛЕНИЯ ПОБЕДИТЕЛЯ
bot.command('winner', async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
        return ctx.reply('❌ Ошибка: У вас нет доступа к этой команде.');
    }

    if (participants.length === 0) {
        return ctx.reply('❌ В розыгрыше пока никто не участвует. Массив пуст.');
    }

    // Рандом
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];
    const ticketNum = randomIndex + 1;

    try {
        // 1. Бот сам асинхронно стучится в ЛС к победителю и радует его
        await ctx.telegram.sendMessage(
            winner.id, 
            `🎉 ПОЗДРАВЛЯЕМ! Ты выиграл в розыгрыше сотки!\n🎫 Твой выигрышный билет: №${ticketNum}\n\n👉 Напиши админу в ЛС, чтобы забрать кэш: https://t.me{ADMIN_USERNAME}`
        );
    } catch (err) {
        console.log('[УВЕДОМЛЕНИЕ] Не удалось написать юзеру в ЛС, так как он заблокировал бота.');
    }

    // 2. Бот выдаёт админу кликабельный отчёт
    return ctx.reply(
        `🎉 ПОБЕДИТЕЛЬ ОПРЕДЕЛЕН!\n\n🎫 Билет: №${ticketNum}\n👤 Ссылка на победителя: ${winner.username}\n🆔 Telegram ID: \`${winner.id}\`\n\nЯ уже отправил ему уведомление в ЛС! Кликай по имени выше и скидывай сотку! 💸`
    );
});

bot.launch();
console.log('[SERVER] Боевой бот для розыгрыша сотки запущен на Node.js!');

;
