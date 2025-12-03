import React, { useState } from 'react';
import { AdConfig, DeviceFrame } from '../types';
import { ExternalLink, ShoppingBag, QrCode, Maximize2, X } from 'lucide-react';

interface AdPreviewProps {
  config: AdConfig;
  className?: string;
  showOriginal?: boolean;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ config, className, showOriginal = false }) => {
  const { generatedImage, videoUrl, productImage, device, headline, ctaText, ctaLink, outputType } = config;
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const isVideo = outputType === 'video' && videoUrl && !showOriginal;
  
  const displayImage = showOriginal && productImage 
    ? productImage 
    : (generatedImage || productImage || "https://picsum.photos/800/800");

  // Increased max-widths for better visibility on desktop
  const getContainerStyle = () => {
    switch (device) {
      case DeviceFrame.PHONE:
        return "aspect-[9/16] w-full max-w-[340px] md:max-w-[420px]"; // Increased from 320px
      case DeviceFrame.TABLET:
        return "aspect-[3/4] w-full max-w-[500px] md:max-w-[640px]"; // Increased from 480px
      case DeviceFrame.DESKTOP:
        return "aspect-[16/9] w-full max-w-[800px] md:max-w-full";
      default:
        return "aspect-[9/16] w-full max-w-[340px] md:max-w-[420px]";
    }
  };

  const FullscreenModal = () => (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsFullscreen(false)}>
        <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-white/10 rounded-full transition-colors"
            onClick={() => setIsFullscreen(false)}
        >
            <X size={32} />
        </button>
        <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
             {isVideo ? (
                 <video 
                    src={videoUrl || ""}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    controls
                    autoPlay
                    loop
                 />
             ) : (
                <img 
                    src={displayImage} 
                    alt="Visualização em tela cheia" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
             )}
        </div>
    </div>
  );

  return (
    <>
      {isFullscreen && <FullscreenModal />}
      
      <div className={`flex items-center justify-center p-4 md:p-8 bg-slate-100 rounded-xl border border-slate-200 shadow-inner relative group ${className}`}>
        
        {/* Label for state */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none transition-opacity">
                {showOriginal ? "Original" : (isVideo ? "Vídeo Veo" : (generatedImage ? "Gerada por IA" : "Prévia"))}
            </div>
        </div>

        {/* Fullscreen Button (Only visible if there is content) */}
        {(generatedImage || videoUrl || productImage) && (
            <button 
                onClick={() => setIsFullscreen(true)}
                className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-slate-800 p-2 rounded-full transition-all shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                title="Expandir visualização"
            >
                <Maximize2 size={18} className="text-slate-900" />
            </button>
        )}

        {/* Device Frame */}
        <div className={`relative overflow-hidden bg-white shadow-2xl transition-all duration-500 ease-in-out ${getContainerStyle()} ${device === DeviceFrame.PHONE ? 'rounded-[2rem] border-[8px] border-slate-800' : 'rounded-lg border-[12px] border-slate-800'}`}>
          
          {/* Media Layer */}
          <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center">
              {isVideo ? (
                  <video 
                      src={videoUrl || ""}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                  />
              ) : (
                  <img 
                      src={displayImage} 
                      alt="Prévia do Anúncio" 
                      className="w-full h-full object-cover"
                  />
              )}
              
              {/* Gradient Overlay */}
              {!showOriginal && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 pointer-events-none"></div>
              )}
          </div>

          {/* UI Overlay Layer */}
          {!showOriginal && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 pointer-events-none">
            
            {/* Top Bar (Mock) */}
            <div className="flex justify-between items-center opacity-80">
              <div className="flex space-x-1">
                  <div className="w-8 h-1 bg-white/50 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/50 rounded-full"></div>
              </div>
              <div className="text-white/80 text-[10px] font-bold tracking-widest uppercase">Patrocinado</div>
            </div>

            {/* Bottom Content Area */}
            <div className="flex flex-col gap-4">
              {/* Headline */}
              {headline && (
                  <h2 className={`font-bold leading-tight drop-shadow-lg text-white ${device === DeviceFrame.PHONE ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>
                      {headline}
                  </h2>
              )}

              {/* CTA Section */}
              <div className="flex items-center justify-between gap-3 mt-2 pointer-events-auto">
                  <button className="flex-1 bg-white text-black font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-lg">
                      <ShoppingBag size={18} />
                      <span>{ctaText || "Comprar Agora"}</span>
                  </button>
                  
                  {/* Mock Link/QR Indicator */}
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                      <QrCode size={20} />
                  </div>
              </div>
              
              {/* Link URL Display */}
              {ctaLink && (
                  <div className="flex justify-center items-center gap-1 text-white/70 text-[10px]">
                      <ExternalLink size={10} />
                      <span className="truncate max-w-[200px]">{ctaLink.replace(/^https?:\/\//, '')}</span>
                  </div>
              )}
            </div>

          </div>
          )}
        </div>
      </div>
    </>
  );
};