import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import DocumentCard from '../components/documents/DocumentCard';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';
import DocumentViewer from '../components/documents/DocumentViewer';
import toast from 'react-hot-toast';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    verified: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters, searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        search: searchTerm
      }).toString();
      const response = await axios.get(`/api/documents?${queryParams}`);
      setDocuments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: documents.length,
    verified: documents.filter(d => d.isVerified).length,
    pending: documents.filter(d => !d.isVerified).length,
    lalpurja: documents.filter(d => d.documentType === 'lalpurja').length
  };

  const documentTypes = [
    { value: 'lalpurja', label: 'Lalpurja', icon: '📄' },
    { value: 'survey_map', label: 'Survey Map', icon: '🗺️' },
    { value: 'tax_receipt', label: 'Tax Receipt', icon: '💰' },
    { value: 'citizenship', label: 'Citizenship', icon: '🪪' },
    { value: 'deed', label: 'Deed', icon: '📜' },
    { value: 'court_order', label: 'Court Order', icon: '⚖️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <XCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Lalpurja</p>
                <p className="text-2xl font-bold text-purple-600">{stats.lalpurja}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <select
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              value={filters.verified}
              onChange={(e) => setFilters({...filters, verified: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload your first document to get started.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onClick={() => setSelectedDocument(doc)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchDocuments();
            setShowUploadModal(false);
          }}
        />
      )}

      {/* Document Viewer */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onVerify={() => fetchDocuments()}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
