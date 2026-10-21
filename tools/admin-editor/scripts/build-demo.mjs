import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=name=>readFile(new URL(name,root),'utf8');
let html=await read('web/index.html');
html=html.replace('<body>','<body data-demo="true">').replace('<link rel="stylesheet" href="styles.css">','<style>'+await read('web/styles.css')+'</style>');
for(const name of ['core.js','app.js'])html=html.replace('<script src="'+name+'"></script>','<script>\n'+(await read('web/'+name)).replace(/<\/script/gi,'<\\/script')+'\n</script>');
await writeFile(new URL('admin-editor-demo.html',root),html);console.log('Built standalone demo; memory only, no server writes.');
