import http from 'node:http';
import {createReadStream,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const allowed=new Set(['index.html','Ambedkar_Muslim_League_Direct_Action_Day.html','evidence.json','sources/Punjab_Boundary_Commission_Vol_II.pdf','sources/Indian_Commission_of_Jurists_1965.pdf','sources/Indian_Annual_Register_1946_II.pdf']);
http.createServer((req,res)=>{
 const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 if(!allowed.has(file)){res.writeHead(404);res.end('Not found');return;}
 try{
  const filename=path.join(root,file),size=statSync(filename).size;
  res.setHeader('Content-Type',file.endsWith('.pdf')?'application/pdf':file.endsWith('.json')?'application/json; charset=utf-8':'text/html; charset=utf-8');
  res.setHeader('Accept-Ranges','bytes');
  let start=0,end=size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
   if(!match||Number(match[1])>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
   start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;
   if(end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
   status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);
  }
  res.setHeader('Content-Length',end-start+1);res.writeHead(status);
  if(req.method==='HEAD'){res.end();return;}
  createReadStream(filename,{start,end}).pipe(res);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||8767),'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+(process.env.PORT||8767)));
