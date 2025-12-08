
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
  LogIn,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  X
} from 'lucide-react';
import { AdConfig, AdTheme, DeviceFrame, LoadingState } from './types';
import { AdPreview } from './components/AdPreview';
import { generateAdScene } from './services/geminiService';

// --- CUSTOM ICONS ---

const BogurMascot: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Gradients para efeito 3D */}
      <linearGradient id="faceGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCD34D" /> {/* Amber 300 */}
        <stop offset="1" stopColor="#D97706" /> {/* Amber 600 */}
      </linearGradient>
      
      <linearGradient id="earGrad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#78350F" />
      </linearGradient>

      <radialGradient id="snoutGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 60) rotate(90) scale(20)">
        <stop stopColor="#FFFBEB" />
        <stop offset="1" stopColor="#FDE68A" />
      </radialGradient>

      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3"/>
        </feComponentTransfer>
        <feMerge> 
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/> 
        </feMerge>
      </filter>
    </defs>

    {/* Orelhas (Fundo) */}
    <path d="M20 35C15 20 30 15 40 25" fill="url(#earGrad)" stroke="#451A03" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M80 35C85 20 70 15 60 25" fill="url(#earGrad)" stroke="#451A03" strokeWidth="2" strokeLinejoin="round"/>
    
    {/* Interior Orelhas */}
    <path d="M26 32C24 28 28 25 32 29" fill="#FEF3C7" opacity="0.8"/>
    <path d="M74 32C76 28 72 25 68 29" fill="#FEF3C7" opacity="0.8"/>

    {/* Cabeça Principal */}
    <path d="M50 90C75 90 90 70 90 50C90 30 75 15 50 15C25 15 10 30 10 50C10 70 25 90 50 90Z" fill="url(#faceGrad)" stroke="#451A03" strokeWidth="2" filter="url(#softShadow)"/>

    {/* Brilho na Testa (Highlight 3D) */}
    <ellipse cx="50" cy="30" rx="20" ry="10" fill="white" opacity="0.2"/>

    {/* Focinho / Mancha Clara */}
    <path d="M50 88C70 88 80 75 80 60C80 52 70 48 65 52C60 56 55 52 50 52C45 52 40 56 35 52C30 48 20 52 20 60C20 75 30 88 50 88Z" fill="url(#snoutGrad)"/>

    {/* Olhos (Com reflexo de vidro) */}
    <g>
        <ellipse cx="35" cy="45" rx="6" ry="8" fill="#451A03"/>
        <circle cx="37" cy="42" r="2.5" fill="white" opacity="0.9"/>
        <circle cx="33" cy="47" r="1" fill="white" opacity="0.3"/>
    </g>
    <g>
        <ellipse cx="65" cy="45" rx="6" ry="8" fill="#451A03"/>
        <circle cx="67" cy="42" r="2.5" fill="white" opacity="0.9"/>
        <circle cx="63" cy="47" r="1" fill="white" opacity="0.3"/>
    </g>

    {/* Bochechas (Blush suave) */}
    <circle cx="28" cy="60" r="5" fill="#FCA5A5" opacity="0.6" filter="url(#softShadow)"/>
    <circle cx="72" cy="60" r="5" fill="#FCA5A5" opacity="0.6" filter="url(#softShadow)"/>

    {/* Nariz 3D */}
    <path d="M46 56C46 56 50 54 54 56C46 56 52 62 50 62C48 62 46 56 46 56Z" fill="#451A03"/>
    <ellipse cx="50" cy="56.5" rx="2" ry="1" fill="white" opacity="0.3"/>

    {/* Boca */}
    <path d="M50 62V65" stroke="#451A03" strokeWidth="2" strokeLinecap="round"/>
    <path d="M42 65C45 70 50 70 50 65C50 70 55 70 58 65" stroke="#451A03" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// --- COMPONENTS ---

// 1. Auth Screen Component
const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 flex flex-col items-center">
        
        {/* LOGO BOGUR PUBLICIDADE (VERSÃO 3D) */}
        <div className="flex flex-col items-center justify-center mb-10 transform hover:scale-105 transition-transform duration-500 cursor-pointer group">
            
            {/* Mascot Circle Container 3D */}
            <div className="w-40 h-40 rounded-full bg-gradient-to-b from-green-300 to-green-600 border-[6px] border-[#3f1602] flex items-center justify-center relative z-10 shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_-5px_10px_rgba(0,0,0,0.2),inset_0_5px_10px_rgba(255,255,255,0.4)] overflow-hidden">
                 {/* Brilho de Vidro (Glass effect) */}
                 <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none z-20"></div>
                 
                 <BogurMascot className="w-32 h-32 mt-4 z-10 drop-shadow-2xl filter contrast-125" />
            </div>
            
            {/* Text Badge 3D */}
            <div className="bg-gradient-to-b from-[#5D2305] to-[#2E1102] px-12 py-5 rounded-[2rem] -mt-10 pt-12 pb-5 border-[4px] border-[#3f1602] shadow-[0_20px_40px_rgba(0,0,0,0.7)] flex flex-col items-center min-w-[280px] relative z-0">
                {/* Highlight borda badge */}
                <div className="absolute inset-0 rounded-[2rem] border-t border-white/20 pointer-events-none"></div>

                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 tracking-wide leading-none font-sans drop-shadow-md">BOGUR</h1>
                <span className="text-xs font-extrabold text-amber-400 tracking-[0.4em] mt-1 drop-shadow-sm uppercase">Publicidade</span>
            </div>
        </div>

        <p className="text-slate-400 text-center mb-8 w-full">
          {isLogin ? "Bem-vindo de volta! Acesse seus projetos." : "Crie anúncios profissionais em segundos."}
        </p>

        <form className="space-y-4 w-full" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div>
            <label className="block text-white font-bold mb-1">Email</label>
            <input 
              type="email" 
              placeholder="seu@email.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-white font-bold mb-1">Senha</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLogin ? (
              <><span>Entrar</span> <ArrowRight size={18} /></>
            ) : (
              <><span>Criar Conta Grátis</span> <UserPlus size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center w-full">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-400 hover:text-amber-300 font-medium ml-1 transition-colors"
            >
              {isLogin ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfig] = useState<AdConfig>({
    productImage: null,
    generatedImage: null,
    logoImage: null,
    narrative: '',
    headline: 'Sinta a diferença.',
    ctaText: 'Comprar Agora',
    ctaLink: 'https://minhaloja.com/produto',
    theme: AdTheme.MINIMAL,
    device: DeviceFrame.PHONE,
  });

  const [buttonMode, setButtonMode] = useState<'site' | 'whatsapp'>('site');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [siteUrl, setSiteUrl] = useState('https://minhaloja.com/produto'); // Persistência do link do site

  const [history, setHistory] = useState<string[]>([]);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
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
        }));
        setHistory([]); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ 
            ...prev, 
            logoImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addToHistory = (url: string) => {
    setHistory(prev => [url, ...prev]);
  };

  const updateWhatsappLink = (number: string) => {
      setWhatsappNumber(number);
      // Remove non-digits
      const cleanNumber = number.replace(/\D/g, '');
      if (cleanNumber.length > 0) {
          const finalLink = `https://wa.me/55${cleanNumber}`;
          setConfig(prev => ({ ...prev, ctaLink: finalLink }));
      } else {
          setConfig(prev => ({ ...prev, ctaLink: '' }));
      }
  };

  const handleButtonModeChange = (mode: 'site' | 'whatsapp') => {
      setButtonMode(mode);
      if (mode === 'whatsapp') {
          // Restaurar o link do WhatsApp se houver número salvo
          const cleanNumber = whatsappNumber.replace(/\D/g, '');
          const link = cleanNumber ? `https://wa.me/55${cleanNumber}` : '';
          setConfig(prev => ({ ...prev, ctaLink: link }));
      } else {
          // Restaurar o link do site salvo
          setConfig(prev => ({ 
              ...prev, 
              ctaLink: siteUrl 
          }));
      }
  };

  const handleGenerate = async () => {
    if (!config.productImage) {
      alert("Por favor, envie uma foto do produto primeiro.");
      return;
    }

    setLoading({ status: 'generating', message: 'A IA está criando seu anúncio...' });

    try {
        // Determine aspect ratio for image based on device
        // Phone 9:16, Tablet 4:5 (using 3:4 as closest API support), Desktop 16:9
        const aspectRatio = config.device === DeviceFrame.DESKTOP ? '16:9' : (config.device === DeviceFrame.TABLET ? '3:4' : '9:16');
        
        const resultImage = await generateAdScene(
        config.productImage,
        config.narrative || "Crie um anúncio profissional",
        config.theme,
        'generate',
        aspectRatio
        );
        setConfig(prev => ({ ...prev, generatedImage: resultImage }));
        addToHistory(resultImage);

      setLoading({ status: 'success' });
      // Pequeno delay para garantir que o scroll funcione após renderização
      setTimeout(() => {
        if (previewRef.current) {
            previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);

    } catch (error: any) {
      console.error(error);
      setLoading({ status: 'error', message: error.message || 'Erro ao gerar. Tente novamente ou verifique sua conexão.' });
    }
  };

  const handleRefine = async () => {
    if (!config.generatedImage) return;
    if (!refinePrompt.trim()) {
        alert("Digite o que deseja alterar na imagem.");
        return;
    }
    setLoading({ status: 'generating', message: 'Ajustando imagem com IA...' });
    try {
        const aspectRatio = config.device === DeviceFrame.DESKTOP ? '16:9' : (config.device === DeviceFrame.TABLET ? '3:4' : '9:16');
        const resultImage = await generateAdScene(
            config.generatedImage,
            refinePrompt,
            config.theme,
            'edit',
            aspectRatio
        );
        setConfig(prev => ({ ...prev, generatedImage: resultImage }));
        addToHistory(resultImage);
        setRefinePrompt(''); 
        setLoading({ status: 'success' });
    } catch (error: any) {
        console.error(error);
        setLoading({ status: 'error', message: error.message || 'Falha ao editar a imagem.' });
    }
  };

  const handleDownload = () => {
    const url = config.generatedImage;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `anuncio-bogur-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
        alert("Nada para baixar.");
    }
  };

  const selectHistoryItem = (url: string) => {
      setConfig(prev => ({ ...prev, generatedImage: url }));
  };

  // If not authenticated, show Auth Screen
  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  // Main App Interface
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Header Logo Compact 3D */}
          <div className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-700 border-[2px] border-[#3f1602] flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative">
                 <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent"></div>
                 <BogurMascot className="w-9 h-9 mt-1 drop-shadow-md" />
            </div>
            <div className="bg-gradient-to-b from-[#5D2305] to-[#2E1102] px-4 py-1 rounded-lg border border-[#3f1602] flex flex-col justify-center h-11 shadow-md">
                <h1 className="text-xl font-black text-white tracking-wide leading-none drop-shadow-sm">BOGUR</h1>
                <span className="text-[0.6rem] font-bold text-amber-400 tracking-[0.2em] leading-none uppercase">Publicidade</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-amber-900/50 border border-amber-500/30 flex items-center justify-center text-amber-300 font-medium text-sm">
                  JD
                </div>
                <button 
                  onClick={() => setIsAuthenticated(false)}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Sair
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls */}
          <div className="xl:col-span-4 space-y-6 relative z-30">
            
            {/* Step 1: Product Upload */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
                    <ImageIcon size={20} />
                </div>
                <h2 className="font-semibold text-lg text-white">1. Foto do Produto</h2>
              </div>
              
              <div 
                className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${config.productImage ? 'border-indigo-500/50 bg-slate-950' : 'border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {config.productImage ? (
                    <>
                        <img src={config.productImage} alt="Produto" className="w-full h-full object-contain p-4" />
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2"><Upload size={16}/> Trocar Foto</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-slate-800 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform ring-2 ring-emerald-500/20">
                          <Upload className="w-12 h-12 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-white uppercase tracking-wide">CLIQUE OU ARRASTE A FOTO</p>
                        <p className="text-base text-white mt-2">Suporta PNG, JPG e WEBP</p>
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
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-500/10 p-2 rounded-lg text-pink-400">
                    <Wand2 size={20} />
                </div>
                <h2 className="font-semibold text-lg text-white">2. Cenário e Estilo</h2>
              </div>

              <div className="space-y-5">
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-white font-bold">
                            Narrativa do Anúncio:
                        </label>
                        {config.narrative && (
                            <button
                                onClick={() => setConfig({ ...config, narrative: '' })}
                                className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 text-xs uppercase font-bold tracking-wider"
                                title="Limpar texto"
                            >
                                <Trash2 size={14} />
                                Limpar
                            </button>
                        )}
                    </div>
                    <textarea 
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-lg text-white placeholder-slate-600 min-h-[120px] resize-none"
                        placeholder='Ex: "O produto flutuando no espaço com luzes neon rosa e azul..."'
                        value={config.narrative}
                        onChange={(e) => setConfig({...config, narrative: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-lg font-bold text-white mb-3">Estilo Visual</label>
                    <div className="grid grid-cols-1 gap-3">
                        {Object.values(AdTheme).map((theme) => (
                            <button
                                key={theme}
                                onClick={() => setConfig({...config, theme})}
                                className={`text-lg font-bold py-5 px-5 rounded-xl border text-left transition-all relative overflow-hidden ${config.theme === theme ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white'}`}
                            >
                                {config.theme === theme && <div className="absolute top-2 right-2 p-1"><CheckCircle2 size={24} /></div>}
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={loading.status === 'generating' || !config.productImage}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                >
                    {loading.status === 'generating' ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Processando IA...</span>
                        </>
                    ) : (
                        <>
                            <Wand2 size={20} />
                            <span>Gerar Anúncio Agora</span>
                        </>
                    )}
                </button>
                {loading.status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex flex-col gap-2">
                        <strong className="flex items-center gap-2">❌ Erro na Geração</strong>
                        <span>{loading.message}</span>
                    </div>
                )}
              </div>
            </div>

            {/* Step 3: Overlay Content */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
               <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                    <Type size={20} />
                </div>
                <h2 className="font-semibold text-lg text-white">3. Texto e Links</h2>
              </div>
              
              <div className="space-y-4">
                 {/* Button Type Selector */}
                 <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                     <button 
                        onClick={() => handleButtonModeChange('site')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${buttonMode === 'site' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                     >
                         Site / Loja
                     </button>
                     <button 
                        onClick={() => handleButtonModeChange('whatsapp')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${buttonMode === 'whatsapp' ? 'bg-[#25D366] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                     >
                         <MessageCircle size={16} /> WhatsApp
                     </button>
                 </div>

                 {/* LOGO UPLOAD */}
                 <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">Logo da Marca (Opcional)</label>
                    <div className="flex items-center gap-3">
                        <div 
                            onClick={() => logoInputRef.current?.click()}
                            className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-700 border-dashed flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden relative group"
                        >
                            {config.logoImage ? (
                                <>
                                    <img src={config.logoImage} className="w-full h-full object-contain p-1" alt="Logo" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload size={14} />
                                    </div>
                                </>
                            ) : (
                                <Upload size={20} className="text-slate-500" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Sua logo aparecerá na barra.</span>
                            {config.logoImage && (
                                <button 
                                    onClick={() => setConfig(prev => ({ ...prev, logoImage: null }))}
                                    className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                    <X size={12}/> Remover logo
                                </button>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={logoInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">Manchete (Headline)</label>
                    <input 
                        type="text"
                        value={config.headline}
                        onChange={(e) => setConfig({...config, headline: e.target.value})}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">Texto do Botão</label>
                        <input 
                            type="text"
                            value={config.ctaText}
                            onChange={(e) => setConfig({...config, ctaText: e.target.value})}
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                            {buttonMode === 'whatsapp' ? "Número (DDD + Tel)" : "Link de Destino"}
                        </label>
                        <div className="relative">
                            {buttonMode === 'whatsapp' ? (
                                <MessageCircle className="absolute left-3 top-3.5 text-emerald-500 w-4 h-4" />
                            ) : (
                                <LinkIcon className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
                            )}
                            
                            {buttonMode === 'whatsapp' ? (
                                <input 
                                    type="text"
                                    value={whatsappNumber}
                                    placeholder="Ex: 11999998888"
                                    onChange={(e) => updateWhatsappLink(e.target.value)}
                                    className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                />
                            ) : (
                                <input 
                                    type="text"
                                    value={config.ctaLink}
                                    onChange={(e) => {
                                        setSiteUrl(e.target.value);
                                        setConfig({...config, ctaLink: e.target.value});
                                    }}
                                    className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                />
                            )}
                        </div>
                    </div>
                 </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Preview & History */}
          <div className="xl:col-span-8 flex flex-col h-full gap-6" ref={previewRef}>
             
             {/* Format Toggles */}
             <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                 <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto max-w-full">
                    {[
                        { id: DeviceFrame.PHONE, icon: Smartphone, label: 'Stories (9:16)' },
                        { id: DeviceFrame.TABLET, icon: Tablet, label: 'Feed (4:5)' },
                        { id: DeviceFrame.DESKTOP, icon: Monitor, label: 'Wide (16:9)' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setConfig({...config, device: item.id})}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${config.device === item.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                        >
                            <item.icon size={16} />
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    ))}
                 </div>

                 {/* Compare Toggle */}
                 {(config.generatedImage) && (
                    <button
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onMouseLeave={() => setShowOriginal(false)}
                        className="flex items-center gap-2 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg hover:bg-amber-500/20 active:scale-95 transition-all select-none ml-auto"
                    >
                        <Eye size={16} />
                        <span className="hidden sm:inline">Segurar para Comparar</span>
                    </button>
                 )}
             </div>

             <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Main Preview Area */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="w-full relative flex justify-center bg-slate-900/50 rounded-2xl border border-slate-800/50 p-4 min-h-[500px] items-center">
                        <AdPreview 
                            key={config.generatedImage}
                            config={config} 
                            showOriginal={showOriginal}
                            className="" 
                        />
                    </div>
                    
                    {/* Action Bar */}
                     {(config.generatedImage) && (
                        <div className="w-full mt-6 flex flex-col gap-4 max-w-3xl">
                            {/* Refine Input */}
                            <div className="bg-slate-900 p-2 pl-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-2 items-center">
                                <Edit2 size={18} className="text-slate-500" />
                                <input 
                                    type="text" 
                                    className="flex-1 p-2 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 w-full"
                                    placeholder='O que quer mudar? Ex: "Adicionar óculos de sol"'
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                />
                                <button 
                                    onClick={handleRefine}
                                    disabled={loading.status === 'generating'}
                                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                                >
                                    Ajustar
                                </button>
                            </div>

                            {/* Download Buttons */}
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleDownload}
                                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
                                >
                                    <Download size={20} />
                                    <span>Baixar Imagem</span>
                                </button>
                                <button 
                                    onClick={() => alert("Projeto salvo na nuvem!")}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
                                >
                                    <Layout size={20} />
                                    <span>Salvar Projeto</span>
                                </button>
                            </div>
                        </div>
                     )}
                </div>

                {/* History Gallery Sidebar */}
                {history.length > 0 && (
                    <div className="xl:w-64 flex-shrink-0 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden h-fit max-h-[800px]">
                        <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                            <History size={16} className="text-amber-400"/>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Versões Anteriores</span>
                        </div>
                        <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar">
                            {history.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectHistoryItem(url)}
                                    className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                                        config.generatedImage === url
                                        ? 'border-amber-500 ring-4 ring-amber-500/10' 
                                        : 'border-slate-800 hover:border-slate-600'
                                    }`}
                                >
                                    <img src={url} alt={`Versão ${history.length - idx}`} className="w-full h-full object-cover" />
                                    
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white text-[10px] py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform">
                                        Imagem {history.length - idx}
                                    </div>
                                    
                                    {idx === 0 && (
                                        <div className="absolute top-2 right-2 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-white/20"></div>
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
