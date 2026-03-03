// FileUpload.jsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFilesSelect }) => {           // ← переименовали проп
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      // Ограничиваем до 10 файлов
      const limited = acceptedFiles.slice(0, 10);
      onFilesSelect(limited);
    }
  }, [onFilesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 10,                    // ← важно!
    multiple: true                   // ← разрешаем множественный выбор
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#f0f8ff' : 'white',
        transition: 'background 0.2s'
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Отпустите файлы здесь...</p>
      ) : (
        <div>
          <p><strong>Перетащите до 10 изображений</strong> или кликните для выбора</p>
          <small style={{ color: '#64748b' }}>Поддерживаются: jpg, jpeg, png</small>
        </div>
      )}
    </div>
  );
};

export default FileUpload;