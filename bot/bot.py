# bot/bot.py
import asyncio
from aiogram import Bot, Dispatcher
from bot.handlers import router
from app.config import TELEGRAM_BOT_TOKEN

async def main():
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("❌ ОШИБКА: TELEGRAM_BOT_TOKEN не найден!")
        print("   Добавь его в файл .env в корне проекта")
        return

    bot = Bot(token=TELEGRAM_BOT_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)

    # Удаляем старый вебхук (если был)
    await bot.delete_webhook(drop_pending_updates=True)

    print("✅ Бот PlantSeg успешно запущен!")
    print("Ожидаю фото от пользователей...\n")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())