with open('C:\\Web Projects\\Nimbus_labs\\explore.html', 'w', encoding='utf-8') as f:
    f.write('''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
<title>Explore Products and Services | Nimbus Labs</title>
<meta name="description" content="Discover the frontier products and services by Nimbus Labs." />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&family=Plus+Jakarta+Sans:wght@300;400;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="explore.css">
<link rel="icon" type="image/png" href="assets/logo_tight.png">
</head>
<body class="exp-page">
<header class="exp-nav" id="exp-nav">
  <a href="index.html" class="exp-nav-brand" aria-label="AI Labs by Nimbus Home"><span class="dot"></span> AI LABS BY NIMBUS</a>
  <nav class="exp-nav-links" aria-label="Explore page navigation">
    <a href="index.html">Homepage</a>
    <a href="#explore-products" class="current">Products</a>
    <a href="#explore-services">Services</a>
  </nav>
</header>

<main>
  <section class="exp-hero" id="explore-hero" aria-label="Explore products and services introduction">
    <div class="exp-hero-bg" aria-hidden="true"></div>
    <div class="exp-hero-inner">
      <span class="exp-hero-label">Nimbus Labs — Frontier Intelligence</span>
      <h1 class="exp-hero-title">
        <span class="line-em">Explore</span>
        <span class="line-sub">Products & Services</span>
      </h1>
      <p class="exp-hero-desc">Placeholder introduction paragraph. Replace with a real brand statement when available.</p>
      <div class="exp-hero-cta-row">
        <a href="#explore-products" class="exp-hero-cta">Discover Products <span class="arrow">→</span></a>
        <a href="#explore-services" class="exp-hero-cta exp-hero-cta-alt">Explore Services</a>
      </div>
    </div>
    <a href="#explore-products" class="exp-hero-scroll" aria-label="Scroll to explore products"><span>SCROLL TO DISCOVER</span><span aria-hidden="true"></span></a>
  </section>

  <section id="explore-products" class="exp-section exp-products" aria-label="Nimbus Labs products">
    <div class="exp-inner">
      <header class="exp-products__header">
        <span class="exp-label">Future Offerings</span>
        <h2 class="exp-h2">Products <em>under development.</em></h2>
        <p class="exp-sub">Placeholder category description. Replace with real product category narrative.</p>
      </header>
      <div class="exp-products-grid">
        <article class="exp-product-card featured" aria-label="Product 01 — Placeholder category">
          <div class="exp-product-card__visual"><img src="assets/explore/neural.jpg" alt="Placeholder visual for Product 01" class="exp-product-card__img" loading="lazy"><div class="exp-product-card__overlay"></div></div>
          <div class="exp-product-card__meta"><div class="exp-product-card__label">Placeholder Category / Featured</div><h3 class="exp-product-card__name">Product 01 — Placeholder</h3></div>
          <div class="exp-product-card__content">
            <p class="exp-product-card__short">Placeholder short description.</p>
            <p class="exp-product-card__detail">Placeholder detailed description. Replace with real capabilities and differentiators.</p>
            <div class="exp-product-card__features"><span>Feature 1</span><span>Feature 2</span><span>Feature 3</span></div>
            <a href="#product-01" class="exp-product-card__link">Learn more →</a>
          </div>
        </article>
        <article class="exp-product-card" aria-label="Product 02 — Placeholder category">
          <div class="exp-product-card__visual"><img src="assets/explore/technology.jpg" alt="Placeholder visual for Product 02" class="exp-product-card__img" loading="lazy"><div class="exp-product-card__overlay"></div></div>
          <div class="exp-product-card__meta"><div class="exp-product-card__label">Placeholder Category</div><h3 class="exp-product-card__name">Product 02 — Placeholder</h3></div>
          <div class="exp-product-card__content">
            <p class="exp-product-card__short">Placeholder short description.</p>
            <p class="exp-product-card__detail">Placeholder detailed description.</p>
            <div class="exp-product-card__features"><span>Feature 1</span><span>Feature 2</span></div>
            <a href="#product-02" class="exp-product-card__link">Learn more →</a>
          </div>
        </article>
        <article class="exp-product-card" aria-label="Product 03 — Placeholder category">
          <div class="exp-product-card__visual"><img src="assets/explore/server.jpg" alt="Placeholder visual for Product 03" class="exp-product-card__img" loading="lazy"><div class="exp-product-card__overlay"></div></div>
          <div class="exp-product-card__meta"><div class="exp-product-card__label">Placeholder Category</div><h3 class="exp-product-card__name">Product 03 — Placeholder</h3></div>
          <div class="exp-product-card__content">
            <p class="exp-product-card__short">Placeholder short description.</p>
            <p class="exp-product-card__detail">Placeholder detailed description.</p>
            <div class="exp-product-card__features"><span>Feature 1</span><span>Feature 2</span><span>Feature 3</span><span>Feature 4</span></div>
            <a href="#product-03" class="exp-product-card__link">Learn more →</a>
          </div>
        </article>
        <article class="exp-product-card" aria-label="Product 04 — Placeholder category">
          <div class="exp-product-card__visual"><img src="assets/explore/abstract.jpg" alt="Placeholder visual for Product 04" class="exp-product-card__img" loading="lazy"><div class="exp-product-card__overlay"></div></div>
          <div class="exp-product-card__meta"><div class="exp-product-card__label">Placeholder Category</div><h3 class="exp-product-card__name">Product 04 — Placeholder</h3></div>
          <div class="exp-product-card__content">
            <p class="exp-product-card__short">Placeholder short description.</p>
            <p class="exp-product-card__detail">Placeholder detailed description.</p>
            <div class="exp-product-card__features"><span>Feature 1</span><span>Feature 2</span></div>
            <a href="#product-04" class="exp-product-card__link">Learn more →</a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section id="explore-services" class="exp-section exp-services" aria-label="Nimbus Labs services">
    <div class="exp-inner">
      <header style="margin-bottom: clamp(36px, 5vw, 72px);">
        <span class="exp-label">Capabilities and Partnerships</span>
        <h2 class="exp-h2">Services <em>under development.</em></h2>
        <p class="exp-sub">Placeholder description for future services. Replace with real offerings when available.</p>
      </header>
      <div class="exp-services__rail" aria-label="Service offerings">
        <article class="exp-service-card" aria-label="Service 01"><div class="icon">◆</div><h3>Service 01</h3><p class="service-short">Placeholder service description.</p><p class="service-detail">Replace with real scope, timeline, and deliverables.</p><a href="#service-01" class="exp-product-card__link">Learn more →</a></article>
        <article class="exp-service-card" aria-label="Service 02"><div class="icon">◇</div><h3>Service 02</h3><p class="service-short">Placeholder service description.</p><p class="service-detail">Replace with real scope, timeline, and deliverables.</p><a href="#service-02" class="exp-product-card__link">Learn more →</a></article>
        <article class="exp-service-card" aria-label="Service 03"><div class="icon">◈</div><h3>Service 03</h3><p class="service-short">Placeholder service description.</p><p class="service-detail">Replace with real scope, timeline, and deliverables.</p><a href="#service-03" class="exp-product-card__link">Learn more →</a></article>
        <article class="exp-service-card" aria-label="Service 04"><div class="icon">◇</div><h3>Service 04</h3><p class="service-short">Placeholder service description.</p><p class="service-detail">Replace with real scope, timeline, and deliverables.</p><a href="#service-04" class="exp-product-card__link">Learn more →</a></article>
        <article class="exp-service-card" aria-label="Service 05"><div class="icon">◆</div><h3>Service 05</h3><p class="service-short">Placeholder service description.</p><p class="service-detail">Replace with real scope, timeline, and deliverables.</p><a href="#service-05" class="exp-product-card__link">Learn more →</a></article>
      </div>
    </div>
  </section>

  <section class="exp-closer exp-closing" aria-label="Closing invitation">
    <div class="exp-inner">
      <h2>Explore the <em>frontier.</em></h2>
      <p class="closing-desc">Placeholder closing statement. Replace with the actual invitation to partner, learn more, or engage.</p>
      <a href="mailto:contact@ailabsnimbus.com" class="exp-hero-cta exp-hero-cta-alt">Contact Nimbus Labs →</a>
    </div>
  </section>
</main>

<footer style="text-align:center;padding:24px clamp(20px,5vw,80px);border-top:1px solid rgba(255,255,255,0.05);font-family:var(--exp-font-mono);font-size:11px;color:var(--exp-dim);letter-spacing:0.1em;text-transform:uppercase;">
  <a href="index.html" style="color:var(--exp-muted);border-bottom:1px solid rgba(255,255,255,0.12);padding-bottom:2px;">← Back to Homepage</a>
</footer>

<script src="explore.js"></script>
</body>
</html>
''')
print('explore.html written')
print('lines:', len(open('C:\\Web Projects\\Nimbus_labs\\explore.html').read().splitlines()))
