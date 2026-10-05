// Retire competing chapter URLs while preserving the shared selection and language.
const script=document.currentScript;
let target=script.dataset.target;
if(script.dataset.legacySignals)target=location.hash.includes('professional')?'explore/':location.hash.includes('research')?'methods/':'guide/';
const destination=new URL(target,location.href);
destination.search=location.search;
location.replace(destination.href);

