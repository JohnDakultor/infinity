declare module 'nfc-pcsc' {
  import { EventEmitter } from 'events';

  export class NFC extends EventEmitter {
    on(event: 'reader', listener: (reader: Reader) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }

  export class Reader extends EventEmitter {
    reader: { name: string };

    on(event: 'card', listener: (card: Card) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'end', listener: () => void): this;
  }

  export interface Card {
    atr?: Buffer;
    standard?: string;
    type?: string;
    uid: string;
  }
}
