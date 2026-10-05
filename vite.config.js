import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';

const page = (p) => fileURLToPath(new URL(p, import.meta.url));
const legacyRedirects = {'nomadcast/index.html':'../experience/food-drying/','nomadcast/decide.html':'../experience/food-drying/','nomadcast/weather-guide.html':'../signals/introduction/','jinxi/index.html':'../cases/jinxi/'};

// public/signals/ is the Temperature Comparison app, served as-is (classic scripts, no bundling).
export default defineConfig({
  base: './',
  plugins: [{
    name: 'legacy-route-migration',
    generateBundle() {
      for (const [fileName, target] of Object.entries(legacyRedirects)) this.emitFile({type:'asset', fileName, source:`<!doctype html><html><head><meta charset="utf-8"><title>Weatherbridge</title></head><body><a href="${target}">Continue to Weatherbridge</a><script src="../route-redirect.js" data-target="${target}"></script></body></html>`});
      for (const name of readdirSync(page('./jinxi/assets/'))) this.emitFile({type:'asset', fileName:'jinxi/assets/'+name, source:readFileSync(page('./jinxi/assets/'+name))});
    },
    configureServer(server) {
      server.middlewares.use((req,res,next)=>{
        const url=new URL(req.url,'http://localhost');
        let key=url.pathname.slice(1);
        if(key.endsWith('/'))key+='index.html';
        if(!legacyRedirects[key])return next();
        res.writeHead(302,{Location:new URL(legacyRedirects[key],url).pathname+url.search});
        res.end();
      });
    }
  }],
  build: {
    rollupOptions: {
      input: {
        origin: page('./index.html'),
        research: page('./research/index.html'),
        jinxi: page('./cases/jinxi/index.html'),
        malawi: page('./cases/malawi/index.html'),
        mexicoCity: page('./cases/mexico-city/index.html'),
        drying: page('./experience/food-drying/index.html'),
        debrief: page('./experience/food-drying/debrief/index.html'),
      },
    },
  },
});
