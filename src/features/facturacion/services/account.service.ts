import { downloadApiFile } from '../../../core/api/api.config';

export const accountService = {
  downloadStatement: (): Promise<void> => downloadApiFile('/accounts/me/statement/pdf', 'SAGRISA_estado_de_cuenta.pdf'),
};
