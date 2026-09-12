const db=window.EA_SUPABASE, app=document.querySelector('#app');
const A='/assets/';
const NAV=[
 ['home','⌂','Beranda'],['works','✦','Karya'],['create','＋','Buat'],['stats','◒','Statistik'],['profile','◉','Profil']
];
let state={session:null,user:null,profile:null,active:'home',loading:false,works:[],myWorks:[],query:'',selectedWork:null,selectedChapter:null,stats:{progress:0,targets:0,projects:0,journal:0},isOwner:false};

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const toast=(m)=>{const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)};
const fmt=d=>d?new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'';
const safeTags=v=>Array.isArray(v)?v:[];
function coverUrl(path){if(!path)return A+'logo.png'; if(/^https?:/i.test(path))return path; return db.storage.from('profile-media').getPublicUrl(path).data.publicUrl}
function workCover(path){return path?coverUrl(path):A+'logo.png'}

function splash(){
 app.innerHTML=`<div class="splash"><img class="bg" src="${A}splash.jpg"><div class="content"><img class="logo" src="${A}logoea.png"><div class="tag">YOUR PERSONALIZED PLANNING JOURNEY</div></div></div>`;
 setTimeout(init,1200);
}
async function init(){
 const {data}=await db.auth.getSession(); state.session=data.session; state.user=data.session?.user||null;
 if(!state.user){welcome();return}
 await loadProfile(); dashboard();
 db.auth.onAuthStateChange(async(_e,s)=>{state.session=s;state.user=s?.user||null;if(state.user){await loadProfile();}else{state.profile=null;welcome();}});
}
async function loadProfile(){
 const {data,error}=await db.from('profiles').select('*').eq('id',state.user.id).maybeSingle();
 if(error){console.error(error);return}
 state.profile=data||{id:state.user.id,name:state.user.email?.split('@')[0]||'Kreator'};
 state.isOwner=!!state.profile?.is_owner;
}
function welcome(){
 app.innerHTML=`<div class="authShell"><div class="authVisual"><div class="visualText"><div class="ey">PLAN · CREATE · REFLECT · GROW</div><h1>Rancang hidupmu.<br>Rawat perjalananmu.</h1><p>Ruang untuk merencanakan langkah, menyimpan ide, menulis karya, mengelola proyek, dan berbagi cerita dengan dunia.</p></div></div><div class="authPanel"><div class="authBox"><img class="miniLogo" src="${A}logoea.png"><h2>Mulai perjalananmu.</h2><p class="sub">Bangun ruang privatmu, lalu publikasikan karya ketika kamu siap.</p><div class="form"><button class="goldBtn" onclick="auth('register')">Buat Akun</button><button class="ghostBtn" onclick="auth('login')">Sudah punya akun? Masuk</button></div></div></div></div>`;
}
function auth(mode){
 const reg=mode==='register';
 app.innerHTML=`<div class="ea-page authPanel"><div class="authBox"><img class="miniLogo" src="${A}logoea.png"><h2>${reg?'Buat akun.':'Selamat datang kembali.'}</h2><p class="sub">${reg?'Buat ruang perjalanan pribadimu.':'Masuk untuk melanjutkan perjalananmu.'}</p><form class="form" onsubmit="submitAuth(event,'${mode}')">${reg?'<input class="input" id="name" placeholder="Nama" required><input class="input" id="username" placeholder="Username" required>':''}<input class="input" id="email" type="email" placeholder="Email" required><input class="input" id="password" type="password" minlength="6" placeholder="Password" required><div id="err" class="error"></div><button class="goldBtn">${reg?'Buat Akun':'Masuk'}</button></form><div class="switch" style="margin-top:16px"><button class="link ghostBtn" onclick="welcome()">← Kembali</button> <button class="link ghostBtn" onclick="forgot()">Lupa password</button></div></div></div>`;
}
async function submitAuth(e,mode){
 e.preventDefault(); const email=document.querySelector('#email').value.trim(), password=document.querySelector('#password').value;
 if(mode==='login'){const {error}=await db.auth.signInWithPassword({email,password}); if(error)document.querySelector('#err').textContent=error.message; else{await loadProfile();dashboard()}return}
 const name=document.querySelector('#name').value.trim(), username=document.querySelector('#username').value.trim();
 const {data,error}=await db.auth.signUp({email,password,options:{data:{name,username}}});
 if(error){document.querySelector('#err').textContent=error.message;return}
 if(data.user){state.user=data.user;state.session=data.session;await db.from('profiles').upsert({id:data.user.id,name,username,email,updated_at:new Date().toISOString()});await loadProfile();onboarding();}
}
async function forgot(){
 app.innerHTML=`<div class="ea-page authPanel"><div class="authBox"><h2>Reset password.</h2><p class="sub">Masukkan email untuk menerima instruksi pemulihan.</p><form class="form" onsubmit="event.preventDefault();sendReset()"><input class="input" id="resetEmail" type="email" placeholder="Email" required><button class="goldBtn">Kirim instruksi</button></form><button class="ghostBtn" style="margin-top:12px" onclick="auth('login')">Kembali</button></div></div>`;
}
async function sendReset(){const email=document.querySelector('#resetEmail').value.trim();const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin});toast(error?error.message:'Instruksi reset password telah dikirim.');}

function onboarding(){
 state.onStep=1; state.selected=state.profile?.focus||[]; renderOnboarding();
}
function renderOnboarding(){
 const steps=['Fokus','Tentangmu','Target'];
 const body=state.onStep===1?`<div class="kicker">LANGKAH 1</div><h2>Apa yang ingin kamu kembangkan?</h2><p class="sub">Pilih yang paling dekat dengan perjalananmu.</p><div class="choices">${['Karya','Bisnis','Karier','Pendidikan','Kehidupan','Kreativitas'].map(x=>`<button class="choice ${state.selected.includes(x)?'selected':''}" onclick="pick('${x}')">${state.selected.includes(x)?'✓':'○'} ${x}</button>`).join('')}</div>`:
 state.onStep===2?`<div class="kicker">LANGKAH 2</div><h2>Ceritakan sedikit tentangmu.</h2><p class="sub">Profil dapat diubah kapan saja.</p><textarea class="textarea" id="bio" placeholder="Apa yang sedang kamu perjuangkan atau bangun?">${esc(state.profile?.bio||'')}</textarea>`:
 `<div class="kicker">LANGKAH 3</div><h2>Apa target utamamu?</h2><p class="sub">Mulai dari satu target yang benar-benar berarti.</p><input class="input" id="firstGoal" placeholder="Contoh: menyelesaikan karya pertama saya">`;
 app.innerHTML=`<div class="ea-page onboard"><div class="onboardBox"><div class="brandText">EA PLAN</div><div class="steps">${steps.map((_,i)=>`<i class="${i+1<=state.onStep?'active':''}"></i>`).join('')}</div>${body}<div class="actions">${state.onStep>1?'<button class="ghostBtn" onclick="state.onStep--;renderOnboarding()">Kembali</button>':''}<button class="goldBtn" onclick="nextOnboard()">${state.onStep<3?'Lanjut':'Masuk ke EA PLAN'}</button></div></div></div>`;
}
function pick(x){state.selected=state.selected.includes(x)?state.selected.filter(y=>y!==x):[...state.selected,x];renderOnboarding()}
async function nextOnboard(){
 if(state.onStep<3){state.onStep++;renderOnboarding();return}
 const bio=document.querySelector('#bio')?.value?.trim()||state.profile?.bio||'';
 const goal=document.querySelector('#firstGoal')?.value?.trim();
 await db.from('profiles').upsert({id:state.user.id,name:state.profile?.name||state.user.user_metadata?.name||'Kreator',username:state.profile?.username||state.user.user_metadata?.username||'',email:state.user.email,bio,focus:state.selected,onboarding_completed:true,updated_at:new Date().toISOString()});
 if(goal)await db.from('goals').insert({user_id:state.user.id,title:goal,status:'active',progress:0});
 await loadProfile();dashboard();
}

async function dashboard(){state.active='home';await loadStats();await loadPublic();renderApp()}
async function loadStats(){
 const uid=state.user.id;
 const [g,p,j]=await Promise.all([
  db.from('goals').select('id,progress,status').eq('user_id',uid),
  db.from('projects').select('id,progress,status').eq('user_id',uid),
  db.from('journal_entries').select('id').eq('user_id',uid)
 ]);
 const goals=g.data||[], projects=p.data||[], journal=j.data||[];
 const progress=goals.length?Math.round(goals.reduce((a,x)=>a+(Number(x.progress)||0),0)/goals.length):0;
 state.stats={progress,targets:goals.filter(x=>x.status!=='completed').length,projects:projects.length,journal:journal.length};
}
async function loadPublic(query=''){
 let q=db.from('works').select('id,user_id,title,slug,description,cover_url,work_type,tags,views,likes_count,published_at,created_at,profiles!works_user_id_fkey(name,username)').eq('visibility','public').eq('status','published').order('published_at',{ascending:false}).limit(30);
 if(query)q=q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
 const {data}=await q;state.works=data||[];
}
function shell(content,title){
 const n=NAV.find(x=>x[0]===state.active)||NAV[0];
 return `<div class="ea-page"><div class="appShell"><aside class="side"><div class="sideBrand"><img src="${A}logoea.png"><span>EA PLAN</span></div><nav class="nav">${NAV.map(x=>`<button class="${x[0]===state.active?'active':''}" onclick="go('${x[0]}')">${x[1]}&nbsp;&nbsp;${x[2]}</button>`).join('')}</nav></aside><main class="main"><header class="top"><div><div class="kicker">RUANG PERJALANAN</div><h2>${esc(title||n[2])}</h2></div><div class="avatar" onclick="go('profile')">${state.profile?.avatar_url?`<img src="${esc(coverUrl(state.profile.avatar_url))}" style="width:100%;height:100%;object-fit:cover">`:esc((state.profile?.name||'EA').slice(0,2).toUpperCase())}</div></header>${content}</main><nav class="mobileNav">${NAV.map(x=>`<button class="${x[0]===state.active?'active':''}" onclick="go('${x[0]}')"><b>${x[1]}</b>${x[2]}</button>`).join('')}</nav></div></div>`;
}
function bookCard(w){return `<article class="book"><button style="border:0;background:none;color:inherit;padding:0;width:100%;text-align:left" onclick="openWork('${w.id}')"><img class="cover" src="${esc(workCover(w.cover_url))}" onerror="this.src='${A}logo.png'"><h4>${esc(w.title)}</h4><small>${esc(w.profiles?.name||w.profiles?.username||'Kreator')} · ${Number(w.views||0)} dibaca</small></button><div class="tags">${safeTags(w.tags).slice(0,3).map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div></article>`}

async function home(){
 let {data:quote}=await db.from('app_settings').select('value').eq('key','daily_quote').maybeSingle();
 const q=quote?.value||'Setiap karya besar berawal dari satu langkah kecil yang terencana.';
 const recent=state.works.slice(0,8), popular=[...state.works].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,8), interesting=[...state.works].sort((a,b)=>(b.likes_count||0)-(a.likes_count||0)).slice(0,8);
 return `<div class="grid"><article class="card full"><div class="kicker">QUOTE HARIAN</div><div class="quote">“${esc(q)}”</div>${state.isOwner?`<div class="quoteAdmin"><input class="input" id="dailyQuote" value="${esc(q)}"><button class="goldBtn" onclick="saveQuote()">Simpan</button></div>`:''}</article>
 <article class="card wide"><div class="kicker">SELAMAT DATANG, ${esc((state.profile?.name||'KREATOR').toUpperCase())}</div><h1 style="font:500 42px Georgia,serif;margin:12px 0">Rancang hidupmu.<br>Rawat perjalananmu.</h1><p class="muted">Ruang privat untuk perjalananmu, sekaligus ruang publik untuk karya yang ingin kamu bagikan.</p></article>
 <article class="card"><div class="kicker">PROGRESS</div><div class="metric">${state.stats.progress}%</div><div class="progress"><i style="width:${state.stats.progress}%"></i></div><span class="muted">${state.stats.progress}% perjalanan targetmu.</span></article>
 <article class="card"><div class="kicker">TARGET AKTIF</div><div class="metric">${state.stats.targets}</div><span class="muted">Target yang sedang kamu jalankan.</span></article>
 <article class="card"><div class="kicker">PROJECTS</div><div class="metric">${state.stats.projects}</div><span class="muted">Ruang karya yang sedang tumbuh.</span></article>
 <article class="card"><div class="kicker">JOURNAL</div><div class="metric">${state.stats.journal}</div><span class="muted">Catatan perjalananmu.</span></article>
 ${rail('TERBARU',recent)}${rail('TERPOPULER',popular)}${rail('MENARIK DILIHAT',interesting)}
 <article class="card full"><h3>Langkah hari ini</h3><div class="item">○ Tentukan satu prioritas utama</div><div class="item">○ Kerjakan tanpa menunggu semuanya sempurna</div><div class="item">○ Tulis satu hal yang kamu pelajari</div></article></div>`;
}
function rail(title,items){return `<article class="card full"><div class="sectionTitle"><h3>${title}</h3><button class="ghostBtn" onclick="go('works')">Lihat semua</button></div>${items.length?`<div class="bookRail">${items.map(bookCard).join('')}</div>`:`<p class="muted">Belum ada karya publik. Jadilah kreator pertama.</p>`}</article>`}

async function worksPage(){
 const filtered=state.works.filter(w=>!state.query||`${w.title} ${w.description} ${(w.tags||[]).join(' ')}`.toLowerCase().includes(state.query.toLowerCase()));
 return `<div class="grid"><article class="card full"><div class="searchbar"><input class="input" id="workSearch" value="${esc(state.query)}" placeholder="Cari judul, deskripsi, atau tag..."><button class="goldBtn" onclick="doSearch()">Cari</button></div><div class="sectionTitle"><h3>Karya Publik</h3><span class="muted">${filtered.length} karya</span></div><div class="bookRail" style="flex-wrap:wrap;overflow:visible">${filtered.map(bookCard).join('')}</div></article></div>`;
}

function createPage(){
 return `<div class="grid"><article class="card full"><div class="kicker">RUANG KREATOR</div><h1 style="font:500 40px Georgia,serif;margin:10px 0">Buat karya yang ingin kamu tinggalkan.</h1><p class="muted">Simpan sebagai draft, susun bab, pasang cover dan tag, lalu publikasikan ketika siap.</p><div class="row" style="margin-top:18px"><button class="goldBtn" onclick="editor()">＋ Buku / Tulisan</button><button class="ghostBtn" onclick="go('profile')">Ideas · Projects · Journal</button></div></article></div>`;
}
async function editor(id=null){
 let w=id?state.myWorks.find(x=>x.id===id):null;
 app.innerHTML=shell(`<div class="editorGrid"><section class="card"><div class="kicker">${w?'EDIT KARYA':'KARYA BARU'}</div><form class="form" onsubmit="event.preventDefault();saveWork('${w?.id||''}')"><input class="input" id="wTitle" placeholder="Judul karya" value="${esc(w?.title||'')}" required><select class="select" id="wType"><option value="book" ${w?.work_type==='book'?'selected':''}>Buku / Novel</option><option value="essay" ${w?.work_type==='essay'?'selected':''}>Esai / Tulisan</option><option value="poetry" ${w?.work_type==='poetry'?'selected':''}>Puisi</option><option value="comic" ${w?.work_type==='comic'?'selected':''}>Komik / Galeri</option></select><textarea class="textarea" id="wDesc" placeholder="Deskripsi singkat">${esc(w?.description||'')}</textarea><input class="input" id="wTags" placeholder="Tag, pisahkan dengan koma" value="${esc((w?.tags||[]).join(', '))}"><input class="input" id="wCover" type="file" accept="image/*"><label class="row"><input id="wComments" type="checkbox" ${w?.comments_enabled!==false?'checked':''}> Izinkan komentar</label><div class="actions"><button type="button" class="ghostBtn" onclick="go('works')">Batal</button><button class="goldBtn">${w?'Simpan perubahan':'Buat karya'}</button></div></form></section><aside class="card"><div class="kicker">BAB</div><h3>Daftar isi</h3>${w?chapterEditor(w):'<p class="muted">Simpan karya dulu, lalu tambahkan bab.</p>'}</aside></div>`,'Karya');
}
function chapterEditor(w){
 const chapters=w._chapters||[];
 return `<form class="form" onsubmit="event.preventDefault();addChapter('${w.id}')"><input class="input" id="cTitle" placeholder="Judul bab" required><textarea class="textarea" id="cBody" placeholder="Tulis isi bab..." required></textarea><button class="goldBtn">Tambah bab</button></form><div class="toc" style="margin-top:16px">${chapters.map((c,i)=>`<button class="chapterBtn" onclick="editChapter('${c.id}','${w.id}')">${i+1}. ${esc(c.title)}</button>`).join('')}</div>`;
}
async function saveWork(id){
 const title=document.querySelector('#wTitle').value.trim(), type=document.querySelector('#wType').value, desc=document.querySelector('#wDesc').value.trim(), tags=document.querySelector('#wTags').value.split(',').map(x=>x.trim()).filter(Boolean), file=document.querySelector('#wCover').files[0];
 let cover=null;
 if(file){const ext=file.name.split('.').pop().toLowerCase();const path=`${state.user.id}/covers/${crypto.randomUUID()}.${ext}`;const up=await db.storage.from('profile-media').upload(path,file,{upsert:false});if(up.error){toast(up.error.message);return}cover=path}
 const payload={title,work_type:type,description:desc,tags,comments_enabled:document.querySelector('#wComments').checked,updated_at:new Date().toISOString()};if(cover)payload.cover_url=cover;
 let res=id?await db.from('works').update(payload).eq('id',id).eq('user_id',state.user.id).select().single():await db.from('works').insert({...payload,user_id:state.user.id,visibility:'private',status:'draft'}).select().single();
 if(res.error){toast(res.error.message);return} toast('Karya tersimpan.');await loadMyWorks();editor(res.data.id);
}
async function loadMyWorks(){
 const {data}=await db.from('works').select('*').eq('user_id',state.user.id).order('updated_at',{ascending:false});state.myWorks=data||[];
 for(const w of state.myWorks){const {data:c}=await db.from('work_chapters').select('*').eq('work_id',w.id).order('chapter_no');w._chapters=c||[]}
}
async function addChapter(workId){
 const {data}=await db.from('work_chapters').select('chapter_no').eq('work_id',workId).order('chapter_no',{ascending:false}).limit(1).maybeSingle();
 const n=(data?.chapter_no||0)+1,title=document.querySelector('#cTitle').value.trim(),body=document.querySelector('#cBody').value;
 const {error}=await db.from('work_chapters').insert({work_id:workId,user_id:state.user.id,chapter_no:n,title,body});if(error)toast(error.message);else{toast('Bab ditambahkan.');await loadMyWorks();editor(workId)}
}
async function editChapter(chapterId,workId){
 const {data}=await db.from('work_chapters').select('*').eq('id',chapterId).single();if(!data)return;
 app.innerHTML=shell(`<article class="card full"><div class="kicker">EDIT BAB ${data.chapter_no}</div><form class="form" onsubmit="event.preventDefault();saveChapter('${chapterId}','${workId}')"><input class="input" id="ecTitle" value="${esc(data.title)}"><textarea class="textarea" id="ecBody" style="min-height:420px">${esc(data.body)}</textarea><div class="actions"><button type="button" class="ghostBtn" onclick="editor('${workId}')">Kembali</button><button class="goldBtn">Simpan bab</button></div></form></article>`,'Edit Bab');
}
async function saveChapter(id,workId){const {error}=await db.from('work_chapters').update({title:document.querySelector('#ecTitle').value.trim(),body:document.querySelector('#ecBody').value,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',state.user.id);if(error)toast(error.message);else{toast('Bab tersimpan.');editor(workId)}}
async function publishWork(id){
 const {data,error}=await db.from('works').update({visibility:'public',status:'published',published_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',state.user.id).select().single();
 if(error)toast(error.message);else{toast('Karya berhasil dipublikasikan.');await loadMyWorks();go('profile')}
}
async function openWork(id){
 const {data,error}=await db.from('works').select('*,profiles!works_user_id_fkey(name,username)').eq('id',id).eq('status','published').eq('visibility','public').single();
 if(error){toast(error.message);return}
 state.selectedWork=data;const {data:c}=await db.from('work_chapters').select('*').eq('work_id',id).order('chapter_no');state.selectedWork._chapters=c||[];
 await db.from('works').update({views:(data.views||0)+1}).eq('id',id);
 state.active='works';renderReader();
}
function renderReader(){
 const w=state.selectedWork;if(!w)return;
 app.innerHTML=shell(`<div class="card full"><div class="reader"><img class="readerCover" src="${esc(workCover(w.cover_url))}"><div class="kicker">${esc(w.work_type||'KARYA').toUpperCase()}</div><h1 style="font:500 42px Georgia,serif;margin:8px 0">${esc(w.title)}</h1><p class="muted">oleh ${esc(w.profiles?.name||w.profiles?.username||'Kreator')} · ${Number(w.views||0)+1} dibaca</p><p class="muted">${esc(w.description||'')}</p><div class="toc">${(w._chapters||[]).map(c=>`<button class="chapterBtn" onclick="readChapter('${c.id}')">Bab ${c.chapter_no} · ${esc(c.title)}</button>`).join('')}</div>${state.selectedChapter?`<hr style="border-color:#ffffff18;margin:24px 0"><div class="kicker">BAB ${state.selectedChapter.chapter_no}</div><h2 style="font:500 32px Georgia,serif">${esc(state.selectedChapter.title)}</h2><div class="readerBody">${esc(state.selectedChapter.body).split(/\\n+/).map(p=>`<p>${p}</p>`).join('')}</div>`:''}</div></div>`,'Baca Karya');
}
function readChapter(id){state.selectedChapter=state.selectedWork._chapters.find(c=>c.id===id)||null;renderReader()}

async function statsPage(){
 const p=state.stats.progress;const vals=[Math.max(0,p-20),Math.max(0,p-10),p,Math.min(100,p+4),Math.min(100,p+8),p];
 return `<div class="grid"><article class="card full"><div class="kicker">PROGRESS KESELURUHAN</div><div class="metric" style="font-size:64px">${p}%</div><div class="statsChart"><div class="chartWrap">${vals.map((v,i)=>`<div class="chartCol"><div class="chartVal">${v}%</div><div class="bar" style="height:${Math.max(8,v*1.45)}px"></div><div class="chartLbl">${['Sen','Sel','Rab','Kam','Jum','Sab'][i]}</div></div>`).join('')}</div></article><article class="card"><div class="kicker">TARGET AKTIF</div><div class="metric">${state.stats.targets}</div><p class="muted">Target yang sedang kamu jalankan.</p></article><article class="card"><div class="kicker">PROJECTS</div><div class="metric">${state.stats.projects}</div><p class="muted">Ruang karya yang sedang tumbuh.</p></article><article class="card"><div class="kicker">JOURNAL</div><div class="metric">${state.stats.journal}</div><p class="muted">Catatan perjalananmu.</p></article><article class="card full"><div class="kicker">RINGKASAN</div><p class="muted">Statistik berfokus pada progres keseluruhan dan tetap mempertahankan tampilan card transparan EA PLAN.</p></article></div>`;
}

async function profilePage(){
 await loadMyWorks();
 return `<div class="grid"><article class="card full"><div class="profileHero"><img class="profileAvatar" src="${esc(state.profile?.avatar_url?coverUrl(state.profile.avatar_url):A+'logo.png')}" onerror="this.src='${A}logo.png'"><div><div class="kicker">PROFIL KREATOR</div><h1 style="font:500 42px Georgia,serif;margin:7px 0">${esc(state.profile?.name||'Kreator')}</h1><p class="muted">@${esc(state.profile?.username||'')}</p><p>${esc(state.profile?.bio||'Belum ada bio.')}</p><div class="statCards"><div class="statMini"><b>${state.myWorks.length}</b><br><small>Karya</small></div><div class="statMini"><b>${state.stats.projects}</b><br><small>Projects</small></div><div class="statMini"><b>${state.stats.journal}</b><br><small>Journal</small></div><div class="statMini"><b>${state.stats.progress}%</b><br><small>Progress</small></div></div></div></div></article>
<article class="card"><div class="kicker">MEDIA PROFIL</div><form class="form" onsubmit="event.preventDefault();saveMedia()"><input class="input" id="avatarFile" type="file" accept="image/*"><input class="input" id="bgFile" type="file" accept="image/*"><button class="goldBtn">Simpan foto & background</button></form></article>
<article class="card"><div class="kicker">DATA PROFIL</div><form class="form" onsubmit="event.preventDefault();saveProfile()"><input class="input" id="pName" value="${esc(state.profile?.name||'')}" placeholder="Nama"><input class="input" id="pUsername" value="${esc(state.profile?.username||'')}" placeholder="Username"><textarea class="textarea" id="pBio" placeholder="Bio">${esc(state.profile?.bio||'')}</textarea><button class="goldBtn">Simpan profil</button></form></article>
<article class="card full"><div class="sectionTitle"><h3>Karya saya</h3><button class="goldBtn" onclick="editor()">＋ Karya baru</button></div><div class="workList">${state.myWorks.length?state.myWorks.map(w=>`<div class="workRow"><img src="${esc(workCover(w.cover_url))}"><div class="grow"><b>${esc(w.title)}</b><div class="muted">${esc(w.status)} · ${Number(w.views||0)} dibaca</div></div><span class="status">${esc(w.visibility)}</span><button class="ghostBtn" onclick="editor('${w.id}')">Edit</button>${w.status==='draft'?`<button class="goldBtn" onclick="publishWork('${w.id}')">Publikasikan</button>`:''}</div>`).join(''):'<p class="muted">Belum ada karya.</p>'}</div></article>
<article class="card full"><div class="sectionTitle"><h3>Ruang privat</h3></div><div class="row"><button class="ghostBtn" onclick="privateModule('ideas')">✦ Ideas</button><button class="ghostBtn" onclick="privateModule('projects')">□ Projects</button><button class="ghostBtn" onclick="privateModule('journal')">✎ Journal</button><button class="dangerBtn" onclick="logout()">Keluar</button></div></article></div>`;
}
async function saveProfile(){
 const payload={name:document.querySelector('#pName').value.trim(),username:document.querySelector('#pUsername').value.trim(),bio:document.querySelector('#pBio').value.trim(),updated_at:new Date().toISOString()};
 const {error}=await db.from('profiles').update(payload).eq('id',state.user.id);if(error){toast(error.message);return}state.profile={...state.profile,...payload};toast('Profil tersimpan.');await profilePage().then(x=>app.innerHTML=shell(x,'Profil'));
}
async function saveMedia(){
 const files=[['avatarFile','avatar_url'],['bgFile','background_url']];const patch={};
 for(const [id,key] of files){const f=document.querySelector('#'+id).files[0];if(!f)continue;const ext=f.name.split('.').pop().toLowerCase();const path=`${state.user.id}/${key}/${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from('profile-media').upload(path,f,{upsert:false});if(error){toast(error.message);return}patch[key]=path}
 if(!Object.keys(patch).length){toast('Pilih foto profil atau background.');return}
 const {error}=await db.from('profiles').update({...patch,updated_at:new Date().toISOString()}).eq('id',state.user.id);if(error){toast(error.message);return}
 state.profile={...state.profile,...patch};toast('Media profil tersimpan.');go('profile');
}
async function privateModule(type){
 const titles={ideas:'Ideas',projects:'Projects',journal:'Journal'};const table=type==='ideas'?'ideas':type==='projects'?'projects':'journal_entries';
 const {data}=await db.from(table).select('*').eq('user_id',state.user.id).order('created_at',{ascending:false}).limit(30);
 app.innerHTML=shell(`<div class="grid"><article class="card full"><div class="sectionTitle"><h3>${titles[type]}</h3><button class="goldBtn" onclick="privateAdd('${type}')">＋ Tambah</button></div>${(data||[]).map(x=>`<div class="item"><b>${esc(x.title||x.content?.slice?.(0,60)||x.body?.slice?.(0,60)||'Catatan')}</b><div class="muted">${esc(x.description||x.content||x.body||'')}</div></div>`).join('')||'<p class="muted">Belum ada catatan.</p>'}</article></div>`,titles[type]);
}
async function privateAdd(type){
 const map={ideas:['Judul ide','Deskripsi ide'],projects:['Nama project','Deskripsi project'],journal:['Judul catatan','Isi catatan']};const [p1,p2]=map[type];
 app.innerHTML=shell(`<article class="card full"><div class="kicker">${type.toUpperCase()}</div><form class="form" onsubmit="event.preventDefault();savePrivate('${type}')"><input class="input" id="pv1" placeholder="${p1}" required><textarea class="textarea" id="pv2" placeholder="${p2}" required></textarea><div class="actions"><button type="button" class="ghostBtn" onclick="go('profile')">Batal</button><button class="goldBtn">Simpan</button></div></form></article>`,map[type][0]);
}
async function savePrivate(type){
 const v1=document.querySelector('#pv1').value.trim(),v2=document.querySelector('#pv2').value.trim();
 const payload=type==='ideas'?{user_id:state.user.id,title:v1,description:v2}:type==='projects'?{user_id:state.user.id,title:v1,description:v2,status:'active',progress:0}:{user_id:state.user.id,title:v1,body:v2};
 const table=type==='ideas'?'ideas':type==='projects'?'projects':'journal_entries';const {error}=await db.from(table).insert(payload);if(error)toast(error.message);else{toast('Tersimpan.');privateModule(type)}
}
async function saveQuote(){
 if(!state.isOwner)return;const value=document.querySelector('#dailyQuote').value.trim();const {error}=await db.from('app_settings').upsert({key:'daily_quote',value,updated_by:state.user.id,updated_at:new Date().toISOString()});toast(error?error.message:'Quote harian diperbarui.');dashboard();
}
async function go(id){
 if(id==='create'){state.active='create';renderApp();return}
 state.active=id;
 if(id==='home')await dashboard();else renderApp();
}
async function renderApp(){
 if(state.active==='works'){await loadPublic(state.query);app.innerHTML=shell(await worksPage(),'Karya');return}
 if(state.active==='stats'){await loadStats();app.innerHTML=shell(await statsPage(),'Statistik');return}
 if(state.active==='profile'){app.innerHTML=shell(await profilePage(),'Profil');return}
 if(state.active==='create'){app.innerHTML=shell(createPage(),'Buat');return}
 app.innerHTML=shell(await home(),'Beranda');
}
function doSearch(){state.query=document.querySelector('#workSearch').value.trim();renderApp()}
async function logout(){await db.auth.signOut();state={...state,session:null,user:null,profile:null};welcome()}
window.go=go;window.auth=auth;window.submitAuth=submitAuth;window.forgot=forgot;window.sendReset=sendReset;window.pick=pick;window.nextOnboard=nextOnboard;window.dashboard=dashboard;window.editor=editor;window.saveWork=saveWork;window.addChapter=addChapter;window.editChapter=editChapter;window.saveChapter=saveChapter;window.publishWork=publishWork;window.openWork=openWork;window.readChapter=readChapter;window.doSearch=doSearch;window.saveProfile=saveProfile;window.saveMedia=saveMedia;window.privateModule=privateModule;window.privateAdd=privateAdd;window.savePrivate=savePrivate;window.saveQuote=saveQuote;window.logout=logout;
splash();