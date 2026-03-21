import React from 'react';
import { Calendar, ChevronRight, Clock, User, CalendarPlus } from 'lucide-react';
import { RehearsalEvent, EventTypeDefinition } from '../types';
import { getTypeStyles, getFriendlyEventName } from '../utils/eventHelpers';
import { getGoogleCalendarUrl } from '../utils/calendar';

const LargeEventCard: React.FC<{ event: RehearsalEvent; onConfirm: () => void; allTypes: EventTypeDefinition[] }> = ({ event, onConfirm, allTypes }) => {
    const styles = getTypeStyles(event.type, allTypes);
    const eventName = getFriendlyEventName(event.type);

    return (
        <section
            className={`rounded-[2.5rem] p-5 md:p-6 text-white relative overflow-hidden shadow-xl transition-all duration-500 ${styles.isHex ? '' : styles.card}`}
            style={styles.isHex ? { backgroundColor: styles.hex } : {}}
        >
            <div className="relative z-10 space-y-3 md:space-y-4">
                {/* Header - Compact */}
                <div className="flex items-center gap-2 opacity-90">
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                        <Calendar size={14} />
                    </div>
                    <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-wider">{eventName}</h2>
                </div>

                {/* Content - Horizontal on Mobile */}
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Date Block */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 md:p-4 rounded-2xl md:rounded-3xl text-center min-w-[75px] md:min-w-[90px] shadow-lg flex-shrink-0">
                        <span className="block text-2xl md:text-3xl font-black tracking-tighter leading-none">{event.day.split(' ')[0]}</span>
                        <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.15em] opacity-80 mt-1 block">{event.month}</span>
                    </div>

                    {/* Info Block */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight truncate">{event.location}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1 text-[11px] font-bold">
                                <Clock size={12} className="opacity-60" /> {event.time}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] opacity-80 truncate max-w-[120px]">
                                <User size={12} className="opacity-60" /> {event.conductor}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Balanced */}
                <div className="flex flex-col sm:flex-row items-center gap-3 md:ml-auto w-full md:w-fit">
                    <a
                        href={getGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-fit bg-white/20 hover:bg-white/30 text-white px-5 py-3 md:py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all backdrop-blur-sm border border-white/10"
                    >
                        <CalendarPlus size={16} /> Google Agenda
                    </a>
                    <button
                        onClick={onConfirm}
                        className="w-full md:w-fit bg-white text-slate-900 px-6 py-3.5 md:py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                        style={styles.isHex ? { backgroundColor: styles.hex, color: 'white' } : {}}
                    >
                        Confirmar presença <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Decorative Orbs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-[60px] pointer-events-none"></div>
        </section>
    );
};

export default LargeEventCard;
