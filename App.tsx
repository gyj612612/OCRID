import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Download, RefreshCw, Trash2, Github } from 'lucide-react';
import DropZone from './components/DropZone';
import CardResult from './components/CardResult';
import { extractBusinessCardInfo } from './services/geminiService';
import { BusinessCardItem, ProcessingStatus, ProcessingStats } from './types';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [cards, setCards] = useState<BusinessCardItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derived stats
  const stats: ProcessingStats = {
    total: cards.length,
    completed: cards.filter(c => c.status === ProcessingStatus.COMPLETED).length,
    failed: cards.filter(c => c.status === ProcessingStatus.ERROR).length,
  };

  const pendingCount = stats.total - stats.completed - stats.failed;

  // Function to process a single card
  const processCard = useCallback(async (card: BusinessCardItem) => {
    try {
      const data = await extractBusinessCardInfo(card.file);
      setCards(prev => prev.map(c => 
        c.id === card.id 
          ? { ...c, status: ProcessingStatus.COMPLETED, data } 
          : c
      ));
    } catch (err: any) {
      setCards(prev => prev.map(c => 
        c.id === card.id 
          ? { ...c, status: ProcessingStatus.ERROR, error: err.message || 'Processing failed' } 
          : c
      ));
    }
  }, []);

  // Effect to process queue
  // Uses a simple concurrency queue by effect: Finds first IDLE card and processes it.
  useEffect(() => {
    const nextCard = cards.find(c => c.status === ProcessingStatus.IDLE);
    
    if (nextCard && !isProcessing) {
      setIsProcessing(true);
      // Mark as processing
      setCards(prev => prev.map(c => 
        c.id === nextCard.id ? { ...c, status: ProcessingStatus.PROCESSING } : c
      ));

      processCard(nextCard).finally(() => {
        setIsProcessing(false);
      });
    }
  }, [cards, isProcessing, processCard]);


  const handleFilesDropped = (files: File[]) => {
    const newCards: BusinessCardItem[] = files.map(file => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: ProcessingStatus.IDLE
    }));
    setCards(prev => [...prev, ...newCards]);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      // Revoke URLs to avoid memory leaks
      cards.forEach(c => URL.revokeObjectURL(c.previewUrl));
      setCards([]);
    }
  };

  const handleExportExcel = () => {
    const completedCards = cards.filter(c => c.status === ProcessingStatus.COMPLETED && c.data && c.data.length > 0);
    
    if (completedCards.length === 0) {
      alert("No completed cards to export.");
      return;
    }

    // Flatten logic: One file might produce multiple rows
    const exportData: any[] = [];

    completedCards.forEach(cardItem => {
      if (cardItem.data) {
        cardItem.data.forEach((contact, index) => {
           exportData.push({
            "Full Name": contact.fullName,
            "Job Title": contact.jobTitle,
            "Company": contact.companyName,
            "Phone": contact.phoneNumber,
            "Email": contact.email,
            "Website": contact.website,
            "Address": contact.address,
            "Source File": cardItem.file.name,
            "Card Index": cardItem.data!.length > 1 ? index + 1 : 1 
           });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Business Cards");
    
    // Auto-width columns
    const maxWidth = 30;
    const wscols = Object.keys(exportData[0]).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, "BusinessCards_Export.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              B
            </div>
            <h1 className="text-xl font-bold text-slate-800">BizCard AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex text-sm text-slate-500 gap-4 mr-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Total: {stats.total}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ready: {stats.completed}</span>
             </div>

            <button 
              onClick={handleExportExcel}
              disabled={stats.completed === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro / Upload Area */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Batch Processor</h2>
              <p className="text-slate-500 mt-1">
                Upload business card images (multiple cards per image supported).
              </p>
            </div>
            {cards.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            )}
          </div>
          
          <DropZone onFilesDropped={handleFilesDropped} isProcessing={false} />
        </section>

        {/* Results Grid */}
        <section>
          {cards.length === 0 ? (
            <div className="text-center py-20 opacity-50">
               <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                 <RefreshCw className="w-8 h-8 text-slate-400" />
               </div>
               <p className="text-lg text-slate-400 font-medium">No cards uploaded yet.</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {cards.map(card => (
                 <div key={card.id} className="h-full">
                   <CardResult item={card} />
                 </div>
               ))}
             </div>
          )}
        </section>

      </main>
      
      {/* Processing Indicator (Sticky if active) */}
      {pendingCount > 0 && (
          <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <div>
                <p className="font-medium">Processing...</p>
                <p className="text-xs text-slate-400">{pendingCount} remaining</p>
            </div>
          </div>
      )}

    </div>
  );
};

export default App;