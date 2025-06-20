import React, { useState, useEffect } from 'react';
import { Group, GroupMember } from '../../types/groups';
import { groupService } from '../../services/groupService';
import { GroupAnalytics } from './GroupAnalytics';
import { errorService } from '../../services/errorService';

interface SponsorDashboardProps {
  sponsorUserId: string;
}

export const SponsorDashboard: React.FC<SponsorDashboardProps> = ({ sponsorUserId }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'members' | 'settings'>('overview');

  useEffect(() => {
    loadSponsorGroups();
  }, [sponsorUserId]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers();
    }
  }, [selectedGroup]);

  const loadSponsorGroups = async () => {
    try {
      setLoading(true);
      const userGroups = await groupService.getUserGroups(sponsorUserId);
      
      // Filter to only groups where user is sponsor
      const sponsorGroups = userGroups.filter(group => group.sponsorId === sponsorUserId);
      setGroups(sponsorGroups);
      
      if (sponsorGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(sponsorGroups[0]);
      }
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SponsorDashboard.loadSponsorGroups',
        sponsorUserId
      });
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupMembers = async () => {
    if (!selectedGroup) return;
    
    try {
      const members = await groupService.getGroupMembers(selectedGroup.id);
      setGroupMembers(members);
    } catch (error) {
      errorService.logError(error as Error, {
        context: 'SponsorDashboard.loadGroupMembers',
        groupId: selectedGroup.id
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroup) return;
    
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await groupService.removeMember(selectedGroup.id, memberId, sponsorUserId);
      await loadGroupMembers(); // Refresh members list
      
      // Show success message
      alert('Member removed successfully');
    } catch (error) {
      alert('Failed to remove member: ' + (error as Error).message);
    }
  };

  const handleTransferOwnership = async (newSponsorId: string) => {
    if (!selectedGroup) return;
    
    if (!confirm('Are you sure you want to transfer ownership? This cannot be undone.')) return;
    
    try {
      await groupService.transferOwnership(selectedGroup.id, sponsorUserId, newSponsorId);
      await loadSponsorGroups(); // Refresh groups list
      
      alert('Ownership transferred successfully');
    } catch (error) {
      alert('Failed to transfer ownership: ' + (error as Error).message);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    
    if (!confirm(`Are you sure you want to delete "${selectedGroup.name}"? This cannot be undone and will remove all members.`)) return;
    
    try {
      await groupService.deleteGroup(selectedGroup.id, sponsorUserId);
      await loadSponsorGroups(); // Refresh groups list
      setSelectedGroup(null);
      
      alert('Group deleted successfully');
    } catch (error) {
      alert('Failed to delete group: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sponsor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={loadSponsorGroups}
          className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Groups Found</h2>
        <p className="text-gray-600 mb-4">You are not currently a sponsor of any groups.</p>
        <p className="text-sm text-gray-500">Create a group to access the sponsor dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsor Dashboard</h1>
          <p className="text-gray-600">Manage your {groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        
        {/* Group Selector */}
        {groups.length > 1 && (
          <div className="mt-4 md:mt-0">
            <select
              value={selectedGroup?.id || ''}
              onChange={(e) => {
                const group = groups.find(g => g.id === e.target.value);
                setSelectedGroup(group || null);
              }}
              className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.currentMemberCount}/{group.maxMembers})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedGroup && (
        <>
          {/* Group Info Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedGroup.name}</h2>
                <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>👥 {selectedGroup.currentMemberCount}/{selectedGroup.maxMembers} members</span>
                  <span>🔗 Code: {selectedGroup.inviteCode}</span>
                  <span>📅 Created {new Date(selectedGroup.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button
                  onClick={() => navigator.clipboard.writeText(selectedGroup.inviteCode)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  📋 Copy Code
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'members', label: 'Members', icon: '👥' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">👥 Members</h3>
                  <p className="text-2xl font-bold text-blue-600">{selectedGroup.currentMemberCount}</p>
                  <p className="text-sm text-gray-500">of {selectedGroup.maxMembers} maximum</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">📅 Group Age</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.floor((new Date().getTime() - new Date(selectedGroup.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-gray-500">days old</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">🔗 Invite Code</h3>
                  <p className="text-2xl font-bold text-purple-600">{selectedGroup.inviteCode}</p>
                  <p className="text-sm text-gray-500">share to invite</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Members</h3>
                <div className="space-y-3">
                  {groupMembers.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {member.role === 'sponsor' ? '👑' : '👤'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            User {member.userId.slice(-8)}
                            {member.role === 'sponsor' && ' (You)'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        member.role === 'sponsor' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <GroupAnalytics groupId={selectedGroup.id} isSponsor={true} />
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
                  <p className="text-sm text-gray-600">{groupMembers.length} total members</p>
                </div>
                <div className="space-y-3">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {member.role === 'sponsor' ? '👑' : '👤'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            User {member.userId.slice(-8)}
                            {member.role === 'sponsor' && ' (You)'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Joined {new Date(member.joinedAt).toLocaleDateString()} • 
                            Last active {new Date(member.lastActiveAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'sponsor' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role}
                        </span>
                        {member.role !== 'sponsor' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleTransferOwnership(member.userId)}
                              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            >
                              Make Sponsor
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <input
                      type="text"
                      value={selectedGroup.name}
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={selectedGroup.description}
                      readOnly
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={selectedGroup.inviteCode}
                        readOnly
                        className="block flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedGroup.inviteCode)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-red-800">Delete Group</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Permanently delete this group and remove all members. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteGroup}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SponsorDashboard;