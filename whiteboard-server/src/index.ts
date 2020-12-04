import * as WebSocket from "ws";
import cors from 'cors';
import express from 'express';

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

const images = new Map<string, string>();

interface customWs extends WebSocket {
  room: string;
}

wss.on("connection", (clientWs, request) => {
  const ws = clientWs as customWs;
  ws.room = request.url || "";
  console.log("connection on", ws.room)


  ws.on("message", function incoming(dataStr) {
    const data = JSON.parse(dataStr as string);
    console.log("received message");
    if ((data as any).image) {
      console.log('set image', ws.room);
      images.set(ws.room, (data as any).image);
    }
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
  const data = images.get(room);
  console.log('GET image', room);

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

app.use('/:room', (req: express.Request, res: express.Response) => {
  const room = `/broadcast/${req.params.room}`;
  const data = images.get(room);
  console.log('GET page', room, req.baseUrl, req.hostname, req.url);
  const img_url = `${req.protocol}://${req.hostname}/image/${req.params.room}`

  if (data !== undefined) {
    const page=`<html><body><h1>Hello World</h1><img src="${img_url}"></body></html>`;
    console.log('send page', page);
    res.send(page);
  } else {
    res.sendStatus(200);
  }
});

const port = 80;
app.listen(port, () => {
  console.log('The server is running in port localhost: ', port);
});