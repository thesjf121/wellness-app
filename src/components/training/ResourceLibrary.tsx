import React, { useState, useEffect } from 'react';
import { ModuleResource, TrainingModule } from '../../types/training';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';

interface ResourceLibraryProps {
  userId: string;
  moduleId?: string;
  onClose?: () => void;
}

interface ResourceCategory {
  name: string;
  icon: string;
  resources: ModuleResource[];
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({
  userId,
  moduleId,
  onClose
}) => {
  const [resources, setResources] = useState<ModuleResource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadResources();
  }, [moduleId]);

  const loadResources = () => {
    setLoading(true);
    try {
      const modules = wellnessTrainingService.getTrainingModules();
      let allResources: ModuleResource[] = [];

      if (moduleId) {
        // Get resources for specific module
        const module = modules.find(m => m.id === moduleId);
        if (module) {
          allResources = module.resources || [];
        }
      } else {
        // Get all resources from all modules
        modules.forEach(module => {
          if (module.resources) {
            allResources = [...allResources, ...module.resources];
          }
        });
      }

      setResources(allResources);
      organizeByCategory(allResources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeByCategory = (resources: ModuleResource[]) => {
    const categoryMap: { [key: string]: ResourceCategory } = {
      template: { name: 'Templates', icon: '📄', resources: [] },
      guide: { name: 'Guides', icon: '📚', resources: [] },
      worksheet: { name: 'Worksheets', icon: '📝', resources: [] },
      checklist: { name: 'Checklists', icon: '✅', resources: [] },
      planner: { name: 'Planners', icon: '📅', resources: [] },
      audio: { name: 'Audio', icon: '🎧', resources: [] },
      video: { name: 'Videos', icon: '📹', resources: [] }
    };

    resources.forEach(resource => {
      if (categoryMap[resource.type]) {
        categoryMap[resource.type].resources.push(resource);
      }
    });

    const categoriesArray = Object.values(categoryMap).filter(cat => cat.resources.length > 0);
    setCategories(categoriesArray);
  };

  const filteredResources = () => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.type === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleDownload = async (resource: ModuleResource) => {
    try {
      setDownloadProgress({ ...downloadProgress, [resource.id]: 0 });

      // Simulate download progress (in real app, this would track actual download)
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          const current = prev[resource.id] || 0;
          if (current >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [resource.id]: current + 20 };
        });
      }, 200);

      // Track download in service
      await wellnessTrainingService.trackResourceDownload(userId, resource.id);

      // In real app, this would trigger actual file download
      setTimeout(() => {
        alert(`Downloaded: ${resource.title}\n\nNote: In production, this would download the actual file.`);
        setDownloadProgress(prev => {
          const { [resource.id]: _, ...rest } = prev;
          return rest;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to download resource:', error);
      alert('Failed to download resource. Please try again.');
    }
  };

  const getResourceIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      template: '📄',
      guide: '📚',
      worksheet: '📝',
      checklist: '✅',
      planner: '📅',
      audio: '🎧',
      video: '📹'
    };
    return icons[type] || '📎';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isModal = !!onClose;

  return (
    <div className={isModal ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" : ""}>
      <div className={isModal ? "bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" : "space-y-6"}>
        {/* Header */}
        <div className={isModal ? "flex items-center justify-between p-6 border-b border-gray-200" : "bg-white p-6 rounded-lg border border-gray-200"}>
          <h2 className="text-xl font-semibold text-gray-900">
            📚 Resource Library
          </h2>
          {isModal && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className={isModal ? "p-6 border-b border-gray-200" : "bg-white p-6 rounded-lg border border-gray-200"}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({resources.length})
              </button>
              
              {categories.map(category => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.resources[0].type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.resources[0].type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name} ({category.resources.length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className={isModal ? "flex-1 overflow-y-auto p-6" : "bg-white p-6 rounded-lg border border-gray-200"}>
          {filteredResources().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <p className="text-gray-600">No resources found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources().map(resource => (
                <div
                  key={resource.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {downloadProgress[resource.id] !== undefined ? (
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Downloading...</span>
                          <span>{downloadProgress[resource.id]}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${downloadProgress[resource.id]}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(resource)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <span>📥</span>
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className={isModal ? "border-t border-gray-200 p-4 bg-gray-50" : "bg-white p-4 rounded-lg border border-gray-200"}>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredResources().length} of {resources.length} resources
            </span>
            <span>
              💡 Tip: Download resources to access them offline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLibrary;