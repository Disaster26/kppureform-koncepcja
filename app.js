(function(){
  var top=document.getElementById('top'),bg=document.getElementById('burger');
  function zamknij(){top.classList.remove('open');bg.setAttribute('aria-expanded','false');bg.setAttribute('aria-label','Otwórz menu')}
  bg.addEventListener('click',function(){var o=top.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu')});
  document.querySelectorAll('.menu a').forEach(function(a){a.addEventListener('click',zamknij)});
  var tk=false;function sc(){if(tk)return;tk=true;requestAnimationFrame(function(){top.classList.toggle('sc',window.pageYOffset>30);tk=false})}
  addEventListener('scroll',sc,{passive:true});sc();

  var links=[].slice.call(document.querySelectorAll('.menu a[href^="#"]:not(.btn)'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
    links.forEach(function(l){var t=document.querySelector(l.getAttribute('href'));if(t)io.observe(t)});
    ['start','kontakt'].forEach(function(id){var t=document.getElementById(id);if(t)io.observe(t)});
    var mob=document.getElementById('mob');
    if(mob)new IntersectionObserver(function(es){mob.classList.toggle('widac',!es[0].isIntersecting&&es[0].boundingClientRect.top<0)},{threshold:0}).observe(document.querySelector('.hero .btn'));
  }

  /* przesuwanie myszą (palec obsługuje przeglądarka) */
  var drag=null;
  function krok(tor){var k=tor.children[0];return k?k.getBoundingClientRect().width+(parseFloat(getComputedStyle(tor).columnGap)||0):300}
  document.querySelectorAll('[data-tor]').forEach(function(tor){
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0||tor.scrollWidth<=tor.clientWidth+2)return;if(drag)return;drag={t:tor,x:e.clientX,l:tor.scrollLeft,m:false}});
    tor.addEventListener('click',function(e){if(tor._moved){e.preventDefault();e.stopPropagation();tor._moved=false}},true);
    tor.addEventListener('dragstart',function(e){e.preventDefault()});
  });
  addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x;if(Math.abs(dx)>5){drag.m=true;drag.t.classList.add('drag')}if(drag.m)drag.t.scrollLeft=drag.l-dx});
  addEventListener('pointerup',function(){if(!drag)return;var d=drag;drag=null;d.t.classList.remove('drag');if(d.m){d.t._moved=true;var w=krok(d.t);d.t.scrollTo({left:Math.round(d.t.scrollLeft/w)*w,behavior:'smooth'});setTimeout(function(){d.t._moved=false},60)}});

  /* strzałki pasa projektów */
  document.querySelectorAll('[data-nav]').forEach(function(nav){
    var tor=document.getElementById(nav.dataset.nav),bs=nav.querySelectorAll('button');
    bs.forEach(function(b){b.addEventListener('click',function(){tor.scrollBy({left:krok(tor)*(+b.dataset.k),behavior:'smooth'})})});
    function upd(){bs[0].disabled=tor.scrollLeft<4;bs[1].disabled=tor.scrollLeft+tor.clientWidth>=tor.scrollWidth-4}
    tor.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
  });
  /* galeria w karcie: licznik i strzałki */
  document.querySelectorAll('.okno').forEach(function(ok){
    var s=ok.querySelector('.slajdy'),nr=ok.querySelector('.nr'),l=ok.querySelector('.pk.l'),p=ok.querySelector('.pk.p'),n=s.children.length;
    function upd(){var i=Math.round(s.scrollLeft/s.clientWidth);nr.textContent=(i+1)+'/'+n;l.disabled=i<=0;p.disabled=i>=n-1}
    s.addEventListener('scroll',function(){requestAnimationFrame(upd)},{passive:true});
    l.addEventListener('click',function(){s.scrollBy({left:-s.clientWidth,behavior:'smooth'})});
    p.addEventListener('click',function(){s.scrollBy({left:s.clientWidth,behavior:'smooth'})});
    upd();
  });

  /* lightbox */
  var lb=document.getElementById('lb'),li=lb.querySelector('img'),lp=lb.querySelector('p'),cur=0,last=null,grp=[];
  function pokaz(i){cur=(i+grp.length)%grp.length;var b=grp[cur],im=b.querySelector('img');li.src=im.currentSrc||im.src;li.alt=im.alt;lp.textContent=im.alt+'  ('+(cur+1)+'/'+grp.length+')';var big=b.dataset.lb;setTimeout(function(){if(grp[cur]===b){var t=new Image();t.onload=function(){if(grp[cur]===b)li.src=big};t.src=big}},150)}
  document.querySelectorAll('[data-lb]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();last=b;var g=b.closest('[data-grupa]');grp=[].slice.call((g||document).querySelectorAll('[data-lb]'));pokaz(grp.indexOf(b));lb.classList.add('otw');document.body.style.overflow='hidden';lb.querySelector('.x').focus()})});
  function zam(){lb.classList.remove('otw');document.body.style.overflow='';li.removeAttribute('src');if(last)last.focus()}
  lb.querySelector('.x').addEventListener('click',zam);
  lb.querySelector('.p').addEventListener('click',function(){pokaz(cur-1)});
  lb.querySelector('.n').addEventListener('click',function(){pokaz(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)zam()});
  var tx=0;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)pokaz(cur+(d<0?1:-1))});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){if(lb.classList.contains('otw'))zam();else zamknij()}
    if(!lb.classList.contains('otw'))return;
    if(e.key==='ArrowRight')pokaz(cur+1);if(e.key==='ArrowLeft')pokaz(cur-1);
  });

  var f=document.getElementById('form'),msg=document.getElementById('msg');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();var ok=true;[].forEach.call(f.querySelectorAll('[required]'),function(i){var v=i.type==='checkbox'?(i.checked?'1':''):i.value.trim();var bad=!v||(i.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));i.setAttribute('aria-invalid',bad);if(bad&&ok){ok=false;i.focus()}});if(!ok)return;msg.hidden=false;f.reset()});
  var r=document.getElementById('rok');if(r)r.textContent=new Date().getFullYear();
})();
