import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Wand2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Download, 
  Layout, 
  Link as LinkIcon,
  Type,
  Image as ImageIcon,
  Edit2,
  History,
  Eye,
  Trash2,
  Video,
  PlayCircle
} from 'lucide-react';
import { AdConfig, AdTheme, DeviceFrame, LoadingState } from './types';
import { AdPreview } from './components/AdPreview';
import { generateAdScene, generateAdVideo } from './services/geminiService';

// Removed conflicting global declaration
// We will access aistudio via (window as any) to avoid conflict with existing type definitions

const App: React.FC = () => {
  const [config, setConfig] = useState<AdConfig>({
    productImage: null,
    generatedImage: null,
    videoUrl: null,
    outputType: 'image',
    narrative: '',
    headline: 'Sinta a diferença.',
    ctaText: 'Comprar Agora',
    ctaLink: 'https://minhaloja.com/produto',
    theme: AdTheme.MINIMAL,
    device: DeviceFrame.PHONE,
  });

  // History can store URLs (image or blob)
  const [history, setHistory] = useState<{url: string, type: 'image' | 'video'}[]>([]);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ 
            ...prev, 
            productImage: reader.result as string,
            generatedImage: null,
            videoUrl: null
        }));
        setHistory([]); 
      };
      reader.readAsDataURL(file);
    }
  };

  const addToHistory = (url: string, type: 'image' | 'video') => {
    setHistory(prev => [{url, type}, ...prev]);
  };

  const handleGenerate = async () => {
    if (!config.productImage) {
      alert("Por favor, envie uma foto do produto primeiro.");
      return;
    }

    // Veo/Video requires specific paid key check
    if (config.outputType === 'video') {
       const aistudio = (window as any).aistudio;
       if (aistudio) {
         const hasKey = await aistudio.hasSelectedApiKey();
         if (!hasKey) {
            await aistudio.openSelectKey();
            // We assume success after the dialog closes, or the user can click generate again if it failed.
            // But let's check again just in case or proceed.
         }
       }
    } else if (!process.env.API_KEY) {
        alert("Chave da API não encontrada.");
        return;
    }

    setLoading({ status: 'generating', message: config.outputType === 'video' ? 'Gerando vídeo (pode demorar até 1 minuto)...' : 'A IA está criando seu anúncio...' });

    try {
      if (config.outputType === 'video') {
          // Determine aspect ratio for Veo based on device
          // Veo supports 9:16 or 16:9
          const aspectRatio = config.device === DeviceFrame.DESKTOP ? '16:9' : '9:16';
          
          const resultVideo = await generateAdVideo(
            config.productImage,
            config.narrative || "Showcase this product in a cinematic way",
            config.theme,
            aspectRatio
          );
          
          setConfig(prev => ({ ...prev, videoUrl: resultVideo }));
          addToHistory(resultVideo, 'video');

      } else {
          const resultImage = await generateAdScene(
            config.productImage,
            config.narrative || "Crie um anúncio profissional",
            config.theme,
            'generate'
          );
    
          setConfig(prev => ({ ...prev, generatedImage: resultImage }));
          addToHistory(resultImage, 'image');
      }

      setLoading({ status: 'success' });
      
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error: any) {
      console.error(error);
      const aistudio = (window as any).aistudio;
      // Handle Veo "Requested entity was not found" error specifically if needed
      if (error.message?.includes("Requested entity was not found") && aistudio) {
         setLoading({ status: 'error', message: 'Erro de chave API. Por favor, selecione uma chave novamente.' });
         await aistudio.openSelectKey();
      } else {
         setLoading({ status: 'error', message: 'Erro ao gerar. Tente novamente.' });
      }
    }
  };

  const handleRefine = async () => {
    // Only supported for images currently
    if (!config.generatedImage || config.outputType === 'video') return;
    if (!refinePrompt.trim()) {
        alert("Digite o que deseja alterar na imagem.");
        return;
    }

    setLoading({ status: 'generating', message: 'Ajustando imagem com IA...' });

    try {
        const resultImage = await generateAdScene(
            config.generatedImage,
            refinePrompt,
            config.theme,
            'edit'
        );
        setConfig(prev => ({ ...prev, generatedImage: resultImage }));
        addToHistory(resultImage, 'image');
        setRefinePrompt(''); 
        setLoading({ status: 'success' });
    } catch (error) {
        console.error(error);
        setLoading({ status: 'error', message: 'Falha ao editar a imagem.' });
    }
  };

  const handleDownload = () => {
    const url = config.outputType === 'video' ? config.videoUrl : config.generatedImage;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = config.outputType === 'video' ? `anuncio-veo-${Date.now()}.mp4` : `anuncio-adgenius-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
        alert("Nada para baixar.");
    }
  };

  const selectHistoryItem = (item: {url: string, type: 'image' | 'video'}) => {
    if (item.type === 'video') {
        setConfig(prev => ({ ...prev, videoUrl: item.url, outputType: 'video', generatedImage: null }));
    } else {
        setConfig(prev => ({ ...prev, generatedImage: item.url, outputType: 'image', videoUrl: null }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Wand2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              AdGenius AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Key Selector Helper */}
             <button onClick={() => (window as any).aistudio?.openSelectKey()} className="text-xs text-slate-400 hover:text-indigo-600 underline">
                API Key
             </button>
             <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Entrar</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Step 1: Product Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-100 p-1.5 rounded-md text-indigo-700">
                    <ImageIcon size={18} />
                </div>
                <h2 className="font-semibold text-lg">1. Foto do Produto</h2>
              </div>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${config.productImage ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {config.productImage ? (
                    <div className="relative group w-full h-48">
                        <img src={config.productImage} alt="Produto" className="w-full h-full object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white font-medium">Trocar Foto</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <Upload className="w-10 h-10 text-slate-400 mb-3" />
                        <p className="text-sm font-medium text-slate-700">Clique ou arraste a foto</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG</p>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Step 2: Narrative & Theme */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-pink-100 p-1.5 rounded-md text-pink-700">
                    <Wand2 size={18} />
                </div>
                <h2 className="font-semibold text-lg">2. Cenário e Estilo</h2>
              </div>

              <div className="space-y-4">
                {/* Format Selector */}
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    <button 
                        onClick={() => setConfig({...config, outputType: 'image'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${config.outputType === 'image' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ImageIcon size={16} />
                        Imagem
                    </button>
                    <button 
                         onClick={() => setConfig({...config, outputType: 'video'})}
                         className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${config.outputType === 'video' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Video size={16} />
                        Vídeo (Veo)
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {config.outputType === 'video' ? "Descreva o movimento e cena:" : "Como você imagina o anúncio?"}
                    </label>
                    <textarea 
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm min-h-[100px]"
                        placeholder={config.outputType === 'video' ? 'Ex: Câmera lenta girando em torno do produto, luzes cinematográficas.' : 'Ex: "O produto flutuando no espaço com luzes neon"'}
                        value={config.narrative}
                        onChange={(e) => setConfig({...config, narrative: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estilo Visual</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(AdTheme).map((theme) => (
                            <button
                                key={theme}
                                onClick={() => setConfig({...config, theme})}
                                className={`text-xs py-2 px-3 rounded-md border text-left transition-all ${config.theme === theme ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={loading.status === 'generating' || !config.productImage}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading.status === 'generating' ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>{config.outputType === 'video' ? 'Gerando Vídeo...' : 'Criando Anúncio...'}</span>
                        </>
                    ) : (
                        <>
                            {config.outputType === 'video' ? <Video size={18}/> : <Wand2 size={18} />}
                            <span>{config.outputType === 'video' ? 'Gerar Vídeo' : 'Gerar Imagem'}</span>
                        </>
                    )}
                </button>
                {loading.status === 'error' && (
                    <p className="text-xs text-red-500 text-center">{loading.message}</p>
                )}
              </div>
            </div>

            {/* Step 3: Overlay Content */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-700">
                    <Type size={18} />
                </div>
                <h2 className="font-semibold text-lg">3. Texto e Links</h2>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Manchete (Headline)</label>
                    <input 
                        type="text"
                        value={config.headline}
                        onChange={(e) => setConfig({...config, headline: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Texto do Botão</label>
                        <input 
                            type="text"
                            value={config.ctaText}
                            onChange={(e) => setConfig({...config, ctaText: e.target.value})}
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Link de Destino</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                            <input 
                                type="text"
                                value={config.ctaLink}
                                onChange={(e) => setConfig({...config, ctaLink: e.target.value})}
                                className="w-full p-2 pl-9 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                 </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Preview & History */}
          <div className="lg:col-span-8 flex flex-col h-full gap-6" ref={previewRef}>
             
             {/* Format Toggles */}
             <div className="flex justify-between items-center">
                 <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex gap-1">
                    {[
                        { id: DeviceFrame.PHONE, icon: Smartphone, label: 'Stories (9:16)' },
                        { id: DeviceFrame.TABLET, icon: Tablet, label: 'Feed' },
                        { id: DeviceFrame.DESKTOP, icon: Monitor, label: 'Wide (16:9)' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setConfig({...config, device: item.id})}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${config.device === item.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <item.icon size={16} />
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    ))}
                 </div>

                 {/* Compare Toggle - Only available for images currently or just product compare */}
                 {(config.generatedImage || config.videoUrl) && (
                    <button
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onMouseLeave={() => setShowOriginal(false)}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 active:scale-95 transition-all select-none"
                    >
                        <Eye size={16} />
                        Segurar para Comparar
                    </button>
                 )}
             </div>

             <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Main Preview */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="w-full relative">
                        <AdPreview 
                            config={config} 
                            showOriginal={showOriginal}
                            className="w-full min-h-[500px] lg:min-h-[700px]" 
                        />
                    </div>
                    
                    {/* Refine / Actions */}
                     {(config.generatedImage || config.videoUrl) && (
                        <div className="w-full mt-4 flex flex-col gap-4">
                            {/* Refine Input - Images Only */}
                            {config.outputType === 'image' && (
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2">
                                    <div className="flex items-center gap-2 text-slate-400 pl-2">
                                        <Edit2 size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        className="flex-1 p-2 bg-transparent text-sm outline-none placeholder:text-slate-400"
                                        placeholder='O que quer mudar? Ex: "Adicionar óculos de sol"'
                                        value={refinePrompt}
                                        onChange={(e) => setRefinePrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                    />
                                    <button 
                                        onClick={handleRefine}
                                        disabled={loading.status === 'generating'}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                    >
                                        Ajustar
                                    </button>
                                </div>
                            )}

                            {/* Download / Save */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleDownload}
                                    className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download size={18} />
                                    <span>Baixar {config.outputType === 'video' ? 'Vídeo' : 'Imagem'}</span>
                                </button>
                                <button 
                                    onClick={() => alert("Projeto salvo! (Simulação)")}
                                    className="flex-1 bg-slate-900 text-white hover:bg-slate-800 px-4 py-3 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Layout size={18} />
                                    <span>Salvar</span>
                                </button>
                            </div>
                        </div>
                     )}
                </div>

                {/* Right Side: History Gallery */}
                {history.length > 0 && (
                    <div className="lg:w-48 flex-shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                        <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                            <History size={14} className="text-slate-500"/>
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Galeria</span>
                        </div>
                        <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                            {history.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectHistoryItem(item)}
                                    className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                                        (item.type === 'video' ? config.videoUrl === item.url : config.generatedImage === item.url)
                                        ? 'border-indigo-600 ring-2 ring-indigo-100' 
                                        : 'border-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <PlayCircle className="text-white w-8 h-8" />
                                        </div>
                                    ) : (
                                        <img src={item.url} alt={`Versão ${history.length - idx}`} className="w-full h-full object-cover" />
                                    )}
                                    
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.type === 'video' ? 'Vídeo' : 'Imagem'} {history.length - idx}
                                    </div>
                                    
                                    {idx === 0 && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full shadow-sm"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
             </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default App;