export enum eServerEvents {
    sendMessage = 'sendMessage'
}
export enum eMessages {
    realmStatus = 'realmStatus', // message sent to all clients when connecting to give them the current realm status
    startDrawing = 'startDrawing', // message received from a ClientApp to tell a drawer take the lead on a room
    roundStarted = 'roundStarted', // message sent to all clients to tell the word has been given to the drawer ant round's countdown  is starting
    roundFailed = 'roundFailed', // message sent to all clients to tell the round is over without a winner
    roundCompleted = 'roundCompleted', // message sent to all clients to tell the round is over with winner
    updateImage = 'updateImage', // message received from a ClientApp to update the drawing
    imageUpdated = 'imageUpdated' // message sent to all clients to tell the image has been updated
}
export interface WSMessageArgs {
    realm: string;
    message: eMessages;
    args: StartDrawingArgs | RoundStartedArgs | RoundCompletedArgs | RoundFailedArgs | UpdateImageArgs | ImageUpdatedArgs | RealmStatus;
}
export interface StartDrawingArgs {
    drawerAddress: string
}
export interface RoundStartedArgs {
    drawerName: string;
    drawerAddress: string;
    timeoutSec: number;
}
export interface RoundCompletedArgs {
    word: string;
    winnerName: string;
    winnerAddress: string;
}
export interface RoundFailedArgs {
    words: string[];
}
export interface UpdateImageArgs {
    image: string;
}
export interface ImageUpdatedArgs {
    imageUrl: string;
}

export interface IUser {
    name: string;
    address: string;
}
export interface RealmStatus {
    drawer: IUser | undefined;
    imageUrl: string;
}
