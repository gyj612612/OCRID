import React, { useCallback } from 'react';
import { Upload, FileImage } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  isProcessing: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, isProcessing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isProcessing) return;

      // Cast Array.from result to File[] to fix TS error 'Property type does not exist on type unknown'
      const files = (Array.from(e.dataTransfer.files) as File[]).filter((file) =>
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onFilesDropped(files);
      }
    },
    [onFilesDropped, isProcessing]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Cast Array.from result to File[] to fix TS error 'Property type does not exist on type unknown'
      const files = (Array.from(e.target.files) as File[]).filter((file) =>
        file.type.startsWith('image/')
      );
      onFilesDropped(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 
        ${isProcessing 
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
          : 'border-primary/30 hover:border-primary bg-blue-50/30 hover:bg-blue-50 cursor-pointer'
        }`}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isProcessing ? 'bg-slate-100' : 'bg-blue-100 group-hover:scale-110 transition-transform'}`}>
          {isProcessing ? (
             <FileImage className="w-8 h-8 text-slate-400" />
          ) : (
             <Upload className="w-8 h-8 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700">
            {isProcessing ? 'Processing in progress...' : 'Upload Business Cards'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Drag & drop images here, or click to select files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;