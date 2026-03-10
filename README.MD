# PlantSeg — сегментация растений (листья, стебель, корень)

Нейросетевое решение для сегментации растений на изображениях с последующим расчётом площади и длины стебля/корня.

**Ключевые возможности:**
- Сегментация трёх классов: лист (leaf), стебель (stem), корень (root)
- Вывод изображения с наложенными масками
- Расчёт площади (см²) и длины (см) для стебля и корня
- Веб-приложение (React + Vite)
- Telegram-бот
- Командная строка для инференса одного изображения
## Структура проекта

- **app/** — FastAPI бэкенд + YOLO инференс
  - main.py
  - model.py
  - utils.py
  - config.py
- **bot/** — Telegram-бот (aiogram)
  - bot.py
  - handlers.py
- **frontend/** — React + Vite веб-приложение
  - src/App.jsx
  - src/components/...
  - package.json
- **test.py** — консольный инференс одного фото
- **README.md** — описание проекта
- **requirements.txt** — зависимости бэкенда
- **.gitignore** — игнорируемые файлы

## Ссылка на проект в Roboflow

https://app.roboflow.com/mouses-workspace/pop-6hyms/browse?queryText=&pageSize=50&startingIndex=0&browseQuery=true

## Установка и запуск

### Требования

- Python 3.10+
- Node.js 18+ (для фронтенда)
- Git

### Быстрый запуск (рекомендуется)

1. Клонируй репозиторий
   ```bash
   git clone https://github.com/Mouse-ai/Plant_Seg.git
   cd Plant_Seg
2. Установи зависимости backend
    ```Bash
    pip install -r requirements.txt
    Пример минимального requirements.txt:
    fastapi
    uvicorn
    ultralytics
    opencv-python
    numpy
    scikit-image
    python-multipart
    python-dotenv
    httpx
    aiogram
3. Установи зависимости фронтенда
    ```Bash
    cd frontend
    npm install
4. Запусти backend
    ```Bash
    cd app
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
5. Запусти фронтенд (в отдельном терминале)
    ```Bash
    cd frontend
    npm run dev
6. Запусти Telegram-бота (в отдельном терминале)
    ```Bash
    cd bot
    python bot.py
______________________________________________________
 Командная строка — инференс одного изображения
    ```Bash
    python test.py path/to/image.jpg
______________________________________________________
## Обучение модели

Модель сегментации растений обучена с помощью YOLOv8 (Ultralytics) на кастомном датасете.

### 1. Скачивание датасета из Roboflow

1. Перейдите по ссылке на проект в Roboflow:  
   https://app.roboflow.com/mouses-workspace/pop-6hyms/browse?queryText=&pageSize=50&startingIndex=0&browseQuery=true

2. Нажмите кнопку **Download Dataset** (в правом верхнем углу).

3. Выберите формат: **YOLOv8**  
   (это самый удобный и совместимый формат)

4. Скачайте архив (обычно называется что-то вроде `pop-6hyms.zip`).

5. Распакуйте архив в любую удобную папку, например:  
   `C:\project\dataset\`

### 2. Установка зависимостей для обучения

Если ещё не установили:

```bash
pip install ultralytics
### 3. Запуск обучения
```Bash
yolo task=segment mode=train model=yolov8n-seg.pt data=dataset/data.yaml epochs=100 imgsz=640 batch=16 device=0
### 4. Где будет результат обучения
После завершения обучения (обычно 1–6 часов в зависимости от железа и количества эпох) результаты появятся в папке:
textruns/segment/trainX/
├── weights/
│   ├── best.pt          ← это ваша лучшая модель — скопируйте её в app/best.pt
│   └── last.pt
├── results.png          ← графики обучения
└── val_batch0_pred.jpg  ← примеры предсказаний на валидации
