from ultralytics import YOLO


model = YOLO('yolov8m-seg.pt')




results = model.train(
    data='D:\PycharmProjects\plant_ai\pop.v5-export2.yolov8\data.yaml',  # <--- ВАЖНО: укажите правильный путь к датасету!
    epochs=150,
    patience=30,                                 
    imgsz=640,                                 
    batch=8,                                    
    device='cuda:0',                                
    name='my_plants_model',                     
    workers=0,
    
)

