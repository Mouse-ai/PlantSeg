// src/components/Results.jsx
const Results = ({ predictions, imageBase64 }) => {  // ← добавили проп imageBase64
  if (!predictions || predictions.length === 0) {
    return <p className="no-results">Ничего не обнаружено.</p>;
  }

  // Группировка по классам (остаётся как было)
  const groups = {
    leaf: { confSum: 0, count: 0, area: 0, length: null },
    stem: { confSum: 0, count: 0, area: 0, length: 0 },
    root: { confSum: 0, count: 0, area: 0, length: 0 }
  };

  predictions.forEach(p => {
    const cls = p.class;
    if (cls in groups) {
      groups[cls].confSum += p.confidence;
      groups[cls].count += 1;
      groups[cls].area += p.area_cm2 || 0;
      if (p.length_cm !== null && cls !== 'leaf') {
        groups[cls].length += p.length_cm;
      }
    }
  });

  const avgConf = group => group.count ? (group.confSum / group.count * 100).toFixed(1) + '%' : '—';
  const formatArea = area => area ? area.toFixed(2) + ' см²' : '—';
  const formatLength = len => len ? len.toFixed(2) + ' см' : '—';

  return (
    <div className="results-container">
      {/* НОВАЯ ЧАСТЬ: картинка с разметкой */}
      {imageBase64 && (
        <div className="processed-image-wrapper" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h3>Обработанное изображение</h3>
          <img
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt="Processed with YOLO masks"
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0'
            }}
          />
        </div>
      )}

      {/* Таблица результатов (как было) */}
      <table className="results-table">
        <thead>
          <tr>
            <th>Класс</th>
            <th>Средняя уверенность</th>
            <th>Площадь</th>
            <th>Длина</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="class-badge class-leaf">🍃 Лист</span></td>
            <td>{avgConf(groups.leaf)}</td>
            <td>{formatArea(groups.leaf.area)}</td>
            <td>—</td>
          </tr>
          <tr>
            <td><span className="class-badge class-stem">🌱 Стебель</span></td>
            <td>{avgConf(groups.stem)}</td>
            <td>{formatArea(groups.stem.area)}</td>
            <td>{formatLength(groups.stem.length)}</td>
          </tr>
          <tr>
            <td><span className="class-badge class-root">🪴 Корень</span></td>
            <td>{avgConf(groups.root)}</td>
            <td>{formatArea(groups.root.area)}</td>
            <td>{formatLength(groups.root.length)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Results;