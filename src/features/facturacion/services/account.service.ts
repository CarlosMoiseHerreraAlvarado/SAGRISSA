import { downloadApiFile, fetchApi } from '../../../core/api/api.config';

export const accountService = {
  downloadStatement: (): Promise<void> => downloadApiFile('/accounts/me/statement/pdf', 'SAGRISA_estado_de_cuenta.pdf'),
  sendByEmail: (email: string): Promise<void> => fetchApi<void>('/accounts/me/statement/email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
};
