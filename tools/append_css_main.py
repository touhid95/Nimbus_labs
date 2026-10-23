with open('C:\\Web Projects\\Nimbus_labs\\explore.css','a') as f:
    f.write('''
/* ===================== PRODUCTS ===================== */
.exp-products { padding: clamp(100px, 16vh, 180px) 0 clamp(80px, 12vh, 140px); }
.exp-products__header { margin-bottom: clamp(48px, 6vw, 100px); }
.exp-products-grid { display: grid; gap: 24px; }
.exp-product-card { position: relative; overflow: hidden; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.015); transition: border-color 0.4s ease, transform 0.45s ease; }
.exp-product-card:hover { border-color: rgba(100,89,232,0.18); transform: translateY(-6px); }
.exp-product-card__visual { position: relative; height: clamp(240px, 35vw, 520px); overflow: hidden; }
.exp-product-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
.exp-product-card:hover .exp-product-card__img { transform: scale(1.03); }
.exp-product-card__overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(2,0,22,0.8) 0%, rgba(2,0,22,0.2) 55%, transparent 100%); }
.exp-product-card__meta { position: absolute; bottom: 28px; left: 28px; z-index: 2; }
.exp-product-card__label { font-family: var(--exp-font-mono); font-size: 11px; letter-spacing: 0.2em; color: var(--exp-muted); text-transform: uppercase; margin-bottom: 8px; }
.exp-product-card__name { font-family: var(--exp-font-heading); font-size: clamp(24px, 3vw, 52px); font-weight: 300; letter-spacing: -0.03em; line-height: 1.05; color: var(--exp-text); }
.exp-product-card__name strong { font-weight: 600; }
.exp-product-card__content { padding: 28px 28px 32px; }
.exp-product-card__short { font-size: 15px; color: var(--exp-muted); line-height: 1.7; margin-bottom: 12px; max-width: 520px; }
.exp-product-card__detail { font-size: 13px; color: var(--exp-dim); line-height: 1.65; margin-bottom: 16px; }
.exp-product-card__features { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.exp-product-card__features span { font-family: var(--exp-font-mono); font-size: 11px; padding: 4px 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 2px; color: var(--exp-muted); }
.exp-product-card__link { display: inline-flex; align-items: center; gap: 8px; font-family: var(--exp-font-mono); font-size: 11px; letter-spacing: 0.15em; color: var(--exp-text); text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.18); padding-bottom: 3px; transition: border-color 0.3s ease, color 0.3s ease; }
.exp-product-card__link:hover { border-color: var(--exp-primary); color: var(--exp-primary); }

/* Featured product — larger, editorial layout */
.exp-product-card.featured { grid-row: span 2; }
/* Responsive grid: 1 col mobile, 2 col tablet, 3-4 col desktop */
.exp-products-grid { grid-template-columns: 1fr; }
@media (min-width: 640px) { .exp-products-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .exp-products-grid { grid-template-columns: repeat(4, 1fr); } .exp-product-card.featured { grid-column: span 2; grid-row: span 2; } }

/* ===================== SERVICES ===================== */
.exp-services { padding: clamp(80px, 12vh, 160px) 0 clamp(60px, 10vh, 120px); border-top: 1px solid rgba(255,255,255,0.05); }
.exp-services__rail { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px; -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
.exp-services__rail::-webkit-scrollbar { height: 3px; }
.exp-services__rail::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.exp-service-card { flex: 0 0 clamp(280px, 30vw, 380px); scroll-snap-align: start; position: relative; border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; padding: clamp(28px, 4vw, 48px); background: rgba(255,255,255,0.015); transition: border-color 0.35s ease, background 0.35s ease, transform 0.45s ease; }
.exp-service-card:hover { border-color: rgba(100,89,232,0.25); background: rgba(255,255,255,0.03); transform: translateY(-4px); }
.exp-service-card .icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.08); border-radius: 50%; font-family: var(--exp-font-mono); font-size: 16px; color: var(--exp-primary); margin-bottom: 24px; }
.exp-service-card h3 { font-family: var(--exp-font-heading); font-size: 22px; font-weight: 300; letter-spacing: -0.025em; color: var(--exp-text); margin-bottom: 12px; line-height: 1.15; }
.exp-service-card .service-short { font-size: 15px; color: var(--exp-muted); line-height: 1.65; margin-bottom: 8px; }
.exp-service-card .service-detail { font-size: 13px; color: var(--exp-dim); line-height: 1.6; }

/* ===================== CLOSING ===================== */
.exp-closing { padding: clamp(100px, 14vh, 200px) 0 clamp(80px, 10vh, 140px); text-align: center; border-top: 1px solid rgba(255,255,255,0.05); }
.exp-closing h2 { font-family: var(--exp-font-heading); font-weight: 200; font-size: clamp(36px, 7vw, 84px); letter-spacing: -0.04em; line-height: 0.92; color: var(--exp-text); margin-bottom: 16px; }
.exp-closing h2 em { font-weight: 600; color: var(--exp-primary-bright); }
.exp-closing .closing-desc { max-width: 580px; margin: 0 auto 40px; font-size: 17px; color: var(--exp-muted); line-height: 1.7; }
.exp-closing .closing-cta { display: inline-flex; align-items: center; gap: 10px; padding: 16px 36px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03); color: var(--exp-text); font-family: var(--exp-font-mono); font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; transition: all 0.35s ease; }
.exp-closing .closing-cta:hover { background: var(--exp-primary); border-color: var(--exp-primary); color: #fff; }

/* ===================== FOOTER LINK ===================== */
.exp-footer-cta { text-align: center; padding: clamp(80px, 12vh, 140px) 0; border-top: 1px solid rgba(255,255,255,0.05); }
.exp-footer-cta h2 { font-family: var(--exp-font-heading); font-size: clamp(32px, 5vw, 72px); font-weight: 300; letter-spacing: -0.035em; line-height: 1.05; color: var(--exp-text); }
.exp-footer-cta h2 em { font-weight: 600; color: var(--exp-primary-bright); }
.exp-footer-cta p { max-width: 540px; margin: 16px auto 32px; color: var(--exp-muted); line-height: 1.7; }

/* ===================== RESPONSIVE ===================== */
@media (max-width: 768px) {
  .exp-hero__title { font-size: clamp(36px, 14vw, 72px); }
  .exp-service-card { flex: 0 0 260px; padding: 20px; }
  .exp-nav-links { display: none; }
  .exp-mobile-toggle { display: flex; }
}
@media (min-width: 769px) {
  .exp-mobile-toggle { display: none; }
  .exp-mobile-menu { display: none !important; }
}
''')
print('main sections appended')
