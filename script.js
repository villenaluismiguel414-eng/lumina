// Año dinámico
document.getElementById('y').textContent = new Date().getFullYear();

// Toggle del menú móvil
const nav = document.getElementById('mainNav');
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Scroll suave para anclas
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
      nav.classList.remove('open');
    }
  });
});

// Enviar inscripción vía WhatsApp
function enviarInscripcion(e){
  e.preventDefault();
  const f = e.target;
  const data = new FormData(f);
  const text = `Hola, soy ${data.get('name')}. Quiero inscribirme al plan ${data.get('plan')}.
Correo: ${data.get('email')}
Teléfono: ${data.get('phone')}
Mensaje: ${data.get('message') || '(sin mensaje)'} `;
  const url = `https://wa.me/51955340650?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
  f.reset();
  return false;
}

/* === Precios interactivos v7 === */
(function(){
  const PRICES={mensualidad:100,inscripcion:50};
  const ANNUAL_DISCOUNT=0.15;
  const coupons={LUMINA10:0.10,LUMINA20:0.20};
  const card=document.querySelector('.pricing-card');
  if(!card)return;
  const monthlyEl=card.querySelectorAll('.price-item .amount')[0];
  const signupEl=card.querySelectorAll('.price-item .amount')[1];
  const compareEl=document.getElementById('comparePrices');
  const switchEl=document.getElementById('billingSwitch');
  const couponInput=document.getElementById('couponInput');
  const applyBtn=document.getElementById('applyCoupon');
  const ctaIns=document.querySelector('.cta-inscribir');
  const ctaAs=document.querySelector('.cta-consulta');
  let annual=false;let couponPct=0;
  const fmt=n=>'S/'+Math.round(n);
  function render(){
    let mensual=PRICES.mensualidad;let insc=PRICES.inscripcion;let beforeMensual=null;
    if(annual){const anualSinDesc=PRICES.mensualidad*12;const anualConDesc=anualSinDesc*(1-ANNUAL_DISCOUNT);mensual=anualConDesc/12;beforeMensual=anualSinDesc/12;}
    if(couponPct>0){beforeMensual=beforeMensual??mensual;mensual=mensual*(1-couponPct);}
    monthlyEl.innerHTML='<span class="currency">S/</span>'+Math.round(mensual);
    signupEl.innerHTML='<span class="currency">S/</span>'+Math.round(insc);
    const hadDiscount=annual||couponPct>0;
    if(hadDiscount){const antes=Math.round((beforeMensual??PRICES.mensualidad));const ahora=Math.round(mensual);compareEl.innerHTML='<span>Mensual: <del>S/'+antes+'</del> <strong>S/'+ahora+'</strong></span>';}else{compareEl.textContent='';}}
  function toggleAnnual(on){annual=(on!==undefined)?!!on:!annual;switchEl.classList.toggle('on',annual);switchEl.setAttribute('aria-checked',annual?'true':'false');render();}
  switchEl?.addEventListener('click',()=>toggleAnnual());
  applyBtn?.addEventListener('click',()=>{const code=(couponInput.value||'').trim().toUpperCase();couponPct=coupons[code]||0;render();});
  const phone=(ctaIns?.dataset.whatsapp||'51999999999');
  ctaIns?.addEventListener('click',()=>{const mode=annual?'Anual':'Mensual';const mensualTxt=monthlyEl.textContent.trim();const inscTxt=signupEl.textContent.trim();const msg=`Hola, quiero inscribirme. Modalidad: ${mode}. Mensualidad: ${mensualTxt}. Inscripción: ${inscTxt}.`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');});
  ctaAs?.addEventListener('click',()=>{const msg='Hola, quiero hablar con un asesor sobre los precios y horarios.';window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');});
  render();
})();
