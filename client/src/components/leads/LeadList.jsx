import { useEffect, useState } from 'react';
import { leadApi } from '../../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import LeadForm from './LeadForm';

// Modal component for viewing lead details
const ViewLeadModal = ({ lead, isOpen, onClose }) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{lead.name}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">Email: {lead.email}</p>
            <p className="text-sm text-gray-500">Phone: {lead.phone}</p>
            <p className="text-sm text-gray-500">Status: {lead.status}</p>
            <p className="text-sm text-gray-500">Notes: {lead.notes || 'N/A'}</p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              onClick={onClose}
              className="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadList = () => {
  const [allLeads, setAllLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewLead, setViewLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemsPerPage = 5;

  // Fetch all leads on component mount
  useEffect(() => {
    const fetchAllLeads = async () => {
      try {
        setLoading(true);
        // Fetch all leads without pagination from the server
        const data = await leadApi.getLeads(1, 1000, ''); // Fetch all leads (adjust 1000 based on your needs)
        setAllLeads(data.data || []);
        setTotalLeads(data.totalItems || data.count || 0);
        setFilteredLeads(data.data || []);
        setTotalPages(Math.ceil((data.totalItems || data.count || 0) / itemsPerPage));
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error(error.message || 'Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };

    fetchAllLeads();
  }, []);

  // Apply client-side filtering when statusFilter changes
  useEffect(() => {
    if (!statusFilter) {
      setFilteredLeads(allLeads);
      setTotalPages(Math.ceil(allLeads.length / itemsPerPage));
      setCurrentPage(1);
      return;
    }

    const filtered = allLeads.filter(lead => lead.status === statusFilter);
    setFilteredLeads(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [statusFilter, allLeads]);

  // Get current leads for pagination
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadApi.updateLead(leadId, { status: newStatus });
      toast.success('Lead status updated successfully');
      
      // Update the local state instead of refetching
      setAllLeads(prevLeads => 
        prevLeads.map(lead => 
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const handleLeadSaved = () => {
    setIsEditModalOpen(false);
    setEditingLead(null);
    const fetchAllLeads = async () => {
      try {
        setLoading(true);
        // Fetch all leads without pagination from the server
        const data = await leadApi.getLeads(1, 1000, ''); // Fetch all leads (adjust 1000 based on your needs)
        setAllLeads(data.data || []);
        setTotalLeads(data.totalItems || data.count || 0);
        setFilteredLeads(data.data || []);
        setTotalPages(Math.ceil((data.totalItems || data.count || 0) / itemsPerPage));
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error(error.message || 'Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };

    fetchAllLeads();
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadApi.deleteLead(leadId);
        toast.success('Lead deleted successfully');
        // If we're on the last page with only one item, go to previous page
        if (currentLeads.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          const fetchAllLeads = async () => {
            try {
              setLoading(true);
              // Fetch all leads without pagination from the server
              const data = await leadApi.getLeads(1, 1000, ''); // Fetch all leads (adjust 1000 based on your needs)
              setAllLeads(data.data || []);
              setTotalLeads(data.totalItems || data.count || 0);
              setFilteredLeads(data.data || []);
              setTotalPages(Math.ceil((data.totalItems || data.count || 0) / itemsPerPage));
            } catch (error) {
              console.error('Error fetching leads:', error);
              toast.error(error.message || 'Failed to fetch leads');
            } finally {
              setLoading(false);
            }
          };

          fetchAllLeads();
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleViewLead = (lead) => {
    setViewLead(lead);
    setIsViewModalOpen(true);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && allLeads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Leads</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
            {statusFilter && ` (${allLeads.length} total)`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Link
            to="/leads/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Lead
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Phone
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLeads.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? 'Loading...' : 'No leads found'}
                </td>
              </tr>
            ) : (
              currentLeads.map((lead) => (
                <tr key={lead._id || lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id || lead.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(lead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => handleViewLead(lead)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead._id || lead.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
                </span>{' '}
                of <span className="font-medium">{filteredLeads.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {isViewModalOpen && (
        <ViewLeadModal 
          lead={viewLead} 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
        />
      )}

      {/* Edit Lead Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingLead(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Lead</h2>
            <LeadForm 
              leadId={editingLead?._id} 
              onSuccess={handleLeadSaved}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingLead(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
