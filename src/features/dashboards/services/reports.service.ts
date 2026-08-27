import { downloadApiFile, fetchApi } from '../../../core/api/api.config';

export interface ReportItem {
  id: string;
  title: string;
  type: 'PDF' | 'XLSX' | 'CSV';
  size: string;
  date: string;
}

export const reportsService = {
  getReports: async (): Promise<ReportItem[]> => (await fetchApi<ReportItem[]>('/reports')).map(item => ({ ...item, type: 'CSV' as const })),

  downloadReport: (report: ReportItem): Promise<void> => downloadApiFile(
    `/reports/${encodeURIComponent(report.id)}/download`,
    `SAGRISA_${report.title.replace(/\s+/g, '_')}.csv`,
  ),
};
