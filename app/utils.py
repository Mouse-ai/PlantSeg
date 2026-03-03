import cv2
import numpy as np
from skimage.morphology import skeletonize

def mask_to_polygon(mask):
    """Преобразует бинарную маску в список точек (x, y) для JSON."""
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return []
    # Берём самый большой контур (обычно один)
    contour = max(contours, key=cv2.contourArea)
    # Упрощаем контур (можно оставить как есть)
    epsilon = 0.001 * cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, epsilon, True)
    return approx.squeeze().tolist()

def measure_mask(mask, pixels_per_cm):
    """Вычисляет площадь и длину (для стебля/корня) маски."""
    area_px = np.sum(mask > 0)
    area_cm2 = area_px / (pixels_per_cm ** 2)

    # Длина через скелетизацию (для стебля и корня)
    skeleton = skeletonize(mask).astype(np.uint8)
    length_px = np.sum(skeleton)
    length_cm = length_px / pixels_per_cm

    return {
        "area_px": int(area_px),
        "area_cm2": round(area_cm2, 2),
        "length_px": int(length_px),
        "length_cm": round(length_cm, 2)
    }