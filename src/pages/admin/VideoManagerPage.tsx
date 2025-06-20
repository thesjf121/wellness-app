import React from 'react';
import VideoUploadManager from '../../components/welcome/VideoUploadManager';

const VideoManagerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <VideoUploadManager />
    </div>
  );
};

export default VideoManagerPage;