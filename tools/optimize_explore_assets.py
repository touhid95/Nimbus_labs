import urllib.request, os
from PIL import Image

UA = {'User-Agent': 'NimbusLabsExplore/1.0 (contact@nimbus.ai)'}
OUT = r'C:\Web Projects\Nimbus_labs\assets\explore'
os.makedirs(OUT, exist_ok=True)

# --- 1. Optimize downloaded images for web ---
print('=== OPTIMIZING IMAGES ===')
for f in ['neural.png', 'abstract.png', 'technology.jpg', 'server.jpg', 'supercomputer.png']:
    p = os.path.join(OUT, f)
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert('RGB')
    # Cap longest edge at 1600, save as JPEG quality 82
    im.thumbnail((1600, 1600), Image.LANCZOS)
    out = os.path.join(OUT, f.replace('.png', '.jpg').replace('.jpg', '_opt.jpg') if not f.endswith('.jpg') else f)
    if f.endswith('.png'):
        out = os.path.join(OUT, f.replace('.png', '.jpg'))
    im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    old = os.path.getsize(p)
    new = os.path.getsize(out)
    print(f, im.size, old // 1024, 'KB ->', new // 1024, 'KB')
    if out != p:
        os.remove(p)

# --- 2. Download SVG icons from simple-icons (OFL) ---
print('=== DOWNLOADING ICONS ===')
icons = {
    'pytorch': 'pytorch',
    'tensorflow': 'tensorflow',
    'kubernetes': 'kubernetes',
    'docker': 'docker',
    'python': 'python',
    'linux': 'linux',
    'nvidia': 'nvidia',
    'blender': 'blender',
}
base = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/'
icon_manifest = {}
for name, slug in icons.items():
    url = base + slug + '.svg'
    try:
        req = urllib.request.Request(url, headers=UA)
        data = urllib.request.urlopen(req, timeout=30).read()
        path = os.path.join(OUT, 'icon_' + name + '.svg')
        with open(path, 'wb') as fh:
            fh.write(data)
        icon_manifest[name] = {'file': os.path.basename(path), 'bytes': len(data),
                               'source': 'simple-icons (OFL)', 'url': url}
        print('OK', name, len(data), 'bytes')
    except Exception as e:
        print('FAIL', name, repr(e)[:80])

json_path = os.path.join(OUT, 'icons_manifest.json')
import json
json.dump(icon_manifest, open(json_path, 'w'), indent=2)
print('ICONS MANIFEST', len(icon_manifest))