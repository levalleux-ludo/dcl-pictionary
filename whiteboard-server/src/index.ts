import { Realm } from './realm';
import * as WebSocket from "ws";
import cors from 'cors';
import express from 'express';
import { eMessages, eServerEvents, WSMessageArgs, StartDrawingArgs, ImageUpdatedArgs, UpdateImageArgs } from "./iserver";
import { Server } from './server';

const app = express();
// options for cors middleware
const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: true,
  preflightContinue: false,
};
app.use(cors(options));
const wss = new WebSocket.Server({ port: 13370 });

// const images = new Map<string, string>();

const server = new Server();

server.on(eServerEvents.sendMessage, (args: WSMessageArgs) => {
  // dispatch the message to all clients of the same room/realm
  wss.clients.forEach(function each(client) {
    const cWs = client as customWs;
    if (cWs.readyState === WebSocket.OPEN && cWs.room === args.realm) {
      cWs.send(JSON.stringify({message: args.message, args: args.args}));
    }
  });
});
interface customWs extends WebSocket {
  room: string;
}

wss.on("connection", (clientWs, request) => {
  const ws = clientWs as customWs;
  ws.room = request.url || "";
  console.log("connection on", ws.room)
  // TODO find userName and userAddress
  const userName = "unknown_user";
  const userAddress = "unknown_address";
  server.connect(ws.room, userName, userAddress)

  ws.on('open', () => {
    console.log('opened connection with url:' + ws.url);
  })

  ws.on('error', () => {
    console.log('connection error with url:' + ws.url);
  })

  ws.on('close', () => {
    console.log('closed connection with url:' + ws.url);
    server.disconnect(userAddress);
  })

  ws.on("message", function incoming(dataStr) {

    const data: WSMessageArgs = JSON.parse(dataStr as string) as WSMessageArgs;
    data.realm = ws.room;
    // if message is 'startDrawing'
    if (data.message === eMessages.startDrawing) {
      const args: StartDrawingArgs = data.args as StartDrawingArgs;
      server.startDrawing(ws.room, args.drawerAddress);
    }

    // if message is 'updateImage'
    if (data.message === eMessages.updateImage) {
      const args: UpdateImageArgs = data.args as UpdateImageArgs;
      server.updateImage(ws.room, args.image)
    }

    // console.log("received message");
    // if ((data as any).image) {
    //   console.log('set image', ws.room);
    //   images.set(ws.room, (data as any).image);
    // }
    wss.clients.forEach(function each(client) {
      const cWs = client as customWs;

      if (cWs.readyState === WebSocket.OPEN && cWs.room === ws.room) {
        cWs.send(dataStr);
      }
    });
  });
});

wss.once("listening", ()=>{
  console.log("Listening on port 13370")
})

app.use('/image/:room', (req: express.Request, res: express.Response) => {
  const room = `/broadcast/${req.params.room}`;
  // const data = images.get(room);
  const data = server.getImage(room);
  console.log('GET image', room);
  console.log('dummy', req.query.dummy);

  if (data !== undefined) {
    console.log('send image data');
    const im = data.split(",")[1];
    var img = Buffer.from(im, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
  } else {
    res.sendStatus(200);
  }
});

app.use('/check/:room', (req: express.Request, res: express.Response) => {
  const realm = `/broadcast/${req.params.room}`;
  const word = req.query.word as string;
  if (!word) {
    res.sendStatus(400);
  } else {
    const checkResult = server.checkWord(realm, word);
    res.send({word, checkResult});
  }
});

app.use('/submit/:room', (req: express.Request, res: express.Response) => {
  const realm = `/broadcast/${req.params.room}`;
  const word = req.query.word as string;
  const user = req.query.user as string;
  if (!word || !user) {
    res.sendStatus(400);
  } else {
    const checkResult = server.submitWord(realm, user, word);
    res.send({word, checkResult});
  }
});

app.use('/:room', (req: express.Request, res: express.Response) => {
  const room = `/broadcast/${req.params.room}`;
  console.log('GET page', room, req.baseUrl, req.hostname, req.url);
  const img_url = `${req.protocol}://${req.hostname}/image/${req.params.room}`

  const page=`<html><body><h1>Hello World</h1><img src="${img_url}"></body></html>`;
  console.log('send page', page);
  res.send(page);
});

const port = 80;
app.listen(port, () => {
  console.log('The server is running in port localhost: ', port);
});