# Telegram WebApp Backend — Crypto Cat Runner (minimal)

## Quick start
```bash
npm i
cp .env.example .env   # вставь свой BOT_TOKEN
npm run dev            # http://localhost:3000
```

Открой `http://localhost:3000` — игра загрузится. Если открыть через Telegram WebApp кнопку, фронт пришлёт `initData` на `/api/validate`.

## Что тут есть
- `public/index.html` — игра + интеграция с Telegram WebApp SDK (initData, expand, кнопка «сохранить рекорд»).
- `POST /api/validate` — проверка `initData` по HMAC (по докам Telegram).
- `POST /api/score` и `GET /api/score/:user_id` — заглушки для рекордов (in‑memory Map).

## Подключение к боту (Telegraf)
```js
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('Жми, чтобы открыть игру', {
  reply_markup: {
    keyboard: [[{ text: 'Запустить игру 🎮', web_app: { url: 'https://<your-host>/' } }]],
    resize_keyboard: true
  }
}));
bot.launch();
```

## Деплой
- **Render**: Web Service → Node → `npm i` / `npm start`
- **Railway/Fly/Heroku/VPS**: стандартный Node + `PORT` из окружения
- **Nginx**: проксируй к Node на `localhost:3000`

## Примечание
Хранилище очков — временная Map. Для продакшена подключи БД (Redis/Postgres) и делай проверку `initData` на каждом запросе.
