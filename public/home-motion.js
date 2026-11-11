(() => {
  'use strict';
  const projects=window.WUJIE.projects,count=projects.length;
  const asset=name=>window.WUJIE_ASSETS?.[name]||'assets/'+name;
  const wrap=n=>(n%count+count)%count,number=n=>String(n+1).padStart(2,'0');
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=0, albumSeen=false;
  const projectLocations={
  "hainan-luoniushan": {
    "map": "puyu",
    "place": "罗牛山·璞域二期",
    "address": "海南省海口市秀英区 · 丘海大道与金集路交汇处",
    "lat": 19.99402,
    "lon": 110.28978
  },
  "hong-kong-yinan": {
    "map": "yinan",
    "place": "倚南",
    "address": "香港南区 · 鸭脷洲大街 68 号",
    "lat": 22.24423,
    "lon": 114.15569
  },
  "shenzhen-yingxi": {
    "map": "yingxi",
    "place": "中洲迎玺花园",
    "address": "深圳市龙华区 · 民丰路",
    "lat": 22.61069,
    "lon": 114.0329
  },
  "changsha-jiangshanjing": {
    "map": "jiangshan",
    "place": "招商蛇口·江山境三期",
    "address": "长沙市岳麓区 · 岳华路",
    "lat": 28.25481,
    "lon": 112.93742
  },
  "tianfu-bay": {
    "map": "tianfu",
    "place": "天賦海灣",
    "address": "香港大埔 · 科进路 5 号",
    "lat": 22.43371,
    "lon": 114.20247
  },
  "taojinshan": {
    "map": "taojin",
    "place": "淘金山湖景花园",
    "address": "深圳市罗湖区 · 翠荫路 268 号",
    "lat": 22.58967,
    "lon": 114.13817
  },
  "taojinshan-residence": {
    "map": "taojin",
    "place": "淘金山湖景花园",
    "address": "深圳市罗湖区 · 翠荫路 268 号",
    "lat": 22.58967,
    "lon": 114.13817
  },
  "shenzhen-manjinghua-jinshuo": {
    "map": "jinshuo",
    "place": "满京华金硕华府",
    "address": "深圳市光明区 · 狮山三街",
    "lat": 22.77171,
    "lon": 113.93194
  },
  "hong-kong-kadoorie-hill": {
    "map": "kadoorie",
    "place": "Kadoorie Hill",
    "address": "香港九龙 · 太子道西 211 号",
    "lat": 22.32493,
    "lon": 114.17547
  },
  "wuhan-heyeshan": {
    "map": "heye",
    "place": "荷叶山",
    "address": "武汉东湖高新区 · 秦云路荷叶山片区",
    "lat": 30.50386,
    "lon": 114.44662,
    "precision": "片区参考点"
  }
};
  function projectAtlas(){
    return `<section class="project-atlas" aria-label="项目地址">
      <div class="local-map" hidden>
        <div class="local-cartography"><img class="local-overview" alt="" decoding="async" aria-hidden="true"><img class="local-detail" alt="" decoding="async"></div><span class="local-pin" aria-hidden="true"></span>
      </div>
      <span class="local-attribution"><a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a></span>
      <p class="local-address"></p><div class="local-meta" hidden><span class="local-coords"></span><a class="local-open" target="_blank" rel="noopener">查看地图 ↗</a></div>
    </section>`;
  }
  const mapImages=new Map();
  const mapSource=name=>{const url=asset(name);return url.startsWith('data:')?url:url+'?v=9.14';};
  function readyMap(src){
    if(!mapImages.has(src))mapImages.set(src,new Promise((resolve,reject)=>{
      const image=new Image(),timer=setTimeout(()=>fail(),12000);
      const fail=()=>{clearTimeout(timer);image.onload=image.onerror=null;mapImages.delete(src);reject(new Error('Map image unavailable'));};
      image.onload=()=>{clearTimeout(timer);image.onload=image.onerror=null;resolve(src);};image.onerror=fail;image.src=src;
    }));
    return mapImages.get(src);
  }
  function mapJourney(atlas,signal){
    const map=atlas.querySelector('.local-map'),detail=map.querySelector('.local-detail'),overview=map.querySelector('.local-overview'),pin=map.querySelector('.local-pin');
    let request=0,raf=0,current=null,desired=null,enabled=false;
    let pose={s:1,a:1,os:1,oa:0,x:.5,y:.5,p:1};
    const coords=loc=>({x:(loc.lon-72)/66,y:(1.20-Math.asinh(Math.tan(loc.lat*Math.PI/180)))/(66*Math.PI/180)});
    const draw=()=>{
      detail.style.transform=`translate(-50%,-50%) scale(${pose.s})`;detail.style.opacity=pose.a;
      overview.style.transform=`translate(-50%,-50%) translate(${(.5-pose.x)*100*pose.os}%,${(.5-pose.y)*100*pose.os}%) scale(${pose.os})`;overview.style.opacity=pose.oa;pin.style.opacity=pose.p;
    };
    function stop(){cancelAnimationFrame(raf);raf=0;}
    function settle(loc,src){
      stop();current=loc;detail.src=src;detail.alt=loc.place+'周边街区';
      map.classList.toggle('is-area',Boolean(loc.precision));map.classList.remove('is-map-error');
      pose={s:1,a:1,os:1,oa:0,x:.5,y:.5,p:1};draw();map.dataset.journey='arrived';map.setAttribute('aria-busy','false');
    }
    function tween(to,ms,id,done){
      const from={...pose};let began=null;
      function frame(now){
        if(id!==request||signal.aborted||!enabled)return;
        if(document.hidden){raf=requestAnimationFrame(frame);began=null;return;}
        if(began===null)began=now;
        const t=clamp((now-began)/ms,0,1),ease=t*t*(3-2*t);
        for(const k in to)pose[k]=from[k]+(to[k]-from[k])*ease;
        draw();if(t<1)raf=requestAnimationFrame(frame);else {raf=0;done();}
      }
      raf=requestAnimationFrame(frame);
    }
    async function set(loc,show){
      if(desired===loc&&enabled===show)return;
      desired=loc;enabled=show;const id=++request;stop();
      if(!loc||!show)return;
      const src=mapSource('location-'+loc.map+'.webp');
      // A shared building is the same destination, including the two Taojinshan projects.
      if(current?.map===loc.map&&detail.complete&&detail.naturalWidth){settle(loc,src);return;}
      map.setAttribute('aria-busy','true');pose.p=0;draw();
      try{await readyMap(src);}catch{if(id===request){pose.a=pose.oa=pose.p=0;draw();map.dataset.journey='unavailable';map.setAttribute('aria-busy','false');map.classList.add('is-map-error');}return;}
      if(id!==request||signal.aborted||!enabled)return;
      if(!current||motion.matches||document.hidden){settle(loc,src);return;}
      const wide=mapSource('location-overview.webp');
      try{await readyMap(wide);}catch{if(id===request&&!signal.aborted)settle(loc,src);return;}
      if(id!==request||signal.aborted||!enabled)return;
      overview.src=wide;
      if(pose.oa<.01){const old=coords(current);pose.os=3.2;pose.x=old.x;pose.y=old.y;}
      map.dataset.journey='pull-back';
      tween({s:.32,a:0,os:1,oa:1,x:.5,y:.5,p:0},620,id,()=>{
        map.dataset.journey='overview';
        tween({os:1,oa:1},220,id,()=>{
          current=loc;detail.src=src;detail.alt=loc.place+'周边街区';map.classList.toggle('is-area',Boolean(loc.precision));
          const destination=coords(loc);map.dataset.journey='approach';
          tween({s:1,a:1,os:3.2,oa:0,x:destination.x,y:destination.y,p:1},1080,id,()=>settle(loc,src));
        });
      });
    }
    signal.addEventListener('abort',()=>{++request;stop();},{once:true});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){++request;stop();}
      else if(desired&&enabled){const loc=desired;desired=null;set(loc,true);}
    },{signal});
    motion.addEventListener('change',()=>{if(motion.matches&&desired&&enabled){const loc=desired;desired=null;current=null;set(loc,true);}},{signal});
    return {set};
  }
  function showLocation(atlas,project,index,loadMap,journey){
    const location=projectLocations[project.id],map=atlas.querySelector('.local-map'),meta=atlas.querySelector('.local-meta');
    map.hidden=meta.hidden=!location;
    atlas.querySelector('.local-attribution').hidden=!location;
    const address=atlas.querySelector('.local-address');
    journey.set(location,loadMap);
    if(!location){
      address.textContent=project.city || project.name;
      atlas.querySelector('.local-open').removeAttribute('href');
      return;
    }
    const {place,lat,lon}=location;
    address.textContent=location.precision?location.address+'（片区参考）':location.address+' · '+place;
    atlas.querySelector('.local-coords').textContent=lat.toFixed(5)+'° N  /  '+lon.toFixed(5)+'° E';
    atlas.querySelector('.local-open').href='https://www.openstreetmap.org/?mlat='+lat+'&mlon='+lon+'#map=18/'+lat+'/'+lon;
  }
  function mount(story,view) {
    const abort=new AbortController(),signal=abort.signal;
    let albumPending=!albumSeen&&!motion.matches;
    let albumStart=null,albumRaf=0;
    let position=selected,target=selected,velocity=0,browse=0,raf=0,last=0,lastInput=-1e9,settledAt=0,snapTimer=0,touch=null,disposed=false,snapping=true;
    let lastNotch=-1e9,lastDirection=0,suppressClickUntil=0;
    let zoomFrom=0,zoomTo=0,zoomStarted=0;
    let width=0,height=0,rowHeight=42;
    story.innerHTML=`<div class="home-story"><span class="eyebrow">WUJIE — SPACES FOR LIFE</span><h1>让空间呼吸，<br>让景观<em>无界。</em></h1><p class="home-lead">从人的感受出发，<br>让设计回到生活本身。<br>居住空间 · 样板间 · 公共空间</p><div class="home-bottom">${projectAtlas()}</div></div>`;
    view.innerHTML=`<section class="home-carousel" aria-label="项目选集，滚轮或方向键切换"><div class="home-covers">${projects.map((p,i)=>`<figure class="home-cover" data-cover="${i}" aria-hidden="${i!==selected}"><picture><source media="(max-width:760px) and (orientation:portrait)"><source media="(max-width:760px)"><img alt="${p.name} · ${p.status}" decoding="async" draggable="false"></picture></figure>`).join('')}</div><a class="home-open-surface" href="#project/${projects[selected].id}" aria-label="查看${projects[selected].name}项目详情"></a><div class="home-selector"><span class="home-selector-idx"></span><div class="home-title-rows">${projects.map((p,i)=>`<div class="home-title-row" data-row="${i}"><button class="home-category" data-project-select="${i}" type="button">${p.type}</button><button class="home-name" data-project-select="${i}" type="button">${p.name}</button></div>`).join('')}</div><div class="home-ticks" aria-hidden="true">${Array.from({length:count*4},(_,i)=>`<i data-tick="${i}"></i>`).join('')}</div><span class="home-selector-status">方案呈现</span></div><details class="mobile-atlas"><summary><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="m1.5 4 4.3-2 4.4 2 4.3-2v10l-4.3 2-4.4-2-4.3 2z M5.8 2v10m4.4-8v10" fill="none" stroke="currentColor"/></svg><span data-mobile-place></span></summary>${projectAtlas()}</details><footer class="home-carousel-footer"><div class="home-nav-buttons"><button class="home-step" type="button" data-step="-1" aria-label="上一个项目">↑</button><span>滚动探索</span><button class="home-step" type="button" data-step="1" aria-label="下一个项目">↓</button></div><a class="home-details" href="#project/${projects[selected].id}">查看项目<span class="home-details-count"></span><span aria-hidden="true">↗</span></a></footer><p class="sr-only" aria-live="polite" data-home-status></p></section>`;
    const root=view.querySelector('.home-carousel'),covers=[...root.querySelectorAll('[data-cover]')],rows=[...root.querySelectorAll('[data-row]')],ticks=[...root.querySelectorAll('.home-ticks i')];
    if(albumPending)root.dataset.entry='waiting';
    const atlases=[...story.querySelectorAll('.project-atlas'),...root.querySelectorAll('.project-atlas')];
    const journeys=atlases.map(atlas=>mapJourney(atlas,signal));
    const mobileAtlas=root.querySelector('.mobile-atlas');
    const handset=matchMedia('(max-width:760px)');
    function updateLocations(){
      for(const [i,atlas] of atlases.entries()){
        const showImage=atlas.parentElement===mobileAtlas?handset.matches&&mobileAtlas.open:!handset.matches;
        showLocation(atlas,projects[selected],selected,showImage,journeys[i]);
      }
    }
    handset.addEventListener('change',updateLocations,{signal});
    mobileAtlas.addEventListener('toggle',updateLocations,{signal});
    document.addEventListener('pointerdown',e=>{if(!mobileAtlas.contains(e.target))mobileAtlas.open=false;},{signal});
    const coverImages=covers.map(c=>c.querySelector('img')),rowButtons=rows.map(r=>[...r.querySelectorAll('button')]);
    function loadCover(index, priority) {
      const image=coverImages[index];
      if(image.hasAttribute('src'))return;
      const project=projects[index], mobileFile=project.coverMobile||project.cover;
      const [portrait,smallScreen]=image.parentElement.querySelectorAll('source');
      image.fetchPriority=priority;
      if(window.WUJIE.photoSizes[mobileFile]){
        portrait.srcset=asset('handset-cover-'+mobileFile);
        smallScreen.srcset=asset(window.WUJIE.smallPhoto(mobileFile));
      }else if(project.coverMobile){
        smallScreen.srcset=asset(mobileFile);
      }
      image.src=asset(project.cover);
    }
    function prepareNeighbors(){
      if(disposed||navigator.connection?.saveData)return;
      loadCover(wrap(selected+1),'low');
      loadCover(wrap(selected-1),'low');
    }
    const initialImage=coverImages[selected];
    initialImage.addEventListener('load',prepareNeighbors,{once:true,signal});
    loadCover(selected,'high');
    const cursor=document.createElement('div');cursor.className='home-cursor';cursor.setAttribute('aria-hidden','true');cursor.textContent='查看项目';document.body.append(cursor);
    const offset=i=>wrap(i-position+count/2)-count/2;
    const blocked=()=>!!document.querySelector('dialog[open]')||document.body.classList.contains('intro-running');
    function labels() {
      root.querySelector('.home-selector-status').textContent=projects[selected].status;
      root.querySelector('[data-mobile-place]').textContent='项目地址';
      updateLocations();
      root.querySelector('.home-details-count').textContent=projects[selected].images.length+' 张';
      root.dataset.selected=String(selected);root.querySelector('.home-selector-idx').textContent=number(selected)+' / '+number(count-1);
      root.querySelectorAll('.home-open-surface,.home-details').forEach(a=>{a.href='#project/'+projects[selected].id;a.setAttribute('aria-label','查看'+projects[selected].name+'项目详情');});
      root.querySelector('[data-home-status]').textContent=projects[selected].name+'，'+projects[selected].type+'，第'+(selected+1)+'个项目，共'+count+'个。';
      rows.forEach((r,i)=>r.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-label',(i===selected?'打开':'切换到')+projects[i].name);b.setAttribute('aria-current',String(i===selected));}));
      covers.forEach((c,i)=>{c.classList.toggle('is-current',i===selected);c.setAttribute('aria-hidden',String(i!==selected));});
    }
    // Use the same three cover elements for the stack, the unfolding strip and the full cover.
    // A pointer or keyboard action can take over as soon as the curtain is open.
    function finishAlbum(){
      if(!albumPending)return;
      albumPending=false;albumSeen=true;cancelAnimationFrame(albumRaf);
      delete root.dataset.entry;
      for(const cover of covers){cover.style.removeProperty('z-index');cover.style.removeProperty('opacity');}
      paint();
    }
    const easeAlbum=t=>{const k=clamp(t,0,1);return k*k*(3-2*k);};
    function paintAlbum(now){
      if(!albumPending||disposed)return;
      if(albumStart===null)albumStart=now;
      const t=(now-albumStart)/1000;
      const fan=easeAlbum((t-.77)/.68),grow=easeAlbum((t-1.52)/1.05);
      const fit=Math.min(width*.50,height*.45,295),mid=Math.min(width*.68,height*.63,495);
      const seats=[{delta:-1,delay:0,dx:-.18,dy:-.15,tilt:-5},{delta:1,delay:.15,dx:.15,dy:.10,tilt:4},{delta:0,delay:.32,dx:0,dy:0,tilt:0}];
      root.dataset.entry=t<.77?'stack':t<1.52?'spread':'expand';
      for(const [order,seat] of seats.entries()){
        const index=wrap(selected+seat.delta),el=covers[index],im=coverImages[index];
        if(!im.hasAttribute('src'))loadCover(index,seat.delta?'low':'high');
        const enter=easeAlbum((t-seat.delay)/.23);
        let w=fit*(.91+enter*.09),h=w*1.12;
        let x=seat.dx*fit*(1-fan),y=(seat.dy*fit+(1-enter)*.12*fit)*(1-fan);
        if(seat.delta){
          const thumb=Math.min(fit*.55,145);
          w+=(thumb-w)*fan;h=w*1.12;
          y+=seat.delta*fan*((mid*1.12+thumb*1.12)/2+24+grow*height*.62);
        }else{
          w+=(mid-w)*fan;h=w*1.12;w+=(width-w)*grow;h+=(height-h)*grow;
        }
        el.style.visibility=enter>0&&im.naturalWidth?'visible':'hidden';el.style.zIndex=String(order+1);el.style.opacity=enter.toFixed(3);
        el.style.clipPath=`inset(${Math.max(0,(height-h)/2)}px ${Math.max(0,(width-w)/2)}px)`;
        el.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${seat.tilt*(1-fan)}deg)`;
        im.style.transform=`scale(${Math.max(w/width,h/height)})`;
      }
      if(t>=2.57)finishAlbum();else albumRaf=requestAnimationFrame(paintAlbum);
    }
    function startAlbum(){
      if(!albumPending||albumRaf||disposed)return;
      if(motion.matches||navigator.connection?.saveData){finishAlbum();return;}
      albumRaf=requestAnimationFrame(paintAlbum);
    }
    document.addEventListener('wujie:album',startAlbum,{signal});
    document.addEventListener('wujie:skip',finishAlbum,{signal});
    function paint() {
      if(albumPending)return;
      const nearest=wrap(Math.round(position));if(nearest!==selected){selected=nearest;loadCover(selected,'high');prepareNeighbors();labels();}
      root.dataset.mode=browse>.02?'browsing':'expanded';root.dataset.position=position.toFixed(4);root.style.setProperty('--browse',browse.toFixed(4));if(browse>.05)cursor.classList.remove('is-visible');
      const restingW=Math.min(576,width*.64,height*.67*480/534),restingH=restingW*534/480;
      const unit=Math.max(.3,Math.min(1,restingW/480));
      const mainW=width+(restingW-width)*browse,mainH=height+(restingH-height)*browse,smallW=156*unit,smallH=174*unit;
      const cards=covers.map((el,i)=>{const d=offset(i),t=clamp(1-Math.abs(d),0,1),s=t*t*(3-2*t);return {el,img:coverImages[i],d,w:smallW+(mainW-smallW)*s,h:smallH+(mainH-smallH)*s,y:0};}).sort((a,b)=>a.d-b.d);
      for(let i=1;i<cards.length;i++)cards[i].y=cards[i-1].y+(cards[i-1].h+cards[i].h)/2+unit*(48+16*Math.max(0,1-Math.min(Math.abs(cards[i].d),Math.abs(cards[i-1].d))));
      let low=0;cards.forEach((c,i)=>{if(c.d<=0)low=i;});const a=cards[low],b=cards[low+1],center=b?a.y+(b.y-a.y)*(-a.d/(b.d-a.d)):a.y;
      // Fixed-size layers: change the crop and transforms without relaying out images.
      cards.forEach(c=>{
        const y=c.y-center,visible=Math.abs(y)<height/2+c.h/2;
        c.el.style.visibility=visible?'visible':'hidden';if(!visible)return;
        if(!c.img.hasAttribute('src'))loadCover(Number(c.el.dataset.cover),'auto');
        c.el.style.clipPath=`inset(${Math.max(0,(height-c.h)/2).toFixed(2)}px ${Math.max(0,(width-c.w)/2).toFixed(2)}px)`;
        c.el.style.transform=`translate(-50%,-50%) translate3d(0,${y.toFixed(2)}px,0)`;
        c.img.style.transform=`scale(${Math.max(c.w/width,c.h/height).toFixed(5)})`;
      });
      rows.forEach((r,i)=>{
        const d=offset(i),distance=Math.abs(d),near=Math.exp(-distance*distance*1.25),alpha=(.14+.86*near)*clamp(2-distance,0,1),scale=.78+.22*near;
        r.style.transform=`translateY(calc(-50% + ${(d*rowHeight).toFixed(2)}px))`;r.style.opacity=alpha.toFixed(4);r.style.visibility=distance<2?'visible':'hidden';r.inert=distance>1.4;r.setAttribute('aria-hidden',String(distance>1.4));
        rowButtons[i].forEach(button=>button.style.transform=`scale(${scale.toFixed(4)})`);
      });
      const pitch=rowHeight/4;
      // Stable marks: each project's three subdivisions pass through the same focus point.
      // Keep this driven by position, so reverse input retraces the same transition.
      ticks.forEach((tick,index)=>{
        const distance=wrap(index/4-position+count/2)-count/2,y=distance*rowHeight,major=index%4===0;
        const focus=Math.exp(-Math.pow(y/(pitch*.92),2));
        const length=major?22+20*focus:14+18*focus;
        const thickness=major?1+focus:.85+.75*focus;
        const fade=clamp((rowHeight*1.65-Math.abs(y))/(rowHeight*.65),0,1);
        tick.style.transform=`translate(-50%,-50%) translateY(${y.toFixed(3)}px) scale(${(length/40).toFixed(4)},${thickness.toFixed(4)})`;
        tick.style.opacity=((major?.42+.58*focus:.28+.66*focus)*fade).toFixed(4);
        tick.style.visibility=fade>0?'visible':'hidden';tick.dataset.major=String(major);
      });
    }

    function wake(){if(!raf&&!disposed){last=0;raf=requestAnimationFrame(frame);}}
    function frame(now) {
      raf=0;if(disposed||document.hidden)return;const dt=last?Math.min(now-last,40):16;last=now;
      if(motion.matches){position=target=Math.round(target);velocity=0;browse=zoomTo=0;}
      else {
        const moving=touch?.moved||now-lastInput<190||Math.abs(target-position)>.002||Math.abs(velocity)>.015;
        if(moving)settledAt=0;else if(!settledAt)settledAt=now;
        const want=moving||!settledAt||now-settledAt<120?1:0;
        if(want!==zoomTo){zoomFrom=browse;zoomTo=want;zoomStarted=now;}
        const t=clamp((now-zoomStarted)/(zoomTo?260:680),0,1),eased=zoomTo?1-Math.pow(1-t,3):t*t*t*(t*(t*6-15)+10);
        browse=zoomFrom+(zoomTo-zoomFrom)*eased;
        // Let the frame open up before it travels; interrupted zooms stay continuous.
        const readiness=.22+.78*clamp(browse/.55,0,1),frequency=snapping?12:19,seconds=dt/1000*readiness;
        const delta=position-target,decay=Math.exp(-frequency*seconds),carry=velocity+frequency*delta;
        position=target+(delta+carry*seconds)*decay;velocity=(velocity-frequency*carry*seconds)*decay;
        if(Math.abs(target-position)<.0005&&Math.abs(velocity)<.006){position=target;velocity=0;}
      }
      paint();if(!motion.matches&&(touch?.moved||now-lastInput<190||position!==target||browse!==0))raf=requestAnimationFrame(frame);else last=0;
    }
    function activity(){finishAlbum();lastInput=performance.now();settledAt=0;clearTimeout(snapTimer);snapTimer=setTimeout(()=>{target=Math.round(target);snapping=true;wake();},150);wake();}
    function step(direction){if(blocked())return;target=Math.round(target)+direction;snapping=true;activity();}
    function choose(index){if(blocked())return;finishAlbum();target=Math.round(target)+wrap(index-wrap(Math.round(target))+count/2)-count/2;snapping=true;activity();}
    function resize(){width=root.clientWidth;height=root.clientHeight;rowHeight=parseFloat(getComputedStyle(root.querySelector('.home-selector')).getPropertyValue('--row'))||42;paint();}
    const observer=new ResizeObserver(resize);observer.observe(root);labels();resize();
    if(document.getElementById('opening').hidden)startAlbum();
    root.addEventListener('wheel',e=>{
      if(e.target.closest('.mobile-atlas')||blocked()||e.ctrlKey||e.metaKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      finishAlbum();e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?height:1);if(Math.abs(delta)<.4)return;
      const now=performance.now(),direction=Math.sign(delta),pixels=Math.abs(e.deltaY);
      const notch=e.deltaMode!==0||(Number.isInteger(e.deltaY)&&pixels>=50&&((e.wheelDeltaY&&e.wheelDeltaY%120===0)||pixels===100||pixels===120));
      if(notch||motion.matches){
        if(now-lastNotch<170&&direction===lastDirection){activity();return;}
        lastNotch=now;
        if(direction*velocity<-.08)target=direction>0?Math.ceil(position):Math.floor(position);
        else if(direction*(target-position)<.2)target=Math.round(position)+direction;
        snapping=true;
      }else{
        if(direction!==lastDirection&&now-lastInput<350){target=position;velocity*=.35;}
        target+=clamp(delta/clamp(height*.62,420,720),-.65,.65);target=clamp(target,position-1.35,position+1.35);snapping=false;
      }
      lastDirection=direction;activity();
    },{passive:false,signal});
    root.addEventListener('touchstart',e=>{
      if(blocked()||e.target.closest('.mobile-atlas')){release(true);return;}if(e.touches.length!==1){release(true);return;}
      const p=e.touches[0];touch={x:p.clientX,y:p.clientY,start:position,lastY:p.clientY,time:performance.now(),speed:0,moved:false};
      // A new deliberate tap is allowed even just after a swipe. Do not animate until drag intent is clear.
      suppressClickUntil=0;
    },{passive:true,signal});
    root.addEventListener('touchmove',e=>{
      if(!touch||e.touches.length!==1)return;const p=e.touches[0],dy=touch.y-p.clientY,dx=touch.x-p.clientX;
      if(!touch.moved){
        if(Math.hypot(dx,dy)<10)return;
        if(Math.abs(dx)>=Math.abs(dy)){touch=null;return;}
        finishAlbum();touch.moved=true;touch.start=position;velocity=0;clearTimeout(snapTimer);
      }
      if(e.cancelable)e.preventDefault();
      const now=performance.now(),elapsed=Math.max(8,now-touch.time);touch.speed=touch.speed*.35+(touch.lastY-p.clientY)/elapsed*.65;touch.lastY=p.clientY;touch.time=now;
      snapping=false;target=touch.start+dy/clamp(height*.54,300,540);lastInput=now;wake();
    },{passive:false,signal});
    const release=(cancelled=false)=>{
      if(!touch)return;const gesture=touch;touch=null;if(!gesture.moved)return;
      const now=performance.now(),momentum=!cancelled&&now-gesture.time<100?clamp(gesture.speed*.14,-.35,.35):0;
      suppressClickUntil=now+350;target=Math.round(target+momentum);snapping=true;activity();
    };
    root.addEventListener('touchend',()=>release(),{signal});root.addEventListener('touchcancel',()=>release(true),{signal});
    root.addEventListener('click',e=>{
      if(e.target.closest('.mobile-atlas'))return;
      if(performance.now()<suppressClickUntil){e.preventDefault();return;}
      const button=e.target.closest('[data-step]');if(button)step(Number(button.dataset.step));
      const label=e.target.closest('[data-project-select]');if(label){const index=Number(label.dataset.projectSelect);if(index===selected)location.hash='project/'+projects[index].id;else choose(index);}
      // Native cover/detail links remain usable while the image finishes expanding.
    },{signal});

    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileAtlas.open){mobileAtlas.open=false;mobileAtlas.querySelector('summary').focus();return;}if(blocked()||mobileAtlas.open||e.target.closest?.('input,textarea,select,summary')||e.altKey||e.ctrlKey||e.metaKey)return;if(['ArrowDown','PageDown','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();step(e.key==='ArrowDown'||e.key==='PageDown'?1:-1);}if(e.key==='Home'){e.preventDefault();choose(0);}if(e.key==='End'){e.preventDefault();choose(count-1);}},{signal});
    const fine=matchMedia('(pointer:fine)');if(fine.matches&&!motion.matches)root.classList.add('has-fine-cursor');
    root.addEventListener('pointermove',e=>{if(!fine.matches||motion.matches||e.pointerType==='touch')return;cursor.classList.toggle('is-visible',!!e.target.closest('.home-open-surface')&&browse<.05);cursor.style.transform=`translate(${e.clientX+14}px,${e.clientY-8}px)`;},{passive:true,signal});root.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'),{signal});
    motion.addEventListener('change',()=>{finishAlbum();clearTimeout(snapTimer);position=target=Math.round(target);velocity=0;browse=zoomFrom=zoomTo=0;paint();wake();},{signal});document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();},{signal});
    return ()=>{disposed=true;albumSeen=true;abort.abort();cancelAnimationFrame(albumRaf);cancelAnimationFrame(raf);clearTimeout(snapTimer);observer.disconnect();cursor.remove();};
  }
  window.WujieHome={mount,remember(index){selected=index;}};
})();
