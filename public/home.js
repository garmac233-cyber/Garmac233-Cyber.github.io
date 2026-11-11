(() => {
  'use strict';
  const projects = window.WUJIE.projects;
  const count = projects.length;
  const asset = name => window.WUJIE_ASSETS?.[name] || 'assets/' + name;
  const wrap = n => (n % count + count) % count;
  const number = n => String(n + 1).padStart(2, '0');
  let selected = 0, paused = false, inverted = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function mount(story, view) {
    const abort = new AbortController();
    const signal = abort.signal;
    let disposed = false, transitioning = false, lastWheel = -1000, wheelTotal = 0, touch = null;
    const runningAnimations = new Set();
    story.innerHTML = `<section class="brand-stage${inverted ? ' is-inverted' : ''}" aria-label="无界标志空间动态"><div class="brand-stage-top">无界 WUJIE / SPACES FOR LIFE</div><div class="brand-space"><canvas aria-label="由无界标志构件生成的立体形态"></canvas></div><div class="brand-stage-brand"><img src="${asset('wujie-mark.png')}" alt=""><span>让空间呼吸，让景观无界。</span></div><div class="spatial-note">FORM · SPACE · POSSIBILITY</div><div class="brand-stage-footer"><button type="button" data-invert aria-pressed="${inverted}">反转颜色</button><button type="button" data-motion aria-pressed="${paused || motion.matches}">${paused || motion.matches ? '继续动态' : '暂停动态'} <span aria-hidden="true">—</span></button></div></section>`;
    view.innerHTML = `<section class="home-carousel" aria-label="项目选集，滚轮或方向键切换"><div class="home-covers">${projects.map((p,i) => `<figure class="home-cover${i===selected?' is-current':''}" data-cover="${i}" aria-hidden="${i!==selected}"><img src="${asset(p.cover)}" alt="${p.name} · ${p.status}" decoding="async" draggable="false"></figure>`).join('')}</div><a class="home-open-surface" href="#project/${projects[selected].id}" aria-label="查看${projects[selected].name}项目详情"></a><div class="home-mobile-mark" aria-hidden="true"><canvas></canvas></div><div class="home-selector"><span class="home-selector-idx">${number(selected)} / ${String(count).padStart(2,'0')}</span><div class="home-title-rows">${projects.map((p,i)=>`<div class="home-title-row" data-row="${i}"><button class="home-category" data-project-select="${i}" type="button">${p.type}</button><button class="home-name" data-project-select="${i}" type="button">${p.name}</button></div>`).join('')}</div><div class="home-ticks" aria-hidden="true">${'<i></i>'.repeat(13)}</div><span class="home-selector-status">方案呈现</span></div><span class="home-caption">SELECTED SPACES / 方案呈现</span><footer class="home-carousel-footer"><div class="home-nav-buttons"><button class="home-step" type="button" data-step="-1" aria-label="上一个项目">↑</button><span>滚动探索</span><button class="home-step" type="button" data-step="1" aria-label="下一个项目">↓</button></div><a class="home-details" href="#project/${projects[selected].id}">查看项目 ↗</a></footer><p class="sr-only" aria-live="polite" data-home-status></p></section>`;
    const root = view.querySelector('.home-carousel');
    const stage = story.querySelector('.brand-stage');
    const covers = [...root.querySelectorAll('[data-cover]')];
    const rows = [...root.querySelectorAll('[data-row]')];
    const ruler = responsiveRuler(root.querySelector('.home-ticks'), signal);
    const pointer = {x:0,y:0};
    const cursor = document.createElement('div');
    cursor.className='home-cursor'; cursor.setAttribute('aria-hidden','true'); cursor.textContent='查看项目';
    document.body.append(cursor);

    function updateLabels() {
      rows.forEach((row,i) => {
        let offset = wrap(i-selected);
        if (offset > count/2) offset -= count;
        row.style.setProperty('--offset', offset);
        row.dataset.distance = Math.abs(offset);
        row.inert = Math.abs(offset)>1;
        row.setAttribute('aria-hidden',String(Math.abs(offset)>1));
        row.querySelectorAll('button').forEach(button => {
          button.setAttribute('aria-label', (offset===0?'打开':'切换到')+projects[i].name);
          button.setAttribute('aria-current',String(offset===0));
        });
      });
      root.querySelector('.home-selector-idx').textContent=number(selected)+' / '+String(count).padStart(2,'0');
      root.querySelectorAll('.home-open-surface,.home-details').forEach(link=>{
        link.href='#project/'+projects[selected].id;
        link.setAttribute('aria-label','查看'+projects[selected].name+'项目详情');
      });
      root.querySelector('[data-home-status]').textContent=projects[selected].name+'，'+projects[selected].type+'，第'+(selected+1)+'个项目，共'+count+'个。';
      root.dataset.selected=String(selected);
    }
    updateLabels();

    function animate(node,frames,options) {
      if (typeof node.animate!=='function') return Promise.resolve();
      const anim=node.animate(frames,options); runningAnimations.add(anim);
      return anim.finished.catch(()=>{}).finally(()=>runningAnimations.delete(anim));
    }
    async function choose(index, direction=1) {
      const next=wrap(index);
      if(disposed || transitioning || next===selected) return;
      const old=covers[selected], incoming=covers[next];
      selected=next; transitioning=true; updateLabels(); ruler.step(direction);
      incoming.classList.add('is-incoming'); incoming.setAttribute('aria-hidden','false');
      const duration=motion.matches?0:850;
      const start=direction>0?'inset(100% 0 0 0)':'inset(0 0 100% 0)';
      await Promise.all([
        animate(incoming,[{clipPath:start},{clipPath:'inset(0 0 0 0)'}],{duration,easing:'cubic-bezier(.76,0,.24,1)'}),
        animate(incoming.querySelector('img'),[{transform:`translateY(${direction*18}%) scale(1.14)`},{transform:'translateY(0) scale(1.025)'}],{duration,easing:'cubic-bezier(.22,1,.36,1)'}),
        animate(old.querySelector('img'),[{transform:'translateY(0) scale(1.025)'},{transform:`translateY(${-direction*9}%) scale(.98)`}],{duration,easing:'cubic-bezier(.76,0,.24,1)'})
      ]);
      if(disposed) return;
      covers.forEach((cover,i)=>{cover.classList.toggle('is-current',i===selected);cover.classList.remove('is-incoming');cover.setAttribute('aria-hidden',String(i!==selected));});
      transitioning=false;
    }
    const step = direction => choose(selected+direction,direction);
    root.addEventListener('wheel',event=>{
      if(event.ctrlKey || event.metaKey || Math.abs(event.deltaX)>Math.abs(event.deltaY) || document.querySelector('dialog[open]') || document.body.classList.contains('intro-running'))return;
      event.preventDefault();
      const now=performance.now(), delta=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?view.clientHeight:1);
      const since=now-lastWheel; lastWheel=now;
      if(transitioning){wheelTotal=null;return;}
      if(since<180 && wheelTotal===null)return;
      if(since>=180 || wheelTotal===null)wheelTotal=0;
      if(Math.sign(delta)!==Math.sign(wheelTotal))wheelTotal=0;
      wheelTotal+=delta;
      if(Math.abs(wheelTotal)>=34){const direction=Math.sign(wheelTotal);wheelTotal=null;step(direction);}
    },{passive:false,signal});
    root.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true,signal});
    root.addEventListener('touchend',event=>{
      if(!touch || !event.changedTouches.length)return;
      const dx=touch.x-event.changedTouches[0].clientX,dy=touch.y-event.changedTouches[0].clientY;touch=null;
      if(Math.abs(dy)>45 && Math.abs(dy)>Math.abs(dx))step(Math.sign(dy));
    },{passive:true,signal});
    root.addEventListener('click',event=>{
      const next=event.target.closest('[data-step]');
      if(next)step(Number(next.dataset.step));
      const label=event.target.closest('[data-project-select]');
      if(label){const index=Number(label.dataset.projectSelect);if(index===selected)location.hash='project/'+projects[index].id;else choose(index,Number(label.closest('[data-row]').style.getPropertyValue('--offset'))>0?1:-1);}
    },{signal});
    document.addEventListener('keydown',event=>{
      if(document.querySelector('dialog[open]') || event.target.closest('input,textarea,select') || event.altKey || event.ctrlKey || event.metaKey || document.body.classList.contains('intro-running'))return;
      if(['ArrowDown','PageDown','ArrowUp','PageUp'].includes(event.key)){event.preventDefault();step(event.key==='ArrowDown'||event.key==='PageDown'?1:-1);}
      if(event.key==='Home'){event.preventDefault();choose(0,-1);}
      if(event.key==='End'){event.preventDefault();choose(count-1,1);}
    },{signal});
    const fine=matchMedia('(pointer:fine)');
    if(fine.matches && !motion.matches)root.classList.add('has-fine-cursor');
    root.addEventListener('pointermove',event=>{
      if(!fine.matches || motion.matches)return;
      if(event.pointerType==='touch')return;
      ruler.follow(event.clientX,event.clientY);
      const plain=event.target.closest('.home-open-surface');
      cursor.classList.toggle('is-visible',!!plain);
      cursor.style.transform=`translate(${event.clientX+14}px,${event.clientY-8}px)`;
    },{passive:true,signal});
    root.addEventListener('pointerleave',()=>{cursor.classList.remove('is-visible');ruler.leave();},{signal});
    stage.addEventListener('pointermove',event=>{const r=stage.getBoundingClientRect();pointer.x=(event.clientX-r.left)/r.width-.5;pointer.y=(event.clientY-r.top)/r.height-.5;},{passive:true,signal});
    stage.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;},{signal});
    stage.querySelector('[data-invert]').addEventListener('click',event=>{inverted=!inverted;stage.classList.toggle('is-inverted',inverted);event.currentTarget.setAttribute('aria-pressed',String(inverted));},{signal});
    const pauseButton=stage.querySelector('[data-motion]');
    const updateMotion=()=>{pauseButton.disabled=motion.matches;if(motion.matches){pauseButton.textContent='已减少动态';pauseButton.setAttribute('aria-pressed','true');}else{pauseButton.innerHTML=paused?'继续动态 —':'暂停动态 —';pauseButton.setAttribute('aria-pressed',String(paused));}};
    pauseButton.addEventListener('click',()=>{paused=!paused;updateMotion();},{signal});
    motion.addEventListener('change',updateMotion,{signal});updateMotion();
    const destroyScene=spatialMark(stage.querySelector('canvas'),root.querySelector('.home-mobile-mark canvas'),pointer,()=>selected,()=>paused||motion.matches,()=>inverted);
    return ()=>{disposed=true;abort.abort();runningAnimations.forEach(a=>a.cancel());cursor.remove();ruler.destroy();destroyScene();};
  }

  function responsiveRuler(element,signal) {
    const ticks=[...element.children],middle=(ticks.length-1)/2;
    let phase=0,targetPhase=0,focus=0,targetFocus=0,raf=0,last=0,alive=true;
    const pitch=()=>element.clientHeight/(ticks.length+1);
    function paint() {
      const gap=pitch()||8,span=ticks.length*gap;
      ticks.forEach((tick,i)=>{
        const raw=(i-middle)*gap-phase;
        const y=((raw+span/2)%span+span)%span-span/2;
        const near=Math.exp(-Math.pow((y-focus)/(gap*1.35),2));
        const edge=clamp((span/2-Math.abs(y))/gap,0,1);
        tick.style.transform=`translate(-50%,-50%) translateY(${y.toFixed(3)}px) scaleX(${(.5+near*.5).toFixed(3)})`;
        tick.style.opacity=((.3+near*.7)*edge).toFixed(3);
      });
    }
    function frame(now) {
      raf=0;
      if(!alive)return;
      const dt=last?Math.min(now-last,40):16;last=now;
      const blend=1-Math.exp(-dt/95);
      phase+=(targetPhase-phase)*blend;focus+=(targetFocus-focus)*blend;
      const moving=Math.abs(phase-targetPhase)>.015||Math.abs(focus-targetFocus)>.015;
      if(!moving){phase=targetPhase;focus=targetFocus;last=0;}
      paint();
      if(moving)raf=requestAnimationFrame(frame);
    }
    function wake(){if(alive&&!raf){last=0;raf=requestAnimationFrame(frame);}}
    function reset(){cancelAnimationFrame(raf);raf=0;last=0;phase=targetPhase=focus=targetFocus=0;paint();}
    const observer=new ResizeObserver(reset);observer.observe(element);
    motion.addEventListener('change',reset,{signal});paint();
    return {
      follow(x,y){
        if(motion.matches)return;
        const rect=element.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
        const horizontal=clamp(1-Math.abs(x-cx)/125,0,1);
        const vertical=clamp(1-Math.max(0,Math.abs(y-cy)-rect.height/2)/65,0,1);
        targetFocus=clamp(y-cy,-rect.height*.42,rect.height*.42)*horizontal*vertical;
        wake();
      },
      leave(){targetFocus=0;wake();},
      step(direction){if(motion.matches)return;targetPhase+=Math.sign(direction)*(pitch()||8)*3;wake();},
      destroy(){alive=false;cancelAnimationFrame(raf);observer.disconnect();}
    };
  }

  function spatialMark(canvas,mobileCanvas,pointer,getSelected,isPaused,isInverted) {
    const ctx=canvas.getContext('2d'),small=mobileCanvas.getContext('2d');
    if(!ctx || !small)return ()=>{};
    let frame=0,last=0,time=0,rotation=0,alive=true;
    const polygons=window.WUJIE_MARK;
    const surfaces=[{canvas,ctx,w:0,h:0,mini:false},{canvas:mobileCanvas,ctx:small,w:0,h:0,mini:true}];
    const resize=()=>surfaces.forEach(s=>{
      const r=s.canvas.getBoundingClientRect();s.w=r.width;s.h=r.height;
      const dpr=Math.min(window.devicePixelRatio||1,2);s.canvas.width=Math.round(r.width*dpr);s.canvas.height=Math.round(r.height*dpr);s.ctx.setTransform(dpr,0,0,dpr,0,0);
    });
    const observer=new ResizeObserver(resize);surfaces.forEach(s=>observer.observe(s.canvas));resize();
    function paint(s) {
      if(s.w<1 || s.h<1)return;
      const {ctx:c,w,h}=s, dark=s.mini||!isInverted();
      c.clearRect(0,0,w,h);
      const radius=Math.min(w*.43,h*.34),cx=w/2,cy=h/2-8;
      if(!s.mini){
        c.textAlign='center';c.textBaseline='middle';c.font='10px Consolas, monospace';
        for(let i=0;i<60;i++){
          const angle=i*Math.PI/30-Math.PI/2;
          const warp=Math.sin(angle*2+time*.12)*radius*.025;
          c.fillStyle=i===getSelected()*12?'#e77540':dark?'#93918a':'#817d75';
          const x=cx+Math.cos(angle)*(radius+warp),y=cy+Math.sin(angle)*(radius+warp);
          c.fillText(String(i).padStart(2,'0'),x,y);
          if(i%5===0){
            const a=angle+Math.PI*.65+Math.sin(time*.08)*.1;
            c.beginPath();c.moveTo(cx+Math.cos(angle)*radius*.88,cy+Math.sin(angle)*radius*.88);
            c.bezierCurveTo(cx-radius*.25,cy+radius*.1,cx+radius*.2,cy-radius*.25,cx+Math.cos(a)*radius*.88,cy+Math.sin(a)*radius*.88);
            c.strokeStyle=dark?'rgba(243,238,231,.09)':'rgba(7,7,7,.09)';c.lineWidth=.6;c.stroke();
          }
        }
      }
      const scale=s.mini?22:radius*.47;
      const ry=Math.sin(time*.24)*.24+rotation*.18+pointer.x*.33;
      const rx=-.14+Math.sin(time*.19)*.09+pointer.y*.2;
      const rz=Math.sin(time*.14)*.025;
      const turn=([x,y,z])=>{
        let xx=x*Math.cos(ry)+z*Math.sin(ry),zz=-x*Math.sin(ry)+z*Math.cos(ry);
        let yy=y*Math.cos(rx)-zz*Math.sin(rx);zz=y*Math.sin(rx)+zz*Math.cos(rx);
        return [xx*Math.cos(rz)-yy*Math.sin(rz),xx*Math.sin(rz)+yy*Math.cos(rz),zz];
      };
      const project=p=>{const [x,y,z]=p,f=5/(5+z);return [cx+x*scale*f,cy+y*scale*f];};
      const faces=[];
      polygons.forEach(poly=>{
        const center=poly.reduce((a,p)=>a+p[0],0)/poly.length;
        const spread=(.5+.5*Math.sin(time*.36))*Math.abs(Math.sin(rotation*.3))*.12;
        const rings=[-.21,.21].map(z=>poly.map(([x,y])=>turn([x+Math.sign(center)*spread,y,z])));
        faces.push({pts:rings[0],light:.97},{pts:[...rings[1]].reverse(),light:.6});
        poly.forEach((_,i)=>{const j=(i+1)%poly.length;faces.push({pts:[rings[0][i],rings[0][j],rings[1][j],rings[1][i]],light:.43+Math.abs(poly[j][1]-poly[i][1])*.16});});
      });
      faces.sort((a,b)=>b.pts.reduce((v,p)=>v+p[2],0)/b.pts.length-a.pts.reduce((v,p)=>v+p[2],0)/a.pts.length);
      faces.forEach(face=>{
        c.beginPath();face.pts.forEach((p,i)=>{const [x,y]=project(p);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);});c.closePath();
        const v=dark?Math.round(237*face.light):Math.round(42+(1-face.light)*48);
        c.fillStyle=`rgb(${v},${Math.max(0,v-3)},${Math.max(0,v-8)})`;c.fill();
        c.strokeStyle=dark?'rgba(250,245,234,.15)':'rgba(7,7,7,.13)';c.lineWidth=.6;c.stroke();
      });
      if(!s.mini){
        c.textAlign='center';c.fillStyle=dark?'#f3eee7':'#26251f';c.font='12px Consolas, monospace';
        c.fillText('W U J I E',cx,cy+radius*.7);
      }
    }
    function loop(now){
      if(!alive)return;
      const dt=Math.min(now-last,48)/1000;last=now;
      if(!document.hidden && !document.body.classList.contains('intro-running')){
        if(!isPaused())time+=dt;
        rotation+=(getSelected()-rotation)*Math.min(1,dt*3);
        surfaces.forEach(paint);
      }
      frame=requestAnimationFrame(loop);
    }
    frame=requestAnimationFrame(loop);
    return ()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();};
  }
  window.WujieHome={mount};
})();
