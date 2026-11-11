(() => {
  'use strict';
  const app=document.getElementById('app');
  function enhance(){
    app.querySelectorAll('img:not([loading])').forEach(img=>{img.loading='lazy';img.decoding='async';});
    if(app.querySelector('.clean-result')&&!app.querySelector('.quiz-site-return')){
      const links=document.createElement('div');links.className='quiz-site-return';
      links.innerHTML='<span>把这些选择带进真实的家。</span><a href="index.html#process">了解设计服务 ↗</a><a href="index.html#work">看看空间作品 ↗</a>';
      app.appendChild(links);
    }
  }
  enhance();new MutationObserver(enhance).observe(app,{childList:true,subtree:true});
})();
