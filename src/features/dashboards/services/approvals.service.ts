import { fetchApi } from '../../../core/api/api.config';

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
  decide: (id: string, decision: 'approve' | 'reject', comment?: string): Promise<ApprovalRequest> => fetchApi<ApprovalRequest>(`/approvals/${encodeURIComponent(id)}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision, comment }),
  }),
};
