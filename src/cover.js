// One set of native SVG portraits: clothing and tools identify each everyday role.
const people = [
  ['游船经营者','Boat operator','明天会下雨吗？','Will it rain tomorrow?','boat'],
  ['晾晒食品的家人','Food-drying household','还能继续晾晒吗？','Can I keep drying food?','food'],
  ['临水咖啡店主','Canal-side café owner','游客会减少吗？','Will customers still come?','cafe'],
  ['老年居民','Older resident','要不要早点准备？','Should I prepare earlier?','elder'],
  ['游客','Visitor','会有多热？','How hot will it get?','visitor'],
  ['户外工作者','Outdoor worker','这个判断靠谱吗？','Can I trust this judgment?','worker'],
  ['小商贩','Street vendor','市场的看法一致吗？','Do market signals agree?','vendor'],
  ['学生','Student','过去判断准吗？','How did past judgments turn out?','student'],
];

function portrait(kind) {
  const longHair = ['food','visitor'].includes(kind);
  const head = `<path class="person-paper" d="M51 39Q52 20 75 20Q98 21 99 43L95 73Q91 88 75 91Q60 87 55 73Z"/><path class="person-detail" d="M62 53h3m20 0h3M76 55l-3 12h6M68 77q7 4 14-1"/>`;
  let hair = longHair
    ? '<path class="person-ink" d="M49 70V38Q47 7 75 9Q109 10 103 46L101 83L91 70V38Q72 47 57 36L57 75Z"/>'
    : '<path class="person-ink" d="M51 42Q44 16 65 13Q83 4 99 20L101 44L90 30Q72 36 56 28Z"/>';
  if(kind==='elder') hair='<path fill="#b9c6b8" d="M51 46Q45 22 59 22L59 45ZM92 25Q103 24 99 48L93 46Z"/>';
  if(kind==='student') hair='<path class="person-ink" d="M49 43Q39 33 47 25Q39 12 53 13Q57 1 69 9Q78-3 88 9Q104 5 103 20Q115 30 101 45L92 32Q72 41 56 32Z"/>';
  const shoulders = '<path class="person-paper" d="M54 91L64 85L65 99Q75 107 86 99L86 85L96 93Q127 102 133 133L144 226H9L17 132Q22 103 54 91Z"/>';
  const clothing = ['cafe','vendor','food'].includes(kind)
    ? '<path class="person-ink" d="M48 95L57 95L59 129H93L96 97L103 100L112 225H40Z"/><path class="person-accent" d="M62 157h29v29H62Z"/>'
    : '<path class="person-detail" d="M54 95l20 31L94 95M74 126v96M36 131l-7 80M111 131l10 79"/>';
  const props = {
    boat:'<path class="person-paper" d="M37 30L55 6H92L111 30Z"/><path class="person-accent" d="M29 30h89v9H29Z"/><path class="person-detail" d="M111 93l11 130"/><path class="person-paper" d="M115 162l12-1 8 55-17 3Z"/>',
    food:'<path class="person-paper" d="M19 176q55 12 111 0l-10 29H30Z"/><path class="person-detail" d="M35 178l5-7m13 10 5-7m14 8 5-8m15 5 5-7m11 7 5-7"/>',
    cafe:'<path class="person-paper" d="M90 149h25l-4 31H95Z"/><path class="person-detail" d="M114 154q19 0 6 17h-7M96 138q-5-7 1-14m9 14q-5-7 1-14"/>',
    elder:'<path class="person-paper" d="M58 50h15v13H58Zm22 0h15v13H80Z"/><path class="person-detail" d="M73 56h7M64 69l-4 2m24-2 5 2M48 171q-14-13-17 2v52"/><path class="person-accent" d="M53 97l22 22 21-21-7 30-24-2Z"/>',
    visitor:'<path class="person-accent" d="M26 108l12-6 15 105-12 3Z"/><path class="person-paper" d="M53 152h46v32H53Z"/><circle class="person-detail" cx="76" cy="168" r="10"/><path class="person-detail" d="M54 102l16 50m26-51-16 51"/>',
    worker:'<path class="person-paper" d="M48 32Q50 5 77 5Q103 6 104 32Z"/><path class="person-accent" d="M41 32h70v9H41ZM30 108l20-11 16 128H38ZM101 99l20 11-8 115H86Z"/><path class="person-detail" d="M38 156h24m30 0h22"/>',
    vendor:'<path class="person-paper" d="M51 28q15-28 42-7l14 10H51Z"/><path class="person-accent" d="M45 29h65v8H45Z"/><path class="person-paper" d="M101 166h26l8 43h-39Z"/><path class="person-detail" d="M108 166v-9q8-12 13 0v9"/>',
    student:'<path class="person-accent" d="M31 106h11l12 117H40ZM105 105h12l-9 118H96Z"/><path class="person-paper" d="M56 163l21 4 24-7v46l-23 6-22-4Z"/><path class="person-detail" d="M77 167v45M63 177l8 2m14-2 9-2"/>',
  };
  return `<svg viewBox="0 0 150 230" aria-hidden="true">${shoulders}${clothing}${head}${hair}${props[kind]}</svg>`;
}

const crowd = document.getElementById('cover-crowd');
const lines = document.getElementById('crowd-lines');
if (crowd && lines) {
  let selected = 1;
  crowd.innerHTML = people.map((person,i) => `<button type="button" class="crowd-person${i===5?' is-peek':''}" data-person="${i}" aria-pressed="${i===selected}" aria-describedby="person-question-${i}">${portrait(person[4])}<span class="person-label"></span><span class="person-question" id="person-question-${i}" role="status"></span></button>`).join('');
  const buttons = [...crowd.querySelectorAll('button')];
  function renderLanguage() {
    const zh = document.documentElement.lang.startsWith('zh');
    buttons.forEach((button,i) => {
      const p=people[i];
      button.querySelector('.person-label').textContent=p[zh?0:1];
      button.querySelector('.person-question').textContent=p[zh?2:3];
      button.setAttribute('aria-label',`${p[zh?0:1]}：${p[zh?2:3]}`);
    });
  }
  // Compute connections from actual button positions, including the mobile two-row layout.
  function renderLines() {
    const svg=lines.ownerSVGElement;
    const top=svg.getBoundingClientRect().top;
    svg.style.height=`${Math.max(150,...buttons.map(b=>b.getBoundingClientRect().top-top+10))}px`;
    const box=svg.getBoundingClientRect();
    const paths=buttons.map((button,i) => {
      const rect=button.getBoundingClientRect();
      const x=(rect.left+rect.width/2-box.left)/box.width*1200;
      const y=(rect.top-box.top)/box.height*300;
      return `<path class="${i===selected?'is-active':''}" d="M${x} ${y} Q${x} 45 600 0"/>`;
    });
    lines.innerHTML=paths.join('');
  }
  function select(i) {
    selected=i;
    buttons.forEach((b,j) => {b.setAttribute('aria-pressed',String(i===j));b.classList.remove('is-peek');});
    renderLines();
  }
  buttons.forEach((button,i) => {
    button.addEventListener('click',()=>select(i));
    button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')select(i);});
    button.addEventListener('focus',()=>select(i));
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?7:(i+(event.key==='ArrowRight'?1:7))%8;
      buttons[next].focus();
    });
  });
  window.addEventListener('site-language-change',renderLanguage);
  new ResizeObserver(renderLines).observe(crowd);
  renderLanguage();
  renderLines();
}
