(() => {
  'use strict';
  const phases = window.WUJIE.phases;
  const asset = file => window.WUJIE_ASSETS?.[file] || 'assets/' + file;
  const img = (file, alt) => `<img src="${asset(file)}" alt="${alt}" decoding="async">`;
  const num = i => String(i + 1).padStart(2, '0');
  const clamp = n => Math.max(0, Math.min(1, n));
  const softExamples = [
    {title:'餐厅整体搭配',tag:'家具 · 比例 · 材质',image:'soft-dining.webp',alt:'软装方案中的木色餐桌、餐椅与餐厨空间',copy:'从餐桌与餐椅的比例，到吊灯、织物与器皿的呼应，把分散的单品组织成一个完整的日常场景。',output:'家具布局与选型方向 · 色彩及材质搭配'},
    {title:'卧室家具与织物',tag:'休息 · 触感 · 光线',image:'soft-bedroom.webp',alt:'软装方案中的卧室家具、床品、窗帘与地毯搭配',copy:'围绕休息、阅读与起居，协调床、边几、单椅和灯具。通过窗帘、地毯与床品，让材质与光线形成柔和的层次。',output:'家具与织物组合 · 尺度及配色建议'},
    {title:'灯具与陈设细节',tag:'照明 · 质感 · 点睛',image:'soft-lighting.webp',alt:'软装资料中的金属吊灯细节',copy:'在整体方向中选择灯具、挂画与配饰，核对尺寸、颜色和材质。让每一处点缀与空间相称，也方便后续选购与摆放。',output:'灯具及配饰选型 · 尺寸与材质清单'}
  ];
  const planSheets = [
    ['03','PL-03','拆除墙体尺寸图'], ['04','PL-04','墙体定位尺寸图'],
    ['05','PL-05','完成面尺寸图'], ['06','PL-06','地面铺装图'], ['07','PL-07','天花布置图']
  ];
  const detailSheets = [
    ['02','PL-02','平面优化布置图'], ['09','PL-09','天花灯具分布定位图'],
    ['14','EL-01','客餐厅立面图（一）'], ['31','QS-01','墙身大样图（一）']
  ];
  const sheetTitle = ([,code,title]) => code+' · '+title;
  const sheetImage = sheet => img('process-sheet-'+sheet[0]+'.webp',sheetTitle(sheet));
  const chapters = [
    {steps:['生活场景选择','空间偏好梳理','设计沟通摘要'], caption:'设计 Brief · 将偏好带进第一次沟通', description:'先选熟悉的生活场景，再整理空间连接、停留边界、材色和光影偏好。不同场景里的不同选择会单独保留，结合户型、预算与现场条件继续讨论。'},
    {steps:planSheets.map(sheetTitle), caption:'拆除墙体尺寸图 · 局部', description:'先看哪些墙要拆、哪些墙要建，再看地面怎么铺、吊顶怎么排。左边看整张图，右边可以看清同一张图里的尺寸和做法。'},
    {steps:['空间白模','材质与灯光效果'], caption:'方案沟通 · 现场讨论空间细节'},
    {steps:detailSheets.map(sheetTitle), caption:'材料氛围板', material:['比对木色与纹理','加入石材与金属','比较织物与饰面','完整材料氛围板']},
    {steps:['淘金山 · 二维线稿','淘金山 · 三维白模','淘金山 · 实景落地'], caption:'深圳淘金山 · 石材与空间细节', note:'线稿与白模依据实景转译 · 过程示意', description:'让图纸里的线条成为可感知的空间。从二维表达、三维推敲到现场落地，逐一核对比例、材料与细节，让设计与施工在同一个空间里衔接。'},
    {steps:softExamples.map(p=>p.title), caption:softExamples[0].output, description:'从整体搭配到选品清单，衔接采购与到货，再由设计师完成现场摆场。服务范围随项目共同确认。'}
  ];
  const total = chapters.length;
  const layer = (i,html) => `<div class="process-layer" data-layer="${i}">${html}</div>`;
  const card = (title,body) => `<div class="document-card quiz-process-card"><small>居住问答 · 流程示意</small><h3>${title}</h3>${body}</div>`;
  const survey = card('从日常场景里选择',`<p class="quiz-card-lead">不用先懂设计，先说你怎样待着更舒服。</p><div class="quiz-sample-choices"><div><span>01</span><p>公共空间怎样连接</p><small>一片连着 / 一处一景</small></div><div><span>02</span><p>独处时喜欢坐在哪里</p><small>周围留开 / 身边有靠</small></div><div><span>03</span><p>夜晚希望光怎样分布</p><small>光铺开来 / 光在身边</small></div></div><p class="quiz-card-foot">两种都可以、暂不确定，也可以如实留下。</p>`);
  const analysis = card('把偏好分开看清',`<div class="quiz-axis-list"><div><b>空间连接</b><span>连通与分区</span></div><div><b>停留边界</b><span>留开与有靠</span></div><div><b>材色搭配</b><span>相融与重点</span></div><div><b>光影分布</b><span>铺开与局部</span></div></div><p class="quiz-card-foot">主倾向之外，保留每个场景的例外；未确定的部分继续沟通。</p>`);
  const designBrief = card('让回答成为设计起点',`<div class="quiz-brief-list"><div><small>你的选择</small><p>日常习惯、空间偏好与具体需要</p></div><div><small>需要一起确认</small><p>实际户型、现场条件、预算与时间</p></div><div><small>带进设计沟通</small><p>优先目标、局部例外与待讨论的问题</p></div></div><p class="quiz-card-foot">结果可以查看、修改，并导出给设计师。</p>`);
  const brief = `<div class="owner-brief"><small>从回答，到设计沟通</small><h3>你的家，<br>从你的选择开始。</h3><p>一份居住侧写，整理你在意的空间关系；一份设计摘要，留下具体需要与仍待确认的问题。</p><p>不用把自己套进某一种风格。保留不同选择，再由设计师结合真实空间继续推敲。</p><a class="quiz-entry" href="quiz.html">开始居住问答 <span aria-hidden="true">↗</span></a></div>`;
  const sheetStack = sheets => '<div class="scene-stack wipe-stack">'+
    sheets.map((sheet,i)=>layer(i,sheetImage(sheet))).join('')+'</div>';
  const planDetail = '<div class="plan-detail">'+planSheets.map(sheet=>
    '<div class="plan-detail-frame" data-plan-detail>'+sheetImage(sheet)+'</div>'
  ).join('')+'</div>';
  const materialPhotos = [
    ['process-board-wood.webp', '比对深浅木样与饰面'],
    ['process-board-stone.webp', '石纹、金属与木色样板'],
    ['process-board-fabric.webp', '织物与硬质饰面的搭配'],
    ['process-board-tray.webp', '图纸与材料样板的整体搭配']
  ];
  const board = '<div class="sample-board">' + materialPhotos.map((_, step) =>
    '<div class="board-frame" data-board-frame="' + step + '">' +
      materialPhotos.slice(0, step + 1).map(([file, alt]) => img(file, alt)).join('') +
    '</div>'
  ).join('') + '</div>';
  const left = [
    `<div class="scene-stack paper-stack">${layer(0,survey)}${layer(1,analysis)}${layer(2,designBrief)}</div>`,
    sheetStack(planSheets),
    `<div class="scene-stack photo-stack wipe-stack">${layer(0,img('process-model.webp','餐厅白模'))}${layer(1,img('process-render.webp','同一餐厅的材质与灯光方案'))}</div>`,
    sheetStack(detailSheets),
    `<div class="scene-stack wipe-stack taojinshan-stack">${layer(0,img('process-taojinshan-line.webp','淘金山餐厅二维线稿示意'))}${layer(1,img('process-taojinshan-model.webp','淘金山餐厅三维白模示意'))}${layer(2,img('taojinshan-01.webp','深圳淘金山餐厅实景照片'))}</div>`,
    `<div class="scene-stack soft-stack wipe-stack">${softExamples.map((p,i)=>layer(i,img(p.image,p.alt))).join('')}</div>`
  ];
  const right = [brief,planDetail,img('about.webp','空间现场的方案讨论'),board,img('taojinshan-03.webp','深圳淘金山实景的石材与过道细节'),`<div class="soft-stage-content"><div class="soft-stage-panels">${softExamples.map((p,i)=>`<div class="soft-stage-panel" data-soft-panel="${i}"><span class="eyebrow">${p.tag}</span><h3>${p.title}</h3><p>${p.copy}</p><div class="soft-output"><span>方案成果</span><p>${p.output}</p></div></div>`).join('')}</div><div class="soft-stage-steps" aria-label="软装选例">${softExamples.map((p,i)=>`<button data-soft-step="${i}" aria-label="${num(i)} ${p.title}"><span>${num(i)}</span>${['餐厅','卧室','灯具'][i]}</button>`).join('')}</div></div>`];
  const durations = {2:'模型确认后 · 效果图绘制 15 个工作日',3:'效果图确认后 · 施工图一般 20 个工作日'};
  function stage(p,i){
    return `<section class="process-stage" data-process-stage="${i}" aria-labelledby="process-title-${i}">
      <figure class="process-scene"><div class="scene-window">${left[i]}</div><figcaption class="scene-caption"><div class="scene-caption-main"><span data-scene-label></span><div class="scene-playback"><span data-scene-count></span><button type="button" data-process-play aria-label="暂停图片演示">暂停 Ⅱ</button></div></div>${chapters[i].note?`<small class="scene-note">${chapters[i].note}</small>`:''}</figcaption></figure>
      <div class="process-sheet"><header class="process-phase-heading"><h2 id="process-title-${i}">${i===5?'让软装回应生活':p.title}</h2><span>${num(i)}</span></header>
      <figure class="process-art"><div class="process-frame">${right[i]}</div><figcaption>${chapters[i].caption}</figcaption></figure>
      <div class="process-copy">${durations[i]?`<div class="process-duration"><span class="duration-meter" aria-hidden="true"><i style="width:${i===2?75:100}%"></i></span>${durations[i]}</div>`:''}<p>${chapters[i].description || p.body}</p><details class="process-extra"><summary>你会参与 / 阶段成果 <span aria-hidden="true">＋</span></summary><div class="process-extra-body"><div><span>你会参与</span><p>${p.you}</p></div><div><span>阶段成果</span><p>${p.get}</p></div></div></details><div class="process-actions"><button data-service-jump="design-timing">设计周期 ↘</button><button data-service-jump="construction-timing">落地工期 ↘</button></div></div></div></section>`;
  }
  const timingSection = `<section class="service-timing" id="design-timing" tabindex="-1" aria-labelledby="timing-title"><header class="service-section-heading"><span class="eyebrow">DESIGN SCHEDULE / 设计周期</span><h2 id="timing-title">从方向确认，到细节成形。</h2><p>两项绘制工作的参考周期。横条长度对应各阶段所需的工作日。</p></header><div class="timing-context"><span>01—02 / 需求与平面</span><p>沟通、量房与平面方案的时间，结合项目范围共同确定。</p></div><figure class="duration-chart" aria-label="效果图绘制15个工作日，施工图深化一般20个工作日"><div class="duration-axis" aria-hidden="true"><span>0</span><span>5</span><span>10</span><span>15</span><span>20 工作日</span></div><div class="duration-row"><div class="duration-label"><span>03</span><h3>效果图绘制</h3><small>模型确认后</small></div><div class="duration-plot"><div class="duration-bar" style="--duration:75%"><b>15</b><span>个工作日</span></div></div></div><div class="duration-row"><div class="duration-label"><span>04</span><h3>施工图深化</h3><small>依据确认的效果图</small></div><div class="duration-plot"><div class="duration-bar duration-bar-detail" style="--duration:100%"><b>20</b><span>个工作日 · 一般周期</span></div></div></div><figcaption>单阶段绘制时长 / 工作日</figcaption></figure><div class="timing-context"><span>05—06 / 落地与软装</span><p>按施工节点、选品确认与到货进度安排现场配合及软装摆场。</p></div><p class="timing-note">前期沟通、方案确认与调整、施工及采购安排另行协商，整体周期以双方确认的排期为准。</p><div class="service-section-actions"><button class="text-link" data-service-jump="construction-timing">查看落地工期 ↓</button><button class="text-link" data-process-return>回到六阶段流程 ↑</button><button class="text-link" data-soft-step="0">查看 06 软装服务 ↑</button></div></section>`;
  const constructionPhases = [
    ['现场保护',0,2], ['水电微调',2,6], ['泥水修补',6,10],
    ['定制生产',10,40], ['主材安装',40,45], ['油漆收口',45,49]
  ];
  const renovationPhases = [
    ['打拆与清运','5–7','安排拆除、清运及公共区域保护。'],
    ['水电隐蔽工程','15–20','核对点位，验收给排水与电气管线后再封闭。'],
    ['防水与铺贴','15–20','完成防水、闭水检查和地面墙面铺贴。'],
    ['木工与油漆','15–20','完成顶面与墙面基层，待基层干燥后上漆。'],
    ['定制与主材安装','10–15','衔接门、柜体、地板、洁具和灯具进场。'],
    ['收边与保洁','3–5','处理接缝和局部补漆，清洁后逐项交接。']
  ];
  const constructionSection = `<section class="service-timing construction-timing" id="construction-timing" tabindex="-1" aria-labelledby="construction-title">
    <header class="service-section-heading"><span class="eyebrow">施工排期 / 精装房局改示例</span>
      <h2 id="construction-title">从进场保护到油漆收口</h2></header>
    <figure class="build-chart"><figcaption><span>预计现场工期</span><strong>49<small> 天</small></strong></figcaption>
    <ol>${constructionPhases.map(([name,start,end])=>`<li><span>${name}</span><div class="build-track" aria-hidden="true"><i style="left:${start/49*100}%;width:${(end-start)/49*100}%"></i></div><div class="build-days"><b>${end-start} 天</b><small>第 ${start}–${end} 天</small></div></li>`).join('')}</ol></figure>
    <p class="timing-note">这套精装房局改排期中，定制生产占 30 天。实际进场和交付日期，要结合改动范围、现场条件及到货时间确定。前期设计另计。</p>
    <details class="build-more"><summary>整屋翻新的工序一般要多久？</summary><p>整屋翻新涉及拆除和重做水电，以下按单道工序列出参考时长。各工种可能穿插，整体工期按现场另排。</p><dl>${renovationPhases.map(([name,days,copy])=>`<div><dt>${name}<small>约 ${days} 天</small></dt><dd>${copy}</dd></div>`).join('')}</dl></details>
    <div class="service-section-actions"><button class="text-link" data-service-jump="design-timing">查看设计周期 ↑</button><button class="text-link" data-process-return>回到六阶段流程 ↑</button></div></section>`;
  const services=[
    ['全屋设计把控','希望布局、材料、灯光与家具形成整体。从生活需求出发，统筹空间方案与关键设计细节。'],
    ['局改与预算','从最想改善的一处开始，厘清保留与调整的范围，再讨论设计取舍与预算安排。'],
    ['柜体收纳设计','把物品、使用习惯与柜体比例放在一起推敲，让收纳够用、好用，也让空间舒展。'],
    ['软装搭配','从家具、灯具、织物到挂画与配饰，整理选品清单，衔接采购与现场摆场，让搭配方案落在日常生活里。']
  ];
  function stageArrow(delta,label){
    const turn=delta<0?'rotate(180 14 14)':'';
    return `<button type="button" data-nudge="${delta}" aria-label="${label}"><svg aria-hidden="true" viewBox="0 0 28 28" width="28" height="28">
      <circle cx="14" cy="14" r="13.25" class="stage-ring"/>
      <circle cx="14" cy="14" r="13.25" class="stage-arc" pathLength="100" transform="rotate(-90 14 14)"/>
      <g transform="${turn}"><path class="stage-needle" d="M14 9v10m-3.25-3.25L14 19l3.25-3.25"/></g>
    </svg></button>`;
  }
  function mount(story,view){
    story.innerHTML='';
    view.innerHTML=`<article class="process-experience" aria-label="无界服务流程"><h1 class="sr-only">无界服务流程</h1><div class="process-track"><div class="process-sticky">${phases.map(stage).join('')}<nav class="process-rail" aria-label="服务阶段">${phases.map((p,i)=>`<button data-process-step="${i}" aria-label="${num(i)} ${p.title}">${num(i)}</button>`).join('')}<div class="subnav">${stageArrow(-1,'上一个服务阶段')}${stageArrow(1,'下一个服务阶段')}</div></nav></div></div>${timingSection}${constructionSection}<section class="process-summary"><div class="process-summary-heading"><span class="eyebrow">A SHARED PATH / 共同的路径</span><h2>从你最想改善的<br>地方开始。</h2><p>不同需求，会选用相应的服务阶段。<br>从第一次对话开始，共同确定适合你的委托范围。</p></div><div class="process-service-list">${services.map(([title,copy],i)=>`<div class="process-service-row"><span>${num(i)}</span><div><h3>${title}</h3><p>${copy}</p></div></div>`).join('')}<p class="scope-note">各阶段的工作深度与交付内容，以项目实际情况及双方约定的服务范围为准。居住问答画面为流程示意，具体摘要由个人回答生成。</p><button class="text-link" data-inquiry>整理我的项目需求 <span>↗</span></button></div></section></article>`;

    const track=view.querySelector('.process-track'), sticky=view.querySelector('.process-sticky');
    const stages=Array.from(track.querySelectorAll('.process-stage')).map((el,i)=>({
      el, layers:[...el.querySelectorAll('[data-layer]')], sideFrames:[...el.querySelectorAll('[data-board-frame],[data-plan-detail]')], softPanels:[...el.querySelectorAll('[data-soft-panel]')],
      caption:el.querySelector('[data-scene-label]'), rightCaption:el.querySelector('.process-art>figcaption'), index:i
    }));
    const buttons=[...track.querySelectorAll('[data-process-step]')];
    const ringNav=track.querySelector('.subnav');
    const previousStage=track.querySelector('[data-nudge="-1"]'),nextStage=track.querySelector('[data-nudge="1"]');
    const abort=new AbortController(), {signal}=abort, reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const elapsed=chapters.map(()=>0), offsets=chapters.map(()=>0);
    let unit=1,position=0,current=-1,raf=0,motionRaf=0,autoRaf=0,lastTick=0;
    let wheelAt=-Infinity,wheelDirection=0,wheelSum=0,targetStop=null,paused=reduced.matches,disposed=false;
    const topOf = stop => track.offsetTop + stop*unit;
    const timing = i => ({ hold: i === 0 || i === 5 ? 4300 : 2500, move: 1500 });
    // Each chapter plays its own forward/reverse image sequence; scrolling changes chapters only.
    function frameAt(i){
      const count=chapters[i].steps.length, {hold,move}=timing(i), segment=hold+move;
      const route=[...Array(count).keys(),...Array.from({length:Math.max(0,count-2)},(_,j)=>count-2-j)];
      const time=elapsed[i]%(route.length*segment), part=Math.floor(time/segment), progress=clamp((time%segment-hold)/move);
      const from=route[(part+offsets[i])%route.length], to=route[(part+offsets[i]+1)%route.length];
      return from+(to-from)*(1-Math.cos(Math.PI*progress))/2;
    }
    function playing(){
      return !disposed&&!paused&&!document.hidden&&!document.querySelector('dialog[open]')&&document.getElementById('opening')?.hidden!==false&&
        view.scrollTop<track.offsetTop+track.offsetHeight-80&&!stages[current]?.el.querySelector('details[open]');
    }
    function syncPlayback(){
      const active=playing();track.dataset.playing=String(active);
      for(const b of track.querySelectorAll('[data-process-play]')){
        b.textContent=paused?'播放 ▶':'暂停 Ⅱ';
        b.setAttribute('aria-label',paused?'播放图片演示':'暂停图片演示');b.setAttribute('aria-pressed',String(paused));
      }
      if(active&&!autoRaf){lastTick=performance.now();autoRaf=requestAnimationFrame(tick);}
      if(!active){cancelAnimationFrame(autoRaf);autoRaf=0;lastTick=0;}
    }
    function tick(now){
      if(!playing()){autoRaf=0;syncPlayback();return;}
      if(current>=0)elapsed[current]+=Math.min(80,Math.max(0,now-lastTick));
      lastTick=now;autoRaf=requestAnimationFrame(tick);draw();
    }
    function draw(){
      raf=0;position=Math.max(0,(view.scrollTop-track.offsetTop)/unit);
      const nearest=Math.round(position);track.dataset.stop=Math.abs(position-nearest)<.01?String(nearest):'moving';
      if(!motionRaf&&nearest===targetStop&&track.dataset.stop!=='moving')targetStop=null;
      const selected=Math.min(total-1,Math.max(0,Math.floor(position+.34)));
      document.body.classList.toggle('process-at-summary',view.scrollTop>=track.offsetTop+track.offsetHeight-78);
      for(const {el,layers,sideFrames,softPanels,caption,rightCaption,index:i} of stages){
        const local=frameAt(i),steps=chapters[i].steps;
        const phaseReveal=clamp((position-i+.68)/.68);
        el.style.clipPath=i===0?'none':`inset(${100*(1-(reduced.matches?Math.round(phaseReveal):phaseReveal))}% 0 0 0)`;
        // Only the two chapters participating in a reveal need image/style updates.
        if(i!==selected&&Math.abs(position-i)>.70)continue;
        for(const [j,node] of layers.entries()){
          const progress=j===0?1:clamp(local-j+1),reveal=reduced.matches?Math.round(progress):progress;
          if([1,2,3,4,5].includes(i)){
            node.style.opacity=1;node.style.clipPath=j===0?'none':`inset(0 0 ${100*(1-reveal)}% 0)`;
          }else node.style.opacity=clamp(1-Math.abs(local-j));
          node.setAttribute('aria-hidden',String(j!==Math.round(local)));
        }
        for (const [j, frame] of sideFrames.entries()) {
          const amount = j === 0 ? 1 : clamp(local - j + 1);
          const reveal = reduced.matches ? Math.round(amount) : amount;
          frame.style.clipPath = j === 0 ? 'none' : `inset(0 0 ${100*(1-reveal)}% 0)`;
          frame.setAttribute('aria-hidden', String(j !== Math.round(local)));
        }
        const step=Math.max(0,Math.min(steps.length-1,Math.round(local)));
        el.dataset.frame=local.toFixed(3);
        if(caption.textContent!==steps[step])caption.textContent=steps[step];
        el.querySelector('[data-scene-count]').textContent=`${num(step)} / ${num(steps.length-1)}`;
        if(i===1)rightCaption.textContent=planSheets[step][2]+' · 局部放大';
        if(chapters[i].material)rightCaption.textContent=chapters[i].material[step];
        if(i===5){
          rightCaption.textContent='方案选例 · '+softExamples[step].title;
          for(const [j,panel] of softPanels.entries()){
            // Fade out the previous words before revealing the next caption.
            panel.style.opacity=reduced.matches?Number(j===step):clamp(1-2*Math.abs(local-j));
            panel.style.transform=`translateY(${reduced.matches?0:(j-local)*12}px)`;
            panel.inert=j!==step;panel.setAttribute('aria-hidden',String(j!==step));
          }
          el.querySelectorAll('[data-soft-step]').forEach((b,j)=>b.setAttribute('aria-current',String(j===step)));
        }
      }
      if(current!==selected){
        previousStage.disabled=selected===0;
        nextStage.setAttribute('aria-label',selected===total-1?'查看设计周期':'下一个服务阶段');
        current=selected;elapsed[current]=0;offsets[current]=0;
        stages.forEach(({el},i)=>{el.inert=i!==current;el.setAttribute('aria-hidden',String(i!==current));});
        buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===current)));
        syncPlayback();
      }
      const {hold,move}=timing(current);
      // A new slide draws one clockwise circuit. The complete ring stays visible during the wipe.
      const progress=reduced.matches?1:clamp((elapsed[current]%(hold+move))/hold);
      ringNav.style.setProperty('--ring-offset',String(100*(1-progress)));
    }
    function schedule(){if(!raf)raf=requestAnimationFrame(()=>{draw();syncPlayback();});}
    function resize(){
      const old=unit;unit=Math.max(180,Math.round(view.clientHeight*.85));sticky.style.height=view.clientHeight+'px';
      track.style.height=(unit*(total-1)+view.clientHeight)+'px';
      if(current>=0&&view.scrollTop<track.offsetTop+old*total)view.scrollTop=topOf(Math.min(total-1,position));
      draw();syncPlayback();
    }
    function cancelMotion(){cancelAnimationFrame(motionRaf);motionRaf=0;targetStop=null;}
    function go(stop){
      cancelMotion();targetStop=Math.min(total,Math.max(0,stop));
      const top=targetStop===total?track.offsetTop+track.offsetHeight:topOf(targetStop),from=view.scrollTop,distance=top-from;
      if(reduced.matches||Math.abs(distance)<1){view.scrollTo({top,behavior:'instant'});schedule();return;}
      const began=performance.now();
      function animate(now){
        const t=clamp((now-began)/850),eased=(1-Math.cos(Math.PI*t))/2;
        view.scrollTo({top:from+distance*eased,behavior:'instant'});motionRaf=t<1?requestAnimationFrame(animate):0;schedule();
      }
      motionRaf=requestAnimationFrame(animate);
    }
    track.addEventListener('click',e=>{
      const chapter=e.target.closest('[data-process-step]'),step=e.target.closest('[data-nudge]');
      if(chapter)go(Number(chapter.dataset.processStep));
      if(step)go((targetStop??Math.round(position))+Number(step.dataset.nudge));
      if(e.target.closest('[data-process-play]')){paused=!paused;syncPlayback();}
    },{signal});
    view.addEventListener('click',e=>{
      const jump=e.target.closest('[data-service-jump]'),back=e.target.closest('[data-process-return]'),soft=e.target.closest('[data-soft-step]');
      if(jump){
        const section=view.querySelector('#'+jump.dataset.serviceJump);cancelMotion();
        const top=view.scrollTop+section.getBoundingClientRect().top-view.getBoundingClientRect().top-78;
        section.focus({preventScroll:true});view.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});
      }
      if(back){go(0);buttons[0].focus({preventScroll:true});}
      if(soft){
        if(current!==5){go(5);buttons[5].focus({preventScroll:true});}
        offsets[5]=Number(soft.dataset.softStep);elapsed[5]=0;draw();syncPlayback();
      }
    },{signal});
    view.addEventListener('toggle',syncPlayback,{capture:true,signal});
    view.addEventListener('wheel',e=>{
      if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||view.scrollTop>topOf(total-1)+4||!e.deltaY||e.target.closest('details[open]'))return;
      const now=performance.now(),direction=Math.sign(e.deltaY);
      if(now-wheelAt>190||direction!==wheelDirection)wheelSum=0;
      wheelAt=now;wheelDirection=direction;e.preventDefault();if(wheelSum===Infinity)return;
      wheelSum+=Math.abs(e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?view.clientHeight:1);
      if(wheelSum>=14){go((targetStop??Math.round(position))+direction);wheelSum=Infinity;}
    },{passive:false,signal});
    view.addEventListener('scroll',schedule,{passive:true,signal});
    view.addEventListener('pointerdown',cancelMotion,{passive:true,signal});
    view.addEventListener('touchstart',cancelMotion,{passive:true,signal});
    document.addEventListener('visibilitychange',syncPlayback,{signal});
    const modalObserver=new MutationObserver(syncPlayback);
    modalObserver.observe(document.getElementById('inquiry-dialog'),{attributes:true,attributeFilter:['open']});
    document.addEventListener('wujie:ready',syncPlayback,{signal});
    reduced.addEventListener('change',()=>{paused=reduced.matches;syncPlayback();schedule();},{signal});
    view.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))cancelMotion();},{signal});
    const observer=new ResizeObserver(resize);observer.observe(view);resize();
    return ()=>{disposed=true;abort.abort();observer.disconnect();modalObserver.disconnect();cancelAnimationFrame(raf);cancelAnimationFrame(autoRaf);cancelMotion();document.body.classList.remove('process-at-summary');};
  }
  window.WujieProcess={mount};
})();
