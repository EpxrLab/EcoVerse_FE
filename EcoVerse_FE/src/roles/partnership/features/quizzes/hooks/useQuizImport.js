import { useState } from 'react';
import { quizzesService } from '../services/quizzes.service';
import { toast } from 'sonner';

export function useQuizImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleImport = async (file, onSuccess) => {
    setIsImporting(true);
    setImportProgress({ step: 'uploading', done: 0, total: 100 });
    
    try {
      const response = await quizzesService.importQuizzes(file, (progress) => {
        setImportProgress(progress);
      });
      
      toast.success('Import quiz thành công!');
      setIsImportDialogOpen(false);
      if (onSuccess) onSuccess();
      return response.data;
    } catch (error) {
      console.error('Import quiz failed:', error);
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra khi import quiz';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  return {
    isImporting,
    importProgress,
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleImport,
  };
}
