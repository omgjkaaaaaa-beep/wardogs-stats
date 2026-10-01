import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = {'/':'index.html','/app.js':'app.js','/style.css':'style.css','/news.json':'news.json'};
http.createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost').pathname; const file=files[path];if(!file){res.writeHead(404);res.end('Not found');return;}try{const body=await readFile(new URL(file,import.meta.url));res.setHeader('Content-Type',file.endsWith('.json')?'application/json':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(body);}catch{res.writeHead(500);res.end('Unable to load page');}}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Wardogs News listening on port '+(process.env.PORT||3000)));
