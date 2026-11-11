(() => {
  'use strict';
  const opening=document.getElementById('opening');
  const shell=document.querySelector('.site-shell');
  const canvas=document.getElementById('opening-curtain');
  const ctx=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let finished=false,revealing=false,raf=0;
  const timers=[];
  const later=(fn,ms)=>{const id=setTimeout(()=>{if(!finished)fn();},ms);timers.push(id);return id;};
  function finish(){
    if(finished)return;finished=true;timers.forEach(clearTimeout);cancelAnimationFrame(raf);
    opening.hidden=true;shell.inert=false;document.body.classList.remove('intro-running');
    window.removeEventListener('resize',resize);
    document.dispatchEvent(new CustomEvent('wujie:ready'));
  }
  let width=innerWidth,height=innerHeight;
  function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;ctx?.setTransform(ratio,0,0,ratio,0,0);}
  function reveal(){
    if(finished||revealing)return;revealing=true;
    if(reduced||!ctx){skip();return;}
    resize();opening.classList.add('is-revealing');const start=performance.now();
    let albumStarted=false;
    function draw(now){
      if(finished)return;
      const t=Math.min(1,(now-start)/1380),ease=t*t*(3-2*t);
      if(!albumStarted&&t>=.49){albumStarted=true;document.dispatchEvent(new Event('wujie:album'));}
      ctx.clearRect(0,0,width,height);ctx.fillStyle='#0d0e0d';
      // A centre slit opens outwards, with its leading edge arriving in small offset sections.
      const cols=Math.max(42,Math.round(width/8)),step=width/cols;
      for(let i=0;i<cols;i++){
        const x=(i+.5)/cols;
        const contour=Math.sin(Math.PI*t)*(.048*Math.cos(x*9)+.019*Math.sin(x*27));
        const edge=Math.max(0,height*(.5-ease*.56+contour));
        ctx.fillRect(i*step,0,step+.7,edge);
        ctx.fillRect(i*step,height-edge,step+.7,edge);
      }
      if(t<1)raf=requestAnimationFrame(draw);else finish();
    }
    raf=requestAnimationFrame(draw);
  }
  function skip(){document.dispatchEvent(new Event('wujie:skip'));finish();}
  if(document.body.dataset.route!=='work'||reduced){skip();return;}
  shell.inert=true;document.body.classList.add('intro-running');
  window.addEventListener('resize',resize);resize();
  document.getElementById('skip-opening').addEventListener('click',skip);
  document.addEventListener('keydown',event=>{if(!finished&&event.key==='Escape')skip();});
  const firstImage=document.querySelector('.home-cover.is-current img, .detail-image img');
  const imageReady=firstImage&&!firstImage.complete ? new Promise(resolve=>{
    firstImage.addEventListener('load',resolve,{once:true});
    firstImage.addEventListener('error',resolve,{once:true});
  }) : Promise.resolve();
  const assetsReady=Promise.race([Promise.all([imageReady,document.fonts?.ready||Promise.resolve()]),new Promise(resolve=>later(resolve,3500))]);
  opening.classList.add('is-started');

  later(()=>opening.classList.add('show-right'),350);
  later(()=>opening.classList.add('show-left'),780);
  later(()=>opening.classList.add('is-merged'),1650);
  Promise.all([assetsReady,new Promise(resolve=>later(resolve,2500))]).then(reveal);
  later(skip,6200);
})();
