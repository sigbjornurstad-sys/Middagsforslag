const $=id=>document.getElementById(id);
const foods={meat:['Kylling','Svinefilet','Storfe','Kalkun','Lam','Kjøttdeig'],fish:['Laks','Torsk','Sei','Lyr','Ørret','Kveite'],veg:['Kikerter','Bønner','Linser','Tofu','Halloumi','Sopp']};
let chosen=0, recipes=[], portion=4, gluten=false, ingredient='Kylling';
let previousSuggestionKeys=[];
const favoriteStoreKey='middagsforslag-favorites-v1';
let favorites=[];
try { const saved=JSON.parse(localStorage.getItem(favoriteStoreKey)||'[]');if(Array.isArray(saved)) favorites=saved.filter(x=>x&&x.title&&Array.isArray(x.ingredients)); }catch(e){}
function favoriteKey(r){return [r.title,r.url||'',r.originalTitle||''].join('|');}
function saveFavorites(){try{localStorage.setItem(favoriteStoreKey,JSON.stringify(favorites));}catch(e){alert('Favorittene kunne ikke lagres på denne enheten.');}}
function randomTen(all){
 const unseen=all.filter(x=>!previousSuggestionKeys.includes(favoriteKey(x)));
 function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 const next=[...shuffle(unseen),...shuffle(all.filter(x=>previousSuggestionKeys.includes(favoriteKey(x))))].slice(0,10);
 previousSuggestionKeys=next.map(favoriteKey);return next;
}
function renderFavorites(){
 const box=$('favorites-list');if(!box)return;
 box.innerHTML=favorites.length?favorites.map((r,i)=>`<div class="favorite-entry"><span>${escapeHtml(r.title)}</span><div><button type="button" data-show-fav="${i}">Vis</button> <button type="button" data-del-fav="${i}">Fjern</button></div></div>`).join(''):'<p class="hint">Ingen favoritter lagret ennå.</p>';
 box.querySelectorAll('[data-show-fav]').forEach(b=>b.onclick=()=>{recipes=[JSON.parse(JSON.stringify(favorites[Number(b.dataset.showFav)]))];chosen=0;render();$('results').scrollIntoView({block:'start'});});
 box.querySelectorAll('[data-del-fav]').forEach(b=>b.onclick=()=>{favorites.splice(Number(b.dataset.delFav),1);saveFavorites();renderFavorites();if(recipes.length)render();});
}
const ingredientLabels={Svinefilet:'Svin',Storfe:'Okse'};
function options(){
 const category=$('category').value;
 if(!foods[category].includes($('main').value))$('main').value=foods[category][0];
 $('ingredient-options').innerHTML=foods[category].map((x,i)=>`<label class="ingredient-choice"><input type="radio" name="main-choice" data-ingredient value="${x}" ${x===$('main').value?'checked':''}><span>${ingredientLabels[x]||x}</span></label>`).join('');
 document.querySelectorAll('[data-ingredient]').forEach(radio=>radio.onchange=()=>{$('main').value=radio.value;});
}
$('category').onchange=()=>{$('main').value=foods[$('category').value][0];options();};options();
const it=(name,n,unit)=>({name,n,unit});
function makeRecipes(main,category,gf){
 const veg=category==='veg',fish=category==='fish',legume=['Kikerter','Bønner','Linser'].includes(main);
 const mainLabel=legume?main+' (kokte, avrent)':main;
 const base=[it(mainLabel,legume?180:main==='Sopp'?250:main==='Halloumi'?125:175,'g'),it('Olje',.5,'ss'),it('Salt',.125,'ts'),it('Pepper',.125,'ts')];
 const prep=legume?`Skyll og la ${main.toLowerCase()} renne av. De er ferdig kokt og skal bare varmes.`:main==='Kjøttdeig'?'Brun kjøttdeigen i olje og stek den helt gjennom.':fish?`Del ${main.toLowerCase()} i store biter. Stek forsiktig i olje til fisken er gjennomtilberedt og flaker seg.`:veg?`Del ${main.toLowerCase()} i biter og stek i olje til gyllen. Sopp stekes til væsken har fordampet.`:`Skjær ${main.toLowerCase()} i strimler og stek i olje til gjennomstekt. Tilpass tiden til tykkelsen på bitene.`;
 return [
 {title:`${main} med ris og grønnsaker`,time:'30 min',ingredients:[...base,it('Ris (tørr)',75,'g'),it('Brokkoli',125,'g'),it('Gulrot',.5,'stk'),it(gf?'Glutenfri soyasaus':'Soyasaus',.5,'ss'),it('Lime',.25,'stk')],steps:['Kok risen etter anvisningen på pakken. Skjær brokkoli i buketter og gulrot i tynne skiver.',prep,'Stek grønnsakene i samme panne i 5–8 minutter, til passe møre. Tilsett litt vann ved behov.','Vend inn hovedingrediensen og soyasausen. Smak til med salt, pepper og lime. Server med risen.']},
 {title:`Kremet pasta med ${main.toLowerCase()}`,time:'30 min',ingredients:[...base,it(gf?'Glutenfri pasta (tørr)':'Pasta (tørr)',90,'g'),it('Matfløte',.75,'dl'),it('Spinat',50,'g'),it('Cherrytomater',100,'g'),it('Hvitløk',.5,'fedd'),it('Sitron',.25,'stk')],steps:['Kok pastaen etter anvisningen på pakken. Spar litt av kokevannet.',prep,'Tilsett finhakket hvitløk og halve tomater, og stek i 2 minutter. Hell i matfløte og la småkoke i 3–5 minutter.','Rør inn spinat til den faller sammen. Vend inn pastaen, og spe med kokevann ved behov. Smak til med sitron, salt og pepper.']},
 {title:`${main} med ovnspoteter`,time:'40 min',ingredients:[...base,it('Poteter',250,'g'),it('Gulrot',1,'stk'),it('Paprika',.5,'stk'),it('Naturell yoghurt',.5,'dl'),it('Sitron',.25,'stk'),it('Hvitløk',.5,'fedd')],steps:['Sett ovnen på 220 °C over- og undervarme. Skjær poteter og gulrøtter i små biter og paprika i strimler.','Vend grønnsakene i halvparten av oljen, salt og pepper. Spre utover et stekebrett og stek i 25–35 minutter, til potetene er møre. Vend underveis.',prep.replace('i olje','i resten av oljen'),'Rør yoghurt sammen med finhakket hvitløk og sitronsaft. Smak til og server sammen med hovedingrediensen og ovnsgrønnsakene.']}
 ];
}
function extraRecipes(main,category,gf){
 const first=makeRecipes(main,category,gf)[0];
 const base=first.ingredients.slice(0,4),prep=first.steps[1];
 return [
 {title:`Taco med ${main.toLowerCase()}`,time:'25 min',ingredients:[...base,it(gf?'Glutenfrie tortillalefser':'Tortillalefser',2,'stk'),it('Spisskummen',.25,'ts'),it('Paprikapulver',.5,'ts'),it('Salat',40,'g'),it('Tomat',.5,'stk'),it('Mais (avrent)',40,'g'),it('Revet ost',30,'g'),it('Rømme',.5,'dl')],steps:[prep,'Tilsett spisskummen og paprikapulver og litt vann. La småkoke i 2–3 minutter.','Kutt salat og tomat. La maisen renne av. Varm lefsene etter anvisningen på pakken.','Fyll lefsene med hovedingrediensen, grønnsaker, ost og rømme.']},
 {title:`Kokoscurry med ${main.toLowerCase()}`,time:'30 min',ingredients:[...base,it('Ris (tørr)',75,'g'),it('Kokosmelk',1,'dl'),it('Karripulver',.5,'ts'),it('Løk',.25,'stk'),it('Paprika',.5,'stk'),it('Spinat',50,'g'),it('Lime',.25,'stk')],steps:['Kok risen etter anvisningen på pakken. Skjær løk og paprika i strimler.',prep,'Ta hovedingrediensen ut av pannen. Stek løk og paprika i oljen som er igjen i 5 minutter. Tilsett karripulver, kokosmelk og litt vann. La småkoke i 5 minutter.','Vend inn hovedingrediensen og spinaten og varm gjennom. Smak til med lime, salt og pepper. Server med ris.']},
 {title:`Tomatsuppe med ${main.toLowerCase()}`,time:'35 min',ingredients:[...base,it('Hakkede tomater',200,'g'),it('Vann',1.5,'dl'),it(gf?'Glutenfri grønnsaksbuljong':'Grønnsaksbuljong',.25,'terning'),it('Løk',.25,'stk'),it('Hvitløk',.5,'fedd'),it('Tørket oregano',.25,'ts'),it(gf?'Glutenfri pasta (tørr)':'Pasta (tørr)',40,'g')],steps:['Kok pastaen i en egen kjele etter anvisningen på pakken.',prep,'Ta hovedingrediensen ut av pannen. Stek hakket løk og hvitløk i oljen som er igjen i 3–4 minutter. Tilsett tomater, vann, buljong og oregano og la småkoke i 15 minutter.','Tilsett hovedingrediensen og den kokte pastaen. Varm gjennom, og smak til med salt og pepper.']}
 ];
}
function amount(x){if(x.n===0)return 'Etter behov';let n=x.n*portion;return n.toLocaleString('nb-NO',{maximumFractionDigits:2})+' '+x.unit;}
function render(){const r=recipes[chosen];$('results').innerHTML=`<h2>${recipes.length===1?'Din valgte rett til':'Ti forslag til'} ${portion} ${portion===1?'person':'personer'}</h2>${recipes.length>1?'<p class="hint">Et variert utvalg fra MatPrat, Godt, MENY og andre matnettsteder. Trykk igjen for nye forslag. Varianter med din hovedingrediens er merket i oppskriften.</p>':''}<div class="choices">${recipes.map((x,i)=>`<button type="button" class="choice ${i===chosen?'active':''}" data-choice="${i}" aria-pressed="${i===chosen}">${escapeHtml(x.title)}<small>${x.time} · ${escapeHtml(x.source||"Appens egen oppskrift")}</small></button>`).join('')}</div><p><button type="button" id="favorite-button">${favorites.some(f=>favoriteKey(f)===favoriteKey(r))?"★ Fjern fra favoritter":"☆ Legg til favoritter"}</button></p><article class="panel"><h2>${escapeHtml(r.title)}</h2>${r.url?`<a class="source-link" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">Kilde: ${escapeHtml(r.source)} · Åpne originaloppskriften</a><p class="hint">Original: ${escapeHtml(r.originalTitle||r.title)}</p>`:`<p class="hint">Kilde: Appens egen oppskrift.</p>`}<div class="meta"><span class="pill">${r.time}</span><span class="pill">${portion} porsjoner</span>${gluten?'<span class="pill">Glutenfritt</span>':''}</div><div class="details"><section><h3>Dette trenger du</h3><ul class="ingredients">${r.ingredients.map(x=>`<li><span>${x.name}</span><span>${amount(x)}</span></li>`).join('')}</ul></section><section><h3>Slik gjør du</h3>${r.url?`<p>Følg fremgangsmåten i <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">originaloppskriften hos ${escapeHtml(r.source)}</a>.</p>`:""}<ol>${r.steps.map(x=>`<li>${x}</li>`).join('')}</ol>${(r.notes||[]).map(note=>`<p class="source-notes">${escapeHtml(note)}</p>`).join("")}</section></div>${gluten?'<p class="hint">Velg produkter merket glutenfri der det er relevant, og kontroller ingredienslisten på ferdigprodukter. Bruk rene redskaper og unngå kontakt med glutenholdig mat.</p>':''}</article>`;
 $('shopping').innerHTML=r.ingredients.map((x,i)=>`<label><input type="checkbox" aria-label="${x.name}"><span>${x.name} · ${amount(x)}</span></label>`).join('');$('status').textContent='';
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{chosen=Number(b.dataset.choice);render();});
 $('favorite-button').onclick=()=>{const i=favorites.findIndex(f=>favoriteKey(f)===favoriteKey(r));if(i>=0)favorites.splice(i,1);else favorites.push(JSON.parse(JSON.stringify(r)));saveFavorites();render();};renderFavorites();
}
function generate(){const cat=$('category').value;const raw=$('main').value.trim().toLocaleLowerCase('nb');const match=foods[cat].find(x=>x.toLocaleLowerCase('nb')===raw);if(!match){$('error').textContent='Velg en av hovedingrediensene, eller bytt kategori for flere valg.';return;}let n=Number($('people').value);if(!Number.isInteger(n)||n<1||n>30){$('error').textContent='Velg mellom 1 og 30 personer.';return;}$('error').textContent='';ingredient=match;portion=n;gluten=$('gf').checked;const all=allRecipes(ingredient,cat,gluten);const rawDish=$('dish').value.trim();const dish=resolveDish(rawDish);if(rawDish&&dish<0){$('error').textContent='Denne retten finnes ikke ennå. Velg for eksempel Pizza, Burger, Lasagne eller en annen rett fra listen.';return;}recipes=rawDish===''?randomTen(dinnerRecipes(ingredient,cat,gluten)):[all[dish]];chosen=0;render();}
$('form').onsubmit=e=>{e.preventDefault();generate();};
$('copy').onclick=async()=>{const text=`Handleliste: ${recipes[chosen].title}\n${portion} personer${gluten?' · Glutenfritt':''}\n${recipes[chosen].url?'Kilde: '+recipes[chosen].source+'\n'+recipes[chosen].url:'Kilde: Appens egen oppskrift'}\n\n`+recipes[chosen].ingredients.map(x=>`☐ ${x.name}: ${amount(x)}`).join('\n');try{await navigator.clipboard.writeText(text);$('status').textContent='Handlelisten er kopiert.';}catch{const t=document.createElement('textarea');t.value=text;t.style.width='100%';t.rows=12;$('status').replaceChildren(t);t.select();$('status').append(' Kopier teksten fra feltet.');}};
$('dishes').innerHTML=dishNames.map(x=>`<option value="${x}">`).join('');
generate();
renderFavorites();
