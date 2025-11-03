export class DurationUtils {
  /**
   * Parsea una cadena ISO-8601 de duración (por ejemplo "PT1H15M10S")
   * y devuelve la duración en milisegundos.
   */
  static parseToMilliseconds(duration: string): number {
    if (!duration) return 0;
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const [, hours, minutes, seconds] = duration.match(regex) || [];
    return (
      (parseInt(hours || '0') * 3600 +
        parseInt(minutes || '0') * 60 +
        parseInt(seconds || '0')) * 1000
    );
  }

  /**
   * Convierte una cadena ISO-8601 de duración (por ejemplo "PT1H15M10S")
   * a un formato legible como "1h 15m 10s".
   */
  static formatReadable(duration: string | null): string {
    if (!duration) return '0s';
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const [, hours, minutes, seconds] = duration.match(regex) || [];

    const parts: string[] = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds) parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(' ') : '0s';
  }

  /**
   * Devuelve un objeto con los valores individuales de horas, minutos y segundos.
   */
  static parseToParts(duration: string): { hours: number; minutes: number; seconds: number } {
    if (!duration) return { hours: 0, minutes: 0, seconds: 0 };
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const [, hours, minutes, seconds] = duration.match(regex) || [];
    return {
      hours: parseInt(hours || '0'),
      minutes: parseInt(minutes || '0'),
      seconds: parseInt(seconds || '0')
    };
  }

  /**
   * Convierte una duración ISO-8601 a formato HH:mm:ss
   */
  static toHHmmss(duration: string): string {
    const { hours, minutes, seconds } = this.parseToParts(duration);
    const pad = (v: number) => v.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}
