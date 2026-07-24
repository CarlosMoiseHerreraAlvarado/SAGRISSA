import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Search, FileSpreadsheet, FileBarChart, Loader2, CheckCircle } from 'lucide-react';

import { Skeleton } from '../../../core/ui/Skeleton';
import { reportsService, type ReportItem } from '../services/reports.service';

export default function VendedorReportesPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsService.getReports().then(data => {
      // Filtrar o adaptar reportes específicos para el vendedor si fuera necesario
      setReports(data);
      setLoading(false);
    }).catch(caught => setError(caught instanceof Error ? caught.message : 'No fue posible cargar los reportes.')).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (report: ReportItem) => {
    if (downloadingId) return;
    setDownloadingId(report.id);
    try {
      await reportsService.downloadReport(report);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible descargar el reporte.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white md:bg-transparent pb-20 md:pb-10">
      <div className="w-full h-full xl:max-w-4xl mx-auto flex flex-col relative md:pt-6 md:px-8">
        
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Reporte descargado con éxito</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 px-6 md:px-0">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-blue shadow-sm transition-all md:hidden">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-black text-xl text-slate-800 tracking-tight">Mis Reportes</h2>
            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Ventas y Gestión Individual</p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 md:px-0 mb-8 flex gap-3">
          <div className="flex-1 flex items-center bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
             <Search size={18} className="text-slate-300 mr-2" />
             <input type="text" placeholder="Buscar documento..." className="w-full text-sm font-bold bg-transparent outline-none" />
          </div>
          <button className="bg-white border border-slate-100 p-4 rounded-2xl text-slate-400">
             <Filter size={18} />
          </button>
        </div>

        {/* Report Cards */}
        {error && <p role="alert" className="mx-4 mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-0">
          {loading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white border border-slate-50 p-6 rounded-[32px] shadow-sm flex items-center justify-between group hover:border-brand-blue/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${report.type === 'XLSX' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                    {report.type === 'XLSX' ? <FileSpreadsheet size={22} /> : <FileBarChart size={22} />}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-slate-800 mb-1">{report.title}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.date} · {report.size}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(report)}
                  disabled={downloadingId !== null}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-blue hover:bg-brand-blue/10 transition-all"
                >
                  {downloadingId === report.id ? (
                    <Loader2 size={18} className="animate-spin text-brand-blue" />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Floating Decoration */}
        <svg className="absolute top-[40%] -right-10 w-40 h-40 pointer-events-none opacity-10 z-0" viewBox="0 0 100 100" fill="none">
          <path d="M 0 50 Q 50 100 100 50" stroke="#00A9F4" strokeWidth="2" strokeDasharray="10 10" />
        </svg>

      </div>
    </div>
  );
}
