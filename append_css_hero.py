with open('C:\\Web Projects\\Nimbus_labs\\explore.css','a') as f:
    f.write('''
/* ===================== HERO ===================== */
.exp-hero { position: relative; height: 100vh; overflow: hidden; background: var(--exp-bg); }
.exp-hero__background { position: absolute; inset: -15%; z-index: 1; opacity: 0.9; background: radial-gradient(circle at 25% 15%, rgba(100,89,232,0.2) 0%, transparent 55%), radial-gradient(circle at 75% 85%, rgba(168,85,247,0.16) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(244,63,94,0.08) 0%, transparent 55%); animation: exp-drift-bg 28s ease-in-out infinite alternate; }
@keyframes exp-drift-bg { 0% { transform: translate(0,0) scale(1); } 33% { transform: translate(-2%,3%) scale(1.06); } 66% { transform: translate(3%,-2%) scale(0.97); } 100% { transform: translate(0,0) scale(1); } }
.exp-hero__overlay { position: relative; z-index: 2; height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 0 clamp(24px, 6vw, 120px); }
.exp-hero__label { font-family: var(--exp-font-mono); font-size: 12px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--exp-primary-bright); margin-bottom: 28px; opacity: 0.9; }
.exp-hero__title { font-family: var(--exp-font-heading); font-weight: 200; font-size: clamp(52px, 11vw, 160px); line-height: 0.88; letter-spacing: -0.045em; color: var(--exp-text); margin: 0 0 28px; }
.exp-hero__title .line-em { display: block; font-weight: 700; }
.exp-hero__title .line-sub { display: block; font-weight: 300; color: var(--exp-muted); letter-spacing: -0.02em; font-size: 0.52em; margin-top: 6px; }
.exp-hero__desc { max-width: 520px; font-size: 18px; color: var(--exp-muted); line-height: 1.7; margin-bottom: 44px; }
.exp-hero__cta-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
.exp-hero__cta { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.03); color: var(--exp-text); font-family: var(--exp-font-mono); font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; transition: all 0.35s ease; }
.exp-hero__cta:hover { background: var(--exp-primary); border-color: var(--exp-primary); color: #fff; }
.exp-hero__cta .arrow { transition: transform 0.3s ease; }
.exp-hero__cta:hover .arrow { transform: translateX(4px); }
.exp-hero__cta-alt { border-color: var(--exp-primary); color: var(--exp-text); }
.exp-hero__cta-alt:hover { background: var(--exp-primary); color: #fff; }
.exp-hero__scroll { position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; align-items: center; gap: 14px; font-family: var(--exp-font-mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--exp-muted); animation: exp-float 3s ease infinite; }
@keyframes exp-float { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }
''')
print('hero appended')