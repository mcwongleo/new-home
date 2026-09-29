import json
import csv
import re

js_path = 'public/HemmaSapphire_data.js'
out_csv_path = 'hemma_sapphire_flats_list.csv'

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

# Function to shorten block name
def shorten_block(block):
    # E.g., "第1A座 Tower 1A" -> "1A"
    match = re.search(r'Tower\s+(\d+[A-Z])', block, re.IGNORECASE)
    if match:
        return match.group(1)
    return block

# Headers mapped exactly to hemma_sapphire_large_flats.csv
headers = ['座', '樓層', '單位', '實用面積(呎)', '售價', '呎價']

with open(out_csv_path, 'w', encoding='utf-8', newline='') as f:
    # Use QUOTE_NONNUMERIC so strings are quoted and numbers are not
    writer = csv.writer(f, quoting=csv.QUOTE_NONNUMERIC)
    writer.writerow(headers)
    
    for flat in flats:
        raw_block = flat.get('block', '')
        short_block = shorten_block(raw_block)
        
        floor = int(flat.get('floor'))
        unit = flat.get('flat', '')
        size_sq_ft = int(flat.get('size_sq_ft'))
        price = int(flat.get('price'))
        unit_rate_sq_ft = int(flat.get('unit_rate_sq_ft'))
        
        writer.writerow([
            short_block,
            floor,
            unit,
            size_sq_ft,
            price,
            unit_rate_sq_ft
        ])

print(f"Successfully converted and saved {len(flats)} flats with standard fields to {out_csv_path}")
