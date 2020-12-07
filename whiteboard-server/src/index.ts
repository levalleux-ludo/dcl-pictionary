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
    const cWs = client as RealmWS;
    if (cWs.readyState === WebSocket.OPEN && cWs.realm === args.realm) {
      cWs.send(JSON.stringify({message: args.message, args: args.args}));
    }
  });
});
export interface RealmWS extends WebSocket {
  realm: string;
}

wss.on("connection", (clientWs, request) => {
  const ws = clientWs as RealmWS;
  const urlParams = /^\/([^?]*)\??(.*)$/.exec(request.url || '');
  console.log('urlParams', urlParams);
  if (!urlParams) {
    console.error('Unable to get realm from websocket url');
    return;
  }
  ws.realm = urlParams[1];
  console.log("connection on", ws.realm)
  const queryParams = urlParams[2];
  const userIdQuery = /(^|&)userId=([^&]*)/.exec(queryParams);
  console.log('userIdQuery', userIdQuery)
  if (!userIdQuery) {
    console.error('Unable to get userId from websocket url');
    return;
  }
  const userAddress = userIdQuery[2];
  const userNameQuery = /(^|&)userName=([^&]*)/.exec(queryParams);
  console.log('userNameQuery', userIdQuery)
  let realm;
  let fromDCL = false;
  if (userNameQuery) {
    // Connection from the DCL scene
    fromDCL = true;
    const userName = userNameQuery[2];
    realm = server.connect(ws.realm, userName, userAddress)
  } else {
    // Connection from the Whiteboard app
    realm = server.connect(ws.realm)
  }

  server.sendStatus(ws);

  ws.on('open', () => {
    console.log('opened connection with url:' + ws.url);
  })

  ws.on('error', () => {
    console.log('connection error with url:' + ws.url);
  })

  ws.on('close', () => {
    console.log('closed connection with url:' + ws.url);
    if (fromDCL) {
      try {
        server.disconnect(userAddress);
      } catch (e) {
        console.error(e);
      }
    }
  })

  ws.on("message", function incoming(dataStr) {

    const data: WSMessageArgs = JSON.parse(dataStr as string) as WSMessageArgs;
    data.realm = ws.realm;
    console.log('received message', data.message);
    // if message is 'startDrawing'
    if (data.message === eMessages.startDrawing) {
      const args: StartDrawingArgs = data.args as StartDrawingArgs;
      try {
        server.startDrawing(ws.realm, args.drawerAddress);
      } catch (e) {
        console.error(e);
      }
 
    }

    // if message is 'updateImage'
    if (data.message === eMessages.updateImage) {
      const args: UpdateImageArgs = data.args as UpdateImageArgs;
      try {
        server.updateImage(ws.realm, args.image)
      } catch (e) {
        console.error(e);
      }
  
    }

    // console.log("received message");
    // if ((data as any).image) {
    //   console.log('set image', ws.realm);
    //   images.set(ws.realm, (data as any).image);
    // }
    wss.clients.forEach(function each(client) {
      const cWs = client as RealmWS;

      if (cWs.readyState === WebSocket.OPEN && cWs.realm === ws.realm) {
        cWs.send(dataStr);
      }
    });
  });
});

wss.once("listening", ()=>{
  console.log("Listening on port 13370")
})

app.use('/image/:room', (req: express.Request, res: express.Response) => {
  const room = `${req.params.room}`;
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
  const realm = `${req.params.room}`;
  const word = req.query.word as string;
  if (!word) {
    res.sendStatus(400);
  } else {
    const checkResult = server.checkWord(realm, decodeURI(word));
    res.send({word, checkResult});
  }
});

app.use('/submit/:room', (req: express.Request, res: express.Response) => {
  const realm = `${req.params.room}`;
  const word = req.query.word as string;
  const userId = req.query.userId as string;
  if (!word || !userId) {
    res.sendStatus(400);
  } else {
    const checkResult = server.submitWord(realm, userId, word);
    res.send({word, checkResult});
  }
});

app.use('/whiteboard/:room/qrcode', (req: express.Request, res: express.Response) => {
  const room = `${req.params.room}`;
  const userId = req.query.userId as string;
  if (!userId) {
    console.error('missing userId in query parameters');
    res.sendStatus(400);
    return;
  }
  server.getQrCode(room, userId).then(data => {
    if (data !== undefined) {
      console.log('send QrCode image data');
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
  }).catch(e => {
    console.error(e);
    res.sendStatus(500);
  });
});

app.use('/:room/words', (req: express.Request, res: express.Response) => {
  const room = `${req.params.room}`;
  const drawerAddress = req.query.drawer;
  res.send(server.getWords(room, drawerAddress as string));
});

app.use('/:room', (req: express.Request, res: express.Response) => {
  const room = `${req.params.room}`;
  console.log('GET page', room, req.baseUrl, req.hostname, req.url);
  const img_url = `${req.protocol}://${req.hostname}/image/${req.params.room}`

  const page=`<html><body><h1>Hello World</h1><img src="${img_url}"></body></html>`;
  console.log('send page', page);
  res.send(page);
});


const port = 8888;
app.listen(port, () => {
  console.log('The server is running in port localhost: ', port);
});