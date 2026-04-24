import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Loader2 } from 'lucide-react';
import { StatCard } from '../../../core/ui/StatCard';
import { AgingCard } from '../../../core/ui/AgingCard';
import { Skeleton } from '../../../core/ui/Skeleton';
import { useAuth } from '../../../core/hooks/useAuth';
import { accountService } from '../services/account.service';

interface AccountData {
  totalDebt: number;
  availableCredit: number;
  pendingInvoices: number;
  openOrders: number;
  daysToPay: number;
  creditTerm: number;
  lastPayment: number;
  lastPaymentDate: string;
  creditLine: number;
  aging: { range: string; amount: number }[];
}

const MOCK_ACCOUNT_DATA: AccountData = {
  totalDebt: 580000,
  availableCredit: 420000,
  pendingInvoices: 3,
  openOrders: 2,
  daysToPay: 24,
  creditTerm: 30,
  lastPayment: 2971.02,
  lastPaymentDate: '2022-05-16',
  creditLine: 1000000,
  aging: [
    { range: '0 a 30 días', amount: 350000 },
    { range: '31 a 60 días', amount: 130000 },
    { range: '61 a 90 días', amount: 80000 },
    { range: '91 a 120 días', amount: 20000 },
    { range: 'Más de 120 días', amount: 0.01 },
  ],
};

export default function AccountCliente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [accountData, setAccountData] = useState<AccountData>(MOCK_ACCOUNT_DATA);

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) {
        setAccountData(MOCK_ACCOUNT_DATA);
        setLoading(false);
      }
    }, 800);
    return () => { mounted = false; };
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    await accountService.downloadStatement(user?.name || 'Cliente');
    setIsDownloading(false);
  };

  const handleEmail = async () => {
    setIsSending(true);
    await accountService.sendByEmail(user?.email || 'cliente@sagrissa.com');
    setIsSending(false);
    alert('El estado de cuenta ha sido enviado a su correo electrónico.');
  };

  return (
    <div className="w-full min-h-screen flex justify-center bg-white md:bg-transparent pb-20 md:pb-0">
      <div className="w-full h-full xl:max-w-6xl flex flex-col relative md:pt-4 md:px-8">

        {/* Header */}
        <div className="md:bg-transparent bg-white border-b border-slate-100 md:border-none p-6 md:px-0 md:pt-0 md:pb-8 flex flex-col gap-6 relative overflow-hidden">
          <svg className="absolute top-0 right-10 w-24 h-32 pointer-events-none opacity-20" viewBox="0 0 100 100" fill="none">
            <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2.5" strokeDasharray="6 6" fill="none"/>
          </svg>

          <div className="flex items-center gap-3 z-10">
            <button
              className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors md:hidden"
              onClick={() => navigate('/app/cliente/home')}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Estado de Cuenta</h1>
          </div>

          <div className="flex justify-between items-center z-10">
            <div>
              <h3 className="font-bold text-slate-800">{user?.name || 'Cliente SAGRISA'}</h3>
              <p className="text-[11px] font-bold text-brand-blue uppercase tracking-widest mt-1">
                {user?.dui || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Adeudado
              </p>
              {loading ? (
                <Skeleton width={120} height={28} />
              ) : (
                <p className="text-2xl font-black text-brand-blue tracking-tighter">${accountData.totalDebt.toLocaleString()}.00</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
          <div className="flex flex-col gap-6">

            {/* Antigüedad de Saldo & Extras */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div className="flex flex-col gap-6">
                <AgingCard items={accountData.aging} loading={loading} />

                {/* Info Grid */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Días Pago', value: `${accountData.daysToPay} días` },
                      { label: 'Término Crédito', value: `${accountData.creditTerm} días` },
                      { label: 'Último Pago', value: `$${accountData.lastPayment.toLocaleString()}` },
                      { label: 'Fecha Últ. Pago', value: accountData.lastPaymentDate },
                      { label: 'Línea Crédito', value: `$${accountData.creditLine.toLocaleString()}` },
                      { label: 'Crédito Disponible', value: `$${accountData.availableCredit.toLocaleString()}` },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1 items-start justify-center">
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.label}
                        </span>
                        {loading ? (
                          <Skeleton width={80} height={14} />
                        ) : (
                          <span className="text-[14px] font-black text-slate-800">{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard title="Facturas Pendientes" value={accountData.pendingInvoices.toString()} variant="default" />
                  <StatCard title="Pedidos Abiertos" value={accountData.openOrders.toString()} variant="default" />
                </div>
                {/* Boton Acciones */}
                <div className="flex flex-col gap-3 mt-auto">
                   <button
                     className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl shadow-lg hover:bg-brand-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                     onClick={handleDownload}
                     disabled={isDownloading}
                   >
                     {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                     DESCARGAR PDF
                   </button>
                   
                   <button
                     className="w-full bg-white border border-slate-200 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                     onClick={handleEmail}
                     disabled={isSending}
                   >
                     {isSending ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
                     ENVIAR POR EMAIL
                   </button>

                   <button
                     className="w-full bg-slate-50 text-slate-400 font-black py-3 rounded-xl text-[11px] uppercase tracking-widest hover:text-brand-blue transition-all"
                     onClick={() => navigate('/app/cliente/facturas')}
                   >
                     VER DETALLE DE FACTURAS
                   </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
