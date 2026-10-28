/* Techora — طبقة البيانات: Firestore + XP + المستويات + الإنجازات + سجل الدخول */
(function(){
var CAT=[
['g1t1l1','g1','التكنولوجيا الخضراء','grade-1/term-1/l1/'],['g1t1l2','g1','التحول الرقمي','grade-1/term-1/l2/'],['g1t1l3','g1','أنظمة التشغيل','grade-1/term-1/l3/'],['g1t1l4','g1','تثبيت وإزالة البرامج','grade-1/term-1/l4/'],['g1t1l5','g1','البريد الإلكتروني','grade-1/term-1/l5/'],['g1t1l6','g1','الحوسبة السحابية','grade-1/term-1/l6/'],['g1t1l7','g1','جوجل ميت','grade-1/term-1/l7/'],['g1t1l8','g1','تصميم قواعد البيانات','grade-1/term-1/l8/'],['g1t1l9','g1','النماذج والاستعلامات','grade-1/term-1/l9/'],['g1t1l10','g1','مشروعك الرقمي','grade-1/term-1/l10/'],
['g2t1u1l1','g2','الأنظمة الذكية والتغيرات المناخية','grade-2/term-1/u1-l1/'],['g2t1u1l2','g2','التهديدات السيبرانية','grade-2/term-1/u1-l2/'],['g2t1u1l3','g2','البيانات الضخمة','grade-2/term-1/u1-l3/'],['g2t1u1l4','g2','البيانات الضخمة والذكاء الاصطناعي','grade-2/term-1/u1-l4/'],['g2t1u2l1','g2','تجربة وواجهة المستخدم UX/UI','grade-2/term-1/u2-l1/'],['g2t1u2l2','g2','تنسيق المواقع CSS','grade-2/term-1/u2-l2/'],['g2t1u2l3','g2','مشروعي الرقمي لمدرستي','grade-2/term-1/u2-l3/'],['g2t1u2l4','g2','إنشاء موقع بالذكاء الاصطناعي','grade-2/term-1/u2-l4/']
].map(function(a){return{id:a[0],grade:a[1],title:a[2],path:a[3]}});
var BADGES=[
{id:'first-lesson',icon:'🌱',t:'البداية',d:'أكمل أول درس',ok:function(s){return s.done>=1}},
{id:'three-lessons',icon:'📘',t:'متعلّم نشيط',d:'أكمل 3 دروس',ok:function(s){return s.done>=3}},
{id:'six-lessons',icon:'🚀',t:'منطلق',d:'أكمل 6 دروس',ok:function(s){return s.done>=6}},
{id:'ten-lessons',icon:'🏅',t:'محترف',d:'أكمل 10 دروس',ok:function(s){return s.done>=10}},
{id:'all-lessons',icon:'👑',t:'سيد المنصة',d:'أكمل كل الدروس الـ 18',ok:function(s){return s.done>=CAT.length}},
{id:'first-star3',icon:'⭐',t:'إتقان',d:'احصل على 3 نجوم في أي درس',ok:function(s){return s.stars3>=1}},
{id:'five-star3',icon:'🌟',t:'نجم المنصة',d:'3 نجوم في 5 دروس',ok:function(s){return s.stars3>=5}},
{id:'xp-500',icon:'💎',t:'500 XP',d:'اجمع 500 نقطة خبرة',ok:function(s){return s.xp>=500}},
{id:'grade1-done',icon:'🎓',t:'خريج الصف الأول',d:'أكمل كل دروس الصف الأول',ok:function(s){return s.g1>=10}},
{id:'grade2-done',icon:'🎓',t:'خريج الصف الثاني',d:'أكمل كل دروس الصف الثاني',ok:function(s){return s.g2>=8}}];
function lvl(xp){var n=1;while(xp>=50*(n+1)*n)n++;var a=50*n*(n-1),b=50*(n+1)*n;return{n:n,from:a,to:b,pct:Math.round((xp-a)/(b-a)*100)}}
function stars(r,t){return r*10>=t*9?3:r*10>=t*7?2:r*10>=t*4?1:0}
function uid(){var u=TA&&TA.auth&&TA.auth.currentUser;return u?u.uid:null}
var db=null;function DB(){if(!db&&window.firebase&&firebase.firestore&&TA&&TA.configured)db=firebase.firestore();return db}
function U(){var d=DB(),i=uid();return d&&i?d.collection('users').doc(i):null}
var TS=function(){return firebase.firestore.FieldValue.serverTimestamp()};
var D=window.TData={CAT:CAT,BADGES:BADGES,level:lvl,stars:stars,
 find:function(id){return CAT.filter(function(c){return c.id===id})[0]},
 /* ---- حساب المستخدم ---- */
 ensureUser:function(u){var r=U();if(!r)return Promise.resolve();
  return r.get().then(function(s){var d={displayName:u.displayName||'',email:u.email||'',photoURL:u.photoURL||''};
   if(!s.exists)d.createdAt=TS();
   return r.set(d,{merge:true}).then(function(){return s.exists?s.data():{}})}).catch(function(e){console.warn('user doc',e);return {}})},
 saveTheme:function(n){var r=U();if(r)r.set({theme:n},{merge:true}).catch(function(e){console.warn('theme',e)})},
 touch:function(path,title){var r=U();if(!r)return;var k='tl_'+path;try{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,1)}catch(e){}
  r.set({lastLesson:{path:path,title:String(title).slice(0,80)}},{merge:true}).catch(function(){})},
 /* ---- حفظ نتيجة لعبة/اختبار ---- */
 saveGame:function(g){var r=U(),c=D.find(g.id);if(!r||!c||!g.total)return Promise.resolve(null);
  var right=Math.max(0,Math.min(g.right,g.total)),total=g.total,st=stars(right,total),gameXp=right*2+st*10,bonus=right*100>=total*60?50:0,done=bonus>0,
      pr=r.collection('progress').doc(g.id),res={lessonId:g.id,title:c.title,right:right,total:total,pct:Math.round(right*100/total),stars:st,score:Math.max(0,Math.min(g.score|0,100000)),at:TS()};
  return r.collection('quizResults').add(res).then(function(){
   return pr.get()}).then(function(s){var o=s.exists?s.data():null,out={xpGain:0,newDone:false,first:!s.exists};
    if(!o){var d={lessonId:g.id,title:c.title,right:right,total:total,stars:st,gameXp:gameXp,bonusXp:bonus,completed:done,attempts:1,updatedAt:TS()};if(done)d.completedAt=TS();
     out.xpGain=gameXp+bonus;out.newDone=done;return pr.set(d).then(function(){return out})}
    var upd={attempts:(o.attempts||1)+1,updatedAt:TS()},better=gameXp>o.gameXp||(gameXp===o.gameXp&&right>o.right);
    if(better){upd.right=right;upd.total=total;upd.stars=st;upd.gameXp=gameXp;out.xpGain+=gameXp-o.gameXp}else{upd.right=o.right;upd.total=o.total;upd.stars=o.stars;upd.gameXp=o.gameXp}
    upd.bonusXp=o.bonusXp;upd.completed=o.completed;upd.lessonId=g.id;upd.title=c.title;
    if(!o.completed&&done){upd.completed=true;upd.bonusXp=50;upd.completedAt=TS();out.xpGain+=50;out.newDone=true}
    else if(o.completed&&o.completedAt)upd.completedAt=o.completedAt;
    return pr.update(upd).then(function(){return out})}).then(function(out){
   var t=out.newDone?'أكمل درس «'+c.title+'»':'لعب «'+c.title+'» ('+right+'/'+total+')';
   return r.collection('activity').add({type:out.newDone?'lesson':'quiz',title:t,lessonId:g.id,xp:Math.max(0,Math.min(out.xpGain,200)),at:TS()}).catch(function(){}).then(function(){return D.syncBadges().then(function(nb){out.badges=nb;return out})})
  }).catch(function(e){console.warn('saveGame',e);return null})},
 /* ---- تحميل كل بيانات الطالب ---- */
 load:function(){var r=U();if(!r)return Promise.reject(new Error('no-user'));
  return Promise.all([r.get(),r.collection('progress').get(),r.collection('quizResults').orderBy('at','desc').limit(30).get(),r.collection('activity').orderBy('at','desc').limit(15).get(),r.collection('achievements').get()]).then(function(a){
   var P={},xp=0,done=0,s3=0,g1=0,g2=0;a[1].forEach(function(d){var v=d.data();P[d.id]=v;xp+=(v.gameXp||0)+(v.bonusXp||0);if(v.completed){done++;if(d.id.indexOf('g1')===0)g1++;else g2++}if(v.stars===3)s3++});
   var A={};a[4].forEach(function(d){A[d.id]=d.data()});
   return{user:a[0].exists?a[0].data():{},progress:P,results:a[2].docs.map(function(d){return d.data()}),activity:a[3].docs.map(function(d){return d.data()}),ach:A,stats:{xp:xp,done:done,stars3:s3,g1:g1,g2:g2}}})},
 syncBadges:function(){var r=U();if(!r)return Promise.resolve([]);
  return D.load().then(function(d){var add=[];BADGES.forEach(function(b){if(!d.ach[b.id]&&b.ok(d.stats))add.push(b)});
   return Promise.all(add.map(function(b){return r.collection('achievements').doc(b.id).set({id:b.id,earnedAt:TS(),source:'auto'}).then(function(){return b}).catch(function(){return null})}))}).then(function(l){
   l=l.filter(Boolean);l.forEach(function(b){D.toast('🏆 إنجاز جديد: '+b.t)});return l}).catch(function(){return[]})},
 toast:function(t){var e=document.createElement('div');e.className='toast';e.textContent=t;e.style.cssText+=';position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 20px;border-radius:99px;background:var(--gold);color:var(--on-gold);font-weight:900';document.body.appendChild(e);setTimeout(function(){e.remove()},3200)},
 /* ---- تسجيل الدخول في Google Sheets ---- */
 logLogin:function(cred,method){var cfg=window.TECHORA_SHEETS||{},u=TA&&TA.auth&&TA.auth.currentUser;if(!cfg.url||!u)return Promise.resolve();
  var m=method||(cred&&cred.additionalUserInfo&&cred.additionalUserInfo.providerId)||(u.providerData[0]&&u.providerData[0].providerId)||'password';
  var rec={loginId:(window.crypto&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2)),clientTime:new Date().toISOString(),method:m,uid:u.uid};
  try{localStorage.setItem('techora_login_pending',JSON.stringify(rec))}catch(e){}
  return D.flushLogin()},
 flushLogin:function(){var cfg=window.TECHORA_SHEETS||{},u=TA&&TA.auth&&TA.auth.currentUser,raw;try{raw=localStorage.getItem('techora_login_pending')}catch(e){}
  if(!cfg.url||!u||!raw)return Promise.resolve();var rec=JSON.parse(raw);if(rec.uid!==u.uid){try{localStorage.removeItem('techora_login_pending')}catch(e){}return Promise.resolve()}
  if(Date.now()-new Date(rec.clientTime)>864e5){try{localStorage.removeItem('techora_login_pending')}catch(e){}return Promise.resolve()}
  var ctl=window.AbortController?new AbortController():null,tm=setTimeout(function(){ctl&&ctl.abort()},6000);
  return u.getIdToken().then(function(tok){rec.idToken=tok;return fetch(cfg.url,{method:'POST',body:JSON.stringify(rec),signal:ctl&&ctl.signal,redirect:'follow'})}).then(function(r){return r.json()}).then(function(j){
   if(j&&j.ok){try{localStorage.removeItem('techora_login_pending')}catch(e){}}}).catch(function(e){console.warn('sheets log (will retry later)',e)}).then(function(){clearTimeout(tm)})}
};
/* عند تغيّر الحساب: حمّل السمة المحفوظة وأعد محاولة تسجيل الدخول المعلّق */
if(window.TA&&TA.auth){var last=null;TA.auth.onAuthStateChanged(function(u){
 if(!u||u.uid===last)return;last=u.uid;
 D.ensureUser(u).then(function(d){if(d&&d.theme)TTheme.fromCloud(d.theme);else{var l=TTheme.get();if(l&&l!=='emerald')D.saveTheme(l)}});
 D.flushLogin();var m=location.pathname.match(/(grade-[12]\/term-1\/[a-z0-9-]+\/)(content|activity)\.html/);if(m){var c=CAT.filter(function(x){return x.path===m[1]})[0];if(c)D.touch(c.path,c.title)}})}
})();
