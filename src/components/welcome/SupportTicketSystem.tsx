import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'account' | 'feature' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
  attachments?: TicketAttachment[];
}

interface TicketResponse {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'user' | 'support' | 'admin';
  message: string;
  createdAt: Date;
  isInternal?: boolean;
}

interface TicketAttachment {
  id: string;
  filename: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
}

const SupportTicketSystem: React.FC = () => {
  const { user } = useUser();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const
  });
  const [newResponse, setNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-tickets' | 'create' | 'faq'>('my-tickets');

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = () => {
    // Load tickets from localStorage (simulated backend)
    const stored = localStorage.getItem('support_tickets');
    const allTickets = stored ? JSON.parse(stored) : [];
    
    // Filter user's tickets
    const userTickets = allTickets.filter((ticket: SupportTicket) => ticket.userId === user?.id);
    setTickets(userTickets);
  };

  const saveTickets = (updatedTickets: SupportTicket[]) => {
    // Get all tickets and update with new data
    const stored = localStorage.getItem('support_tickets');
    const allTickets = stored ? JSON.parse(stored) : [];
    
    // Remove old user tickets and add updated ones
    const otherTickets = allTickets.filter((ticket: SupportTicket) => ticket.userId !== user?.id);
    const newAllTickets = [...otherTickets, ...updatedTickets];
    
    localStorage.setItem('support_tickets', JSON.stringify(newAllTickets));
    setTickets(updatedTickets);
  };

  const createTicket = async () => {
    if (!user || !newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket: SupportTicket = {
        id: Date.now().toString(),
        userId: user.id,
        subject: newTicket.subject.trim(),
        description: newTicket.description.trim(),
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: [
          {
            id: `${Date.now()}_1`,
            ticketId: Date.now().toString(),
            authorId: user.id,
            authorName: user.firstName || 'User',
            authorType: 'user',
            message: newTicket.description.trim(),
            createdAt: new Date()
          }
        ]
      };

      const updatedTickets = [...tickets, ticket];
      saveTickets(updatedTickets);

      // Reset form
      setNewTicket({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      setShowCreateForm(false);
      setActiveTab('my-tickets');

      // Auto-response from support (simulate)
      setTimeout(() => {
        addAutoResponse(ticket.id);
      }, 2000);

    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAutoResponse = (ticketId: string) => {
    const autoResponse: TicketResponse = {
      id: `${Date.now()}_auto`,
      ticketId,
      authorId: 'support',
      authorName: 'Wellness Support Team',
      authorType: 'support',
      message: 'Thank you for contacting us! We\'ve received your request and our team will review it shortly. Most tickets are responded to within 24 hours during business days.',
      createdAt: new Date()
    };

    const updatedTickets = tickets.map(ticket => 
      ticket.id === ticketId
        ? {
            ...ticket,
            status: 'in_progress' as const,
            responses: [...ticket.responses, autoResponse],
            updatedAt: new Date()
          }
        : ticket
    );

    saveTickets(updatedTickets);
  };

  const addResponse = async () => {
    if (!selectedTicket || !newResponse.trim() || !user) return;

    const response: TicketResponse = {
      id: `${Date.now()}_${Math.random()}`,
      ticketId: selectedTicket.id,
      authorId: user.id,
      authorName: user.firstName || 'User',
      authorType: 'user',
      message: newResponse.trim(),
      createdAt: new Date()
    };

    const updatedTickets = tickets.map(ticket => 
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            responses: [...ticket.responses, response],
            updatedAt: new Date(),
            status: ticket.status === 'waiting' ? 'in_progress' as const : ticket.status
          }
        : ticket
    );

    saveTickets(updatedTickets);
    setSelectedTicket(prev => prev ? {
      ...prev,
      responses: [...prev.responses, response],
      updatedAt: new Date()
    } : null);
    setNewResponse('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return '🔧';
      case 'account': return '👤';
      case 'feature': return '💡';
      case 'general': return '❓';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Support Center</h1>
        <p className="text-xl text-gray-600">
          Need help? We're here to support your wellness journey.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'my-tickets', label: 'My Tickets', count: tickets.length },
              { key: 'create', label: 'Create Ticket', count: null },
              { key: 'faq', label: 'FAQ', count: null }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    tab.count > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* My Tickets Tab */}
          {activeTab === 'my-tickets' && (
            <div>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📧</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't created any support tickets. If you need help, create a new ticket.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Create Your First Ticket
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your Support Tickets</h2>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Create New Ticket
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-xl">{getCategoryIcon(ticket.category)}</span>
                              <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                              <span>Updated: {ticket.updatedAt.toLocaleDateString()}</span>
                              <span>{ticket.responses.length} responses</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Ticket Tab */}
          {activeTab === 'create' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Support Ticket</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">General Question</option>
                      <option value="technical">Technical Issue</option>
                      <option value="account">Account Problem</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    placeholder="Please provide as much detail as possible about your issue or question. Include steps to reproduce any technical problems."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Tips for faster support:</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Be specific about what you were trying to do when the issue occurred</li>
                    <li>• Include any error messages you saw</li>
                    <li>• Mention your device type (phone, tablet, computer) and operating system</li>
                    <li>• Let us know if this is a recurring issue or happened just once</li>
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setActiveTab('my-tickets')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTicket}
                    disabled={isSubmitting || !newTicket.subject.trim() || !newTicket.description.trim()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    question: "How do I reset my password?",
                    answer: "You can reset your password by clicking 'Forgot Password' on the login page. We'll send you a reset link via email."
                  },
                  {
                    question: "Why aren't my steps syncing?",
                    answer: "Make sure you've granted health data permissions and that your health app is running in the background. Try refreshing the app or logging out and back in."
                  },
                  {
                    question: "How do I join a wellness group?",
                    answer: "You need to be active for 7 days and complete all training modules before you can join groups. Once eligible, you'll see group options in the Groups section."
                  },
                  {
                    question: "Can I change my goals after setting them?",
                    answer: "Yes! You can adjust your goals anytime from your Profile page. We recommend reviewing and updating them monthly."
                  },
                  {
                    question: "How do I export my data?",
                    answer: "Data export is available in your Profile settings. You can download your activity, nutrition, and progress data in CSV format."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-700 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Create a Support Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="text-sm text-gray-500">#{selectedTicket.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Responses */}
              <div className="space-y-4 mb-6">
                {selectedTicket.responses.map(response => (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg ${
                      response.authorType === 'user' 
                        ? 'bg-blue-50 ml-8' 
                        : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{response.authorName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          response.authorType === 'user' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {response.authorType}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {response.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{response.message}</p>
                  </div>
                ))}
              </div>
              
              {/* Add Response */}
              {selectedTicket.status !== 'closed' && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Add Response</h4>
                  <textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    rows={4}
                    placeholder="Type your response..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={addResponse}
                      disabled={!newResponse.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketSystem;