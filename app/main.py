# app/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import numpy as np
import cv2
import base64
from . import model, utils
from app.config import PIXELS_PER_CM, MODEL_PATH, CLASS_MAPPING

app = FastAPI(title="PlantSeg API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


print("Запуск сервера — загружаю модель...")
model.load_model()
if model.is_model_loaded():
    print("Модель успешно загружена при старте!")
else:
    print("ВНИМАНИЕ: модель НЕ загружена при старте!")

@app.post("/predict")
async def predict_image(file: UploadFile = File(...), scale: float = None):
    if not model.is_model_loaded():
        raise HTTPException(status_code=503, detail="Модель не загружена.")

    file_ext = os.path.splitext(file.filename)[1].lower()
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"[DEBUG] Получено фото: {file.filename}")

        
        results = model.predict(file_path)

        print(f"[DEBUG] Найдено боксов: {len(results.boxes)}")

        if results.masks is None:
            print("[DEBUG] Масок нет")
            return JSONResponse(content={"predictions": [], "image_base64": None})

        boxes = results.boxes
        masks = results.masks.data
        names = results.names

        pixels_per_cm = scale if scale is not None else PIXELS_PER_CM
        predictions = []

        for i, (box, mask_data) in enumerate(zip(boxes, masks)):
            cls_id = int(box.cls)
            class_name = names.get(cls_id, f"class_{cls_id}").lower()
            class_name = CLASS_MAPPING.get(class_name, class_name)

            confidence = float(box.conf)
            print(f"[DEBUG] Детекция #{i}: {class_name} | conf={confidence:.3f}")

            mask = mask_data.cpu().numpy() > 0.5
            measurements = utils.measure_mask(mask, pixels_per_cm)
            polygon = utils.mask_to_polygon(mask)

            predictions.append({
                "class": class_name,
                "confidence": round(confidence, 3),
                "polygon": polygon,
                "area_cm2": measurements["area_cm2"],
                "length_cm": measurements["length_cm"] if class_name in ["root", "stem"] else None
            })

        visualized = results.plot()

        _, buffer = cv2.imencode('.jpg', visualized, [cv2.IMWRITE_JPEG_QUALITY, 92])
        image_base64 = base64.b64encode(buffer).decode('utf-8')

        print(f"[DEBUG] Отправляем {len(predictions)} предсказаний")

        return JSONResponse(content={
            "predictions": predictions,
            "image_base64": image_base64
        })

    except Exception as e:
        print(f"[ERROR] Ошибка в /predict: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка обработки: {str(e)}")
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass

@app.get("/")
async def root():
    return {"message": "Plant Segmentation API is running."}