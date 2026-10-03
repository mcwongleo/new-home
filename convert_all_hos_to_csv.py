import json
import csv
import os

output_csv_path = 'flats_list.csv'

# Map English script names to Chinese estate names
HOS_ESTATES = {
    'WuiHeiCourt': '匯熙苑',
    'YuFungCourt': '裕豐苑',
    'LongFungCourt': '朗風苑',
    'KaiYeungCourt': '啟陽苑',
    'YingFaiCourt': '影輝苑',
    'YanNgaCourt': '欣雅苑',
    'HiuNgaCourt': '曉雅苑'
}

# Target Headers
headers = ['座', '樓層', '單位', '實用面積(呎)', '售價', '呎價']

all_flats_combined = []

for script_name, chinese_name in HOS_ESTATES.items():
    js_path = f"public/{script_name}_data.js"
    if not os.path.exists(js_path):
        print(f"Warning: {js_path} does not exist!")
        continue
        
    print(f"Reading {js_path}...")
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Strip JS variable declaration
    json_str = content.replace('var allFlatsData =', '').strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
        
    try:
        flats = json.loads(json_str)
        print(f"  Parsed {len(flats)} flats from {script_name}")
    except Exception as e:
        print(f"  Error parsing JSON for {script_name}: {e}")
        continue
        
    for idx, flat in enumerate(flats):
        raw_block = flat.get('block', '')
        
        # Format block name
        if raw_block == '-' or not raw_block:
            block_fmt = chinese_name
        else:
            block_fmt = f"{chinese_name} {raw_block}座" if "座" not in raw_block else f"{chinese_name} {raw_block}"
            
        floor_val = flat.get('floor')
        unit_val = flat.get('flat')
        size_val = flat.get('size_sq_ft')
        price_val = flat.get('price')
        rate_val = flat.get('unit_rate_sq_ft')
        
        # Robust None checking
        if floor_val is None or unit_val is None:
            print(f"  [Warning] Skipping flat at index {idx} in {script_name} due to missing core fields (floor/flat)")
            continue
            
        try:
            floor = int(floor_val)
            unit = str(unit_val)
            
            # Use empty string or default to 0 if price/size is None
            size_sq_ft = int(size_val) if size_val is not None else ""
            price = int(price_val) if price_val is not None else ""
            unit_rate_sq_ft = int(rate_val) if rate_val is not None else ""
            
            all_flats_combined.append([
                block_fmt,
                floor,
                unit,
                size_sq_ft,
                price,
                unit_rate_sq_ft
            ])
        except Exception as e:
            print(f"  [Error] Failed to convert flat at index {idx} in {script_name}: {flat}. Error: {e}")

# Write to consolidated CSV
with open(output_csv_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_NONNUMERIC)
    writer.writerow(headers)
    writer.writerows(all_flats_combined)

print(f"\nSuccessfully wrote {len(all_flats_combined)} total flats from all 7 HOS estates to {output_csv_path}")
