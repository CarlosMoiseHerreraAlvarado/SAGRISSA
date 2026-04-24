import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, TrendingUp, PieChart, Map } from 'lucide-react';
import { MobilePage } from '../../../core/layout/MobilePage';
import { Skeleton } from '../../../core/ui/Skeleton';
import { getBusinessAnalytics, type BusinessAnalytics } from '../services/analytics.service';
import { reportsService } from '../services/reports.service';
import { FileDown, Loader2 } from 'lucide-react';

export default function DirectorAnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getBusinessAnalytics().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleExport = async (type: 'PDF' | 'XLSX') => {
    setIsExporting(true);
    await reportsService.downloadReport({
      id: 'analytics-export',
      title: 'Reporte_Ejecutivo_BI',
      type,
      size: type === 'PDF' ? '1.2MB' : '85KB',
      date: new Date().toLocaleDateString()
    });
    setIsExporting(false);
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
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Business Analytics</h1>
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Visión Ejecutiva Regional</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => handleExport('PDF')}
             disabled={isExporting}
             className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
             title="Exportar PDF"
           >
             {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
           </button>
           <button 
             onClick={() => handleExport('XLSX')}
             disabled={isExporting}
             className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all"
           >
             {isExporting ? 'Procesando...' : 'Excel'}
           </button>
        </div>
      </header>

      <div className="flex flex-col gap-8 px-6 md:px-0 z-10 relative pb-24">
        
        {/* Map Placeholder / Geo Analytics - Consistent Light Style */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 min-h-[350px] relative overflow-hidden flex flex-col justify-between shadow-sm">
           <div className="z-10">
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Distribución de Ventas</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">Presencia Regional</h3>
           </div>
           
           <div className="z-10 flex-1 flex items-center justify-center py-10">
              <Map size={80} className="text-slate-100" strokeWidth={1} />
           </div>

           <div className="z-10 grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
              {loading || !data ? (
                <>
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                </>
              ) : (
                data.regionalSales.map((region, idx) => (
                  <div key={idx}>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{region.region}</p>
                    <p className="text-sm font-black text-slate-800">${(region.amount / 1000000).toFixed(1)}M</p>
                  </div>
                ))
              )}
           </div>
        </div>


        {/* Charts Grid Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <TrendingUp size={20} />
                 </div>
                 <span className="font-black text-[13px] text-slate-800 uppercase tracking-widest">Tendencia Semestral</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                 {loading || !data ? (
                   <Skeleton width={100} height={100} className="rounded-full" />
                 ) : (
                   <div className="w-full flex flex-col gap-3 mt-4">
                     {data.sixMonthTrend.slice(-4).map((trend, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-slate-400 w-8">{trend.period}</span>
                         <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                           <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(trend.value / 1000000) * 100}%` }} />
                         </div>
                         <span className="text-[10px] font-black text-slate-800">${(trend.value / 1000).toFixed(0)}k</span>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
           </div>

           <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <PieChart size={20} />
                 </div>
                 <span className="font-black text-[13px] text-slate-800 uppercase tracking-widest">Participación Familias</span>
              </div>
              <div className="flex-1 flex flex-col justify-center py-4">
                 {loading || !data ? (
                   <Skeleton width={100} height={100} className="rounded-full mx-auto" />
                 ) : (
                   <div className="flex flex-col gap-3">
                     {data.productMix.map((mix, idx) => (
                       <div key={idx} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-brand-blue" style={{ opacity: 1 - (idx * 0.2) }} />
                           <span className="text-[11px] font-bold text-slate-600">{mix.category}</span>
                         </div>
                         <span className="text-[11px] font-black text-slate-800">{mix.percentage}%</span>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Metric Insights */}
        <div className="bg-brand-blue/5 border border-brand-blue/10 p-8 rounded-[40px] flex flex-col gap-4">
           <div className="flex items-center gap-2">
              <Globe size={16} className="text-brand-blue" />
              <span className="text-[11px] font-black text-brand-blue uppercase tracking-widest">Global Insights</span>
           </div>
           {loading || !data ? (
              <Skeleton height={60} />
           ) : (
              <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">
                "{data.globalInsight}"
              </p>
           )}
        </div>

      </div>

      <svg className="absolute bottom-[5%] right-6 w-2 h-40 pointer-events-none opacity-20" viewBox="0 0 10 100" fill="none">
        <line x1="5" y1="0" x2="5" y2="100" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>
    </MobilePage>
  );
}
