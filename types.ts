export enum DeviceFrame {
  PHONE = 'PHONE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP'
}

export interface AdConfig {
  productImage: string | null;
  generatedImage: string | null;
  videoUrl: string | null;
  outputType: 'image' | 'video';
  narrative: string;
  headline: string;
  ctaText: string;
  ctaLink: string;
  theme: AdTheme;
  device: DeviceFrame;
}

export enum AdTheme {
  MINIMAL = 'Estúdio Minimalista',
  LUXURY = 'Luxo & Elegância',
  SUMMER = 'Verão & Praia',
  FASHION = 'Moda Streetwear',
  RETRO = 'Vibe Retrô 90s',
  FUTURISTIC = 'Cyberpunk Neon'
}

export interface LoadingState {
  status: 'idle' | 'uploading' | 'generating' | 'success' | 'error';
  message?: string;
}