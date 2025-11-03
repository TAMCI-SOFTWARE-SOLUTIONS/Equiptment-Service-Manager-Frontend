/**
 * Utilidad para generar contraseñas seguras
 */
export class PasswordGenerator {

  private static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly NUMBERS = '0123456789';
  private static readonly SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  /**
   * Genera una contraseña segura de 12 caracteres
   * - Al menos 2 mayúsculas
   * - Al menos 2 minúsculas
   * - Al menos 2 números
   * - Al menos 2 símbolos
   * - Total: 12 caracteres
   */
  static generate(length: number = 12): string {
    if (length < 8) {
      throw new Error('Password length must be at least 8 characters');
    }

    // Garantizar al menos 2 de cada tipo
    const minUppercase = 2;
    const minLowercase = 2;
    const minNumbers = 2;
    const minSymbols = 2;

    const minRequired = minUppercase + minLowercase + minNumbers + minSymbols;

    if (length < minRequired) {
      throw new Error(`Password length must be at least ${minRequired} characters to meet complexity requirements`);
    }

    let password = '';

    // Agregar caracteres mínimos requeridos
    password += this.getRandomChars(this.UPPERCASE, minUppercase);
    password += this.getRandomChars(this.LOWERCASE, minLowercase);
    password += this.getRandomChars(this.NUMBERS, minNumbers);
    password += this.getRandomChars(this.SYMBOLS, minSymbols);

    // Completar con caracteres aleatorios del conjunto completo
    const allChars = this.UPPERCASE + this.LOWERCASE + this.NUMBERS + this.SYMBOLS;
    const remaining = length - password.length;
    password += this.getRandomChars(allChars, remaining);

    // Mezclar la contraseña (shuffle)
    return this.shuffleString(password);
  }

  /**
   * Obtiene N caracteres aleatorios de un string
   */
  private static getRandomChars(chars: string, count: number): string {
    let result = '';
    const charsLength = chars.length;

    for (let i = 0; i < count; i++) {
      const randomIndex = this.getSecureRandomInt(0, charsLength);
      result += chars.charAt(randomIndex);
    }

    return result;
  }

  /**
   * Mezcla los caracteres de un string de forma aleatoria
   */
  private static shuffleString(str: string): string {
    const array = str.split('');

    for (let i = array.length - 1; i > 0; i--) {
      const j = this.getSecureRandomInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array.join('');
  }

  /**
   * Genera un número aleatorio seguro entre min (inclusive) y max (exclusive)
   * Usa crypto.getRandomValues para mayor seguridad
   */
  private static getSecureRandomInt(min: number, max: number): number {
    const range = max - min;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const randomBytes = new Uint8Array(bytesNeeded);

    let randomValue: number;

    do {
      crypto.getRandomValues(randomBytes);
      randomValue = 0;

      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = randomValue * 256 + randomBytes[i];
      }
    } while (randomValue >= maxValue - (maxValue % range));

    return min + (randomValue % range);
  }

  /**
   * Valida si una contraseña cumple los requisitos de seguridad
   */
  static validate(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un símbolo especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera múltiples contraseñas y devuelve una (útil para testing)
   */
  static generateSecure(): string {
    let password: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      password = this.generate(12);
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate secure password after maximum attempts');
      }
    } while (!this.validate(password).isValid);

    return password;
  }
}
