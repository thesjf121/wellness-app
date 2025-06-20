import React, { useState } from 'react';
import { Group } from '../../types/groups';

interface InviteCodeCardProps {
  group: Group;
  isOwner: boolean;
}

export const InviteCodeCard: React.FC<InviteCodeCardProps> = ({ group, isOwner }) => {
  const [copied, setCopied] = useState(false);

  const formatInviteCode = (code: string) => {
    return `${code.slice(0, 3)}-${code.slice(3, 6)}`;
  };

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite code:', error);
    }
  };

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/groups/join?code=${group.inviteCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
    }
  };

  const shareViaEmail = () => {
    const subject = `Join my wellness group: ${group.name}`;
    const body = `Hi!

I'd like to invite you to join my wellness accountability group "${group.name}" on WellnessApp.

Group Description: ${group.description}

To join, use this invite code: ${group.inviteCode}

Or click this link: ${window.location.origin}/groups/join?code=${group.inviteCode}

Looking forward to supporting each other on our wellness journey!`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const shareViaSMS = () => {
    const message = `Join my wellness group "${group.name}"! Use code ${group.inviteCode} or visit ${window.location.origin}/groups/join?code=${group.inviteCode}`;
    const smsLink = `sms:?body=${encodeURIComponent(message)}`;
    window.location.href = smsLink;
  };

  if (!isOwner && !group.settings.allowMemberInvites) {
    return null; // Only show to owner if member invites are disabled
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Invite Others</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {group.currentMemberCount}/{group.maxMembers} members
        </span>
      </div>

      {group.currentMemberCount >= group.maxMembers ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">Group is Full</p>
          <p className="text-yellow-600 text-sm mt-1">
            This group has reached its maximum of {group.maxMembers} members.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Invite Code Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Invite Code
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-center">
                <div className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {formatInviteCode(group.inviteCode)}
                </div>
              </div>
              <button
                onClick={copyInviteCode}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                title="Copy invite code"
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this code with people you want to invite
            </p>
          </div>

          {/* Quick Share Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Share
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyInviteLink}
                className="flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded-lg text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Copy Link</span>
              </button>

              <button
                onClick={shareViaEmail}
                className="flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded-lg text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </button>

              <button
                onClick={shareViaSMS}
                className="flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded-lg text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>SMS</span>
              </button>

              {navigator.share && (
                <button
                  onClick={() => navigator.share({
                    title: `Join ${group.name}`,
                    text: `Join my wellness group "${group.name}" with code ${group.inviteCode}`,
                    url: `${window.location.origin}/groups/join?code=${group.inviteCode}`
                  })}
                  className="flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 py-2 px-3 rounded-lg text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>

          {/* Requirements Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">Requirements to Join</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 7 days of app activity (steps, food logging, etc.)</li>
              <li>• Complete all 8 training modules</li>
              <li>• Available spots: {group.maxMembers - group.currentMemberCount} remaining</li>
            </ul>
          </div>

          {copied && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-green-800 text-sm font-medium">✅ Copied to clipboard!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};