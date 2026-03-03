
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).parent.absolute()


MODEL_PATH = BASE_DIR / "best.pt"


CONFIDENCE_THRESHOLD = 0.3  

PIXELS_PER_CM = 93.8


CLASS_MAPPING = {
    "корень": "root",
    "стебель": "stem",
    "листья": "leaf",
    "лист": "leaf",
    "root": "root",
    "stem": "stem",
    "leaf": "leaf",
    
}

# Временная папка для фото от бота
TEMP_DIR = BASE_DIR / "temp"
TEMP_DIR.mkdir(exist_ok=True)


API_URL = os.getenv("API_URL", "http://localhost:8000/predict")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TELEGRAM_BOT_TOKEN:
    print("❌ TELEGRAM_BOT_TOKEN не найден в .env!")