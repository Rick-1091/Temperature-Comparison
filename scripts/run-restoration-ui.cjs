const {spawn}=require('node:child_process');
const path=require('node:path');
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','8031','--strictPort'],{stdio:['ignore','pipe','pipe'],windowsHide:true});
server.stdout.on('data',s=>process.stdout.write(s));server.stderr.on('data',s=>process.stderr.write(s));
const run=file=>new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,[file],{stdio:'inherit',windowsHide:true,env:{...process.env,WEATHERBRIDGE_PREVIEW_URL:'http://127.0.0.1:8031/'}});
 child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(file+' exited '+code)));
});
(async()=>{
 try{
  let ready=false;
  for(let i=0;i<40;i++){
   try{const response=await fetch('http://127.0.0.1:8031/');if(response.ok){ready=true;break;}}catch{}
   await new Promise(r=>setTimeout(r,250));
  }
  if(!ready)throw new Error('Preview did not start');
  for(const file of process.argv.slice(2).length?process.argv.slice(2):['scripts/verify-exploration-ui.cjs','scripts/verify-market-ui.cjs'])await run(file);
 }finally{server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
