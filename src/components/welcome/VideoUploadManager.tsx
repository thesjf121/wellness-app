import React, { useState, useRef } from 'react';
import { useMockAuth } from '../../context/MockAuthContext';
import VideoPlayer from './VideoPlayer';

interface WelcomeVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  isActive: boolean;
  category: 'welcome' | 'tutorial' | 'announcement';
}

const VideoUploadManager: React.FC = () => {
  const { user } = useMockAuth();
  const [videos, setVideos] = useState<WelcomeVideo[]>([
    {
      id: '1',
      title: 'Welcome to Your Wellness Journey',
      description: 'A personal welcome message from our wellness team',
      videoUrl: '/placeholder-video.mp4',
      uploadedBy: 'Admin',
      uploadedAt: new Date(),
      isActive: true,
      category: 'welcome'
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WelcomeVideo | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    category: 'welcome' as const,
    file: null as File | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has admin privileges
  const isAdmin = user?.role === 'super_admin' || user?.role === 'team_sponsor';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const maxSize = 100 * 1024 * 1024; // 100MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, WebM, or OGG)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 100MB');
        return;
      }

      setVideoForm(prev => ({ ...prev, file }));
    }
  };

  const simulateUpload = async (): Promise<string> => {
    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          // Return a placeholder URL - in real implementation this would be from your video hosting service
          resolve(`/videos/${Date.now()}.mp4`);
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!videoForm.file || !videoForm.title) {
      alert('Please fill in all required fields and select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // In a real implementation, you would upload to a service like AWS S3, Vimeo, or similar
      const videoUrl = await simulateUpload();

      const newVideo: WelcomeVideo = {
        id: Date.now().toString(),
        title: videoForm.title,
        description: videoForm.description,
        videoUrl,
        uploadedBy: user?.firstName || 'Admin',
        uploadedAt: new Date(),
        isActive: true,
        category: videoForm.category
      };

      setVideos(prev => [newVideo, ...prev]);
      setShowUploadModal(false);
      setVideoForm({
        title: '',
        description: '',
        category: 'welcome',
        file: null
      });

      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleVideoStatus = (videoId: string) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === videoId 
          ? { ...video, isActive: !video.isActive }
          : video
      )
    );
  };

  const deleteVideo = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'tutorial': return 'bg-green-100 text-green-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only administrators can manage welcome videos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Video Manager</h1>
          <p className="text-gray-600">Upload and manage welcome videos for new users</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <span>📹</span>
          <span>Upload Video</span>
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Video thumbnail placeholder */}
            <div 
              className="h-48 bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="text-center">
                <span className="text-4xl mb-2 block">🎥</span>
                <p className="text-gray-600 text-sm">Click to Preview</p>
              </div>
            </div>
            
            {/* Video details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
                  {video.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
              
              <div className="text-xs text-gray-500 mb-3">
                Uploaded by {video.uploadedBy} on {video.uploadedAt.toLocaleDateString()}
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  video.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {video.isActive ? 'Active' : 'Inactive'}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleVideoStatus(video.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {video.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
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
              <h3 className="text-xl font-bold text-gray-900">Upload Welcome Video</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter video title"
                  disabled={isUploading}
                />
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
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={videoForm.category}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUploading}
                >
                  <option value="welcome">Welcome</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File * (Max 100MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUploading}
                />
                {videoForm.file && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected: {videoForm.file.name} ({(videoForm.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {isUploading && (
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !videoForm.title || !videoForm.file}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
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
              <VideoPlayer
                videoUrl={selectedVideo.videoUrl}
                title={selectedVideo.title}
                description={selectedVideo.description}
                showControls={true}
                onComplete={() => console.log('Video completed')}
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedVideo.category)}`}>
                      {selectedVideo.category}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedVideo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedVideo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Uploaded by:</span>
                    <span className="ml-2 text-gray-900">{selectedVideo.uploadedBy}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="ml-2 text-gray-900">{selectedVideo.uploadedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploadManager;