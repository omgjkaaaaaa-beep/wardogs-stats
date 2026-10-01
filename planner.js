const plannerCanvas = document.querySelector('#plan-canvas');
const plannerContext = plannerCanvas.getContext('2d');
const plannerStatus = document.querySelector('#plan-status');
let plannerImage = null;
let plan = {version:1,map:'Bakurani',bounds:{xmin:0,xmax:160,ymin:0,ymax:160},origin:null,target:null,route:[]};
function validPoint(point) { return point && Number.isFinite(point.x) && Number.isFinite(point.y) && Math.abs(point.x) <= 100000 && Math.abs(point.y) <= 100000 && typeof point.label === 'string' && point.label.length <= 50; }
function validatePlan(value) {
  if (!value || value.version !== 1 || !['Bakurani','Ozeti','Zestafona'].includes(value.map) || !value.bounds || !Array.isArray(value.route) || value.route.length > 100 || value.route.some(p=>!validPoint(p)) || value.origin !== null && !validPoint(value.origin) || value.target !== null && !validPoint(value.target)) throw new Error('Файл не похож на план WARDOGS.');
  const b=value.bounds;
  if (!['xmin','xmax','ymin','ymax'].every(k=>Number.isFinite(b[k])&&Math.abs(b[k])<=100000) || b.xmax<=b.xmin || b.ymax===b.ymin) throw new Error('Некорректные границы карты.');
  return {version:1,map:value.map,bounds:{xmin:b.xmin,xmax:b.xmax,ymin:b.ymin,ymax:b.ymax},origin:value.origin ? {...value.origin} : null,target:value.target ? {...value.target} : null,route:value.route.map(p=>({...p}))};
}
function setBoundsFields() {for(const key of ['xmin','xmax','ymin','ymax']) document.querySelector('#map-'+key[0]+'-'+key.slice(1)).value=plan.bounds[key];}
function readBounds() {
  const b={};for(const key of ['xmin','xmax','ymin','ymax']) {const field=document.querySelector('#map-'+key[0]+'-'+key.slice(1));if(!field.value.trim())throw new Error('Заполните все границы карты.');b[key]=Number(field.value);}
  plan=validatePlan({...plan,bounds:b});
}
function persistPlan() {try{localStorage.setItem('wardogs-plan-'+plan.map,JSON.stringify(plan));}catch{ /* Export works when local storage is unavailable. */ }}
function screenPoint(p) {const b=plan.bounds;return {x:(p.x-b.xmin)/(b.xmax-b.xmin)*900,y:(b.ymax-p.y)/(b.ymax-b.ymin)*600};}
function drawPlan() {
  const c=plannerContext;c.clearRect(0,0,900,600);c.fillStyle='#182117';c.fillRect(0,0,900,600);
  if(plannerImage){c.drawImage(plannerImage,0,0,900,600);c.fillStyle='#0a140933';c.fillRect(0,0,900,600);}
  c.font='12px monospace';c.lineWidth=1;
  for(let i=0;i<=10;i++){const x=i*90,y=i*60;c.strokeStyle='#b0c39355';c.beginPath();c.moveTo(x,0);c.lineTo(x,600);c.moveTo(0,y);c.lineTo(900,y);c.stroke();c.fillStyle='#eef1d7';c.fillText((plan.bounds.xmin+(plan.bounds.xmax-plan.bounds.xmin)*i/10).toFixed(1),Math.min(x+4,858),16);if(i>0)c.fillText((plan.bounds.ymax-(plan.bounds.ymax-plan.bounds.ymin)*i/10).toFixed(1),4,Math.min(y-4,590));}
  if(plan.route.length){c.strokeStyle='#ddbd77';c.lineWidth=3;c.beginPath();plan.route.forEach((p,i)=>{const s=screenPoint(p);if(i)c.lineTo(s.x,s.y);else c.moveTo(s.x,s.y);});c.stroke();}
  if(plan.origin&&plan.target){const a=screenPoint(plan.origin),b=screenPoint(plan.target);c.strokeStyle='#e3ddba';c.setLineDash([8,6]);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.setLineDash([]);}
  function marker(p,color,label){if(!p)return;const s=screenPoint(p);c.fillStyle=color;c.strokeStyle='#111';c.lineWidth=2;c.beginPath();c.arc(s.x,s.y,7,0,Math.PI*2);c.fill();c.stroke();const text=p.label||label;c.font='bold 14px sans-serif';c.lineWidth=4;c.strokeStyle='#10180f';const tx=Math.min(Math.max(s.x+12,5),Math.max(5,895-c.measureText(text).width));const ty=Math.min(Math.max(s.y-12,25),585);c.strokeText(text,tx,ty);c.fillText(text,tx,ty);}
  marker(plan.origin,'#aedb8d','Моя позиция');marker(plan.target,'#ef9f84','Цель');plan.route.forEach((p,i)=>marker(p,'#ddbd77',String(i+1)));
  const parts=[];
  if(plan.origin&&plan.target)parts.push('До цели: '+(Math.hypot(plan.target.x-plan.origin.x,plan.target.y-plan.origin.y)*100).toLocaleString('ru',{maximumFractionDigits:1})+' м');
  let length=0;for(let i=1;i<plan.route.length;i++)length+=Math.hypot(plan.route[i].x-plan.route[i-1].x,plan.route[i].y-plan.route[i-1].y)*100;
  parts.push('Точек маршрута: '+plan.route.length);if(plan.route.length>1)parts.push('Длина маршрута: '+length.toLocaleString('ru',{maximumFractionDigits:1})+' м');
  plannerStatus.textContent=parts.join('. ')+'. '+(plannerImage?'Используется загруженное изображение.':'Подложка: координатная сетка, не карта местности.');
  const list=document.querySelector('#plan-points');list.replaceChildren();
  for(const [label,p] of [['Моя позиция',plan.origin],['Цель',plan.target],...plan.route.map((p,i)=>['Маршрут '+(i+1),p])]){if(!p)continue;const li=document.createElement('li');li.textContent=`${label}${p.label?' — '+p.label:''}: X ${p.x.toFixed(2)}, Y ${p.y.toFixed(2)}`;list.append(li);}
}
function addPlanPoint(x,y) {
  readBounds();const point={x,y,label:document.querySelector('#plan-label').value.trim().slice(0,50)};if(!validPoint(point))throw new Error('Проверьте координаты точки.');
  const b=plan.bounds;if(x<b.xmin||x>b.xmax||y<Math.min(b.ymin,b.ymax)||y>Math.max(b.ymin,b.ymax))throw new Error('Точка вне границ сетки. Измените границы или координаты.');
  const mode=document.querySelector('#plan-mode').value;
  if(mode==='route'){if(plan.route.length>=100)throw new Error('В маршруте может быть до 100 точек.');plan.route.push(point);}else plan[mode]=point;
  persistPlan();drawPlan();
}
plannerCanvas.addEventListener('click',event=>{try{readBounds();const r=plannerCanvas.getBoundingClientRect();const b=plan.bounds;const x=b.xmin+(event.clientX-r.left)/r.width*(b.xmax-b.xmin);const y=b.ymax-(event.clientY-r.top)/r.height*(b.ymax-b.ymin);addPlanPoint(x,y);}catch(error){plannerStatus.textContent=error.message;}});
document.querySelector('#plan-add').addEventListener('click',()=>{try{const x=document.querySelector('#plan-x').value,y=document.querySelector('#plan-y').value;if(!x.trim()||!y.trim())throw new Error('Введите X и Y.');addPlanPoint(Number(x),Number(y));}catch(error){plannerStatus.textContent=error.message;}});
for(const key of ['xmin','xmax','ymin','ymax'])document.querySelector('#map-'+key[0]+'-'+key.slice(1)).addEventListener('change',()=>{try{readBounds();persistPlan();drawPlan();}catch(error){plannerStatus.textContent=error.message;}});
document.querySelector('#plan-undo').addEventListener('click',()=>{plan.route.pop();persistPlan();drawPlan();});
document.querySelector('#plan-clear').addEventListener('click',()=>{plan.origin=null;plan.target=null;plan.route=[];persistPlan();drawPlan();});
document.querySelector('#plan-image').addEventListener('change',async event=>{try{const file=event.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error('Выберите PNG, JPEG или WebP до 10 МБ.');const bitmap=await createImageBitmap(file);if(bitmap.width>10000||bitmap.height>10000){bitmap.close();throw new Error('Размер изображения не должен превышать 10 000 пикселей по стороне.');}plannerImage?.close();plannerImage=bitmap;drawPlan();}catch(error){plannerStatus.textContent=error.message;}});
document.querySelector('#plan-export').addEventListener('click',()=>{try{readBounds();const url=URL.createObjectURL(new Blob([JSON.stringify(plan,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='wardogs-'+plan.map.toLowerCase()+'-plan.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){plannerStatus.textContent=error.message;}});
document.querySelector('#plan-import').addEventListener('change',async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>200000)throw new Error('Файл плана слишком большой.');plan=validatePlan(JSON.parse(await file.text()));plannerImage?.close();plannerImage=null;document.querySelector('#plan-image').value='';document.querySelector('#plan-map').value=plan.map;setBoundsFields();persistPlan();drawPlan();}catch{plannerStatus.textContent='Не удалось открыть план. Проверьте формат файла и координаты.';}event.target.value='';});
function loadMapPlan(map){const external=document.querySelector('#external-map');external.href='https://wardogs.n4lab.dev/?map='+map.toLowerCase()+'&mode=view&lang=ru';external.textContent='Открыть карту '+map+' в N4Lab ↗';plan={version:1,map,bounds:{xmin:0,xmax:160,ymin:0,ymax:160},origin:null,target:null,route:[]};try{const saved=localStorage.getItem('wardogs-plan-'+map);if(saved){const value=validatePlan(JSON.parse(saved));if(value.map===map)plan=value;}}catch{}setBoundsFields();drawPlan();}
document.querySelector('#plan-map').addEventListener('change',event=>{plannerImage?.close();plannerImage=null;document.querySelector('#plan-image').value='';loadMapPlan(event.target.value);});
loadMapPlan('Bakurani');
function calculateAmmo(guns,shells,volleys,perShell,stock){if(![guns,shells,volleys,perShell,stock].every(Number.isSafeInteger)||guns<1||guns>1000||shells<1||shells>3||volleys<1||volleys>10000||perShell<1||perShell>100000||stock<0||stock>1e9)throw new Error('Проверьте количество орудий, залпов и боеприпасов.');const shotCount=guns*shells*volleys,needed=shotCount*perShell;return{shotCount,needed,missing:Math.max(0,needed-stock),available:Math.floor(stock/(guns*shells*perShell))};}
document.querySelector('#ammo-form').addEventListener('submit',event=>{event.preventDefault();const result=document.querySelector('#ammo-result');try{const values=['guns','shells','volleys','per-shell','stock'].map(k=>Number(document.querySelector('#ammo-'+k).value));const v=calculateAmmo(...values);result.textContent=`Снарядов: ${v.shotCount.toLocaleString('ru')}. Нужно припасов: ${v.needed.toLocaleString('ru')}. Запаса хватит на ${v.available.toLocaleString('ru')} полных залпов всеми орудиями. ${v.missing?'Не хватает '+v.missing.toLocaleString('ru')+' единиц.':'Припасов достаточно.'}`;}catch(error){result.textContent=error.message;}});
