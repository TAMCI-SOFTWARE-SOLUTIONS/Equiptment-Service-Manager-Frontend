export class DateUtils {
  /**
   * Convierte una cadena ISO (por ejemplo, "2025-10-26T15:30:00Z") a un objeto Date.
   */
  static parseISO(dateString: string): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Convierte un objeto Date a una cadena ISO sin zona horaria.
   * Ejemplo: 2025-10-26T15:30:00
   */
  static toISOStringLocal(date: Date | null): string | null {
    if (!date) return null;
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 19);
  }

  /**
   * Devuelve una fecha en formato legible: "26/10/2025"
   */
  static formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Devuelve una fecha con hora legible: "26/10/2025 15:30"
   */
  static formatDateTime(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Devuelve la diferencia en milisegundos entre dos fechas.
   */
  static diffInMilliseconds(start: Date | string, end: Date | string): number {
    const d1 = typeof start === 'string' ? new Date(start) : start;
    const d2 = typeof end === 'string' ? new Date(end) : end;
    return d2.getTime() - d1.getTime();
  }

  /**
   * Devuelve la diferencia entre dos fechas en formato legible (días, horas, minutos).
   */
  static diffReadable(start: Date | string, end: Date | string): string {
    const diffMs = this.diffInMilliseconds(start, end);
    const absMs = Math.abs(diffMs);
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((absMs / (1000 * 60)) % 60);

    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(' ') : '0m';
  }

  /**
   * Suma minutos a una fecha.
   */
  static addMinutes(date: Date | string, minutes: number): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  }

  /**
   * Devuelve la fecha actual en formato ISO local (yyyy-MM-ddTHH:mm:ss)
   */
  static nowISO(): string {
    return this.toISOStringLocal(new Date())!;
  }

  /**
   * Devuelve true si una fecha es anterior a otra.
   */
  static isBefore(date1: Date | string, date2: Date | string): boolean {
    return new Date(date1).getTime() < new Date(date2).getTime();
  }

  /**
   * Devuelve true si una fecha es posterior a otra.
   */
  static isAfter(date1: Date | string, date2: Date | string): boolean {
    return new Date(date1).getTime() > new Date(date2).getTime();
  }
}
