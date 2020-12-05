import { EventEmitter } from 'events';

export enum eRealmEvent {
    wordFound = 'wordFound'
}
export interface WordFoundArgs {
    word: string,
    winner: string;
}

export class Realm extends EventEmitter{
    public drawerAddress: string|undefined;
    public words: string[] = [];
    public image: string|undefined;
    constructor(private _name: string) {
        super();
    }
    public get name() {
        return this._name;
    }

    public checkWord(word: string): boolean {
        return this.words.includes(word);
    }

    public submitWord(word: string, playerAddress: string) {
        if (this.checkWord(word)) {
            this.words = [];
            this.wordFound({word, winner: playerAddress});
            return true;
        }
        return false;
    }

    // public set drawerAddress(value: string|undefined) {
    //     this._drawerAddress = value;
    // }

    // public get drawerAddress(): string|undefined {
    //     return this._drawerAddress;
    // }

    // public set words(value: string[])

    private wordFound(eventArgs: WordFoundArgs) {
        console.log('Realm:wordFound', eventArgs);
        this.emit(eRealmEvent.wordFound, eventArgs);
    }
}