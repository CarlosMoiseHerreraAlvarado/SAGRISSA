import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PackageSearch, BarChart3 } from 'lucide-react';

const slides = [
  {
    id: 0,
    type: 'splash',
  },
  {
    id: 1,
    type: 'content',
    title: 'Realizar pedidos',
    description: 'Puede buscar a los clientes y los productos para agregar en un mismo pedido.',
    icon: <Search size={60} className="text-[#00A9F4]" strokeWidth={2} />,
  },
  {
    id: 2,
    type: 'content',
    title: 'Productos disponibles',
    description: 'Tiene acceso a verificar los productos disponibles, las cantidades en existencia y sus precios.',
    icon: <PackageSearch size={60} className="text-[#00A9F4]" strokeWidth={2} />,
  },
  {
    id: 3,
    type: 'content',
    title: 'Registro de metas',
    description: 'Podrá hacer el seguimiento de sus metas de cobro y ventas.',
    icon: <BarChart3 size={60} className="text-[#00A9F4]" strokeWidth={2} />,
  }
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      navigate('/login');
    }
  }, [currentSlide, navigate]);

  // Auto-advance splash screen after 2.5s
  useEffect(() => {
    if (currentSlide !== 0) return;
    const timer = setTimeout(handleNext, 2500);
    return () => clearTimeout(timer);
  }, [currentSlide, handleNext]);

  const slide = slides[currentSlide];

  if (slide.type === 'splash') {
    return (
      <div className="h-screen bg-white flex justify-center items-center cursor-pointer animate-in fade-in duration-700" onClick={handleNext}>
        <div className="flex flex-col items-center gap-4">
           <div className="w-20 h-20 bg-[#00A9F4] rounded-3xl flex items-center justify-center shadow-lg animate-bounce duration-[2000ms]">
              <span className="text-white font-logo font-black text-4xl">S</span>
           </div>
           <h1 className="text-[32px] tracking-tight font-logo font-black text-[#00A9F4]">SAGRISA</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f3f6f9] flex items-center justify-center p-6 overflow-hidden">
      
      {/* Dashed Lines Pattern */}
      <svg className="absolute top-10 right-10 w-32 h-32 pointer-events-none opacity-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 0 Q 10 60 70 40 Q 90 30 100 40" stroke="#00A9F4" strokeWidth="2" strokeDasharray="5 5" fill="none"/>
      </svg>
      <svg className="absolute bottom-10 left-10 w-32 h-32 pointer-events-none opacity-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 100 Q 90 40 30 60 Q 10 70 0 60" stroke="#00A9F4" strokeWidth="2" strokeDasharray="5 5" fill="none"/>
      </svg>

      {/* Contenedor tipo Web App Card (Full en Móvil, Card en PC) */}
      <div className="w-full h-full md:h-auto md:min-h-[600px] md:max-w-md bg-white md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center p-12 transition-all duration-500 animate-in slide-in-from-right-4">
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
           <div className="w-40 h-40 bg-slate-50 rounded-[40px] flex items-center justify-center mb-12 border border-slate-100 shadow-inner">
              {slide.icon}
           </div>
           
           <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight uppercase tracking-widest">{slide.title}</h2>
           <p className="text-[14px] text-slate-500 leading-relaxed font-medium px-4">
             {slide.description}
           </p>
        </div>

        <div className="w-full flex flex-col items-center gap-10">
          <div className="flex gap-2">
            {slides.slice(1).map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx + 1 ? 'bg-[#00A9F4] w-6' : 'bg-slate-200 w-1.5'}`}
              />
            ))}
          </div>

          <div className="w-full flex gap-3">
             <button 
               onClick={() => navigate('/login')}
               className="flex-1 py-4 text-slate-400 font-bold text-sm hover:text-slate-600"
             >
               Omitir
             </button>
             <button 
               onClick={handleNext}
               className="flex-[2] py-4 bg-[#00A9F4] text-white rounded-2xl font-black text-sm shadow-lg hover:bg-[#0095D8] active:scale-[0.98] transition-all uppercase tracking-widest"
             >
               {currentSlide === slides.length - 1 ? '¡Listo!' : 'Siguiente'}
             </button>
          </div>
        </div>

      </div>

    </div>
  );
}
