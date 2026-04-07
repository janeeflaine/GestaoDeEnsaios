import { EventStatistic, OrchestraFamilyTotals, IDEAL_PERCENTAGES } from '../types';

/**
 * Calcula o total de cada família de instrumentos
 */
export function calcFamilyTotals(stat: EventStatistic): OrchestraFamilyTotals {
    const cordas = (stat.violino || 0) + (stat.viola || 0) + (stat.violoncelo || 0);

    const madeiras =
        (stat.flauta || 0) + (stat.oboe || 0) + (stat.oboe_damore || 0) +
        (stat.corne_ingles || 0) + (stat.fagote || 0) + (stat.clarinete || 0) +
        (stat.clarinete_alto || 0) + (stat.clarinete_baixo || 0) +
        (stat.sax_soprano || 0) + (stat.sax_alto || 0) + (stat.sax_tenor || 0) +
        (stat.sax_baritono || 0) + (stat.sax_baixo || 0);

    const metais =
        (stat.trompete || 0) + (stat.cornet || 0) + (stat.flugelhorn || 0) +
        (stat.trompa || 0) + (stat.trombone || 0) + (stat.trombonito || 0) +
        (stat.baritono || 0) + (stat.eufonio || 0) + (stat.tuba || 0);

    const acordeon = stat.acordeon || 0;
    const total = cordas + madeiras + metais + acordeon;

    return { cordas, madeiras, metais, acordeon, total };
}

/**
 * Calcula % real de cada família
 */
export function calcFamilyPercentages(totals: OrchestraFamilyTotals) {
    const { cordas, madeiras, metais, acordeon, total } = totals;
    if (total === 0) return { cordas: 0, madeiras: 0, metais: 0, acordeon: 0 };

    return {
        cordas: Math.round((cordas / total) * 100),
        madeiras: Math.round((madeiras / total) * 100),
        metais: Math.round((metais / total) * 100),
        acordeon: Math.round((acordeon / total) * 100),
    };
}

/**
 * Retorna comparação % Real vs % Ideal
 */
export function calcIdealComparison(totals: OrchestraFamilyTotals) {
    const pct = calcFamilyPercentages(totals);
    return {
        cordas: { real: pct.cordas, ideal: IDEAL_PERCENTAGES.cordas, diff: pct.cordas - IDEAL_PERCENTAGES.cordas },
        madeiras: { real: pct.madeiras, ideal: IDEAL_PERCENTAGES.madeiras, diff: pct.madeiras - IDEAL_PERCENTAGES.madeiras },
        metais: { real: pct.metais, ideal: IDEAL_PERCENTAGES.metais, diff: pct.metais - IDEAL_PERCENTAGES.metais },
        acordeon: { real: pct.acordeon, ideal: null, diff: null },
    };
}

/**
 * Calcula Músicos + Organistas e o Total Geral (ministério + administração)
 */
export function calcMinistryTotals(stat: EventStatistic) {
    const musicosOrganistas = (stat.musicos || 0) + (stat.organistas || 0);
    // Only count members who did NOT play (those who played are already counted in musicosOrganistas)
    const naoToc = (presKey: keyof EventStatistic, tocKey: keyof EventStatistic) =>
        Math.max(0, (stat[presKey] as number || 0) - (stat[tocKey] as number || 0));
    const totalGeral = musicosOrganistas +
        // Ministério
        naoToc('anciaes_presentes', 'anciaes_tocaram') +
        naoToc('diaconos', 'diaconos_tocaram') +
        naoToc('coop_oficio', 'coop_oficio_tocaram') +
        naoToc('coop_jovens', 'coop_jovens_tocaram') +
        // Encarregados Musicais
        naoToc('enc_regionais_presentes', 'enc_regionais_tocaram') +
        naoToc('examinadoras', 'examinadoras_tocaram') +
        // GEM
        naoToc('secretarios_gem', 'secretarios_gem_tocaram') +
        naoToc('secretaria_gem', 'secretaria_gem_tocaram') +
        naoToc('instrutores', 'instrutores_tocaram') +
        naoToc('instrutoras', 'instrutoras_tocaram') +
        naoToc('candidatas', 'candidatas_tocaram') +
        naoToc('candidatos', 'candidatos_tocaram') +
        // Colaboradores
        naoToc('secretarios_musica', 'secretarios_musica_tocaram') +
        naoToc('secretaria_musica', 'secretaria_musica_tocaram') +
        naoToc('auxiliar_porta', 'auxiliar_porta_tocaram') +
        naoToc('colaborador', 'colaborador_tocaram') +
        naoToc('colaboradora', 'colaboradora_tocaram') +
        // Irmandade
        naoToc('irmas', 'irmas_tocaram') +
        naoToc('irmaos', 'irmaos_tocaram');

    return { musicosOrganistas, totalGeral };
}

/**
 * Gera um EventStatistic vazio (para o formulário)
 */
export function emptyStatistic(): EventStatistic {
    return {
        event_date: new Date().toISOString().split('T')[0],
        violino: 0, viola: 0, violoncelo: 0,
        flauta: 0, oboe: 0, oboe_damore: 0, corne_ingles: 0, fagote: 0,
        clarinete: 0, clarinete_alto: 0, clarinete_baixo: 0,
        sax_soprano: 0, sax_alto: 0, sax_tenor: 0, sax_baritono: 0, sax_baixo: 0,
        trompete: 0, cornet: 0, flugelhorn: 0, trompa: 0,
        trombone: 0, trombonito: 0, baritono: 0, eufonio: 0, tuba: 0,
        acordeon: 0,
        musicos: 0, organistas: 0,
        anciaes_presentes: 0, diaconos: 0, coop_oficio: 0, coop_jovens: 0,
        enc_regionais_presentes: 0, examinadoras: 0,
        enc_locais: 0,
        secretarios_gem: 0, secretaria_gem: 0, instrutores: 0, instrutoras: 0,
        candidatas: 0, candidatos: 0,
        secretarios_musica: 0, secretaria_musica: 0, auxiliar_porta: 0,
        colaborador: 0, colaboradora: 0,
        irmas: 0, irmaos: 0,
        anciaes_tocaram: 0, diaconos_tocaram: 0, coop_oficio_tocaram: 0, coop_jovens_tocaram: 0,
        enc_regionais_tocaram: 0, examinadoras_tocaram: 0,
        secretarios_gem_tocaram: 0, secretaria_gem_tocaram: 0,
        instrutores_tocaram: 0, instrutoras_tocaram: 0,
        candidatas_tocaram: 0, candidatos_tocaram: 0,
        secretarios_musica_tocaram: 0, secretaria_musica_tocaram: 0,
        auxiliar_porta_tocaram: 0, colaborador_tocaram: 0, colaboradora_tocaram: 0,
        irmas_tocaram: 0, irmaos_tocaram: 0,
    };
}
