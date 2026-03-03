from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt

# 1. Укажите путь к вашей лучшей модели и фотографии для анализа
model_path = r"C:\project\чтозахуйня\app\best.pt"
image_path = r"C:\Users\Алексей\Downloads\arugula_20260219163107365.jpg"


model = YOLO(model_path)





results = model(image_path)[0]  


results.save(filename='result_with_masks.jpg')  
print("Результат сохранён в result_with_masks.jpg")



plotted = results.plot()  
plt.figure(figsize=(12, 8))
plt.imshow(plotted)
plt.axis('off')
plt.title('Сегментация растений')
plt.show()


if results.masks is not None:
    for i, (cls, mask) in enumerate(zip(results.boxes.cls, results.masks.data)):
        class_name = model.names[int(cls)]
        print(f"Объект {i+1}: {class_name}")
else:
    print("Ни одного объекта не найдено.")