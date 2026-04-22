import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'

export interface VideoStitchOptions {
  inputFiles: string[]
  outputPath: string
  bitrate?: string
  codec?: string
}

export class VideoStitcher {
  private ffmpegPath: string

  constructor() {
    // FFmpeg will be found via PATH in production
    this.ffmpegPath = 'ffmpeg'
  }

  async stitchVideos(options: VideoStitchOptions): Promise<string> {
    const { inputFiles, outputPath, bitrate = '1000k', codec = 'libx264' } = options

    console.log('[FFmpeg] Stitching videos:', inputFiles)

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    return new Promise((resolve, reject) => {
      let command = ffmpeg()

      // Add input files
      inputFiles.forEach((file) => {
        command = command.input(file)
      })

      command
        .on('start', (commandLine) => {
          console.log('[FFmpeg] Started command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('[FFmpeg] Progress:', Math.round(progress.percent), '%')
        })
        .on('error', (err) => {
          console.error('[FFmpeg] Error:', err)
          reject(err)
        })
        .on('end', () => {
          console.log('[FFmpeg] Finished stitching')
          resolve(outputPath)
        })
        .videoCodec(codec)
        .audioBitrate('128k')
        .videoBitrate(bitrate)
        .output(outputPath)
        .run()
    })
  }

  async generateGif(inputVideo: string, outputPath: string): Promise<string> {
    console.log('[FFmpeg] Generating GIF from:', inputVideo)

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    return new Promise((resolve, reject) => {
      ffmpeg(inputVideo)
        .on('start', (commandLine) => {
          console.log('[FFmpeg] Started GIF generation:', commandLine)
        })
        .on('error', (err) => {
          console.error('[FFmpeg] GIF Error:', err)
          reject(err)
        })
        .on('end', () => {
          console.log('[FFmpeg] GIF generation complete')
          resolve(outputPath)
        })
        .fps(10)
        .size('400x600')
        .output(outputPath)
        .run()
    })
  }

  async getVideoInfo(videoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err)
        } else {
          resolve(metadata)
        }
      })
    })
  }
}

export const stitcher = new VideoStitcher()
