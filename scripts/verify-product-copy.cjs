// Editorial tripwire for original Chinese UI copy. Keep source data outside this scan.
const fs=require('node:fs'),path=require('node:path');
const roots=['index.html','src','public','research','cases','experience','nomadcast','jinxi','huggingface'];
const patterns=[/不代表/g,/不能代表/g,/不等于/g,/不是/g,/并非/g,/不只是/g,/而是/g,/并不意味着/g,/不仅是/g];
const files=[];
// User-supplied source document is kept verbatim, like an archived quotation.
const preservedOriginals=new Set(['public/research-documents/weather-risk-hedging-original.html','public/research-documents/polymarket-research.html']);
function walk(p){const stat=fs.statSync(p);if(stat.isDirectory()){for(const e of fs.readdirSync(p)){if(!['data','assets','node_modules'].includes(e))walk(path.join(p,e));}}else if(/\.(html|js)$/.test(p))files.push(p);}
roots.forEach(walk);
const failures=[];
for(const file of files){if(preservedOriginals.has(file.replaceAll('\\','/')))continue;fs.readFileSync(file,'utf8').split(/\r?\n/).forEach((line,i)=>{for(const pattern of patterns){pattern.lastIndex=0;if(pattern.test(line))failures.push(`${file}:${i+1} ${pattern.source}`);}});}
if(failures.length){console.error('Review these original-copy phrases:\n'+failures.join('\n'));process.exitCode=1;}
else console.log(`Product-copy check passed across ${files.length} HTML/JS files. Manual context and English review remain required.`);
