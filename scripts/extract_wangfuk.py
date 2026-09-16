import pdfplumber
import json
import re
import os

pdf_path = 'HomeOwnershipSchemeFlats/Price-SSE-WangFuk.pdf'
output_dir = 'public'

# We'll map the English court name to the output file prefix
COURT_FILENAME_MAP = {
    'Shing Chi Court': 'ShingChiCourt',
    'Wui Hei Court': 'WuiHeiCourt',
    'Yu Fung Court': 'YuFungCourt',
    'Long Fung Court': 'LongFungCourt',
    'Kai Yeung Court': 'KaiYeungCourt',
    'Ying Fai Court': 'YingFaiCourt',
    'Yan Nga Court': 'YanNgaCourt',
    'Hiu Nga Court': 'HiuNgaCourt'
}

court_records = {k: [] for k in COURT_FILENAME_MAP.keys()}

print(f"Opening PDF file: {pdf_path}...")
current_court = ''

# A helper to clean text
def clean_text(val):
    if val is None:
        return ''
    return str(val).strip().replace('\n', ' ')

with pdfplumber.open(pdf_path) as pdf:
    # Pages 5 to 119 in PDF (indices 4 to 118) contain Part 2: Area and Price Info
    for page_idx in range(4, 119):
        page = pdf.pages[page_idx]
        table = page.extract_table()
        if not table:
            print(f"Warning: No table found on page {page_idx + 1}")
            continue
            
        print(f"Parsing page {page_idx + 1} of {len(pdf.pages)}...")
        for row in table:
            if not row or len(row) < 7:
                continue
            
            # Combine all cells to identify header rows to skip
            row_str = ''.join([clean_text(cell) for cell in row])
            if 'Description of Residential' in row_str or '實用面積' in row_str or '售價' in row_str or '屋苑' in row_str:
                continue
                
            # If the row has 8 columns (Wang Fuk format):
            # Column 0: Court Name (屋苑)
            # Column 1: Block (座)
            # Column 2: Floor (樓層)
            # Column 3: Unit (單位)
            # Column 4: Saleable Area (實用面積)
            # Column 5: Price (售價)
            # Column 6: Unit Rate of Saleable Area (每平米/平方呎售價)
            # Column 7: Area of other specified items (其他指明項目)
            
            # Extract and clean fields
            court_cell = clean_text(row[0])
            block_cell = clean_text(row[1])
            floor_cell = clean_text(row[2])
            flat_cell = clean_text(row[3])
            area_cell = clean_text(row[4])
            price_cell = clean_text(row[5])
            rate_cell = clean_text(row[6])
            
            # Update current court if specified
            if court_cell:
                # Find matching court key (such as 'Shing Chi Court' in '盛緻苑 Shing Chi Court')
                for k in COURT_FILENAME_MAP.keys():
                    if k in court_cell:
                        current_court = k
                        break
            
            # Ensure floor is numeric and unit is alphanumeric (could be single letter or digit)
            if not re.match(r'^\d+$', floor_cell) or not flat_cell:
                continue
                
            if not current_court:
                # If we don't have a court context yet, skip
                continue
            
            # Parse Saleable Area
            size_sq_m = None
            size_sq_ft = None
            # e.g., "35.3 (380)"
            m = re.match(r'^([\d\.]+)\s+\((\d+)\)', area_cell)
            if m:
                size_sq_m = float(m.group(1))
                size_sq_ft = int(m.group(2))
            
            # Parse Price
            price = None
            if price_cell:
                price_text = price_cell.replace(',', '')
                try:
                    price = int(price_text)
                except ValueError:
                    pass
            
            # Parse Unit Rates
            rate_sq_m = None
            rate_sq_ft = None
            if rate_cell:
                # Rate cell format looks like: "80,847 (7,510)" or "80847 (7510)"
                rate_text = rate_cell.replace(',', '')
                rates = re.findall(r'\d+', rate_text)
                if len(rates) >= 2:
                    rate_sq_m = int(rates[0])
                    rate_sq_ft = int(rates[1])
            
            record = {
                'block': block_cell if block_cell else 'Block', # Default if empty
                'floor': int(floor_cell),
                'flat': flat_cell,
                'size_sq_m': size_sq_m,
                'size_sq_ft': size_sq_ft,
                'price': price,
                'unit_rate_sq_m': rate_sq_m,
                'unit_rate_sq_ft': rate_sq_ft,
                'balcony': 0.0, # No balcony for these HOS flats as per PDF note
                'utility_platform': 0.0 # No utility platform as per PDF note
            }
            
            court_records[current_court].append(record)

# Create output directory
os.makedirs(output_dir, exist_ok=True)

for court, records in court_records.items():
    prefix = COURT_FILENAME_MAP[court]
    output_path = os.path.join(output_dir, f"{prefix}_data.js")
    
    print(f"Court: {court} -> Extracted {len(records)} records. Saving to {output_path}...")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("var allFlatsData = ")
        json.dump(records, f, indent=2, ensure_ascii=False)
        f.write(";\n")

print("All Wang Fuk SSE court data files successfully extracted and saved!")
