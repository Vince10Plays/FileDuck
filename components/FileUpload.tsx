import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X } from 'lucide-react';
import { FileAttachment } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<FileAttachment[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFiles(Array.from(event.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const processedFiles: FileAttachment[] = [];

    for (const file of files) {
      // Basic support for images and text
      if (file.type.startsWith('image/') || file.type === 'text/plain' || file.type === 'application/pdf') {
        const reader = new FileReader();
        
        const filePromise = new Promise<FileAttachment>((resolve) => {
          reader.onload = (e) => {
            resolve({
              name: file.name,
              type: file.type,
              data: e.target?.result as string
            });
          };
        });

        reader.readAsDataURL(file);
        processedFiles.push(await filePromise);
      } else {
        alert(`Quack! Sorry, I can't read ${file.name} yet. Images and text only! 🦆`);
      }
    }

    setPreviewFiles(prev => [...prev, ...processedFiles]);
    onFilesSelected(processedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    const updated = [...previewFiles];
    updated.splice(index, 1);
    setPreviewFiles(updated);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group
          ${isDragging 
            ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' 
            : 'border-slate-700 hover:border-amber-500/50 hover:bg-slate-800'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,text/plain"
        />
        
        <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400 group-hover:text-amber-500 group-hover:bg-slate-700'} transition-colors`}>
                <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-300">
                    <span className="text-amber-500">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                    Images or Text files (max 5MB)
                </p>
            </div>
        </div>
      </div>

      {/* Previews */}
      {previewFiles.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {previewFiles.map((file, idx) => (
            <div key={idx} className="relative group flex items-center gap-2 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-sm hover:border-slate-600 transition-colors">
              <div className="p-2 bg-slate-900 rounded-md">
                {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                ) : (
                    <FileText className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">{file.type.split('/')[1]}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;