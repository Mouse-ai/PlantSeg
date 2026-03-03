from ultralytics import YOLO
import cv2


model = YOLO("app/best.pt")  # путь к вашей лучшей модели




results = model("C:/Users/Admin/Downloads/arugula_20260219163214553.jpg")


annotated = results[0].plot()


cv2.imshow("Segmentation Result", annotated)
cv2.waitKey(0)
cv2.destroyAllWindows()


cv2.imwrite("test_result.jpg", annotated)
print("Результат сохранён в test_result.jpg")