import React from 'react';

const DashboardStatCard: React.FC<{
    title: string;
    total: number;
    remaining: number;
    icon: React.ReactNode;
    iconBg: string;
    variant?: 'row' | 'card'
}> = ({ title, total, remaining, icon, iconBg, variant = 'row' }) => {
    if (variant === 'card') {
        return (
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col gap-6 transition-all hover:shadow-2xl hover:-translate-y-1 group">
                <div className="flex items-center gap-4">
                    <div className={`${iconBg} p-4 rounded-[1.25rem] text-white shadow-lg flex-shrink-0 flex items-center justify-center`}>
                        {icon}
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight flex-1">{title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{remaining}</span>
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-2 font-bold">Restantes</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 pl-6">
                        <span className="text-4xl font-black text-slate-200 tracking-tighter leading-none group-hover:text-slate-300 transition-colors uppercase">{total}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2 font-bold whitespace-nowrap">Total Anual</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-5 md:p-6 rounded-[2.5rem] md:rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 md:gap-0 transition-all hover:shadow-2xl hover:-translate-y-1 group">
            <div className="flex items-center gap-4 md:flex-1 pr-6 flex-shrink-1">
                <div className={`${iconBg} p-4 md:p-3.5 rounded-2xl md:rounded-2xl text-white shadow-lg flex-shrink-0 flex items-center justify-center`}>
                    {icon}
                </div>
                <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight flex-1">
                    {title}
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 flex-shrink-0 md:flex md:items-center">
                <div className="flex flex-col md:items-center md:px-8 border-r md:border-none border-slate-100 min-w-[75px] md:min-w-[110px]">
                    <span className="text-4xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{remaining}</span>
                    <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-2 md:mt-1.5 font-bold">Restantes</span>
                </div>
                <div className="flex flex-col md:items-center pl-4 md:px-8 min-w-[75px] md:min-w-[110px]">
                    <span className="text-4xl md:text-3xl font-black text-slate-200 tracking-tighter leading-none group-hover:text-slate-300 transition-colors uppercase">{total}</span>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2 md:mt-1.5 whitespace-nowrap font-bold">Total Anual</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardStatCard;
