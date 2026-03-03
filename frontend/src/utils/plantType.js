// src/utils/plantType.js
export const getPlantTypeFromFilename = (filename) => {
  const name = filename.toLowerCase();

  if (name.includes('arugula') || name.includes('руккола') || name.includes('rucola') || name.includes('rocket')) {
    return 'Руккола';
  }

  if (name.includes('wheat') || name.includes('пшеница') || name.includes('пшено')) {
    return 'Пшеница';
  }

  // Можно добавить больше:
  // if (name.includes('lettuce')) return 'Салат';
  // if (name.includes('basil')) return 'Базилик';

  return 'Не определено';
};