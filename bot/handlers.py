# bot/handlers.py
import base64
from aiogram import Router, F
from aiogram.types import Message, BufferedInputFile
from app.config import API_URL
import httpx
from pathlib import Path

router = Router()

@router.message(F.command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "Привет! Я бот PlantSeg 🌱\n\n"
        "Пришли фото растения — я проанализирую:\n"
        "• листья (leaf)\n"
        "• стебель (stem)\n"
        "• корень (root)\n\n"
        "Масштаб по умолчанию — 93.8 px/cm\n"
        "Результаты придут с разметкой и цифрами!"
    )

@router.message(F.text)
async def handle_text(message: Message):
    await message.answer("Я понимаю только фото растений. Пришли картинку 🌿")

@router.message(F.photo)
async def handle_photo(message: Message):
    await message.answer("⏳ Анализирую фото и рисую разметку...")

    # Берём фото максимального качества
    photo = message.photo[-1]
    file_info = await message.bot.get_file(photo.file_id)

    # Временный файл
    temp_file = Path(f"temp_{message.from_user.id}_{photo.file_unique_id}.jpg")

    try:
        # Скачиваем фото
        await message.bot.download_file(file_info.file_path, temp_file)

        # Отправляем на backend
        async with httpx.AsyncClient() as client:
            with open(temp_file, "rb") as f:
                files = {"file": (temp_file.name, f, "image/jpeg")}
                response = await client.post(API_URL, files=files, timeout=120.0)

        if response.status_code == 200:
            data = response.json()
            predictions = data.get("predictions", [])
            image_base64 = data.get("image_base64")

            # Формируем красивый текст
            text = "🌿 Результаты анализа:\n\n"
            if predictions:
                for p in predictions:
                    cls = p["class"].capitalize()  # leaf → Leaf, stem → Stem, root → Root
                    conf = f"{p['confidence']*100:.1f}%"
                    area = f"{p['area_cm2']:.2f} см²"
                    length = f"{p.get('length_cm', '—'):.2f} см" if p.get("length_cm") is not None else "—"
                    text += f"• {cls}: {conf}, площадь {area}, длина {length}\n"
            else:
                text += "Ничего не обнаружено на фото.\n"

            text += "\n🔍 Подробный анализ и экспорт в Excel — на сайте"

            # Отправляем картинку с разметкой + текст
            if image_base64:
                photo_bytes = base64.b64decode(image_base64)
                input_file = BufferedInputFile(photo_bytes, filename="result.jpg")

                await message.answer_photo(
                    photo=input_file,
                    caption=text,
                    parse_mode=None  # если не нужен Markdown — можно убрать
                )
            else:
                await message.answer(text)

        else:
            await message.answer(f"❌ Ошибка сервера: {response.status_code}\n{response.text[:200]}")

    except Exception as e:
        await message.answer(f"❌ Произошла ошибка:\n{str(e)}")

    finally:
        # Надёжное удаление временного файла
        if temp_file.exists():
            try:
                temp_file.unlink()
            except Exception:
                pass  # если не удалилось — не страшно