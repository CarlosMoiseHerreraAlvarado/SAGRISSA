import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Search, FileSpreadsheet, FileBarChart, FileText, Loader2 } from 'lucide-react';

import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';
import { reportsService, type ReportItem } from '../services/reports.service';

export default function DirectorReportesPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    reportsService.getReports().then(data => {
      if (mounted) {
        setReports(data);
        setLoading(false);
      }
    }).catch(caught => { if (mounted) setError(caught instanceof Error ? caught.message : 'No fue posible cargar los reportes.'); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleDownload = async (report: ReportItem) => {
    if (downloadingId) return;
    setDownloadingId(report.id);
    try {
      await reportsService.downloadReport(report);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible descargar el reporte.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <MobilePage>
      {/* Pattern Background strictly following brand guidelines */}
      <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-40 z-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
      </svg>

      <header className="px-6 md:px-0 pt-16 md:pt-0 pb-6 flex items-center gap-4 z-10 relative">

        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Reportes Ejecutivos</h1>
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Descargas y Documentación</p>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 md:px-0 z-10 relative pb-24">
        {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        
        {/* Search & Filter */}
        <div className="flex gap-2">
           <div className="flex-1 flex items-center bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/15 transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Buscar reporte..." className="w-full text-sm font-bold bg-transparent outline-none placeholder:text-slate-200" />
           </div>
           <button className="bg-white border border-slate-100 p-3.5 rounded-2xl text-slate-400 hover:text-brand-blue shadow-sm">
              <Filter size={18} />
           </button>
        </div>

        {/* Report List */}
        <div className="flex flex-col gap-3">
           {loading ? (
             Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-[24px]" />)
           ) : (
             reports.map((report) => (
               <div key={report.id} className="bg-white border border-slate-50 p-5 rounded-[24px] shadow-sm flex items-center justify-between group hover:border-brand-blue/20 transition-all">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${report.type === 'XLSX' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                        {report.type === 'XLSX' ? <FileSpreadsheet size={22} /> : <FileBarChart size={22} />}
                     </div>
                     <div className="flex flex-col">
                        <h4 className="text-[13px] font-black text-slate-800">{report.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</span>
                           <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded bg-slate-200 uppercase">{report.type}</span>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(report)}
                    disabled={downloadingId !== null}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-blue hover:bg-brand-blue/10 transition-all disabled:opacity-50"
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

        {/* Subscription Info */}
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl mt-4">
           <div className="z-10 relative">
              <h3 className="font-black text-[16px] mb-2 uppercase tracking-widest text-brand-blue">Envío Automático</h3>
              <p className="text-[12px] font-medium text-white/50 leading-relaxed">
                Recibe los reportes de cierre de mes directamente en tu correo corporativo.
              </p>
              <button className="mt-6 bg-brand-blue text-white py-3 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-brand-blue/20">
                Configurar Suscripción
              </button>
           </div>
           <FileText className="absolute bottom-[-20px] right-[-20px] text-white/5 w-32 h-32" />
        </div>

      </div>

      <svg className="absolute bottom-[20%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
