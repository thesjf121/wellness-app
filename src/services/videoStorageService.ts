/**
 * Video Storage Service
 * Handles secure video upload, storage, and streaming with multiple cloud providers
 */

export interface VideoMetadata {
  id: string;
  fileName: string;
  originalName: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  format: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  uploadedBy: string;
  uploadedAt: Date;
  lastAccessed?: Date;
  accessCount: number;
  isProcessed: boolean;
  thumbnailUrl?: string;
  streamingUrls: {
    [quality: string]: string;
  };
  tags: string[];
  description?: string;
  visibility: 'public' | 'private' | 'group';
  groupId?: string;
}

export interface VideoUploadProgress {
  videoId: string;
  fileName: string;
  totalBytes: number;
  uploadedBytes: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  estimatedTimeRemaining?: number;
}

export interface VideoStorageConfig {
  provider: 'aws' | 'cloudinary' | 'vimeo' | 'local';
  maxFileSize: number; // in bytes
  allowedFormats: string[];
  enableTranscoding: boolean;
  generateThumbnails: boolean;
  enableStreaming: boolean;
  securityLevel: 'public' | 'authenticated' | 'private';
}

class VideoStorageService {
  private config: VideoStorageConfig;
  private uploads: Map<string, VideoUploadProgress> = new Map();
  private videos: Map<string, VideoMetadata> = new Map();
  private storageKey = 'video-storage-metadata';

  constructor(config: VideoStorageConfig) {
    this.config = config;
    this.loadVideoMetadata();
  }

  /**
   * Load video metadata from localStorage
   */
  private loadVideoMetadata(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, metadata]: [string, any]) => {
          this.videos.set(id, {
            ...metadata,
            uploadedAt: new Date(metadata.uploadedAt),
            lastAccessed: metadata.lastAccessed ? new Date(metadata.lastAccessed) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load video metadata:', error);
    }
  }

  /**
   * Save video metadata to localStorage
   */
  private saveVideoMetadata(): void {
    try {
      const data: { [key: string]: VideoMetadata } = {};
      this.videos.forEach((metadata, id) => {
        data[id] = metadata;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save video metadata:', error);
    }
  }

  /**
   * Generate unique video ID
   */
  private generateVideoId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate video file
   */
  private validateVideoFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(this.config.maxFileSize)}`,
      };
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.config.allowedFormats.includes(fileExtension)) {
      return {
        valid: false,
        error: `File format not supported. Allowed formats: ${this.config.allowedFormats.join(', ')}`,
      };
    }

    // Check if it's actually a video file
    if (!file.type.startsWith('video/')) {
      return {
        valid: false,
        error: 'File must be a video file',
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extract video metadata
   */
  private extractVideoMetadata(file: File): Promise<Partial<VideoMetadata>> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const metadata: Partial<VideoMetadata> = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          format: file.type,
        };
        
        URL.revokeObjectURL(url);
        resolve(metadata);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          format: file.type,
        });
      };

      video.src = url;
    });
  }

  /**
   * Generate thumbnail from video
   */
  private generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      video.onloadeddata = () => {
        // Seek to 10% of video duration for thumbnail
        video.currentTime = video.duration * 0.1;
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(url);
          resolve(thumbnailUrl);
        } else {
          reject(new Error('Failed to create canvas context'));
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video for thumbnail generation'));
      };

      video.src = url;
    });
  }

  /**
   * Simulate video upload with progress tracking
   */
  private simulateUpload(
    videoId: string,
    file: File,
    onProgress: (progress: VideoUploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let uploadedBytes = 0;
      const totalBytes = file.size;
      const chunkSize = Math.max(1024 * 100, totalBytes / 100); // Upload in 100 chunks

      const progress: VideoUploadProgress = {
        videoId,
        fileName: file.name,
        totalBytes,
        uploadedBytes: 0,
        percentage: 0,
        status: 'uploading',
      };

      this.uploads.set(videoId, progress);

      const uploadChunk = () => {
        uploadedBytes += chunkSize;
        if (uploadedBytes > totalBytes) {
          uploadedBytes = totalBytes;
        }

        progress.uploadedBytes = uploadedBytes;
        progress.percentage = Math.round((uploadedBytes / totalBytes) * 100);
        progress.estimatedTimeRemaining = uploadedBytes > 0 
          ? ((totalBytes - uploadedBytes) / uploadedBytes) * 1000 
          : undefined;

        onProgress({ ...progress });

        if (uploadedBytes >= totalBytes) {
          progress.status = 'processing';
          onProgress({ ...progress });

          // Simulate processing time
          setTimeout(() => {
            progress.status = 'completed';
            progress.percentage = 100;
            onProgress({ ...progress });
            
            // Generate a mock URL for the uploaded video
            const videoUrl = URL.createObjectURL(file);
            resolve(videoUrl);
          }, 2000);
        } else {
          // Continue uploading
          setTimeout(uploadChunk, 100);
        }
      };

      uploadChunk();
    });
  }

  /**
   * Upload video file
   */
  async uploadVideo(
    file: File,
    metadata: {
      description?: string;
      tags?: string[];
      visibility?: VideoMetadata['visibility'];
      groupId?: string;
      quality?: VideoMetadata['quality'];
    },
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<VideoMetadata> {
    // Validate file
    const validation = this.validateVideoFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const videoId = this.generateVideoId();
    const fileName = `${videoId}.${file.name.split('.').pop()}`;

    try {
      // Extract video metadata
      const extractedMetadata = await this.extractVideoMetadata(file);
      
      // Generate thumbnail if enabled
      let thumbnailUrl: string | undefined;
      if (this.config.generateThumbnails) {
        try {
          thumbnailUrl = await this.generateThumbnail(file);
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error);
        }
      }

      // Upload video with progress tracking
      const videoUrl = await this.simulateUpload(
        videoId,
        file,
        onProgress || (() => {})
      );

      // Create video metadata
      const videoMetadata: VideoMetadata = {
        id: videoId,
        fileName,
        originalName: file.name,
        size: file.size,
        duration: extractedMetadata.duration,
        width: extractedMetadata.width,
        height: extractedMetadata.height,
        format: extractedMetadata.format || file.type,
        quality: metadata.quality || 'medium',
        uploadedBy: 'current-user', // TODO: Get from auth context
        uploadedAt: new Date(),
        accessCount: 0,
        isProcessed: true,
        thumbnailUrl,
        streamingUrls: {
          [metadata.quality || 'medium']: videoUrl,
        },
        tags: metadata.tags || [],
        description: metadata.description,
        visibility: metadata.visibility || 'private',
        groupId: metadata.groupId,
      };

      // Store metadata
      this.videos.set(videoId, videoMetadata);
      this.saveVideoMetadata();

      // Clean up upload progress
      this.uploads.delete(videoId);

      return videoMetadata;
    } catch (error) {
      // Clean up on error
      this.uploads.delete(videoId);
      throw error;
    }
  }

  /**
   * Get video metadata by ID
   */
  getVideo(videoId: string): VideoMetadata | null {
    const video = this.videos.get(videoId);
    if (video) {
      // Update access tracking
      video.lastAccessed = new Date();
      video.accessCount++;
      this.saveVideoMetadata();
    }
    return video || null;
  }

  /**
   * Get videos by user or group
   */
  getVideos(filter: {
    uploadedBy?: string;
    groupId?: string;
    visibility?: VideoMetadata['visibility'];
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}): VideoMetadata[] {
    let videos = Array.from(this.videos.values());

    // Apply filters
    if (filter.uploadedBy) {
      videos = videos.filter(v => v.uploadedBy === filter.uploadedBy);
    }
    if (filter.groupId) {
      videos = videos.filter(v => v.groupId === filter.groupId);
    }
    if (filter.visibility) {
      videos = videos.filter(v => v.visibility === filter.visibility);
    }
    if (filter.tags && filter.tags.length > 0) {
      videos = videos.filter(v => 
        filter.tags!.some(tag => v.tags.includes(tag))
      );
    }

    // Sort by upload date (newest first)
    videos.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    // Apply pagination
    if (filter.offset) {
      videos = videos.slice(filter.offset);
    }
    if (filter.limit) {
      videos = videos.slice(0, filter.limit);
    }

    return videos;
  }

  /**
   * Update video metadata
   */
  updateVideo(videoId: string, updates: Partial<VideoMetadata>): VideoMetadata | null {
    const video = this.videos.get(videoId);
    if (!video) {
      return null;
    }

    // Merge updates
    const updatedVideo = { ...video, ...updates };
    this.videos.set(videoId, updatedVideo);
    this.saveVideoMetadata();

    return updatedVideo;
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    const video = this.videos.get(videoId);
    if (!video) {
      return false;
    }

    try {
      // In a real implementation, you would delete from cloud storage
      // For now, we'll just remove from local storage
      
      // Revoke object URLs to free memory
      Object.values(video.streamingUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      if (video.thumbnailUrl && video.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(video.thumbnailUrl);
      }

      // Remove from storage
      this.videos.delete(videoId);
      this.saveVideoMetadata();

      return true;
    } catch (error) {
      console.error('Failed to delete video:', error);
      return false;
    }
  }

  /**
   * Get upload progress
   */
  getUploadProgress(videoId: string): VideoUploadProgress | null {
    return this.uploads.get(videoId) || null;
  }

  /**
   * Get all active uploads
   */
  getActiveUploads(): VideoUploadProgress[] {
    return Array.from(this.uploads.values());
  }

  /**
   * Get video streaming URL with security checks
   */
  getStreamingUrl(
    videoId: string,
    quality: string = 'medium',
    userId?: string
  ): string | null {
    const video = this.videos.get(videoId);
    if (!video) {
      return null;
    }

    // Check access permissions
    if (video.visibility === 'private' && video.uploadedBy !== userId) {
      return null;
    }

    // Return streaming URL
    return video.streamingUrls[quality] || video.streamingUrls['medium'] || null;
  }

  /**
   * Generate secure access token for video
   */
  generateAccessToken(videoId: string, userId: string, expiresIn: number = 3600): string {
    // In a real implementation, this would use JWT or similar
    const token = {
      videoId,
      userId,
      expiresAt: Date.now() + (expiresIn * 1000),
      signature: btoa(`${videoId}:${userId}:${Date.now()}`),
    };

    return btoa(JSON.stringify(token));
  }

  /**
   * Validate access token
   */
  validateAccessToken(token: string): { valid: boolean; videoId?: string; userId?: string } {
    try {
      const decoded = JSON.parse(atob(token));
      
      if (decoded.expiresAt < Date.now()) {
        return { valid: false };
      }

      return {
        valid: true,
        videoId: decoded.videoId,
        userId: decoded.userId,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Get storage analytics
   */
  getStorageAnalytics(): {
    totalVideos: number;
    totalSize: number;
    totalDuration: number;
    averageSize: number;
    videosByQuality: { [key: string]: number };
    videosByFormat: { [key: string]: number };
    mostAccessedVideos: VideoMetadata[];
    storageUsageByMonth: { [key: string]: number };
  } {
    const videos = Array.from(this.videos.values());
    
    const totalVideos = videos.length;
    const totalSize = videos.reduce((sum, v) => sum + v.size, 0);
    const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
    const averageSize = totalVideos > 0 ? totalSize / totalVideos : 0;

    // Group by quality
    const videosByQuality: { [key: string]: number } = {};
    videos.forEach(v => {
      videosByQuality[v.quality] = (videosByQuality[v.quality] || 0) + 1;
    });

    // Group by format
    const videosByFormat: { [key: string]: number } = {};
    videos.forEach(v => {
      const format = v.format.split('/')[1] || 'unknown';
      videosByFormat[format] = (videosByFormat[format] || 0) + 1;
    });

    // Most accessed videos
    const mostAccessedVideos = videos
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    // Storage usage by month
    const storageUsageByMonth: { [key: string]: number } = {};
    videos.forEach(v => {
      const month = v.uploadedAt.toISOString().substr(0, 7); // YYYY-MM
      storageUsageByMonth[month] = (storageUsageByMonth[month] || 0) + v.size;
    });

    return {
      totalVideos,
      totalSize,
      totalDuration,
      averageSize,
      videosByQuality,
      videosByFormat,
      mostAccessedVideos,
      storageUsageByMonth,
    };
  }

  /**
   * Clear all video data (development/testing only)
   */
  clearAllVideos(): void {
    // Revoke all object URLs to free memory
    this.videos.forEach(video => {
      Object.values(video.streamingUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      if (video.thumbnailUrl && video.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(video.thumbnailUrl);
      }
    });

    this.videos.clear();
    this.uploads.clear();
    localStorage.removeItem(this.storageKey);
  }
}

// Create default configuration
const defaultConfig: VideoStorageConfig = {
  provider: 'local', // For demo purposes
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  enableTranscoding: true,
  generateThumbnails: true,
  enableStreaming: true,
  securityLevel: 'authenticated',
};

// Export singleton instance
export const videoStorageService = new VideoStorageService(defaultConfig);

// Export utilities
export const VideoUtils = {
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getVideoQuality: (width: number, height: number): VideoMetadata['quality'] => {
    const pixels = width * height;
    if (pixels >= 3840 * 2160) return 'ultra'; // 4K
    if (pixels >= 1920 * 1080) return 'high';  // 1080p
    if (pixels >= 1280 * 720) return 'medium'; // 720p
    return 'low'; // Below 720p
  },

  generateVideoThumbnail: (videoElement: HTMLVideoElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      ctx.drawImage(videoElement, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    });
  },
};