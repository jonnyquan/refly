export abstract class BaseError extends Error {
  abstract code: string;
  abstract messageDict: Record<string, string>;

  constructor(message?: string) {
    super(message);
  }

  toString() {
    return `[${this.code}] ${this.messageDict['en']}`;
  }

  getMessage(locale: string) {
    return this.messageDict[locale] || this.messageDict['en'];
  }
}