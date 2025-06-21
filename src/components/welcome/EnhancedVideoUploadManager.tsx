import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { videoStorageService, VideoMetadata, VideoUploadProgress, VideoUtils } from '../../services/videoStorageService';
import VideoPlayer from './VideoPlayer';

interface VideoUploadManagerProps {
  groupId?: string;
  onVideoUploaded?: (videoId: string, videoUrl: string) => void;
}

const EnhancedVideoUploadManager: React.FC<VideoUploadManagerProps> = ({ 
  groupId, 
  onVideoUploaded 
}) => {
  const { user } = useUser();
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [activeUploads, setActiveUploads] = useState<VideoUploadProgress[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [videoForm, setVideoForm] = useState({
    description: '',
    tags: '',
    visibility: 'private' as const,
    quality: 'medium' as const
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has admin privileges
  const isAdmin = user?.publicMetadata?.role === 'super_admin' || user?.publicMetadata?.role === 'team_sponsor';

  // Load videos on component mount
  useEffect(() => {
    loadVideos();
  }, [groupId]);

  // Poll for active uploads
  useEffect(() => {
    const interval = setInterval(() => {
      const uploads = videoStorageService.getActiveUploads();
      setActiveUploads(uploads);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadVideos = () => {
    const loadedVideos = videoStorageService.getVideos({
      groupId,
      limit: 50
    });
    setVideos(loadedVideos);
  };

  const handleFileSelect = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a video file');
      return;
    }

    try {
      const tags = videoForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const videoMetadata = await videoStorageService.uploadVideo(
        selectedFile,
        {
          description: videoForm.description,
          tags,
          visibility: videoForm.visibility,
          groupId,
          quality: videoForm.quality,
        },
        (progress: VideoUploadProgress) => {
          // Progress is automatically tracked by the service
          console.log('Upload progress:', progress);
        }
      );

      // Reload videos
      loadVideos();

      // Call callback if provided
      if (onVideoUploaded) {
        const streamingUrl = videoStorageService.getStreamingUrl(videoMetadata.id);
        if (streamingUrl) {
          onVideoUploaded(videoMetadata.id, streamingUrl);
        }
      }

      // Reset form
      setShowUploadModal(false);
      setSelectedFile(null);
      setVideoForm({
        description: '',
        tags: '',
        visibility: 'private',
        quality: 'medium'
      });

      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      const success = await videoStorageService.deleteVideo(videoId);
      if (success) {
        loadVideos();
        alert('Video deleted successfully');
      } else {
        alert('Failed to delete video');
      }
    }
  };

  const updateVideoVisibility = async (videoId: string, visibility: VideoMetadata['visibility']) => {
    const updated = videoStorageService.updateVideo(videoId, { visibility });
    if (updated) {
      loadVideos();
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'group': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'ultra': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only administrators can manage videos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Manager</h1>
          <p className="text-gray-600">Upload and manage videos with secure cloud storage</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <span>📹</span>
          <span>Upload Video</span>
        </button>
      </div>

      {/* Active Uploads */}
      {activeUploads.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Uploads</h2>
          <div className="space-y-4">
            {activeUploads.map(upload => (
              <div key={upload.videoId} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{upload.fileName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    upload.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                    upload.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    upload.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {upload.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{VideoUtils.formatFileSize(upload.uploadedBytes)} / {VideoUtils.formatFileSize(upload.totalBytes)}</span>
                  <span>{upload.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${upload.percentage}%` }}
                  ></div>
                </div>
                {upload.estimatedTimeRemaining && (
                  <div className="text-xs text-gray-500 mt-1">
                    Estimated time remaining: {Math.round(upload.estimatedTimeRemaining / 1000)}s
                  </div>
                )}
                {upload.error && (
                  <div className="text-xs text-red-600 mt-1">
                    Error: {upload.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Analytics */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Storage Analytics</h2>
        {(() => {
          const analytics = videoStorageService.getStorageAnalytics();
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalVideos}</div>
                <div className="text-sm text-gray-600">Total Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{VideoUtils.formatFileSize(analytics.totalSize)}</div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{VideoUtils.formatDuration(analytics.totalDuration)}</div>
                <div className="text-sm text-gray-600">Total Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{VideoUtils.formatFileSize(analytics.averageSize)}</div>
                <div className="text-sm text-gray-600">Avg Size</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Video thumbnail */}
            <div 
              className="h-48 bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors relative"
              onClick={() => setSelectedVideo(video)}
            >
              {video.thumbnailUrl ? (
                <img 
                  src={video.thumbnailUrl} 
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🎥</span>
                  <p className="text-gray-600 text-sm">Click to Preview</p>
                </div>
              )}
              
              {/* Quality badge */}
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(video.quality)}`}>
                {video.quality.toUpperCase()}
              </span>

              {/* Duration badge */}
              {video.duration && (
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {VideoUtils.formatDuration(video.duration)}
                </span>
              )}
            </div>
            
            {/* Video details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {video.originalName}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(video.visibility)}`}>
                  {video.visibility}
                </span>
              </div>
              
              {video.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
              )}

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mb-3">
                <div>{VideoUtils.formatFileSize(video.size)} • {video.width}x{video.height}</div>
                <div>Uploaded {video.uploadedAt.toLocaleDateString()}</div>
                <div>Accessed {video.accessCount} times</div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <select
                  value={video.visibility}
                  onChange={(e) => updateVideoVisibility(video.id, e.target.value as VideoMetadata['visibility'])}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="private">Private</option>
                  <option value="group">Group</option>
                  <option value="public">Public</option>
                </select>
                
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload Video</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : selectedFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div>
                      <span className="text-2xl mb-2 block">✅</span>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {VideoUtils.formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl mb-2 block">📹</span>
                      <p className="text-sm text-gray-600">
                        Drag and drop a video file here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports MP4, MOV, AVI, MKV, WebM (max 100MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={videoForm.tags}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="welcome, tutorial, announcement"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={videoForm.visibility}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, visibility: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="private">Private</option>
                    <option value="group">Group Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={videoForm.quality}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, quality: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low (480p)</option>
                    <option value="medium">Medium (720p)</option>
                    <option value="high">High (1080p)</option>
                    <option value="ultra">Ultra (4K)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Video Preview</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              {(() => {
                const videoUrl = videoStorageService.getStreamingUrl(selectedVideo.id);
                return videoUrl ? (
                  <VideoPlayer
                    videoUrl={videoUrl}
                    title={selectedVideo.originalName}
                    description={selectedVideo.description}
                    showControls={true}
                    onComplete={() => console.log('Video completed')}
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-600">Video not available</p>
                  </div>
                );
              })()}
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">File Size:</span>
                    <span className="ml-2 text-gray-900">{VideoUtils.formatFileSize(selectedVideo.size)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedVideo.duration ? VideoUtils.formatDuration(selectedVideo.duration) : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Resolution:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedVideo.width && selectedVideo.height 
                        ? `${selectedVideo.width}x${selectedVideo.height}` 
                        : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Quality:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(selectedVideo.quality)}`}>
                      {selectedVideo.quality.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Visibility:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(selectedVideo.visibility)}`}>
                      {selectedVideo.visibility}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Views:</span>
                    <span className="ml-2 text-gray-900">{selectedVideo.accessCount}</span>
                  </div>
                </div>
                
                {selectedVideo.tags.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedVideo.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoUploadManager;