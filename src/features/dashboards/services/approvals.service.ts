import { fetchApi } from '../../../core/api/api.config';
import { trackEvent } from '../../../core/utils/appInsights';

export interface ApprovalRequest {
  id: string;
  customer: string;
  amount: number;
  reason: string;
  date: string;
  details: string;
  type: 'credit_limit' | 'order_approval';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}

export const approvalsService = {
  getPending: (): Promise<ApprovalRequest[]> => fetchApi<ApprovalRequest[]>('/approvals'),
  decide: async (id: string, decision: 'approve' | 'reject', comment?: string): Promise<ApprovalRequest> => {
    const result = await fetchApi<ApprovalRequest>(`/approvals/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    });
    trackEvent('approvals.decision', { approvalId: id, decision });
    return result;
  },
};
