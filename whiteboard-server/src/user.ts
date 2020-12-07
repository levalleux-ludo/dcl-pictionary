import { Realm } from './realm';
import { EventEmitter } from "events";
import { IUser } from './iserver';

export enum eUserEvents {
    disconnect = 'disconnect'
}
export interface DisconnectArgs {}

export class User extends EventEmitter implements IUser {
    constructor(public name: string, public address: string, public realm: Realm) {
        super();
        console.log('create user with name', name, 'address', address, 'realm', realm.name);
    }
    public disconnect() {
        this.emit(eUserEvents.disconnect, {});
    }
}