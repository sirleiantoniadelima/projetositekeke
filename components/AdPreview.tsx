import React, { useState } from 'react';
import { AdConfig, DeviceFrame } from '../types';
import { ExternalLink, ShoppingBag, QrCode, Maximize2, X, MessageCircle } from 'lucide-react';

interface AdPreviewProps {
  config: AdConfig;
  className?: string;
  showOriginal?: boolean;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ config, className, showOriginal = false }) => {
  const { generatedImage, productImage, device, headline, ctaText, ctaLink } = config;
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const isWhatsApp = ctaLink?.includes('wa.me');
  
  const displayImage = showOriginal && productImage 
    ? productImage 
    : (generatedImage || productImage || "https://picsum.photos/800/800"); // Fallback placeholder if empty

  // Responsive container sizing logic
  const getContainerStyle = () => {
    switch (device) {
      case DeviceFrame.PHONE:
        return "aspect-[9/16] w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px]"; 
      case DeviceFrame.TABLET:
        return "aspect-[4/5] w-full max-w-[480px] sm:max-w-[540px] md:max-w-[600px]"; 
      case DeviceFrame.DESKTOP:
        return "aspect-[16/9] w-full max-w-full";
      default:
        return "aspect-[9/16] w-full max-w-[360px]";
    }
  };

  const formattedLink = ctaLink ? (ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`) : '#';

  const FullscreenModal = () => (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsFullscreen(false)}>
        <button 
            className="absolute top-4 right-4 text-white hover:text-red-400 p-2 bg-white/10 rounded-full transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
        >
            <X size={32} />
        </button>
        <div className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
            <img 
                src={displayImage} 
                alt="Visualização em tela cheia" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
        </div>
    </div>
  );

  return (
    <>
      {isFullscreen && <FullscreenModal />}
      
      <div className={`flex items-center justify-center p-4 bg-slate-900 rounded-2xl shadow-inner relative group ${className}`}>
        
        {/* Label for state */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold pointer-events-none transition-opacity border ${showOriginal ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-black/60 backdrop-blur-md text-white border-white/10'}`}>
                {showOriginal ? "Imagem Original" : (generatedImage ? "Gerada por IA" : "Prévia")}
            </div>
        </div>

        {/* Fullscreen Button */}
        {(generatedImage || productImage) && (
            <button 
                onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
                className="absolute top-4 left-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2.5 rounded-full transition-all shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                title="Expandir visualização"
            >
                <Maximize2 size={18} />
            </button>
        )}

        {/* Device Frame */}
        <div className={`relative overflow-hidden bg-black shadow-2xl transition-all duration-500 ease-in-out ${getContainerStyle()} ${device === DeviceFrame.PHONE ? 'rounded-[2rem] border-[8px] border-slate-800' : 'rounded-xl border-[12px] border-slate-800'}`}>
          
          {/* BACKGROUND LINK - Click anywhere on the image */}
          {ctaLink && !showOriginal ? (
             <a 
                href={formattedLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full h-full absolute inset-0 z-0 cursor-pointer"
                title="Ir para o link"
             >
                {/* Image content is rendered by the sibling div below, but this anchor sits behind UI and covers the area */}
             </a>
          ) : null}

          {/* Media Layer */}
          <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden pointer-events-none">
                <img 
                    src={displayImage} 
                    alt="Prévia do Anúncio" 
                    className="w-full h-full object-cover transition-transform duration-700"
                />
                
                {/* Gradient Overlay for Text Readability */}
                {!showOriginal && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-80 z-10"></div>
                )}
            </div>

            {/* UI Overlay Layer */}
            {!showOriginal && (
            <div className="absolute inset-0 flex flex-col justify-between p-6 z-20 pointer-events-none">
              
              {/* Top Bar (Mock) */}
              <div className="flex justify-between items-center opacity-90">
                <div className="flex space-x-1">
                    <div className="w-8 h-1 bg-white/70 rounded-full"></div>
                    <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                </div>
                <div className="text-white/90 text-[10px] font-black tracking-widest uppercase bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">Patrocinado</div>
              </div>

              {/* Bottom Content Area */}
              <div className="flex flex-col gap-4">
                {/* Headline */}
                {headline && (
                    <h2 className={`font-bold leading-tight drop-shadow-xl text-white ${device === DeviceFrame.PHONE ? 'text-2xl' : 'text-3xl md:text-5xl'}`}>
                        {headline}
                    </h2>
                )}

                {/* CTA Section */}
                <div className="flex items-center justify-between gap-3 mt-2 pointer-events-auto">
                    {/* BUTTON - Explicit Link Wrapper */}
                    {ctaLink ? (
                        <a 
                            href={formattedLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex-1 font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer hover:brightness-110 active:scale-95 ${isWhatsApp ? 'bg-[#25D366] text-white' : 'bg-white text-black hover:bg-slate-200'}`}
                        >
                            {isWhatsApp ? <MessageCircle size={20} fill="white" className="text-white" /> : <ShoppingBag size={18} />}
                            <span className="text-sm uppercase tracking-wide">{ctaText || "Comprar Agora"}</span>
                        </a>
                    ) : (
                        <div className="flex-1 bg-white text-black font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-lg opacity-80">
                            <ShoppingBag size={18} />
                            <span className="text-sm uppercase tracking-wide">{ctaText || "Comprar Agora"}</span>
                        </div>
                    )}
                    
                    {/* Mock QR Indicator */}
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                        <QrCode size={20} />
                    </div>
                </div>
                
                {/* Link URL Display */}
                {ctaLink && (
                    <div className="flex justify-center items-center gap-1.5 text-white/60 text-[10px] mt-1">
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