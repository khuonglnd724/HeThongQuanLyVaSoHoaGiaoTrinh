import React from 'react';
import { useApprovalQueue } from '../hooks';

export const ApprovalQueue = () => {
  const { approvals, loading } = useApprovalQueue();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Approval Queue</h1>
      
      {loading ? (
        <p>Loading approvals...</p>
      ) : (
        <div className="space-y-4">
          {approvals?.map(approval => (
            <div key={approval.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{approval.title}</h3>
                  <p className="text-gray-600 text-sm">From: {approval.requester}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
