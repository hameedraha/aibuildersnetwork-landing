import{i as t}from"./unlock.BRP2pHQX.js";function d(s,a,c){const e=document.createElement("a");return e.href=`/workshop/${s}`,e.className="locked-card locked-card--unlocked",e.setAttribute("aria-label",`open ${a}`),e.innerHTML=`
      <span class="eyebrow locked-card__status locked-card__status--open">unlocked</span>
      <div class="locked-card__header">
        <span class="dot-bullet" aria-hidden="true"><span></span><span></span><span class="accent"></span><span></span></span>
        <span class="locked-card__title">${a}</span>
      </div>
      <p class="locked-card__desc">${c}</p>
      <span class="locked-card__hint locked-card__hint--open">open section →</span>
    `,e}function n(){document.querySelectorAll("[data-locked-card]").forEach(s=>{const a=s.dataset.slug,c=s.dataset.title??a??"",e=s.dataset.description??"";!a||!t(a)||s.replaceWith(d(a,c,e))})}n();document.addEventListener("astro:page-load",n);
