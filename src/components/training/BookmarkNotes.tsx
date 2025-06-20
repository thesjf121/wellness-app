import React, { useState, useEffect } from 'react';
import { ModuleBookmark, ModuleNote } from '../../types/training';
import { wellnessTrainingService } from '../../services/wellnessTrainingService';

interface BookmarkNotesProps {
  userId: string;
  moduleId: string;
  sectionId?: string;
  contentId?: string;
  onClose?: () => void;
}

export const BookmarkNotes: React.FC<BookmarkNotesProps> = ({
  userId,
  moduleId,
  sectionId,
  contentId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<ModuleBookmark[]>([]);
  const [notes, setNotes] = useState<ModuleNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarksAndNotes();
  }, [userId, moduleId]);

  const loadBookmarksAndNotes = async () => {
    setLoading(true);
    try {
      const userBookmarks = await wellnessTrainingService.getUserBookmarks(userId, moduleId);
      const userNotes = await wellnessTrainingService.getUserNotes(userId, moduleId);
      
      setBookmarks(userBookmarks);
      setNotes(userNotes);
    } catch (error) {
      console.error('Failed to load bookmarks and notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookmark = async () => {
    if (!sectionId) return;

    try {
      const bookmark = await wellnessTrainingService.addBookmark(
        userId,
        moduleId,
        sectionId,
        contentId || '',
        `Section bookmark`
      );
      
      setBookmarks([bookmark, ...bookmarks]);
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      alert('Failed to add bookmark. Please try again.');
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await wellnessTrainingService.removeBookmark(bookmarkId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      alert('Failed to remove bookmark. Please try again.');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const note = await wellnessTrainingService.addNote(
        userId,
        moduleId,
        sectionId || '',
        newNote
      );
      
      setNotes([note, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingContent.trim()) return;

    try {
      const updated = await wellnessTrainingService.updateNote(noteId, editingContent);
      setNotes(notes.map(n => n.id === noteId ? updated : n));
      setEditingNote(null);
      setEditingContent('');
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await wellnessTrainingService.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const isInline = !onClose;

  if (loading && !isInline) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const content = (
    <>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'bookmarks'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📌 Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'notes'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📝 Notes ({notes.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'bookmarks' ? (
        <div className="space-y-4">
          {/* Add Bookmark Button (only if sectionId provided) */}
          {sectionId && (
            <button
              onClick={handleAddBookmark}
              className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
            >
              + Add Bookmark for Current Section
            </button>
          )}

          {/* Bookmarks List */}
          {bookmarks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📌</div>
              <p className="text-gray-600">No bookmarks yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Bookmark important sections to easily find them later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {bookmark.title || `Section ${bookmark.sectionId}`}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Module {bookmark.moduleId.replace('module_', '')}
                        {bookmark.sectionId && ` • Section ${bookmark.sectionId.replace('section_', '')}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(bookmark.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add Note Form */}
          <div className="space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note about this section..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                newNote.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add Note
            </button>
          </div>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <p className="text-gray-600">No notes yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Add notes to capture your thoughts and insights
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(null);
                            setEditingContent('');
                          }}
                          className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          {formatDate(note.createdAt)}
                          {note.updatedAt && note.updatedAt !== note.createdAt && (
                            <span className="ml-2">(edited)</span>
                          )}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingNote(note.id);
                              setEditingContent(note.content);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  // Modal view
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Bookmarks & Notes
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Inline view
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        My Bookmarks & Notes
      </h3>
      {content}
    </div>
  );
};

export default BookmarkNotes;