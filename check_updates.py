import os
import urllib.request
import urllib.error
import hashlib
import shutil
import datetime
import re

txt_path = 'statusOfSale.txt'
temp_dir = 'temp_pdfs'
dest_dir = 'status_pdfs'

if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)

# Read URLs
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

print(f"Downloading {len(urls)} PDFs to temporary folder '{temp_dir}'...")

user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

# Download files
for i, url in enumerate(urls, 1):
    adjusted_url = adjust_url(url)
    filename = adjusted_url.split('/')[-1]
    temp_path = os.path.join(temp_dir, filename)
    try:
        req = urllib.request.Request(adjusted_url, headers={'User-Agent': user_agent})
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(temp_path, 'wb') as out_file:
                out_file.write(response.read())
    except Exception as e:
        print(f"Error downloading {adjusted_url}: {e}")

# Rename logic matching rename_pdfs.py
estate_map = {
    "hemma-sapphire": "灝然",
    "sierra-terrace": "樂嶺軒",
    "kai-yeung": "啟陽苑",
    "shing-chi": "盛緻苑",
    "wui-hei": "匯熙苑",
    "yu-fung": "裕豐苑",
    "long-fung": "朗風苑",
    "ying-fai": "影輝苑",
    "yan-nga": "欣雅苑",
    "hiu-nga": "曉雅苑"
}

def get_md5(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

updated_files = []

for filename in os.listdir(temp_dir):
    if not filename.endswith('.pdf'):
        continue
        
    prefix = None
    for keyword, name in estate_map.items():
        if keyword in filename:
            prefix = name
            break
            
    if prefix:
        renamed_name = f"{prefix}_{filename}"
        temp_file_path = os.path.join(temp_dir, filename)
        renamed_temp_path = os.path.join(temp_dir, renamed_name)
        
        # Rename in temp folder
        os.rename(temp_file_path, renamed_temp_path)
        
        # Check against destination folder
        dest_file_path = os.path.join(dest_dir, renamed_name)
        if os.path.exists(dest_file_path):
            temp_hash = get_md5(renamed_temp_path)
            dest_hash = get_md5(dest_file_path)
            
            if temp_hash != dest_hash:
                # File has changed!
                shutil.copy2(renamed_temp_path, dest_file_path)
                updated_files.append((renamed_name, "Updated (Content changed)"))
        else:
            # New file not previously in dest (should not happen normally but handle it)
            shutil.copy2(renamed_temp_path, dest_file_path)
            updated_files.append((renamed_name, "Added (New file)"))

# Clean up temporary directory
shutil.rmtree(temp_dir)

# Print results
if updated_files:
    print("\n[!] DETECTED UPDATES:")
    for name, status in updated_files:
        print(f"  - {name}: {status}")
else:
    print("\n[+] No updates found today. All files are already up-to-date.")
