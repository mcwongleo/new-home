import os
import urllib.request
import urllib.error

txt_path = 'statusOfSale.txt'
dest_dir = 'status_pdfs'

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

# Read URLs from file
with open(txt_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

urls = []
for line in lines:
    url = line.strip()
    if url.startswith('http://') or url.startswith('https://'):
        urls.append(url)

print(f"Found {len(urls)} URLs to download.")

user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

for i, url in enumerate(urls, 1):
    filename = url.split('/')[-1]
    dest_path = os.path.join(dest_dir, filename)
    print(f"[{i}/{len(urls)}] Downloading {url} ...")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': user_agent}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(dest_path, 'wb') as out_file:
                out_file.write(response.read())
        print(f"  Saved to {dest_path} ({os.path.getsize(dest_path)} bytes)")
    except urllib.error.URLError as e:
        print(f"  Error downloading {url}: {e}")
    except Exception as e:
        print(f"  Unexpected error: {e}")

print("All downloads completed!")
