/* =====================================================
   CONSTANTS
   ===================================================== */
const PIX_STRING =
  '00020126570014BR.GOV.BCB.PIX0111084434216570220Presente chá de bebê5204000053039865802BR5925Anna Clara da Costa Marca6009SAO PAULO62140510adlMDueoCP6304E20C';

const LS_CART         = 'chaJacopo.cart';
const LS_PRESENTEADOS = 'chaJacopo.presenteados';

/* =====================================================
   STORAGE HELPERS
   ===================================================== */
function readCart() {
  try { return JSON.parse(localStorage.getItem(LS_CART)) || []; } catch { return []; }
}
function writeCart(cart) {
  try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch {}
}
function readPresenteados() {
  try { return JSON.parse(localStorage.getItem(LS_PRESENTEADOS)) || []; } catch { return []; }
}
function writePresenteados(arr) {
  try { localStorage.setItem(LS_PRESENTEADOS, JSON.stringify(arr)); } catch {}
}

/* =====================================================
   CURRENCY FORMATTING
   ===================================================== */
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* =====================================================
   STATE
   ===================================================== */
let cart         = readCart();
let presenteados = readPresenteados();
let currentItem  = null; // item open in modal

/* =====================================================
   SLIDESHOW — filmstrip / multi-image carousel
   ===================================================== */
const slideshowEl    = document.getElementById('slideshow');
const slideshowTrack = document.getElementById('slideshowTrack');
const viewport       = slideshowEl.querySelector('.slideshow__viewport');
const slides         = Array.from(slideshowTrack.querySelectorAll('.slideshow__slide'));
const dotsWrap       = document.getElementById('slideshowDots');

const SLIDE_GAP = 16; // px — must match CSS gap on .slideshow__track
let currentSlide = 0;
let slideTimer   = null;
let isPaused     = false;
let visibleCount = 1;
let slideW       = 0;
let resizeTimer  = null;

function getVisibleCount() {
  const w = window.innerWidth;
  if (w >= 1200) return 4;
  if (w >= 900)  return 3;
  if (w >= 600)  return 2;
  return 1;
}

function computeDimensions() {
  visibleCount = getVisibleCount();

  // Read from the slideshow wrapper (parent of the viewport), not the viewport itself.
  // The wrapper's width is more reliably set by CSS; the viewport's width can be stale
  // or zero on first paint if its content hasn't been sized yet.
  const wrapperW = slideshowEl.offsetWidth;

  // Math.floor → integer pixel slide size. Avoids sub-pixel rounding discrepancies
  // between slides that would make some appear fractionally wider than others.
  slideW = Math.floor((wrapperW - SLIDE_GAP * (visibleCount - 1)) / visibleCount);

  slides.forEach(s => {
    s.style.width  = slideW + 'px';
    s.style.height = slideW + 'px';
  });

  // Pin the viewport to the exact pixel dimensions it should show.
  // This prevents any CSS ambiguity about the viewport's size from letting
  // partial slides bleed in at the edges.
  const totalW = visibleCount * slideW + (visibleCount - 1) * SLIDE_GAP;
  viewport.style.width  = totalW + 'px';
  viewport.style.height = slideW + 'px';

  // Clamp currentSlide so we never show empty space after a resize
  const maxOffset = Math.max(0, slides.length - visibleCount);
  if (currentSlide > maxOffset) currentSlide = maxOffset;

  updateTrack(false); // reposition without animation
}

function updateTrack(animate = true) {
  if (!animate) {
    slideshowTrack.style.transition = 'none';
  }
  const offset = currentSlide * (slideW + SLIDE_GAP);
  slideshowTrack.style.transform = `translateX(-${offset}px)`;
  if (!animate) {
    slideshowTrack.offsetWidth; // force reflow to apply no-transition
    slideshowTrack.style.transition = '';
  }
  updateDots();
}

// Build dots (one per photo)
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slideshow__dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Foto ${i + 1}`);
  dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
  dot.addEventListener('click', () => goToSlide(i));
  dot.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToSlide(i); }
  });
  dotsWrap.appendChild(dot);
});

function updateDots() {
  Array.from(dotsWrap.children).forEach((dot, i) => {
    const active = i === currentSlide;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function goToSlide(index) {
  const maxOffset = Math.max(0, slides.length - visibleCount);
  currentSlide = Math.max(0, Math.min(index, maxOffset));
  updateTrack();
  resetTimer();
}

function nextSlide() {
  const maxOffset = Math.max(0, slides.length - visibleCount);
  goToSlide(currentSlide >= maxOffset ? 0 : currentSlide + 1);
}

function startTimer() {
  slideTimer = setInterval(() => { if (!isPaused) nextSlide(); }, 3500);
}
function resetTimer() {
  clearInterval(slideTimer);
  startTimer();
}

// Pause on hover — desktop only
slideshowEl.addEventListener('mouseenter', () => { isPaused = true; });
slideshowEl.addEventListener('mouseleave', () => { isPaused = false; });

// Debounced resize handler
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(computeDimensions, 120);
});

// Init slideshow after DOM paint
computeDimensions();
startTimer();

/* =====================================================
   GIFT GRID RENDERING
   ===================================================== */
function renderGrid() {
  const grid = document.getElementById('giftsGrid');
  grid.innerHTML = '';

  ITEMS.forEach(item => {
    const inCart        = cart.some(l => l.id === item.id);
    const isPresenteado = presenteados.includes(item.id);

    const li = document.createElement('li');
    li.className = 'item-card';
    li.setAttribute('role', 'listitem');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', item.name);

    li.innerHTML = `
      <div class="item-card__image-wrap">
        <img class="item-card__image" src="${item.image}" alt="${item.name}" loading="lazy" />
      </div>
      <div class="item-card__body">
        ${inCart ? '<span class="item-card__in-cart">no carrinho</span>' : ''}
        <h3 class="item-card__name">${item.name}</h3>
        <p class="item-card__price">${formatBRL(item.price)}</p>
        <button class="btn btn--primary item-card__btn">Presentear</button>
      </div>
      ${isPresenteado ? `
        <div class="item-card__presenteado-overlay">
          <span class="item-card__presenteado-badge">✓ PRESENTEADO</span>
        </div>` : ''}
    `;

    li.addEventListener('click', () => openItemModal(item));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItemModal(item); }
    });

    grid.appendChild(li);
  });
}

/* =====================================================
   ITEM MODAL
   ===================================================== */
const itemModal      = document.getElementById('itemModal');
const itemModalClose = document.getElementById('itemModalClose');
const itemModalImage = document.getElementById('itemModalImage');
const itemModalName  = document.getElementById('itemModalName');
const itemModalPrice = document.getElementById('itemModalPrice');
const itemModalQty   = document.getElementById('itemModalQty');
const itemModalSub   = document.getElementById('itemModalSubtotal');
const itemModalAdd   = document.getElementById('itemModalAdd');

function openItemModal(item) {
  currentItem = item;

  itemModalImage.src = item.image;
  itemModalImage.alt = item.name;
  itemModalName.textContent = item.name;
  itemModalPrice.textContent = formatBRL(item.price) + ' / unidade';

  // Build qty options
  itemModalQty.innerHTML = '';
  for (let q = 1; q <= item.maxQty; q++) {
    const opt = document.createElement('option');
    opt.value = q;
    opt.textContent = q;
    itemModalQty.appendChild(opt);
  }

  // Restore qty if already in cart
  const existing = cart.find(l => l.id === item.id);
  if (existing) itemModalQty.value = existing.qty;

  updateModalSubtotal();
  itemModal.showModal();
  document.body.style.overflow = 'hidden';
}

function updateModalSubtotal() {
  if (!currentItem) return;
  const qty = parseInt(itemModalQty.value, 10);
  itemModalSub.textContent = 'Total: ' + formatBRL(currentItem.price * qty);
}

itemModalQty.addEventListener('change', updateModalSubtotal);

itemModalAdd.addEventListener('click', addToCart);
itemModalAdd.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addToCart(); }
});

function addToCart() {
  if (!currentItem) return;
  const qty = parseInt(itemModalQty.value, 10);
  const idx = cart.findIndex(l => l.id === currentItem.id);
  if (idx >= 0) {
    cart[idx].qty = qty;
  } else {
    cart.push({ id: currentItem.id, qty });
  }
  writeCart(cart);
  closeItemModal();
  renderGrid();
  updateCartBadge(true);
}

function closeItemModal() {
  itemModal.close();
  document.body.style.overflow = '';
  currentItem = null;
}

itemModalClose.addEventListener('click', closeItemModal);
itemModalClose.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeItemModal(); }
});
itemModal.addEventListener('click', e => {
  if (e.target === itemModal) closeItemModal();
});
itemModal.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeItemModal();
});

/* =====================================================
   CART BADGE
   ===================================================== */
function updateCartBadge(bounce = false) {
  const badge = document.getElementById('cartBadge');
  const fab   = document.getElementById('cartFab');
  const total = cart.reduce((sum, l) => sum + l.qty, 0);

  badge.textContent = total;
  badge.classList.toggle('hidden', total === 0);

  if (bounce) {
    fab.classList.remove('bounce');
    void fab.offsetWidth; // reflow
    fab.classList.add('bounce');
    setTimeout(() => fab.classList.remove('bounce'), 450);
  }
}

/* =====================================================
   CART DRAWER
   ===================================================== */
const cartDrawer   = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartBody     = document.getElementById('cartBody');
const cartFooter   = document.getElementById('cartFooter');
const cartFab      = document.getElementById('cartFab');

function openCartDrawer() {
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}

function closeCartDrawer() {
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

cartFab.addEventListener('click', openCartDrawer);
cartFab.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCartDrawer(); }
});

document.getElementById('cartDrawerClose').addEventListener('click', closeCartDrawer);
document.getElementById('cartDrawerClose').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeCartDrawer(); }
});

cartBackdrop.addEventListener('click', closeCartDrawer);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartDrawer.classList.contains('open')) closeCartDrawer();
});

function cartTotal() {
  return cart.reduce((sum, l) => {
    const item = ITEMS.find(i => i.id === l.id);
    return item ? sum + item.price * l.qty : sum;
  }, 0);
}

function renderCartDrawer() {
  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p class="cart-empty__text">Seu carrinho está vazio. Volte e escolha alguns presentes para o Daniel. 💙</p>
        <button class="btn btn--secondary cart-empty__btn" id="cartContinueBtn">Continuar escolhendo</button>
      </div>
    `;
    cartFooter.innerHTML = '';
    document.getElementById('cartContinueBtn').addEventListener('click', closeCartDrawer);
    document.getElementById('cartContinueBtn').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeCartDrawer(); }
    });
    return;
  }

  cartBody.innerHTML = cart.map(line => {
    const item = ITEMS.find(i => i.id === line.id);
    if (!item) return '';

    const lineTotal = formatBRL(item.price * line.qty);

    let opts = '';
    for (let q = 1; q <= item.maxQty; q++) {
      opts += `<option value="${q}" ${q === line.qty ? 'selected' : ''}>${q}</option>`;
    }

    return `
      <div class="cart-line" data-id="${item.id}">
        <img class="cart-line__thumb" src="${item.image}" alt="${item.name}" loading="lazy" />
        <div class="cart-line__info">
          <p class="cart-line__name">${item.name}</p>
          <div class="cart-line__qty-row">
            <select class="cart-line__qty-select" aria-label="Quantidade de ${item.name}">
              ${opts}
            </select>
            <span class="cart-line__line-total">${lineTotal}</span>
          </div>
        </div>
        <div class="cart-line__actions">
          <button class="cart-line__remove" aria-label="Remover ${item.name}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <span class="cart-line__total">${lineTotal}</span>
        </div>
      </div>
    `;
  }).join('');

  // Wire up qty changes and remove buttons
  cartBody.querySelectorAll('.cart-line').forEach(row => {
    const id = row.dataset.id;

    const qtySelect = row.querySelector('.cart-line__qty-select');
    qtySelect.addEventListener('change', () => {
      const idx = cart.findIndex(l => l.id === id);
      if (idx >= 0) {
        cart[idx].qty = parseInt(qtySelect.value, 10);
        writeCart(cart);
        updateCartBadge();
        renderCartDrawer();
        renderGrid();
      }
    });

    const removeBtn = row.querySelector('.cart-line__remove');
    removeBtn.addEventListener('click', () => removeFromCart(id));
    removeBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeFromCart(id); }
    });
  });

  cartFooter.innerHTML = `
    <div class="cart-total-row">
      <span class="cart-total-row__label">Total</span>
      <span class="cart-total-row__value">${formatBRL(cartTotal())}</span>
    </div>
    <button class="btn btn--primary cart-checkout-btn" id="checkoutBtn">Finalizar e enviar Pix</button>
  `;

  document.getElementById('checkoutBtn').addEventListener('click', openPaymentModal);
  document.getElementById('checkoutBtn').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPaymentModal(); }
  });
}

function removeFromCart(id) {
  cart = cart.filter(l => l.id !== id);
  writeCart(cart);
  updateCartBadge();
  renderCartDrawer();
  renderGrid();
}

/* =====================================================
   PAYMENT MODAL
   ===================================================== */
const paymentModal      = document.getElementById('paymentModal');
const paymentModalClose = document.getElementById('paymentModalClose');
const paymentModalTotal = document.getElementById('paymentModalTotal');
const paymentStepAmt    = document.getElementById('paymentStepAmount');
const pixCopyBtn        = document.getElementById('pixCopyBtn');
const pixConfirmBtn     = document.getElementById('pixConfirmBtn');

function openPaymentModal() {
  closeCartDrawer();
  const total = cartTotal();
  paymentModalTotal.textContent = formatBRL(total);
  paymentStepAmt.textContent    = formatBRL(total);
  paymentModal.showModal();
  document.body.style.overflow = 'hidden';
}

function closePaymentModal(skipConfirm = false) {
  if (!skipConfirm) {
    const ok = window.confirm('Tem certeza que quer fechar? Você ainda não confirmou o envio do Pix.');
    if (!ok) return;
  }
  paymentModal.close();
  document.body.style.overflow = '';
}

paymentModalClose.addEventListener('click', () => closePaymentModal(false));
paymentModalClose.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closePaymentModal(false); }
});
paymentModal.addEventListener('click', e => {
  if (e.target === paymentModal) closePaymentModal(false);
});
paymentModal.addEventListener('keydown', e => {
  if (e.key === 'Escape') { e.preventDefault(); closePaymentModal(false); }
});

// Copy Pix string
pixCopyBtn.addEventListener('click', copyPixString);
pixCopyBtn.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyPixString(); }
});

function copyPixString() {
  const doCopy = () => {
    pixCopyBtn.textContent = '✓ Copiado';
    pixCopyBtn.classList.add('copied');
    showToast('Código copiado!');
    setTimeout(() => {
      pixCopyBtn.textContent = 'Copiar código Pix';
      pixCopyBtn.classList.remove('copied');
    }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(PIX_STRING).then(doCopy).catch(() => fallbackCopy(doCopy));
  } else {
    fallbackCopy(doCopy);
  }
}

function fallbackCopy(callback) {
  const ta = document.createElement('textarea');
  ta.value = PIX_STRING;
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); callback(); } catch {}
  document.body.removeChild(ta);
}

// Confirm payment sent
pixConfirmBtn.addEventListener('click', confirmSent);
pixConfirmBtn.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); confirmSent(); }
});

function confirmSent() {
  paymentModal.close();
  document.body.style.overflow = '';
  openSuccessModal();
}

/* =====================================================
   SUCCESS MODAL
   ===================================================== */
const successModal   = document.getElementById('successModal');
const successBackBtn = document.getElementById('successBackBtn');

function openSuccessModal() {
  successModal.showModal();
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  // Mark all cart items as presenteados
  const ids     = cart.map(l => l.id);
  const updated = Array.from(new Set([...presenteados, ...ids]));
  presenteados  = updated;
  writePresenteados(presenteados);

  // Clear cart
  cart = [];
  writeCart(cart);

  successModal.close();
  document.body.style.overflow = '';

  updateCartBadge();
  renderGrid();
}

successBackBtn.addEventListener('click', closeSuccessModal);
successBackBtn.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeSuccessModal(); }
});
successModal.addEventListener('click', e => {
  if (e.target === successModal) closeSuccessModal();
});
successModal.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSuccessModal();
});

/* =====================================================
   TOAST
   ===================================================== */
let toastTimer = null;
const toastEl  = document.getElementById('toast');

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2200);
}

/* =====================================================
   INIT
   ===================================================== */
renderGrid();
updateCartBadge();
