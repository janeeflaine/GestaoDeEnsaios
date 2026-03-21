import { EventType, EventTypeDefinition } from '../types';

export const getTypeStyles = (type: string, allTypes: EventTypeDefinition[] = []) => {
    const dynamicDef = allTypes.find(t => t.name === type || t.value === type);

    if (dynamicDef) {
        const baseColor = dynamicDef.color.replace('bg-', '');
        const parts = baseColor.split('-');
        const colorName = parts[0];

        if (dynamicDef.color.startsWith('#')) {
            return {
                bg: 'bg-slate-100',
                text: 'text-slate-800',
                dot: dynamicDef.color,
                card: dynamicDef.color,
                isHex: true,
                hex: dynamicDef.color
            };
        }

        return {
            bg: `bg-${colorName}-100`,
            text: `text-${colorName}-700`,
            dot: dynamicDef.color,
            card: dynamicDef.color,
            isHex: false
        };
    }

    switch (type) {
        case EventType.REGIONAL: return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', card: 'bg-amber-500', isHex: false };
        case EventType.BATISMO: return { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500', card: 'bg-sky-500', isHex: false };
        case EventType.BUSCA_DONS: return { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', card: 'bg-purple-500', isHex: false };
        case EventType.REUNIAO_MOCIDADE: return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', card: 'bg-rose-500', isHex: false };
        default: return { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', card: 'bg-indigo-600', isHex: false };
    }
};

export const getFriendlyEventName = (type: string) => {
    if (type === EventType.LOCAL) return 'Ensaio Local';
    if (type === EventType.REGIONAL) return 'Ensaio Regional';
    return type;
};
