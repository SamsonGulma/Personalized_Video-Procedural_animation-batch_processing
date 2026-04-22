export interface CompressionPreset {
  name: string
  bitrate: string
  codec: string
  preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow'
  targetSize?: string // approximate target file size in MB
}

export const compressionPresets: Record<string, CompressionPreset> = {
  // Small file size, lower quality (for social media sharing)
  social: {
    name: 'Social Media',
    bitrate: '500k',
    codec: 'libx264',
    preset: 'fast',
    targetSize: '3',
  },

  // Balanced - good quality with reasonable file size
  balanced: {
    name: 'Balanced',
    bitrate: '1000k',
    codec: 'libx264',
    preset: 'medium',
    targetSize: '5',
  },

  // High quality, larger file size
  hq: {
    name: 'High Quality',
    bitrate: '2000k',
    codec: 'libx264',
    preset: 'slow',
    targetSize: '10',
  },

  // Ultra fast encoding (for real-time previews)
  preview: {
    name: 'Preview',
    bitrate: '300k',
    codec: 'libx264',
    preset: 'ultrafast',
    targetSize: '1.5',
  },

  // Ultra high quality, larger file
  ultra: {
    name: 'Ultra High Quality',
    bitrate: '4000k',
    codec: 'libx265',
    preset: 'veryslow',
    targetSize: '20',
  },
}

export function getPreset(name: string): CompressionPreset {
  return compressionPresets[name] || compressionPresets.balanced
}

export function estimateFileSize(bitrate: string, durationSeconds: number): number {
  // Extract bitrate value (e.g., "1000k" -> 1000)
  const bitrateValue = parseInt(bitrate.replace(/[^0-9]/g, ''))
  // Bitrate is in kb/s, so: (bitrate * duration) / 8 = file size in MB
  return (bitrateValue * durationSeconds) / (8 * 1024)
}
