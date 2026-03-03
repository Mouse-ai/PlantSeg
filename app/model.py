# app/model.py
from ultralytics import YOLO
from app.config import MODEL_PATH, CONFIDENCE_THRESHOLD
import traceback

_model = None

def load_model():
    global _model
    if _model is not None:
        return _model

    print(f"[MODEL] Пытаюсь загрузить: {MODEL_PATH}")
    print(f"[MODEL] Файл существует? {MODEL_PATH.exists()}")

    if not MODEL_PATH.exists():
        print(f"[MODEL] ФАЙЛ НЕ НАЙДЕН: {MODEL_PATH}")
        return None

    try:
        _model = YOLO(str(MODEL_PATH))
        print("[MODEL] Модель успешно загружена!")
        print("[MODEL] Классы:", _model.names)
        return _model
    except Exception as e:
        print("[MODEL] ОШИБКА ЗАГРУЗКИ МОДЕЛИ:")
        print(traceback.format_exc())
        return None

def is_model_loaded():
    return _model is not None

def predict(image_path: str):
    model = load_model()
    if model is None:
        raise RuntimeError("Модель не загружена. Проверьте логи запуска сервера.")
    
    
    results = model.predict(
        source=image_path,
        conf=CONFIDENCE_THRESHOLD,
        verbose=False  
    )
    
    return results[0]  