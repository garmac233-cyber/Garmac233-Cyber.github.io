/* Shenzhen: Amap B02F38IU8A, GCJ-02 converted to WGS84.
   Jinjiang: approximate building marker from the address map at mtf.top,
   interpreted as BD-09 and converted to WGS84. Neither is a surveyed room position. */
(() => {
  'use strict';
  const offices = [
    {city:'深圳', district:'深圳 · 罗湖', english:'SHENZHEN · LUOHU', building:'瑞思国际', room:'B16G', street:'深圳市罗湖区 · 沿河北路1002号', address:'深圳市罗湖区沿河北路1002号瑞思国际 B16G', center:[114.137564898,22.550223400], region:[114.08,22.56], navigation:'https://www.amap.com/place/B02F38IU8A', label:'楼宇位置'},
    {city:'晋江', district:'福建 · 晋江', english:'FUJIAN · JINJIANG', building:'泉商投资大厦', room:'1309–1310', street:'福建省泉州市晋江市 · 泉商投资大厦', address:'福建省泉州市晋江市泉商投资大厦1309-1310', center:[118.602700,24.869895], region:[118.59,24.85], navigation:'https://www.amap.com/ssr/search?query_type=TQUERY&query=%E6%99%8B%E6%B1%9F%E5%B8%82%E6%B3%89%E5%95%86%E6%8A%95%E8%B5%84%E5%A4%A7%E5%8E%A6', label:'楼宇位置示意'}
  ];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function markup() {
    return `<section class="office-location" aria-label="无界深圳与福建办公室地图">
      <div class="office-map-canvas" role="region" aria-label="可旋转缩放的办公地点三维地图"></div>
      <header class="office-map-heading"><span class="eyebrow">FIND US / 来无界坐坐</span><h1>从世界，<br>到我们相遇的地方。</h1>
        <nav class="office-journey" aria-label="地图视角"><button type="button" data-map-view="earth">地球</button><i>—</i><button type="button" data-map-view="city">深圳</button><i>—</i><button type="button" data-map-view="office">办公室</button></nav>
      </header>
      <div class="office-map-tools" aria-label="地图控制">
        <button type="button" data-map-action="plus" aria-label="放大地图" title="放大">＋</button>
        <button type="button" data-map-action="minus" aria-label="缩小地图" title="缩小">−</button>
        <button type="button" data-map-action="rotate" aria-label="旋转地图45度" title="旋转视角">↻</button>
        <button type="button" data-map-action="tilt" aria-label="切换俯视与三维视角" aria-pressed="true">3D</button>
      </div>
      <div class="office-map-notice" role="status"><span data-map-status>正在展开地图…</span><button type="button" data-map-action="retry" hidden>重新加载</button></div>
      <footer class="office-address">
        <div class="office-switch" role="group" aria-label="选择办公地点"><button type="button" data-office="0" aria-pressed="true">深圳 · 罗湖</button><button type="button" data-office="1" aria-pressed="false">福建 · 晋江</button></div>
        <div class="office-address-meta"><span>SHENZHEN · LUOHU</span><button type="button" data-map-action="replay">重新飞入 ↗</button></div>
        <h2>瑞思国际 <span>B16G</span></h2><p>深圳市罗湖区 · 沿河北路1002号</p>
        <div class="office-coordinates"><span>22.55022° N</span><span>114.13756° E</span><small>楼宇位置</small></div>
        <div class="office-address-actions"><a href="https://www.amap.com/place/B02F38IU8A" target="_blank" rel="noopener noreferrer">地图导航 <span>↗</span></a><button type="button" data-map-action="copy">复制地址 <span>＋</span></button></div>
      </footer>
      <p class="office-map-help"><span class="map-desktop-help">拖动平移 · 右键旋转 · 滚轮缩放</span><span class="map-mobile-help">双指缩放、旋转 · 单指上下浏览页面</span><small>建筑体块为地图示意</small></p>
    </section>`;
  }
  function mount(element) {
    let map=null, marker=null, disposed=false, sequence=0, ready=false, suspended=false;
    let delay=0, timeout=0, copyTimer=0, observer=null, visible=true;
    const controller=new AbortController(), opts={signal:controller.signal};
    const canvas=element.querySelector('.office-map-canvas');
    const status=element.querySelector('[data-map-status]');
    const retry=element.querySelector('[data-map-action="retry"]');
    const controls=element.querySelectorAll('[data-map-view],[data-map-action]:not([data-map-action="copy"]):not([data-map-action="retry"])');
    const mobile=matchMedia('(max-width:760px)');
    let currentStage='earth', officeIndex=0;
    const selected=()=>offices[officeIndex];
    function updateAddress(){
      const office=selected(), card=element.querySelector('.office-address');
      element.dataset.officeIndex=String(officeIndex);
      card.querySelector('.office-address-meta>span').textContent=office.english;
      card.querySelector('h2').innerHTML=office.building+' <span>'+office.room+'</span>';
      card.querySelector('p').textContent=office.street;
      const coordinates=card.querySelectorAll('.office-coordinates>span');
      coordinates[0].textContent=office.center[1].toFixed(5)+'° N';
      coordinates[1].textContent=office.center[0].toFixed(5)+'° E';
      card.querySelector('.office-coordinates>small').textContent=office.label;
      card.querySelector('.office-address-actions>a').href=office.navigation;
      element.querySelector('[data-map-view="city"]').textContent=office.city;
      element.querySelectorAll('[data-office]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.office)===officeIndex)));
      if(marker){marker.setLngLat(office.center);marker.getElement().querySelector('strong').textContent=office.building+' · '+office.room;}
    }
    const setStatus=text=>{status.textContent=text;};
    function setStage(stage) {
      currentStage=stage;element.dataset.mapStage=stage;
      element.querySelectorAll('[data-map-view]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.mapView===stage)));
    }
    function stopFlight(){sequence++;clearTimeout(delay);map?.stop();element.classList.remove('is-flying');if(ready&&!disposed)setStatus('自由查看 · 可点“办公室”返回');}
    function setAvailable(value){controls.forEach(b=>b.disabled=!value);}
    function fail(){
      if(disposed)return;
      stopFlight();setAvailable(false);element.classList.add('map-unavailable');
      setStatus('地图暂未加载，可通过下方导航查看地址。');retry.hidden=false;
    }
    function updateView(){
      if(!map)return;
      const z=map.getZoom();setStage(z<5?'earth':z<14?'city':'office');
      marker?.getElement().classList.toggle('is-visible',z>13.5);
      const tilted=map.getPitch()>20;
      const tilt=element.querySelector('[data-map-action="tilt"]');tilt.textContent=tilted?'3D':'2D';tilt.setAttribute('aria-pressed',String(tilted));
    }
    function fly(stage, duration=1800, onEnd){
      if(!ready||disposed)return;
      const id=sequence;
      const office=selected();
      const targets={earth:{center:[104,25],zoom:mobile.matches?-.2:.2,pitch:0,bearing:0},city:{center:office.region,zoom:10.7,pitch:18,bearing:-12},office:{center:office.center,zoom:17.1,pitch:57,bearing:-32}};
      element.classList.add('is-flying');
      setStatus(stage==='earth'?'回到地球视角':stage==='city'?'向'+office.city+'靠近':'正在抵达'+office.building);
      map.once('moveend',()=>{
        if(id!==sequence||disposed)return;
        element.classList.remove('is-flying');
        setStatus(stage==='office'?'已抵达 · 自由查看周边':stage==='city'?office.district:'从世界，来到'+office.city);
        if(onEnd)onEnd();
      });
      map.flyTo({...targets[stage],duration:reduced()?0:duration,essential:false});
    }
    function replay(){
      if(!ready||disposed)return;
      stopFlight();const id=sequence;
      if(reduced()){fly('office',0);return;}
      map.jumpTo({center:[95,23],zoom:mobile.matches?-.2:.2,pitch:0,bearing:0});
      setStatus('从世界，来到'+selected().city);
      delay=setTimeout(()=>{
        if(disposed||id!==sequence||suspended||!visible)return;
        fly('city',4700,()=>{delay=setTimeout(()=>{if(id===sequence&&!disposed&&!suspended)fly('office',4200);},700);});
      },1100);
    }
    function start(){
      if(disposed)return;
      clearTimeout(timeout);stopFlight();ready=false;retry.hidden=true;setAvailable(false);
      marker?.remove();marker=null;map?.remove();map=null;
      element.classList.remove('map-unavailable');setStatus('正在展开地图…');
      if(!window.maplibregl||!window.WUJIE_MAP_STYLE){fail();return;}
      try{
        map=new maplibregl.Map({container:canvas,style:structuredClone(window.WUJIE_MAP_STYLE),center:[95,23],zoom:mobile.matches?-.2:.2,minZoom:-.5,maxZoom:19,maxPitch:68,pitch:0,bearing:0,attributionControl:false,canvasContextAttributes:{antialias:true},localIdeographFontFamily:'Microsoft YaHei, sans-serif',cooperativeGestures:mobile.matches,renderWorldCopies:false});
        map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-left');
        map.getCanvas().setAttribute('aria-label','地图：方向键平移，加减号缩放，Shift加方向键旋转');
        map.on('error',()=>{if(!ready)setStatus('正在连接地图，地址已在下方显示。');});
        map.on('move',updateView);
        map.on('movestart',event=>{if(event.originalEvent){stopFlight();setStatus('自由查看 · 可点“办公室”返回');}});
        map.on('webglcontextlost',()=>{setStatus('地图显示已暂停，请重新加载。');retry.hidden=false;});
        timeout=setTimeout(()=>{if(!ready)fail();},20000);
        map.once('load',()=>{
          if(disposed)return;clearTimeout(timeout);ready=true;setAvailable(true);retry.hidden=true;
          element.classList.remove('map-unavailable');
          const pin=document.createElement('button');pin.type='button';pin.className='office-pin';pin.setAttribute('aria-label','回到无界办公室');
          pin.innerHTML='<span>无界 WUJIE</span><strong>'+selected().building+' · '+selected().room+'</strong><i></i>';
          pin.addEventListener('click',()=>{stopFlight();fly('office');},opts);
          marker=new maplibregl.Marker({element:pin,anchor:'bottom',offset:[0,-4]}).setLngLat(selected().center).addTo(map);
          updateView();if(visible&&!suspended&&document.getElementById('opening')?.hidden!==false)replay();
        });
      }catch{fail();}
    }
    element.addEventListener('click',async event=>{
      const location=event.target.closest('[data-office]');
      if(location){
        const next=Number(location.dataset.office);if(next===officeIndex)return;
        stopFlight();officeIndex=next;updateAddress();
        if(ready)replay();return;
      }
      const view=event.target.closest('[data-map-view]');
      if(view){stopFlight();fly(view.dataset.mapView);return;}
      const button=event.target.closest('[data-map-action]');if(!button)return;
      const action=button.dataset.mapAction;
      if(action==='copy'){
        clearTimeout(copyTimer);const address=selected().address;let clipboardTimeout;
        try{
          await Promise.race([navigator.clipboard.writeText(address),new Promise((_,reject)=>{clipboardTimeout=setTimeout(()=>reject(new Error('clipboard unavailable')),1200);})]);
          button.innerHTML='地址已复制 ✓';
        }catch{
          const field=document.createElement('textarea');field.value=address;field.setAttribute('readonly','');
          field.style.cssText='position:fixed;left:0;top:0;opacity:0';element.append(field);field.select();
          let copied=false;try{copied=document.execCommand('copy');}catch{}field.remove();
          if(copied)button.innerHTML='地址已复制 ✓';
          else{const range=document.createRange();range.selectNodeContents(element.querySelector('.office-address'));const sel=getSelection();sel.removeAllRanges();sel.addRange(range);button.textContent='已选中，请复制';}
        }finally{clearTimeout(clipboardTimeout);}
        copyTimer=setTimeout(()=>{button.innerHTML='复制地址 <span>＋</span>';},2400);return;
      }
      if(action==='retry'){start();return;}
      if(!ready)return;
      stopFlight();
      if(action==='replay')replay();
      else if(action==='plus')map.zoomIn({duration:400});
      else if(action==='minus')map.zoomOut({duration:400});
      else if(action==='rotate')map.easeTo({bearing:map.getBearing()+45,duration:850});
      else if(action==='tilt')map.easeTo({pitch:map.getPitch()>20?0:57,duration:850});
    },opts);
    const resize=new ResizeObserver(()=>{map?.resize();});resize.observe(element);
    observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(!visible)stopFlight();
      else if(ready&&currentStage==='earth'&&!suspended&&document.getElementById('opening')?.hidden!==false)replay();
    },{threshold:.25});observer.observe(element);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFlight();},opts);
    document.addEventListener('wujie:ready',()=>{if(ready&&visible&&!suspended)replay();},opts);
    mobile.addEventListener('change',()=>{
      if(map){if(mobile.matches)map.cooperativeGestures.enable();else map.cooperativeGestures.disable();map.resize();}
    },opts);
    updateAddress();start();
    return {
      suspend(value){suspended=value;if(value)stopFlight();},
      destroy(){disposed=true;stopFlight();clearTimeout(timeout);clearTimeout(copyTimer);controller.abort();resize.disconnect();observer?.disconnect();marker?.remove();map?.remove();}
    };
  }
  window.WujieOfficeMap={markup,mount};
})();
