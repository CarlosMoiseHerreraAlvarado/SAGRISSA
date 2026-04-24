import { fetchApi } from '../../../core/api/api.config';

export interface ReportItem {
  id: string;
  title: string;
  type: 'PDF' | 'XLSX';
  size: string;
  date: string;
}

const MOCK_REPORTS: ReportItem[] = [
  { id: '1', title: 'Cierre Mensual Consolidado', type: 'PDF', size: '2.4 MB', date: '01 Abr 2026' },
  { id: '2', title: 'Matriz de Ventas por Vendedor', type: 'XLSX', size: '1.1 MB', date: '21 Abr 2026' },
  { id: '3', title: 'Análisis de Cartera Vencida', type: 'PDF', size: '3.8 MB', date: '15 Abr 2026' },
  { id: '4', title: 'Inventario Crítico Regional', type: 'XLSX', size: '0.9 MB', date: '22 Abr 2026' },
];

export const reportsService = {
  getReports: async (): Promise<ReportItem[]> => {
    try {
      return await fetchApi<ReportItem[]>('/reports');
    } catch (e) {
      console.warn('[API] Fallback to mock data for reports list');
      await new Promise(r => setTimeout(r, 800));
      return MOCK_REPORTS;
    }
  },

  downloadReport: async (report: ReportItem): Promise<void> => {
    // Simulando latencia de generación de archivo en el servidor
    await new Promise(r => setTimeout(r, 1200));
    
    // Generación de un Blob real para que el navegador dispare el gestor de descargas
    const content = `Documento generado automáticamente por SAGRISA.\nReporte: ${report.title}\nFecha: ${report.date}\nEste es un archivo de prueba (Mock) del entorno de desarrollo.`;
    
    const blobType = report.type === 'PDF' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
    const blob = new Blob([content], { type: blobType });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAGRISA_${report.title.replace(/\s+/g, '_')}.${report.type.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};
