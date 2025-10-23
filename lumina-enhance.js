
/* === LUMINA Interactions Core (v5) === */
(function(){
  // Reveal on scroll
  const revealables = document.querySelectorAll('[data-reveal]');
  if(revealables.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    revealables.forEach(el=> io.observe(el));
  }
})();




// === Pricing interactions (v5) ===
(function(){
  const card = document.querySelector('.pricing-card');
  if(card){
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100)+'%');
    });
  }
  // Ripple + confetti on "Inscribirme"
  const cta = document.querySelector('.cta-inscribir');
  if(cta){
    cta.addEventListener('click', (e)=>{
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = e.offsetX + 'px';
      r.style.top  = e.offsetY + 'px';
      cta.appendChild(r);
      setTimeout(()=> r.remove(), 800);
      const burst = 36;
      for(let i=0;i<burst;i++){
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.background = ['#0ea5e9','#7c3aed','#ef4444','#22c55e','#f59e0b'][i%5];
        el.style.left = (e.clientX + (Math.random()*40-20)) + 'px';
        el.style.top = (e.clientY) + 'px';
        document.body.appendChild(el);
        const dx = (Math.random()*2-1) * 260;
        const dy = Math.random() * -600 - 200;
        const rot = (Math.random()*720-360);
        const dur = 1200 + Math.random()*800;
        const start = performance.now();
        function tick(t){
          const p = Math.min(1, (t-start)/dur);
          const ease = 1 - Math.pow(1-p, 3);
          el.style.transform = `translate(${dx*ease}px, ${dy*ease}px) rotate(${rot*ease}deg)`;
          el.style.opacity = String(1 - p);
          if(p<1) requestAnimationFrame(tick); else el.remove();
        }
        requestAnimationFrame(tick);
      }
    });
  }
})();



// === v6 Billing toggle, coupon, WhatsApp deep link ===
(function(){
  // Base prices (in soles)
  const PRICES = {
    mensualidad: 100,
    inscripcion: 50
  };
  const ANNUAL_DISCOUNT = 0.15; // 15% ahorro en pago anual
  const coupons = { 'LUMINA10': 0.10, 'LUMINA20': 0.20 };

  // Elements
  const card = document.querySelector('.pricing-card');
  const monthlyEl = card?.querySelectorAll('.price-item .amount')[0];
  const signupEl  = card?.querySelectorAll('.price-item .amount')[1];
  const compareEl = document.getElementById('comparePrices');
  const switchEl  = document.getElementById('billingSwitch');
  const couponInput = document.getElementById('couponInput');
  const applyBtn = document.getElementById('applyCoupon');
  const ctaIns = document.querySelector('.cta-inscribir');
  const ctaAs  = document.querySelector('.cta-consulta');

  // Helper to format currency
  const fmt = n => 'S/' + (Math.round(n*100)/100).toString();

  // State
  let annual = false;
  let couponPct = 0;

  // Render function
  function render(){
    let mensual = PRICES.mensualidad;
    let insc = PRICES.inscripcion;
    let beforeMensual = null;

    // Apply billing mode
    if(annual){
      const anualSinDesc = PRICES.mensualidad * 12;
      const anualConDesc = anualSinDesc * (1 - ANNUAL_DISCOUNT);
      // Show mensual equivalent (anual / 12) for clarity
      mensual = anualConDesc / 12;
      beforeMensual = anualSinDesc / 12;
    }

    // Apply coupon to mensualidad only
    if(couponPct > 0){
      beforeMensual = beforeMensual ?? mensual;
      mensual = mensual * (1 - couponPct);
    }

    // Update DOM
    if(monthlyEl) monthlyEl.innerHTML = '<span class="currency">S/</span>' + Math.round(mensual).toString();
    if(signupEl)  signupEl.innerHTML  = '<span class="currency">S/</span>' + Math.round(insc).toString();

    // Compare (antes / ahora) if any discount applied
    const hadDiscount = annual || couponPct > 0;
    if(compareEl){
      if(hadDiscount){
        const antes = Math.round((beforeMensual ?? PRICES.mensualidad));
        const ahora = Math.round(mensual);
        compareEl.innerHTML = `<span>Mensual: <del>S/${antes}</del> <strong>S/${ahora}</strong></span>`;
      }else{
        compareEl.textContent = '';
      }
    }
  }

  // Switch interactions
  function toggleAnnual(on){
    annual = (on !== undefined) ? !!on : !annual;
    switchEl?.classList.toggle('on', annual);
    switchEl?.setAttribute('aria-checked', annual ? 'true' : 'false');
    render();
  }
  switchEl?.addEventListener('click', ()=> toggleAnnual());
  switchEl?.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleAnnual(); } });

  // Coupon
  applyBtn?.addEventListener('click', ()=>{
    const code = (couponInput?.value || '').trim().toUpperCase();
    couponPct = coupons[code] || 0;
    render();
    if(code && !couponPct){
      applyBtn.textContent = 'Cupón inválido';
      setTimeout(()=> applyBtn.textContent = 'Aplicar', 1200);
    }else if(couponPct){
      applyBtn.textContent = 'Aplicado ✓';
      setTimeout(()=> applyBtn.textContent = 'Aplicar', 1400);
    }
  });

  // WhatsApp deep links (replace phone as needed)
  const PHONE = (ctaIns?.dataset.whatsapp || '51999999999'); // <-- Reemplaza con tu número con código de país
  function waUrl(msg){
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
  }

  ctaIns?.addEventListener('click', (e)=>{
    // keep ripple/confetti behavior already attached
    const mode = annual ? 'Anual' : 'Mensual';
    const mensual = document.querySelectorAll('.price-item .amount')[0]?.textContent.replace('S/','').trim();
    const insc = document.querySelectorAll('.price-item .amount')[1]?.textContent.replace('S/','').trim();
    const coupon = (couponPct>0) ? `Cupón aplicado: ${Math.round(couponPct*100)}%` : 'Sin cupón';
    const msg = `Hola, quiero inscribirme. Modalidad: ${mode}. Mensualidad: S/${mensual}. Inscripción: S/${insc}. ${coupon}.`;
    window.open(waUrl(msg), '_blank');
  });

  ctaAs?.addEventListener('click', ()=>{
    const msg = 'Hola, quiero hablar con un asesor sobre los precios y horarios.';
    window.open(waUrl(msg), '_blank');
  });

  // Initial render to ensure values are visible
  render();
})();
