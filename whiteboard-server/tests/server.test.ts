import { Server } from './../src/server';
import { eServerEvents, WSMessageArgs, eMessages } from './../src/iserver';
import { assert, expect } from "chai";

describe('test server class', () => {
    const realm1 = 'DOMAIN1';
    const drawer1 = 'drawer1';
    const drawer1Address = 'aaabbbccc';
    const realm2 = 'DOMAIN2';
    const drawer2 = 'drawer2';
    const drawer2Address = 'dddeeefff';
    const player3 = 'player3';
    const player3Address = 'ggghhhiii';
    const dummyWord = 'dummy-word';
    let words: string[] = [];

    let server: Server;
    it('instanciate server class', () => {
        server = new Server();
        expect(server).not.equal(undefined);
    })
    it('client DOMAIN1 connect to server', () => {
        server.connect(realm1, drawer1, drawer1Address);
        server.connect(realm1, player3, player3Address);
    })
    it('client DOMAIN1 start drawing', () => {
        // const promise = new Promise<WSMessageArgs>((resolve, reject) => {
        //     // const timer = setTimeout(() => {
        //     //     reject();
        //     // }, 1000);
        //     server.on(eServerEvents.sendMessage, (eventArgs: WSMessageArgs) => {
        //         // clearTimeout(timer);
        //         resolve(eventArgs);
        //     });
        // })
        server.startDrawing(realm1, drawer1Address);
        // await promise.then((eventArgs: WSMessageArgs) => {
        //     expect(eventArgs.message).to.equal(eMessages.roundStarted);
        //     done();
        // })
    })
    it('client DOMAIN2 start drawing', () => {
        expect(() => server.startDrawing(realm2, drawer2Address)).throws('UNable to find the realm with name DOMAIN2');
    })
    it('get words', async (done) => {
        server.once(eServerEvents.sendMessage, (eventArgs: WSMessageArgs) => {
            expect(eventArgs.message).to.equal(eMessages.roundStarted);
            done();
        });
        words = server.getWords(realm1);
        expect(words.length).to.equal(4);
        console.log(words);
    })
    it('check dummy word', () => {
        expect(server.checkWord(realm1, dummyWord)).to.equal(false);
    })
    it('check correct word', () => {
        expect(server.checkWord(realm1, words[2])).to.equal(true);
    })
    it('submit dummy word', () => {
        expect(server.checkWord(realm1, dummyWord)).to.equal(false);
    })
    it('submit correct word', async (done) => {
        server.once(eServerEvents.sendMessage, (eventArgs: WSMessageArgs) => {
            expect(eventArgs.message).to.equal(eMessages.roundCompleted);
            done();
        });
        const result = server.submitWord(realm1, player3Address ,words[2]);
        expect(result).to.equal(true);
    })

})