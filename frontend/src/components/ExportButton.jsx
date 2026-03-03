// src/components/ExportButton.jsx
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExportButton = ({ predictionsList }) => {
  const exportToExcel = () => {
    if (!predictionsList || predictionsList.length === 0) {
      alert('Нет результатов для экспорта');
      return;
    }

    const headers = [
      'Название файла',
      'Точность листьев (%)',
      'Точность стебля (%)',
      'Точность корня (%)',
      'Длина листьев (см)',
      'Длина стебля (см)',
      'Длина корня (см)',
      'Площадь листьев (см²)',
      'Площадь стебля (см²)',
      'Площадь корня (см²)'
    ];

    const rows = [];

    predictionsList.forEach((item) => {
      const fileName = item.fileName;

      // Собираем значения по классам
      const data = {
        leaf: { conf: 0, length: '—', area: 0 },
        stem: { conf: 0, length: '—', area: 0 },
        root: { conf: 0, length: '—', area: 0 }
      };

      item.predictions.forEach((p) => {
        const cls = p.class;
        if (cls in data) {
          data[cls].conf = (p.confidence * 100).toFixed(1);
          data[cls].area = p.area_cm2;
          if (p.length_cm !== null && p.length_cm !== undefined) {
            data[cls].length = p.length_cm;
          }
        }
      });

      rows.push([
        fileName,
        data.leaf.conf,
        data.stem.conf,
        data.root.conf,
        data.leaf.length,
        data.stem.length,
        data.root.length,
        data.leaf.area,
        data.stem.area,
        data.root.area
      ]);
    });

    // Формируем таблицу
    const allData = [headers, ...rows];

    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Настраиваем ширину столбцов
    ws['!cols'] = [
      { wch: 28 },  // Название файла
      { wch: 18 },  // Точность листьев
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },  // Длина листьев
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },  // Площадь листьев
      { wch: 18 },
      { wch: 18 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Сводная таблица');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const today = new Date().toISOString().slice(0, 10);
    saveAs(blob, `PlantSeg_Сводка_${today}.xlsx`);
  };

  // Показываем кнопку только если есть хоть один файл с предсказаниями
  const hasData = predictionsList?.some(item => item.predictions?.length > 0);
  if (!hasData) return null;

  return (
    <button
      onClick={exportToExcel}
      className="analyze-button"           // ← тот же класс, что у кнопки анализа
      style={{
        background: '#2b6e4f',             // ← можно оставить или поменять на тот же цвет, что у analyze-button
        marginTop: '2rem',
        padding: '0.8rem 1.8rem',
        fontSize: '1.05rem'
      }}
    >
      Экспорт(xlsx)
    </button>
  );
};

export default ExportButton;