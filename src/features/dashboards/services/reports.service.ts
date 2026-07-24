import { downloadApiFile, fetchApi } from '../../../core/api/api.config';

export interface ReportItem {
  id: string;
  title: string;
  type: 'PDF' | 'XLSX';
  size: string;
  date: string;
}

export const reportsService = {
  getReports: (): Promise<ReportItem[]> => fetchApi<ReportItem[]>('/reports'),

  downloadReport: (report: ReportItem): Promise<void> => downloadApiFile(
    `/reports/${encodeURIComponent(report.id)}/download`,
    `SAGRISA_${report.title.replace(/\s+/g, '_')}.${report.type.toLowerCase()}`,
  ),
};
