# Chá de Bebê & Casamento — Anna, Jacopo & Daniel

## 1. Overview

Single-page static website to celebrate Anna & Jacopo's wedding and welcome baby Daniel. Guests browse a list of gift items, "add to cart," and at checkout are shown a Pix QR code + copia-e-cola string. They send the Pix manually through their banking app, then click "Já enviei o Pix" to mark the gift as sent and see a thank-you screen.

Honor system. No backend. No real inventory. No external services. All state lives in the guest's browser via `localStorage`. All copy in Brazilian Portuguese.

## 2. Tech stack

- Vanilla HTML, CSS, JavaScript. No frameworks, no build step, no npm.
- Deployed via GitHub Pages from the repo root.
- Mobile-first responsive. The crowd skews older, so prioritize clarity over cleverness.

## 3. File structure

```
/
├── index.html
├── styles.css
├── script.js
├── data.js                # ITEMS array
├── README.md
└── images/
    ├── pix-qrcode.png          # Pix QR code (will be added)
    ├── slideshow/              # slideshow-01.jpg ... slideshow-08.jpg (all square)
    ├── items/                  # one image per item, filename matches item id
    └── decorations/            # SVG accent illustrations
        ├── decoration-01.svg   # Chicken/rabbit — bottom-left of gifts section (well below all green eucalyptus dividers)
        ├── decoration-02.svg   # Baby stroller — right side of names block
        ├── decoration-03.svg   # Baby bathtub — top-right of save-the-date
        ├── decoration-04.svg   # Baby bottle — top-right of welcome section
        ├── decoration-05.svg   # Flowers/family — left of gifts header
        ├── decoration-06.svg   # Baby toy — right of gifts header
        └── decoration-07.svg   # Teapot — right corner of footer
```

## 4. Event details

- **Casal**: Anna Clara & Jacopo (com o bebê Daniel)
- **Data**: 27 de junho de 2026 (sábado)
- **Horário**: 15h às 21h
- **Local**: Espaço de Festas Dona Onça
- **Mapa**: https://maps.app.goo.gl/4yZpYbSrGFU45eJM9

## 5. Pix payment

Static Pix QR code, no fixed amount — the guest types the amount manually in their banking app.

- QR code image: `images/pix-qrcode.png` (will be provided)
- Beneficiária: **Anna Clara da Costa Marca**
- Pix Copia e Cola string (use exactly this when implementing the copy button):

```
00020126570014BR.GOV.BCB.PIX0111084434216570220Presente chá de bebê5204000053039865802BR5925Anna Clara da Costa Marca6009SAO PAULO62140510adlMDueoCP6304E20C
```

## 6. Gift items (`data.js`)

All prices set to R$ 10,00 placeholder for now — will be updated later. The `maxQty` is the maximum a single guest can select for that item.

```js
const ITEMS = [
  { id: 'carrinho',             name: 'Carrinho de bebê',                price: 10.00, maxQty: 1,  image: 'images/items/carrinho.jpg' },
  { id: 'cadeirinha',           name: 'Cadeirinha',                      price: 10.00, maxQty: 1,  image: 'images/items/cadeirinha.jpg' },
  { id: 'berco-portatil',       name: 'Berço portátil',                  price: 10.00, maxQty: 1,  image: 'images/items/berco-portatil.jpg' },
  { id: 'cadeira-alimentacao',  name: 'Cadeira de alimentação portátil', price: 10.00, maxQty: 1,  image: 'images/items/cadeira-alimentacao.jpg' },
  { id: 'troninho',             name: 'Troninho',                        price: 10.00, maxQty: 1,  image: 'images/items/troninho.jpg' },
  { id: 'canguru',              name: 'Canguru',                         price: 10.00, maxQty: 1,  image: 'images/items/canguru.jpg' },
  { id: 'trocador-portatil',    name: 'Trocador portátil',               price: 10.00, maxQty: 1,  image: 'images/items/trocador-portatil.jpg' },
  { id: 'fraldas-ecologicas',   name: 'Fraldas ecológicas',              price: 10.00, maxQty: 40, image: 'images/items/fraldas-ecologicas.jpg' },
  { id: 'babadores',            name: 'Babadores',                       price: 10.00, maxQty: 15, image: 'images/items/babadores.jpg' },
  { id: 'mantas',               name: 'Mantas',                          price: 10.00, maxQty: 5,  image: 'images/items/mantas.jpg' },
  { id: 'toalhas-capuz',        name: 'Toalhas com capuz',               price: 10.00, maxQty: 5,  image: 'images/items/toalhas-capuz.jpg' },
  { id: 'fraldas',              name: 'Fraldas',                         price: 10.00, maxQty: 20, image: 'images/items/fraldas.jpg' },
  { id: 'lencos-umedecidos',    name: 'Lenços umedecidos',               price: 10.00, maxQty: 20, image: 'images/items/lencos-umedecidos.jpg' }
];
```

## 7. Page layout (top to bottom)

1. **Hero slideshow** — passive auto-advancing filmstrip, no arrow buttons. Shows 1 square on mobile, 2 on tablet (≥600px), 3 on desktop (≥900px), 4 on large desktop (≥1200px). Slide containers are square (`aspect-ratio: 1/1`); width computed in JS from container ÷ visible count with 16px gaps. Photos use `object-fit: contain` — no cropping ever. All 8 slideshow photos are pre-cropped to 1:1. Auto-advances every 5s, pauses on hover (desktop). Dot indicators below (no arrows). Photos from `images/slideshow/`.
2. **Names block** — "Anna, Jacopo & Daniel" in a script/serif display font.
3. **Save the date block** — date, time, location name, street address (`R. Cedro, 162 - Colonial, Contagem`), and Google Maps link.
4. **Welcome message** — see copy section.
5. **Gift list section header** — "Lista de Presentes do Daniel" + subtitle.
6. **Gift grid** — 1 col mobile, 2 col tablet, 3-4 col desktop.
7. **Minimal footer** — single line, just "Com amor, Anna, Jacopo e Daniel 💚". No links, no logos.

## 8. Components

### 8.1 Item card
- Item image, name, price.
- "Presentear" button.
- Small badge "no carrinho" if currently in cart.
- Overlay badge **"✓ PRESENTEADO"** with 40% opacity tint over the card if confirmed sent in this browser. Card remains clickable (so a guest can send again if they want).

### 8.2 Item modal
Opens when the card or its button is clicked. Centered modal with backdrop.
- Image (left), info (right) on desktop; stacked on mobile.
- Name, price.
- "Quantidade" dropdown: 1 to `maxQty`.
- Live subtotal updates as quantity changes: "Total: R$ XX,00".
- Primary button: "Adicionar ao carrinho".
- Close X top-right.

### 8.3 Cart drawer
Slides in from the right with a dimmed backdrop.
- Trigger: floating cart icon top-right (fixed), with badge showing item count.
- Header: "Meu carrinho".
- For each line: thumbnail, name, qty selector (updates total), line total, trash icon to remove.
- Total row.
- Primary button: "Finalizar e enviar Pix".
- Empty state: "Seu carrinho está vazio. Volte e escolha alguns presentes para o Daniel. 💙" + "Continuar escolhendo" button.

### 8.4 Payment modal
Opens when "Finalizar e enviar Pix" is clicked.
- Title: "Falta pouco! Envie seu Pix"
- Total displayed large and bold: "Total: R$ XXX,00"
- QR code image, large (min 280px square on mobile, ~360px desktop).
- Below QR: button **"Copiar código Pix"**. On click, copies the Pix Copia e Cola string to clipboard and shows a "Copiado!" toast for 2s. Button text briefly changes to "✓ Copiado".
- Numbered instructions:
  1. Abra o app do seu banco
  2. Acesse a função Pix
  3. Escaneie o QR code **ou** cole o código copiado
  4. Confirme o valor de **R$ XXX,00**
  5. Conclua o pagamento e volte aqui
- Primary button: "Já enviei o Pix"
- Close X with confirmation: "Tem certeza? Você ainda não confirmou o envio."

### 8.5 Success modal
Opens after "Já enviei o Pix".
- Big heart or checkmark icon.
- Title: "Obrigado de coração! 💚"
- Message: "Sua contribuição é muito especial para nós. Mal podemos esperar para te ver no dia 27 de junho!"
- Signature: "— Anna, Jacopo e Daniel"
- Button: "Voltar para a lista"

On close: all items that were in the cart are marked as `presenteado` in localStorage, cart is cleared.

## 9. localStorage schema

```js
// chaJacopo.cart         → array of { id, qty }
// chaJacopo.presenteados → array of item ids
```

Wrap all reads in try/catch. If parsing fails, fall back to empty array.

## 10. Visual design

### Palette
- Background:     `#FBF7F2` (warm cream)
- Primary text:   `#2D3142` (deep charcoal)
- Sage green:     `#9CAF88` (primary accent — buttons, links, accents)
- Dusty blue:     `#A8C5DA` (secondary accent — for the "boy" hint, subtle)
- Soft gold:      `#C9A961` (dividers, small details)
- Warm coral:     `#E8B4B8` (hearts, love touches)
- White overlays: `#FFFFFF` at varying opacity

### Typography (Google Fonts)
- Display / headings: **Cormorant Garamond** or **Playfair Display** (serif)
- Body / UI: **Inter** or **DM Sans** (humanist sans)
- Body 16-18px, headings 28-56px responsive.

### Decoration
- SVG eucalyptus / olive branches as section dividers. Placed between: names → save-the-date, welcome → gifts.
- Small star accents flanking the names heading and the gifts title. Corner star/dot accents inside save-the-date. Corner leaf ornaments inside the welcome section.
- Thin golden diamond divider line between save-the-date and welcome.
- No wave/crossed-line SVGs — those have been removed (previously existed above "celebrando juntos", below the names heading, and above the gifts title).
- **Page decoration SVGs** — 7 thin-stroke gold illustration accents placed as absolutely-positioned `<img>` tags (`.page-deco` + `.page-deco--0N`) throughout the page. Visual treatment: `fill="none"`, `stroke="#C9A961"`, `stroke-width="10"` (≈1.5px at display size), `stroke-linejoin="round"`, `stroke-linecap="round"`. Opacity ~0.55–0.72. Several are hidden on mobile (≤768px) to avoid clutter; all hidden on ≤480px screens.
- Generous whitespace, no harsh borders, soft shadows, image corners rounded 8-12px.

### Buttons
- Min 48px tall.
- Rounded 8px.
- Primary: sage green background, white text.
- Secondary: outlined sage green.
- Disabled state: 50% opacity, no pointer.

## 11. Copy (Brazilian Portuguese, final)

**Names block**: `Anna, Jacopo & Daniel`

**Save the date**:
```
SAVE THE DATE
27 de junho de 2026 · 15h às 21h
Espaço de Festas Dona Onça
[Ver no mapa →]
```

**Welcome message**:
```
Olá, família e amigos! ✨

Estamos muito felizes em celebrar com vocês dois momentos especiais da
nossa vida: a nossa união e a chegada do nosso pequeno Daniel.

Mais do que presentes, o que queremos é a presença e o carinho de vocês.
Mas se quiserem nos ajudar de alguma forma, montamos uma listinha do que
vamos precisar para o Daniel — e qualquer contribuição vem direto pelo Pix.

Obrigado por fazerem parte dessa história. 💚

— Anna, Jacopo e Daniel
```

**Gift section title**: `Lista de Presentes do Daniel`

**Gift section subtitle**: `Escolha um ou mais itens. O valor vai direto para nós via Pix.`

**Toast (copy success)**: `Código copiado!`

**Close payment modal confirmation**: `Tem certeza que quer fechar? Você ainda não confirmou o envio do Pix.`

**Footer**: `Com amor, Anna, Jacopo e Daniel 💚`

## 12. Interactions & polish

- All animations 200-300ms ease-out, never jarring.
- Modals: fade backdrop + slight scale-up of content.
- Cart drawer: slide from right + backdrop fade.
- Currency formatting always Brazilian: `R$ 10,00` (comma decimal, period thousands).
- Cart icon has a subtle bounce when an item is added.
- Slideshow pauses on hover (desktop only).
- All click handlers also bind to keyboard Enter/Space for accessibility.

## 13. Image assets (to be added later)

Folder structure created upfront, with placeholder gray rectangles using CSS until real images dropped in:
- `images/pix-qrcode.png` — the Pix QR (will be uploaded)
- `images/slideshow/slideshow-01.jpg` through `slideshow-08.jpg` — couple/wedding/family photos (8 total, all square 1:1)
- `images/items/<id>.jpg` — one image per item, filename matches the `id` field in `data.js`
- `images/decorations/decoration-01.svg` through `decoration-07.svg` — gold thin-stroke SVG accent illustrations

Use `loading="lazy"` on all `<img>` tags except the first slideshow image.

## 14. Out of scope (do NOT build)

- No login, no accounts.
- No backend, no API, no serverless functions.
- No analytics, no tracking pixels.
- No payment gateway integration (it's an honor-system QR only).
- No other pages — `index.html` only.
- No Chá Online branding, no logos, no external page links in the footer.
- No language toggle — Portuguese only.
- No "Sobre / Como Funciona / Termos / Política" pages.

## 15. Deployment

- Push to GitHub repo (existing account).
- Enable GitHub Pages on `main` branch, root folder.
- Default URL: `https://<username>.github.io/<repo-name>/`
- Custom domain: not needed for now.

## 16. Notes for Claude Code

- Auto-approve all changes, no prompts.
- Don't ask about file structure — follow section 3.
- Don't ask about copy — use section 11 verbatim.
- Don't add features not listed in this spec without flagging.
- Commit messages short and descriptive (`feat: hero slideshow`, `feat: cart drawer`, etc.).
- Test mobile responsiveness at 375px width.
- Validate the Pix Copia e Cola string is copied to clipboard correctly (use `navigator.clipboard.writeText` with a fallback for older browsers).
- Use semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<dialog>` where appropriate).
- Keep all colors in CSS custom properties at `:root` so they can be tweaked from one place.
