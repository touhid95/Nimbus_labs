import urllib.request, json, urllib.parse, os

UA = {'User-Agent': 'NimbusLabsExplore/1.0 (contact@nimbus.ai)'}
OUT = r'C:\Web Projects\Nimbus_labs\assets\explore'
os.makedirs(OUT, exist_ok=True)

def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    return json.loads(urllib.request.urlopen(req, timeout=30).read().decode('utf-8'))

def download(url, path):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as r, open(path, 'wb') as f:
        f.write(r.read())
    return os.path.getsize(path)

# namespace 6 = File
queries = {
    'neural': 'neural network',
    'abstract': 'abstract art',
    'technology': 'technology futuristic',
    'server': 'server room',
    'supercomputer': 'supercomputer',
}

manifest = {}
for key, q in queries.items():
    try:
        d = api({'action': 'query', 'format': 'json', 'list': 'search',
                 'srsearch': q, 'srnamespace': 6, 'srlimit': 3})
        hits = d.get('query', {}).get('search', [])
        if not hits:
            print('NO HITS', key)
            continue
        got = False
        for hit in hits[:3]:
            title = hit['title']
            try:
                info = api({'action': 'query', 'format': 'json', 'titles': title,
                            'prop': 'imageinfo', 'iiprop': 'url|mime|size'})
                pages = info.get('query', {}).get('pages', {})
                for pid, p in pages.items():
                    ii = p.get('imageinfo', [])
                    if not ii:
                        continue
                    url = ii[0].get('thumburl') or ii[0].get('url')
                    mime = ii[0].get('mime', '')
                    if not url:
                        continue
                    if 'png' in mime:
                        ext = '.png'
                    elif 'jpeg' in mime or 'jpg' in mime:
                        ext = '.jpg'
                    else:
                        ext = os.path.splitext(url.split('?')[0])[1] or '.jpg'
                    path = os.path.join(OUT, key + ext)
                    sz = download(url, path)
                    manifest[key] = {
                        'file': os.path.basename(path),
                        'bytes': sz,
                        'source': 'Wikimedia Commons',
                        'title': title,
                        'url': url,
                        'license': 'Public domain / CC (verify per-title on Wikimedia)'
                    }
                    print('OK', key, sz, 'bytes <-', title[:55])
                    got = True
                    break
                if got:
                    break
            except Exception as e:
                print('  skip', title[:40], repr(e)[:70])
                continue
        if not got:
            print('NO DOWNLOAD', key)
    except Exception as e:
        print('FAIL', key, repr(e)[:120])

json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=2)
print('MANIFEST WRITTEN', len(manifest))