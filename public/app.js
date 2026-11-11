(() => {
  'use strict';
  const { projects, phases } = window.WUJIE;
  const view = document.querySelector('.viewport');
  const story = document.querySelector('#story');
  const progress = document.querySelector('#scroll-progress');
  const tools = document.querySelector('.mobile-detail-tools');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const numbers = n => String(n + 1).padStart(2, '0');
  let route = '', currentProject = -1, homePosition = 0, smoothTarget = 0, frame = 0, homeCleanup = null;
  const asset = name => window.WUJIE_ASSETS?.[name] || 'assets/' + name;
  function img(name, alt, eager=false){
    const size=window.WUJIE.photoSizes?.[name];
    const dimensions=size ? ` width="${size[0]}" height="${size[1]}"` : '';
    const tag=`<img src="${asset(name)}" alt="${alt}"${dimensions} loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}>`;
    return size ? `<picture class="project-photo"><source media="(max-width:760px)" srcset="${asset(window.WUJIE.smallPhoto(name))}">${tag}</picture>` : tag;
  }
  const homeHeading = `<span class="eyebrow">WUJIE — SPACES FOR LIFE</span><h1>让空间呼吸，<br>让景观<em>无界。</em></h1><p class="home-lead">从人的感受出发，<br>让设计回到生活本身。<br>居住空间 · 样板间 · 公共空间</p>`;
  const serviceHeading = `<span class="eyebrow">OUR PROCESS / 服务流程</span><h1>从第一次对话，<br>到日常发生。</h1><p>好的空间，来自清晰的沟通与持续的协作。我们把设计的每一步展开，让你看得见方向，也看得见进展。</p>`;
  const aboutHeading = `<span class="eyebrow">ABOUT WUJIE / 关于无界</span><h1>先去感受，<br>先去生活。</h1><p>然后，才是设计。</p>`;

  function home() {
    if (window.WujieHome) { homeCleanup = window.WujieHome.mount(story, view); return; }
    story.innerHTML = `<div class="home-story route-enter">${homeHeading}<div class="home-bottom"><div class="index-head"><span>空间作品选集</span><span class="project-counter"><b id="active-number">01</b> / ${numbers(projects.length - 1)}</span></div><div class="project-index" aria-label="跳转项目">${projects.map((p, i) => `<button class="index-button" data-index="${i}" aria-label="浏览${p.name}" aria-current="${i === 0}">${numbers(i)}</button>`).join('')}</div><div id="selected-name" class="selected-name">${projects[0].name}</div></div></div>`;
    view.innerHTML = `<div class="work-view"><div class="mobile-home-intro">${homeHeading}</div><div class="gallery-heading"><span class="eyebrow">SELECTED SPACES / 作品选集</span><span>向下浏览 ↓</span></div>${projects.map((p, i) => `<a class="project-card" href="#project/${p.id}" data-card="${i}" aria-label="查看${p.name}项目详情"><div class="project-image">${img(p.cover, p.name + '空间方案', i === 0)}<span class="project-cover-label">${p.status}</span><span class="view-project" aria-hidden="true">↗</span></div><div class="project-caption"><div><h2>${p.name}</h2><p>${p.type} / ${p.en}</p></div><span class="card-number">${numbers(i)} — ${numbers(projects.length - 1)}</span></div></a>`).join('')}<a href="#process" class="small-cta"><div><p>从喜欢的空间，到属于你的空间。</p><h2>了解我们如何合作</h2></div><span aria-hidden="true">↗</span></a></div>`;
  }
  function project(index) {
    window.WujieHome?.remember?.(index);
    const p = projects[index], next = projects[(index + 1) % projects.length];
    story.innerHTML = `<div class="project-story brief-enter"><span class="eyebrow">SELECTED SPACES / ${numbers(index)} — ${numbers(projects.length - 1)}</span><h1>${p.name}</h1><dl class="brief-list"><div class="brief-row"><dt>项目 Brief</dt><dd>${p.intro}</dd></div><div class="brief-row"><dt>地点</dt><dd>${p.city}</dd></div><div class="brief-row"><dt>类型</dt><dd>${p.type}</dd></div><div class="brief-row"><dt>呈现</dt><dd>${p.status}</dd></div><div class="brief-row"><dt>设计关键词</dt><dd>${p.tags}</dd></div></dl><a class="back-link" href="#work">← <span>返回作品选集</span></a></div>`;
    view.innerHTML = `<article class="detail-view route-enter${p.galleryLayout === 'panoramic' ? ' detail-view--panoramic' : ''}" aria-label="${p.name}项目图片"><header class="mobile-gallery-heading"><span class="eyebrow">${p.status} / ${p.images.length} 张精选</span><h1>${p.name}</h1><p>向下滑动，浏览完整项目图片 ↓</p></header>${p.images.map(([file, label], i) => `<figure class="detail-image">${img(file, p.name + ' · ' + label, i === 0)}<figcaption>${numbers(i)} / ${label}</figcaption></figure>`).join('')}<div class="detail-end"><a class="small-cta" href="#project/${next.id}"><div><p>下一个空间 / NEXT PROJECT</p><h2>${next.name}</h2></div><span aria-hidden="true">↗</span></a></div></article><a class="close-project" href="#work" aria-label="关闭项目，返回作品">×</a>`;
  }
  function processPage() {
    if (window.WujieProcess) { homeCleanup = window.WujieProcess.mount(story, view); return; }
    story.innerHTML = `<div class="section-story route-enter">${serviceHeading}<div class="process-index" aria-label="服务阶段">${phases.map((p, i) => `<button data-phase-link="${i}"><span>${numbers(i)}</span>${p.title}</button>`).join('')}</div></div>`;
    view.innerHTML = `<article class="editorial-view route-enter"><div class="mobile-section-intro">${serviceHeading}</div><div class="editorial-top"><span class="eyebrow">A SHARED PATH</span><span class="eyebrow">01 — 06</span></div><figure class="process-hero">${img('process.webp', '现场方案讨论', true)}<figcaption>共同参与，让每一步有迹可循。</figcaption></figure><div class="section-intro"><h2>一条清楚的路径，<br>让设计落到生活。</h2><p>从需求到交付，我们先建立共同的方向，再根据项目与所选服务，安排每个阶段的深度。</p></div><div class="phases">${phases.map((p, i) => `<details class="phase" id="phase-${i}"${i === 0 ? ' open' : ''}><summary><span class="phase-number">${numbers(i)}</span><div><h3>${p.title}</h3><small>${p.en}</small></div><span class="phase-plus" aria-hidden="true">＋</span></summary><div class="phase-body"><p>${p.body}</p><div class="phase-deliverables"><div><span>你会参与</span><p>${p.you}</p></div><div><span>阶段成果</span><p>${p.get}</p></div></div></div></details>`).join('')}</div><p class="scope-note">各阶段的工作深度与交付内容，以项目实际情况及双方约定的服务范围为准。</p><section class="service-types"><span class="eyebrow">YOUR SPACE, YOUR NEEDS</span><h2>从你最想改善的地方开始。</h2><div class="service-row"><h3>全屋设计把控</h3><p>希望布局、材料、灯光与家具形成整体。我们从生活需求出发，统筹空间方案与关键设计细节。</p></div><div class="service-row"><h3>局改与预算</h3><p>只想改善厨房、客厅或某一处空间。先厘清保留与调整的范围，再讨论设计取舍与预算安排。</p></div><div class="service-row"><h3>柜体收纳设计</h3><p>柜子如何安排才够用、好用，也让空间舒展。把物品、使用习惯与柜体比例放在一起推敲。</p></div><div class="service-row"><h3>软装搭配</h3><p>用家具、灯具、织物与配饰，协调尺度、色彩和日常使用，让现有空间更贴近你的生活。</p></div><p class="scope-note">不同需求会选用相应的服务阶段，具体委托范围在沟通后共同确定。</p></section><div class="process-bottom"><p>不必等所有想法都确定，<br>我们可以先从你最想改善的地方聊起。</p><button class="text-link" data-inquiry>整理我的项目需求 <span>↗</span></button></div></article>`;
  }
  function about() {
    if (window.WujieAbout) { homeCleanup = window.WujieAbout.mount(story, view); return; }
    story.innerHTML = `<div class="section-story route-enter">${aboutHeading}<div class="about-signature">WUJIE STUDIO<br><br>让空间呼吸，让景观无界。</div></div>`;
    view.innerHTML = `<article class="editorial-view route-enter"><div class="mobile-section-intro">${aboutHeading}</div><div class="editorial-top"><span class="eyebrow">DESIGN AROUND LIFE</span></div><figure class="about-hero">${img('about.webp', '无界团队在空间现场沟通', true)}<figcaption>感受空间，理解生活。</figcaption></figure><div class="about-copy"><h2>好设计，最终是<br>对人的关照。</h2><p>我们关注人在空间里的感受：光线落在哪里，动线是否顺畅，物品如何收纳，以及一家人怎样在日常里相遇。</p><p>无界将空间逻辑、美感与落地过程一起考虑。从方案开始统筹预算、硬装、灯光与软装，在设计和现场之间保持持续沟通。</p></div><div class="principles"><section class="principle"><h3>01 / 先理解生活</h3><p>从真实的使用习惯出发，把功能、收纳和舒适感纳入空间的第一轮讨论。</p></section><section class="principle"><h3>02 / 让整体成立</h3><p>布局、材料、灯光和家具彼此协调。每一处细节，都回到整体的设计意图。</p></section><section class="principle"><h3>03 / 关心最后一程</h3><p>通过图纸、样板和现场节点反馈，让方案在落地过程中不断得到核对。</p></section></div><div class="process-bottom"><p>你的空间，可以从一次对话开始。</p><button class="text-link" data-inquiry>聊聊你的空间 <span>↗</span></button></div></article>`;
  }

  function cancelSmooth() { if (frame) cancelAnimationFrame(frame); frame = 0; smoothTarget = view.scrollTop; }
  function moveTo(y, animate = true) {
    smoothTarget = Math.max(0, Math.min(y, view.scrollHeight - view.clientHeight));
    if (!animate || reduced.matches || mobile.matches) { cancelSmooth(); view.scrollTop = y; return; }
    if (frame) return;
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(now - last, 50); last = now;
      const delta = smoothTarget - view.scrollTop;
      if (Math.abs(delta) < .8) {view.scrollTop = smoothTarget; frame = 0; return;}
      view.scrollTop += delta * (1 - Math.exp(-dt / 90));
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }
  function render() {
    const wasRendered = Boolean(route);
    if (homeCleanup) { homeCleanup(); homeCleanup = null; }
    if (route === 'work') homePosition = view.scrollTop;
    cancelSmooth(); document.body.classList.remove('brief-open');
    document.querySelector('#brief-toggle').setAttribute('aria-expanded', 'false');
    document.querySelector('#brief-toggle span').textContent = '＋';
    const hash = location.hash.slice(1) || 'work';
    const id = hash.startsWith('project/') ? hash.slice(8) : null;
    currentProject = id ? projects.findIndex(p => p.id === id) : -1;
    route = currentProject >= 0 ? 'project' : ['process', 'about'].includes(hash) ? hash : 'work';
    document.body.dataset.route = route;
    if (route === 'project') project(currentProject); else if (route === 'process') processPage(); else if (route === 'about') about(); else home();
    tools.hidden = route !== 'project';
    document.querySelectorAll('[data-nav]').forEach(a => a.setAttribute('aria-current', a.dataset.nav === (route === 'project' ? 'work' : route) ? 'page' : 'false'));
    document.title = (route === 'project' ? projects[currentProject].name : route === 'process' ? '服务流程' : route === 'about' ? '关于无界' : '空间作品') + '｜无界 WUJIE';
    story.scrollTop = 0; view.scrollTop = route === 'work' ? homePosition : 0; smoothTarget = view.scrollTop;
    updateScroll(); requestAnimationFrame(updateScroll);
    if (wasRendered) view.focus({preventScroll:true});
  }
  let navigationGeneration=0, activeTransition=null;
  function navigate() {
    const generation=++navigationGeneration;
    activeTransition?.skipTransition();activeTransition=null;
    document.querySelectorAll('[style*="view-transition-name"]').forEach(el=>el.style.removeProperty('view-transition-name'));
    if (!document.startViewTransition || reduced.matches || mobile.matches) {render(); return;}
    const nextId = location.hash.startsWith('#project/') ? location.hash.slice(9) : null;
    const nextIndex = projects.findIndex(p => p.id === nextId);
    const opening = route === 'work' && nextIndex >= 0;
    const closing = route === 'project' && location.hash === '#work' && view.scrollTop < 20;
    const selected = opening ? nextIndex : currentProject;
    const homeCover=()=>view.querySelector(`[data-cover="${selected}"]`)||view.querySelector(`[data-card="${selected}"] .project-image`);
    const previous = opening ? homeCover() : closing ? view.querySelector('.detail-image') : null;
    if (!previous) {render(); return;}
    previous.style.viewTransitionName = 'project-cover';
    const transition = document.startViewTransition(() => {
      if(generation!==navigationGeneration)return;
      render();
      const next = opening ? view.querySelector('.detail-image') : homeCover();
      if(next) next.style.viewTransitionName = 'project-cover';
    });
    activeTransition=transition;
    transition.finished.catch(()=>{}).finally(()=>{
      if(generation!==navigationGeneration)return;
      activeTransition=null;
      document.querySelectorAll('[style*="view-transition-name"]').forEach(el=>el.style.removeProperty('view-transition-name'));
    });
  }
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    const range = view.scrollHeight - view.clientHeight;
    progress.style.transform = `scaleY(${range > 0 ? view.scrollTop / range : 0})`;
    if (route !== 'work' || window.WujieHome) return;
    const bounds = view.getBoundingClientRect();
    let nearest = 0, nearestDistance = Infinity;
    view.querySelectorAll('[data-card]').forEach(card => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.top - bounds.top - 130);
      if (distance < nearestDistance) { nearest = Number(card.dataset.card); nearestDistance = distance; }
      if (!reduced.matches && rect.bottom > bounds.top && rect.top < bounds.bottom) {
        const offset = Math.max(-20, Math.min(20, (bounds.top + bounds.height / 2 - (rect.top + rect.height / 2)) * .045));
        card.style.setProperty('--image-offset', offset + 'px');
      }
    });
    document.querySelectorAll('[data-index]').forEach(b => b.setAttribute('aria-current', String(Number(b.dataset.index) === nearest)));
    const number = document.querySelector('#active-number');
    if (number) number.textContent = numbers(nearest);
    const name = document.querySelector('#selected-name');
    if (name) name.textContent = projects[nearest].name;
  }
  view.addEventListener('scroll', () => { if (!scheduled) {scheduled = true; requestAnimationFrame(updateScroll);} }, {passive:true});
  view.addEventListener('wheel', event => {
    if (route === 'about' && window.WujieAbout) return;
    if (route === 'process' && window.WujieProcess) return;
    if (route === 'work' && window.WujieHome) return;
    if (reduced.matches || mobile.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.target.closest('textarea,select,input')) return;
    event.preventDefault();
    if (!frame) smoothTarget = view.scrollTop;
    moveTo(smoothTarget + event.deltaY * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? view.clientHeight : 1));
  }, {passive:false});
  view.addEventListener('pointerdown', cancelSmooth, {passive:true});
  view.addEventListener('keydown', cancelSmooth);
  window.addEventListener('resize', () => {cancelSmooth(); updateScroll();});
  window.addEventListener('hashchange', navigate);
  document.addEventListener('click', event => {
    if(event.target.closest('.skip-link')){event.preventDefault();view.focus({preventScroll:true});return;}
    const indexButton = event.target.closest('[data-index]');
    if (indexButton) {
      const card = view.querySelector(`[data-card="${indexButton.dataset.index}"]`);
      moveTo(view.scrollTop + card.getBoundingClientRect().top - view.getBoundingClientRect().top - 96);
    }
    const phaseButton = event.target.closest('[data-phase-link]');
    if (phaseButton) {
      const phase = document.querySelector('#phase-' + phaseButton.dataset.phaseLink);
      phase.open = true;
      moveTo(view.scrollTop + phase.getBoundingClientRect().top - view.getBoundingClientRect().top - 96);
      phase.querySelector('summary').focus({preventScroll:true});
    }
    if (event.target.closest('[data-inquiry]')) document.querySelector('#inquiry-dialog').showModal();
  });
  document.querySelector('#brief-toggle').addEventListener('click', () => {
    const open = document.body.classList.toggle('brief-open');
    document.querySelector('#brief-toggle').setAttribute('aria-expanded', String(open));
    document.querySelector('#brief-toggle span').textContent = open ? '−' : '＋';
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('brief-open')) document.querySelector('#brief-toggle').click();
  });
  const dialog = document.querySelector('#inquiry-dialog');
  document.querySelector('#close-inquiry').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {if(event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close();});
  document.querySelector('#inquiry-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.target);
    const content = `无界 WUJIE｜合作需求单\n\n项目城市：${data.get('city') || '待沟通'}\n大致面积：${data.get('area') || '待沟通'}\n希望获得的服务：${data.get('service')}\n\n对空间的期待：\n${data.get('needs') || '期待从第一次沟通开始梳理。'}\n\n此需求单由你本地保存，尚未发送。\n`;
    const url = URL.createObjectURL(new Blob(['\uFEFF' + content], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = '无界-合作需求单.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.querySelector('#form-status').textContent = '已生成下载文件。你可以在联系无界时一并分享。';
  });
  render();
})();
