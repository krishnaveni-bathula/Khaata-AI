import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';

export default function StockCheck({ backendUrl = 'http://localhost:5000' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setZones([]);
      setErrorText('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorText('Please select or capture a shelf photo first.');
      return;
    }

    setIsLoading(true);
    setErrorText('');
    setZones([]);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${backendUrl}/api/check-stock`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to analyze stock levels.');
      }

      const data = await response.json();
      setZones(data.zones || []);
    } catch (err) {
      console.error(err);
      setErrorText(err.message || 'Error occurred while checking shelf stock.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStockColorClass = (level) => {
    const l = level.toLowerCase();
    if (l.includes('high') || l.includes('full')) return 'bg-tertiary';
    if (l.includes('medium') || l.includes('mid') || l.includes('half')) return 'bg-secondary';
    return 'bg-red-500';
  };

  const getStockWidthClass = (level) => {
    const l = level.toLowerCase();
    if (l.includes('high') || l.includes('full')) return 'w-full';
    if (l.includes('medium') || l.includes('mid') || l.includes('half')) return 'w-1/2';
    return 'w-1/5';
  };

  const getStockText = (level) => {
    const l = level.toLowerCase();
    if (l.includes('high')) return 'High Stock';
    if (l.includes('medium')) return 'Medium Stock';
    return 'Low Stock (Restock)';
  };

  return (
    <div className="flex-1 flex flex-col p-20px bg-background text-on-background pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-sans">AI Stock Check</h1>
        <p className="text-xs text-on-surface-variant font-sans mt-0.5">
          Scan shop shelves to estimate stock levels automatically
        </p>
      </div>

      <div className="space-y-6 max-w-md mx-auto w-full">
        {/* Upload Container */}
        <div className="bg-surface-container-lowest border-2 border-dashed border-surface-container hover:border-primary/50 transition-all rounded-3xl p-6 relative flex flex-col items-center justify-center text-center group shadow-premium-sm min-h-[220px]">
          {previewUrl ? (
            <div className="w-full relative rounded-2xl overflow-hidden shadow-sm">
              <img
                src={previewUrl}
                alt="Shelf preview"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl('');
                  setZones([]);
                }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full font-bold transition"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full py-8">
              <div className="w-14 h-14 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-base font-sans block mb-1">Upload Shelf Photo</span>
              <span className="text-xs text-on-surface-variant font-sans max-w-[200px]">
                Capture a photo of your inventory shelves to scan
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Button */}
        {previewUrl && (
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="w-full py-4 rounded-3xl font-bold font-sans bg-primary hover:bg-primary-dark text-white shadow-premium-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Shelf Stock...</span>
              </>
            ) : (
              <>
                <BarChart2 className="w-5 h-5" />
                <span>Verify Shelf Stock</span>
              </>
            )}
          </button>
        )}

        {/* Error Details */}
        {errorText && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-3xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <span className="text-sm font-bold text-red-700 block font-sans">Vision Scan Failed</span>
              <span className="text-xs text-red-600 font-sans">{errorText}</span>
            </div>
          </div>
        )}

        {/* Stock Level Results */}
        {zones.length > 0 && (
          <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-5 shadow-premium-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
              <h2 className="font-bold text-lg font-sans">Stock Analysis Report</h2>
            </div>
            
            <div className="space-y-4">
              {zones.map((zone, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-on-background capitalize">{zone.zone_description}</span>
                    <span className="font-semibold text-on-surface-variant text-xs">{getStockText(zone.stock_level)}</span>
                  </div>
                  
                  {/* Colored progress bar */}
                  <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getStockColorClass(zone.stock_level)} ${getStockWidthClass(zone.stock_level)}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
