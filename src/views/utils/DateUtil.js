// utils/DateUtils.js

// Formatea una fecha al español bonito
export function formatSpanishDate(dateString, withTime = false) {
    if (!dateString) return '';

    const hasTime = dateString.includes('T');
    const date = new Date(hasTime ? dateString : `${dateString}T00:00:00`);

    const options = withTime
        ? { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
        : { day: '2-digit', month: 'long', year: 'numeric' };

    return date.toLocaleString('es-ES', options);
}

// Suma N días a una fecha (sin cambiar hora ni nada raro)
export function addDays(dateString, days) {
    const hasTime = dateString.includes('T');
    const date = new Date(hasTime ? dateString : `${dateString}T00:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // Devuelve formato YYYY-MM-DD limpio
}

// Calcula los días restantes entre hoy y una fecha
export function daysRemaining(dateString) {
    if (!dateString) return 0;
    const today = new Date();
    const target = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // redondea hacia arriba
}

// Devuelve hoy en formato YYYY-MM-DD
export function today() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}
