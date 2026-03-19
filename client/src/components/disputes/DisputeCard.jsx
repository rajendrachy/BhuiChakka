import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ne } from 'date-fns/locale';

const DisputeCard = ({ dispute, onClick }) => {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getPhaseColor = (phase) => {
    const colors = {
      filing: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-blue-100 text-blue-800',
      mediation: 'bg-indigo-100 text-indigo-800',
      survey: 'bg-teal-100 text-teal-800',
      hearing: 'bg-orange-100 text-orange-800',
      decision: 'bg-green-100 text-green-800'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border-l-4 border-l-red-500 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Case #{dispute.caseNumber}
            </h3>
            <p className="text-sm text-gray-500">
              Filed {formatDistanceToNow(new Date(dispute.createdAt), { 
                addSuffix: true,
                locale: ne 
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
              {dispute.priority}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(dispute.currentPhase)}`}>
              {dispute.currentPhase}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Complainant</p>
            <p className="text-sm font-medium">{dispute.complainant?.user?.name}</p>
            <p className="text-xs text-gray-600">{dispute.complainant?.role}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Respondent</p>
            <p className="text-sm font-medium">{dispute.respondent?.user?.name}</p>
            <p className="text-xs text-gray-600">{dispute.respondent?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Dispute Type</p>
            <p className="text-sm capitalize">{dispute.disputeType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Resolution Path</p>
            <p className="text-sm capitalize">{dispute.resolutionPath}</p>
          </div>
        </div>

        {dispute.deadline && (
          <div className="bg-yellow-50 p-3 rounded-lg flex items-center">
            <span className="text-yellow-800 text-sm">
              ⏰ Deadline: {new Date(dispute.deadline).toLocaleDateString('ne-NP')}
            </span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm text-gray-600">
            <span>📅 Next: {dispute.mediation?.sessions?.[0]?.date 
              ? new Date(dispute.mediation.sessions[0].date).toLocaleDateString()
              : 'Not scheduled'}
            </span>
            <span className="text-red-600 font-medium">
              Status: {dispute.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeCard;
