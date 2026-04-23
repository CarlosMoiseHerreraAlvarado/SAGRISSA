import { useState, useRef, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeButton = tabsRef.current[activeTab];
    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className={`relative flex bg-white px-2 pt-2 border-b border-slate-100 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => { tabsRef.current[tab.id] = el; }}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 py-4 text-[13px] font-black uppercase tracking-widest 
            transition-all relative z-10
            ${activeTab === tab.id
              ? 'text-brand-blue'
              : 'text-slate-400 hover:text-slate-600'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`
                  text-[10px] px-1.5 py-0.5 rounded-full
                  ${activeTab === tab.id
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'bg-slate-100 text-slate-400'
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}

      <div
        className="absolute bottom-0 h-0.5 bg-brand-blue transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
}
