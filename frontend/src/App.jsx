// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import Results from './components/Results';
import ExportButton from './components/ExportButton';
import { FiUpload, FiInfo } from 'react-icons/fi';
import { getPlantTypeFromFilename } from './utils/plantType';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/predict`
  : 'http://localhost:8000/predict';

const MAX_IMAGE_SIZE = 1024; // максимальный размер стороны в пикселях

// Функция сжатия изображения
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Пропорциональное уменьшение
      if (width > height) {
        if (width > MAX_IMAGE_SIZE) {
          height = Math.round(height * (MAX_IMAGE_SIZE / width));
          width = MAX_IMAGE_SIZE;
        }
      } else {
        if (height > MAX_IMAGE_SIZE) {
          width = Math.round(width * (MAX_IMAGE_SIZE / height));
          height = MAX_IMAGE_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg',
        0.85 // качество 85%
      );
    };

    img.onerror = reject;
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [predictionsList, setPredictionsList] = useState([]);
  const [processedImages, setProcessedImages] = useState([]); // только обработанные
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    }
  }, [selectedFiles]);

  const analyzeImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setPredictionsList([]);
    setProcessedImages([]);

    const newPredictions = [];
    const newProcessedImages = [];

    for (const file of selectedFiles) {
      try {
        // Сжимаем перед отправкой
        const compressedFile = await compressImage(file);

        const formData = new FormData();
        formData.append('file', compressedFile);

        const response = await axios.post(API_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const data = response.data;

        newPredictions.push({
          fileName: file.name,
          predictions: data.predictions || [],
          error: null,
        });

        if (data.image_base64) {
          newProcessedImages.push({
            fileName: file.name,
            base64: data.image_base64,
          });
        }
      } catch (err) {
        console.error('Ошибка анализа:', err);
        newPredictions.push({
          fileName: file.name,
          predictions: [],
          error: err.response?.data?.detail || 'Ошибка сервера',
        });
      }
    }

    setPredictionsList(newPredictions);
    setProcessedImages(newProcessedImages);
    setIsAnalyzing(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>PlantSeg 🌱</h1>
        <p>Нейросетевая сегментация растений</p>
      </header>

      <main>
        <FileUpload onFilesSelect={setSelectedFiles} />

        {previewUrls.length > 0 && (
          <div className="preview-container">
            <h3>Выбранные изображения ({previewUrls.length})</h3>
            <div className="preview-grid">
              {previewUrls.map((url, index) => (
                <div key={index} className="preview-item">
                  <img src={url} alt={`preview ${index}`} />
                  <p>{selectedFiles[index].name}</p>
                </div>
              ))}
            </div>

            <button
              onClick={analyzeImages}
              disabled={isAnalyzing}
              className="analyze-button"
            >
              {isAnalyzing ? 'Анализирую...' : 'Анализировать все изображения'}
            </button>
          </div>
        )}

        {isAnalyzing && <Loader />}

        {predictionsList.length > 0 && (
          <div className="results-section">
            {predictionsList.map((item, index) => (
              <div key={index} className="result-item">
                <h4>{item.fileName}</h4>

                {/* Только обработанная картинка */}
                {processedImages[index]?.base64 && (
                  <div className="processed-image-wrapper">
                    <h5>Изображение с разметкой</h5>
                    <img
                      src={`data:image/jpeg;base64,${processedImages[index].base64}`}
                      alt={`Processed ${item.fileName}`}
                      className="processed-image"
                    />
                  </div>
                )}

                {item.error ? (
                  <div className="error-message">{item.error}</div>
                ) : item.predictions.length > 0 ? (
                  <Results predictions={item.predictions} />
                ) : (
                  <p className="no-results">На этом изображении ничего не обнаружено.</p>
                )}
              </div>
            ))}

            <ExportButton predictionsList={predictionsList} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 PlantSeg — нейросетевая сегментация растений</p>
      </footer>
    </div>
  );
}

export default App;