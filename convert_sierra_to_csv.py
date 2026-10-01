import json
import csv

js_path = 'public/SierraTerrace_data.js'
out_csv_path = 'sierra_terrace_flats_list.csv'

# Read file and extract JSON
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Strip variable declaration
json_str = content.replace('var allFlatsData =', '').strip()
if json_str.endswith(';'):
    json_str = json_str[:-1]

try:
    flats = json.loads(json_str)
except Exception as e:
    print(f"Error parsing JSON: {e}")
    exit(1)

# Headers matching hemma_sapphire_flats_list.csv
headers = ['座', '樓層', '單位', '實用面積(呎)', '售價', '呎價']

with open(out_csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_NONNUMERIC)
    writer.writeheader() if hasattr(writer, 'writeheader') else writer.writerow(headers)
    
    for flat in flats:
        # Since Sierra Terrace has a single tower, let's write "Sierra Terrace" under "座"
        block = "Sierra Terrace"
        floor = int(flat.get('floor'))
        unit = flat.get('flat', '')
        size_sq_ft = int(flat.get('size_sq_ft'))
        price = int(flat.get('price'))
        unit_rate_sq_ft = int(flat.get('unit_rate_sq_ft'))
        
        writer.writerow([
            block,
            floor,
            unit,
            size_sq_ft,
            price,
            unit_rate_sq_ft
        ])

print(f"Successfully converted and saved {len(flats)} Sierra Terrace flats to {out_csv_path}")
