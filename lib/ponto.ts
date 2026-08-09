// Helpers de data/hora para o Ponto Eletrônico.
// América/São_Paulo é UTC-3 o ano inteiro desde o fim do horário de verão (2019),
// então usamos um offset fixo em vez de depender de Intl/timezone database.

export const LIMITE_PONTO_ATIVO_MS = 12 * 60 * 60 * 1000; // 12 horas
const SP_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Desloca um instante para que seus getters UTC leiam como hora local de SP. */
function paraShiftSP(date: Date) {
  return new Date(date.getTime() - SP_OFFSET_MS);
}

/** Converte de volta um instante "deslocado" (getters UTC = hora local SP) para o instante real. */
function deShiftSP(shifted: Date) {
  return new Date(shifted.getTime() + SP_OFFSET_MS);
}

/** Início (segunda 00:00) e fim (próxima segunda 00:00) da semana ativa, em horário de SP. */
export function getWeekRangeSP(ref: Date = new Date()) {
  const shifted = paraShiftSP(ref);
  const dow = shifted.getUTCDay(); // 0=domingo .. 6=sábado
  const diffToMonday = (dow + 6) % 7; // segunda=0
  const startShifted = new Date(Date.UTC(
    shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() - diffToMonday, 0, 0, 0, 0
  ));
  const endShifted = new Date(startShifted.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start: deShiftSP(startShifted), end: deShiftSP(endShifted) };
}

/** Início e fim do mês corrente, em horário de SP. */
export function getMonthRangeSP(ref: Date = new Date()) {
  const shifted = paraShiftSP(ref);
  const startShifted = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1, 0, 0, 0, 0));
  const endShifted = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start: deShiftSP(startShifted), end: deShiftSP(endShifted) };
}

/** Rótulo "Agosto de 2026" do mês corrente, em horário de SP. */
export function getMonthLabelSP(ref: Date = new Date()) {
  return ref.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
