import React from 'react';
import { Calendar, ChevronRight, Droplets, Sparkles, Users } from 'lucide-react';
import { RehearsalEvent, EventType, EventTypeDefinition } from '../types';
import { getTypeStyles } from '../utils/eventHelpers';

const EventSummaryCard: React.FC<{ event: RehearsalEvent; onClick: () => void; allTypes: EventTypeDefinition[] }> = ({ event, onClick, allTypes }) => {
    const styles = getTypeStyles(event.type, allTypes);
    const Icon = event.type === EventType.BATISMO ? Droplets :
        event.type === EventType.BUSCA_DONS ? Sparkles :
            event.type === EventType.REUNIAO_MOCIDADE ? Users : Calendar;

    return (
        <div onClick={onClick} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-slate-300 transition-all active:scale-95 group">
            <div
                className={`${styles.bg} ${styles.text} p-3 rounded-xl group-hover:scale-110 transition-transform`}
                style={styles.isHex ? { backgroundColor: `${styles.hex}20`, color: styles.hex } : {}}
            >
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>{event.type}</p>
                <h4 className="font-bold text-slate-800 truncate leading-tight">{event.location}</h4>
                <p className="text-xs text-slate-500">{event.day.split(' ')[0]} {event.month} • {event.time}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
    );
};

export default EventSummaryCard;
