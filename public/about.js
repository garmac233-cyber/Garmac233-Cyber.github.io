/* About WUJIE: source portraits and biographies from the user-supplied team PDF. */
(() => {
  'use strict';
  const asset = file => window.WUJIE_ASSETS?.[file] || 'assets/' + file;
  const team = [
    { id:'pascal', name:'肖涛', en:'Pascal', role:'联合创始人 · 福建区域负责人',
      bio:[
        '毕业于法国 Université Clermont Auvergne（UCA），具有丰富的硬装专业设计经验。',
        '熟悉室内设计及相关领域的发展趋势，对空间设计有独到的理解。关注设计与时尚的更迭，持续追求空间中的审美表达。'
      ] },
    { id:'yoyo', name:'曾玉', en:'YOYO', role:'联合创始人 · 深圳负责人',
      bio:[
        '拥有超过十五年的从业经验，以高端、细腻的设计风格见称。',
        '善于将国际文化与历史设计元素融入空间，兼收并蓄，注重不同层次和细节的推敲。温润如玉、张弛自如的个性，也体现在过往的设计作品中。'
      ] },
    { id:'garmac', name:'谭嘉铭', en:'Garmac', role:'联合创始人 · 硬装设计总监',
      bio:[
        '从事设计行业近十年，秉持“与时代同行，坚守初心”的理念，将艺术融入项目与日常生活。',
        '希望生活空间承载艺术精神，让艺术成为日常的一部分。通过独特的设计方式，将艺术表达与市场需求相结合，提供实用的空间解决方案。'
      ] },
    { id:'ice', name:'郑冰玉', en:'ICE', role:'联合创始人 · 软装设计总监',
      bio:[
        '从事设计行业近十年，负责过多个大型私人定制项目，拥有丰富的地产软装设计经验。',
        '作品类型多元，注重回应不同客户的实际诉求，通过家具、织物与细节搭配，为每个作品赋予独特而鲜明的气质。'
      ] }
  ];
  function card(p,i) {
    return `<button class="team-card" type="button" data-person="${i}" aria-haspopup="dialog" aria-controls="team-detail" aria-label="查看${p.name}的介绍，${p.role}">
      <span class="team-portrait"><img class="team-sketch" src="${asset('team-'+p.id+'-sketch.webp')}" alt="${p.name}的线描肖像" loading="eager" decoding="async"><img class="team-photo" src="${asset('team-'+p.id+'-photo.webp')}" alt="" loading="eager" decoding="async"><span class="portrait-corners" aria-hidden="true"><i>＋</i><i>＋</i><i>＋</i><i>＋</i></span><span class="portrait-action">认识${p.name}<b aria-hidden="true">↗</b></span></span>
      <span class="team-card-caption"><span class="team-name">${p.name}<small>${p.en}</small></span><span class="team-role">${p.role.split(' · ').map(part=>`<span>${part}</span>`).join('<i> · </i>')}</span><span class="team-card-arrow" aria-hidden="true">↗</span></span>
    </button>`;
  }
  const strengths = [
    ['售后质保','按服务书约定，所有品类质保 5 年，水电终身质保。签约时可逐项核对保修范围和报修方式。','taojinshan-03.webp','淘金山石材与柜体收口'],
    ['材料选择','看实物样板时，一起核对材质、检测资料和使用位置，再决定家里用哪一种。','process-board-tray.webp','木材、石材与饰面样板'],
    ['设计取舍','从走路、坐卧和收纳开始安排布局，再决定光线、颜色和材料，让房子适合长期居住。','taojinshan-01.webp','淘金山私宅餐厅'],
    ['方案预览','在开工前结合模型和 AI 图像讨论材质与灯光。选材时，再用实物样板核对颜色和触感。','process-render.webp','餐厅的材质与灯光方案'],
    ['交付排期','无界 Air 系列最快 45 天交付，适用范围和起算日期在开工前确认。服务页另列精装房局改的 49 天排期示例。','about.webp','施工现场沟通'],
    ['小户型布局','为 90㎡ 以下户型比较改造前后的核心活动区，围绕多留出约 20% 活动空间的目标推敲布局。可提升的面积取决于原户型。','kadoorie-01.webp','私宅起居空间'],
    ['设计与施工','设计委托与施工服务分开约定，业主可分别核对费用、工作范围和负责的人。','process-model.webp','设计阶段的空间模型'],
    ['细节验收','检查阴阳角与定制收口时，按 2 毫米以内的误差目标逐项核对。现场测量部位和验收方法在施工前约定。','taojinshan-03.webp','石材墙面与木饰面交接细节']
  ];
  function strengthSection(){
    return `<section class="studio-strengths" aria-labelledby="strength-title">
      <header class="team-intro"><span class="eyebrow">STUDIO / 关于无界</span><h1 id="strength-title">为什么选择无界？</h1></header>
      <div class="strength-stage">
        <figure class="strength-photo"><img src="${asset(strengths[0][2])}" alt="${strengths[0][3]}"></figure>
        <div class="strength-list">${strengths.map(([title,copy],i)=>`<details name="studio-strength" data-strength="${i}" ${i===0?'open':''}>
          <summary><span aria-hidden="true"></span>${title}</summary><p>${copy}</p></details>`).join('')}</div>
      </div></section>`;
  }
  function mount(story,view) {
    const events = new AbortController(), opts = {signal:events.signal};
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let selected=0, returnFocus=null, closeTimer=0;
    story.innerHTML = window.WujieOfficeMap.markup();
    view.innerHTML = `<article class="about-team-view">
      ${strengthSection()}
      <section class="team-manifesto studio-profile"><span class="eyebrow">PROFILE / 公司介绍</span><h2>无界空间设计</h2><p>无界在深圳罗湖、福建晋江设有办公地点。硬装和软装设计师共同参与住宅项目，从一家人的作息、物品和预算开始，安排空间、灯光、材料与家具。</p><p>我们关心光线落在哪里，进门后东西放在哪里，一家人在哪里一起吃饭。从图纸到现场，团队持续跟进这些具体的安排。</p><button type="button" class="text-link" data-inquiry>聊聊你的空间 <span aria-hidden="true">↗</span></button></section>
      <header class="team-intro"><span class="eyebrow">PEOPLE / 无界团队</span><h2>认识无界。</h2><p>硬装、软装与区域协作，<br>共同把设计带到生活里。</p></header>
      <div class="team-grid" aria-label="团队成员">${team.map(card).join('')}</div>
      <section class="about-mobile-tree"></section>

    </article>`;
    const strengthPhoto=view.querySelector('.strength-photo img');
    view.addEventListener('toggle',event=>{
      const detail=event.target;
      if(!detail.matches('details[data-strength][open]'))return;
      const [, ,file,alt]=strengths[Number(detail.dataset.strength)];
      strengthPhoto.src=asset(file);
      strengthPhoto.alt=alt;
    },{...opts,capture:true});
    // Keep one map instance when switching between desktop and mobile layouts.
    const mapPanel=story.querySelector('.office-location');
    const mobileSlot=view.querySelector('.about-mobile-tree');
    const mobile=matchMedia('(max-width:760px)');
    function placeMap(){(mobile.matches?mobileSlot:story).append(mapPanel);}
    placeMap();mobile.addEventListener('change',placeMap,opts);
    const officeMap=window.WujieOfficeMap.mount(mapPanel);
    function syncPlay(){officeMap.suspend(document.hidden||Boolean(document.querySelector('dialog[open]')));}
    const dialog=document.createElement('dialog');
    dialog.id='team-detail';dialog.className='team-drawer';dialog.setAttribute('aria-labelledby','team-detail-name');
    dialog.innerHTML=`<header class="team-drawer-header"><span class="eyebrow">PEOPLE BEHIND WUJIE</span><button type="button" data-team-close aria-label="关闭人物介绍" autofocus>×</button></header><div class="team-drawer-body"></div>`;
    document.body.append(dialog);
    function fillDetail(){
      const p=team[selected];
      dialog.querySelector('.team-drawer-body').innerHTML=`<figure class="team-detail-photo"><img src="${asset('team-'+p.id+'-photo.webp')}" alt="${p.name}的照片"></figure><div class="team-detail-identity"><span class="eyebrow">${p.en}</span><h2 id="team-detail-name">${p.name}</h2><p>${p.role}</p></div><div class="team-bio">${p.bio.map(text=>`<p>${text}</p>`).join('')}</div><footer class="team-detail-footer"><span>0${selected+1} / 04</span><button type="button" data-team-next>下一位 · ${team[(selected+1)%team.length].name} <span aria-hidden="true">→</span></button></footer>`;
      dialog.scrollTop=0;
    }
    function openPerson(index,trigger){
      clearTimeout(closeTimer);selected=index;returnFocus=trigger;fillDetail();
      dialog.classList.remove('is-closing');dialog.showModal();syncPlay();
    }
    function closePerson(){
      if(!dialog.open||dialog.classList.contains('is-closing'))return;
      dialog.classList.add('is-closing');
      closeTimer=setTimeout(()=>{dialog.close();dialog.classList.remove('is-closing');syncPlay();returnFocus?.focus({preventScroll:true});},reduced.matches?0:320);
    }
    view.addEventListener('click',event=>{const button=event.target.closest('[data-person]');if(button)openPerson(Number(button.dataset.person),button);},opts);
    dialog.addEventListener('click',event=>{
      if(event.target.closest('[data-team-close]'))closePerson();
      if(event.target.closest('[data-team-next]')){selected=(selected+1)%team.length;fillDetail();dialog.querySelector('[data-team-next]').focus({preventScroll:true});}
      if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePerson();}
    },opts);
    dialog.addEventListener('cancel',event=>{event.preventDefault();closePerson();},opts);
    document.addEventListener('visibilitychange',syncPlay,opts);
    const modalObserver=new MutationObserver(syncPlay);
    modalObserver.observe(document.getElementById('inquiry-dialog'),{attributes:true,attributeFilter:['open']});
    return ()=>{events.abort();clearTimeout(closeTimer);modalObserver.disconnect();officeMap.destroy();dialog.close();dialog.remove();};
  }
  window.WujieAbout={mount};
})();
