import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

interface VideoCompositionProps {
  message: string
  recipientName?: string
  templateId: string
  duration?: number
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  message,
  recipientName,
  templateId,
  duration = 15 * 15, // 15 seconds at 15 FPS
}) => {
  const frame = useCurrentFrame()
  const progress = Math.min(frame / duration, 1)

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {/* Background */}
      <AbsoluteFill style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        {/* Message with handwriting animation */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            opacity: interpolate(progress, [0, 0.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `scale(${interpolate(progress, [0, 0.2], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
            transition: 'all 0.3s ease-out',
            marginBottom: '20px',
          }}
        >
          {message}
        </div>

        {/* Recipient name */}
        {recipientName && (
          <div
            style={{
              fontSize: '36px',
              marginTop: '20px',
              opacity: interpolate(progress, [0.4, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              fontStyle: 'italic',
            }}
          >
            {recipientName}
          </div>
        )}

        {/* Decorative elements */}
        <div
          style={{
            marginTop: '40px',
            fontSize: '24px',
            opacity: interpolate(progress, [0.6, 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          ✨
        </div>
      </div>
    </AbsoluteFill>
  )
}

// Re-export composition settings
export const compositionConfig = {
  id: 'VideoComposition',
  component: VideoComposition,
  durationInFrames: 15 * 15, // 15 seconds at 15 FPS
  fps: 15,
  width: 720,
  height: 1280,
  defaultProps: {
    message: 'Hello!',
    templateId: 'default',
  },
}
