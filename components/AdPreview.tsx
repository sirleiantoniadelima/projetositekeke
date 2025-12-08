
import React, { useState } from 'react';
import { AdConfig, DeviceFrame } from '../types';
import { ExternalLink, ShoppingBag, QrCode, Maximize2, X, MessageCircle } from 'lucide-react';

interface AdPreviewProps {
  config: AdConfig;
  className?: string;
  showOriginal?: boolean;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ config, className, showOriginal = false }) => {
  const { generatedImage, productImage, device, headline, ctaText, ctaLink, logoImage } = config;
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const isWhatsApp = ctaLink?.includes('wa.me');
  
  // Imagem a ser exibida
  const displayImage = showOriginal 
    ? (productImage || "https://via.placeholder.com/800?text=Sem+Foto") 
    : (generatedImage || productImage || "https://via.placeholder.com/800?text=Aguardando+IA");

  // Ajuste do tamanho do container (Aspect Ratio)
  const getContainerStyle = () => {
    switch (device) {
      case DeviceFrame.PHONE:
        return "aspect-[9/16] w-full max-w-[340px]"; 
      case DeviceFrame.TABLET:
        return "aspect-[3/4] w-full max-w-[500px]";
      case DeviceFrame.DESKTOP:
        return "aspect-[16/9] w-full max-w-full";
      default:
        return "aspect-[9/16] w-full max-w-[340px]";
    }
  };

  const formattedLink = ctaLink ? (ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`) : '#';

  // Modal de Tela Cheia
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
        
        {/* Label de Estado */}
        <div className="absolute top-4 right-4 z-40 flex gap-2">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg pointer-events-none transition-colors border uppercase tracking-wider ${showOriginal ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-emerald-600 text-white border-emerald-400'}`}>
                {showOriginal ? "Original" : (generatedImage ? "Gerada por IA" : "Prévia")}
            </div>
        </div>

        {/* Botão Expandir */}
        {(generatedImage || productImage) && (
            <button 
                onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
                className="absolute top-4 left-4 z-40 bg-black/50 hover:bg-black/80 text-white p-2.5 rounded-full transition-all shadow-lg border border-white/20"
                title="Expandir visualização"
            >
                <Maximize2 size={18} />
            </button>
        )}

        {/* CARD DO ANÚNCIO (ESTILO DIVIDIDO - IMAGEM EM CIMA, TEXTO EM BAIXO) */}
        <div 
            className={`relative overflow-hidden bg-slate-950 shadow-2xl flex flex-col ${getContainerStyle()} ${device === DeviceFrame.PHONE ? 'rounded-[2rem] border-[8px] border-slate-800' : 'rounded-xl border-[12px] border-slate-800'}`}
        >
          
            {/* 1. ÁREA DA IMAGEM (Topo - Flex 1 para ocupar o espaço disponível) */}
            <div 
                className="relative flex-1 w-full overflow-hidden cursor-zoom-in bg-slate-900"
                onClick={() => setIsFullscreen(true)}
            >
                <img 
                    src={displayImage} 
                    alt="Anúncio" 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Patrocinado Badge (Dentro da foto) */}
                <div className="absolute top-3 right-3 z-30 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-1 rounded border border-white/20 pointer-events-none">
                    Patrocinado
                </div>
            </div>

            {/* 2. ÁREA DE TEXTO E AÇÃO (Rodapé - Fixo embaixo) */}
            {!showOriginal && (
                <div className="w-full bg-slate-950 p-5 flex flex-col gap-3 border-t border-slate-900 shrink-0 z-20">
                    
                    {/* Logo da Marca */}
                    {logoImage && (
                        <div className="h-8 mb-1 flex items-start">
                            <img src={logoImage} alt="Brand Logo" className="h-full object-contain max-w-[120px]" />
                        </div>
                    )}

                    {/* Manchete */}
                    <h2 className="font-black text-white leading-tight break-words text-lg sm:text-xl line-clamp-2">
                        {headline || "Sua Manchete Aqui"}
                    </h2>

                    {/* Botão e Link */}
                    <div className="flex items-center justify-between gap-3 mt-1 w-full">
                        
                        {/* BOTÃO CTA */}
                        {ctaLink ? (
                            <a 
                                href={formattedLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`flex-1 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 hover:brightness-110 border border-white/10 ${isWhatsApp ? 'bg-[#25D366] text-white' : 'bg-white text-slate-950 hover:bg-slate-200'}`}
                            >
                                {isWhatsApp ? <MessageCircle size={18} fill="white" className="shrink-0" /> : <ShoppingBag size={18} className="shrink-0"/>}
                                <span className="text-sm uppercase tracking-wide truncate font-extrabold">{ctaText || "Comprar"}</span>
                            </a>
                        ) : (
                            <div className="flex-1 bg-slate-800 text-slate-500 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700">
                                <ShoppingBag size={18} />
                                <span className="text-sm uppercase tracking-wide truncate">{ctaText || "Comprar"}</span>
                            </div>
                        )}
                        
                        {/* QR Code (Decorativo) */}
                        <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 border border-slate-800 shrink-0">
                            <QrCode size={20} />
                        </div>
                    </div>
                    
                    {/* Link URL Visual */}
                    {ctaLink && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium pl-1">
                            <ExternalLink size={10} />
                            <span className="truncate max-w-[200px]">{ctaLink.replace(/^https?:\/\//, '')}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </>
  );
};
