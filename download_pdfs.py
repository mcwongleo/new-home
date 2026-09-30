import os
import urllib.request
import urllib.error
import datetime
import re

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

# Function to dynamically adjust Sierra Terrace URL to today's date
def adjust_url(url):
    if 'status-sierra-terrace-text' in url:
        today_str = datetime.date.today().strftime('%Y%m%d')
        # Replace the 8-digit date with today's date
        new_url = re.sub(r'status-sierra-terrace-text_\d{8}\.pdf', f'status-sierra-terrace-text_{today_str}.pdf', url)
        if new_url != url:
            print(f"Adjusted Sierra Terrace URL to today's date: {new_url}")
            return new_url
    return url

print(f"Found {len(urls)} URLs to download.")

user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

for i, url in enumerate(urls, 1):
    adjusted_url = adjust_url(url)
    filename = adjusted_url.split('/')[-1]
    dest_path = os.path.join(dest_dir, filename)
    print(f"[{i}/{len(urls)}] Downloading {adjusted_url} ...")
    try:
        req = urllib.request.Request(
            adjusted_url, 
            headers={'User-Agent': user_agent}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(dest_path, 'wb') as out_file:
                out_file.write(response.read())
        print(f"  Saved to {dest_path} ({os.path.getsize(dest_path)} bytes)")
    except urllib.error.URLError as e:
        print(f"  Error downloading {adjusted_url}: {e}")
    except Exception as e:
        print(f"  Unexpected error: {e}")

print("All downloads completed!")
