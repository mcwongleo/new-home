import pdfplumber
import json
import re
import os

pdf_path = 'HemmaSapphire/Hemma Sapphire_PL_0820.pdf'
output_dir = 'public'
output_path = os.path.join(output_dir, 'flats_data.js')

records = []
current_block = ''

print(f"Opening PDF file: {pdf_path}...")
with pdfplumber.open(pdf_path) as pdf:
    # Pages 4 to 63 (index 3 to 62) contain Part 2: Information on Area and Price
    for page_idx in range(3, 63):
        print(f"Parsing page {page_idx + 1} of {len(pdf.pages)}...")
        page = pdf.pages[page_idx]
        table = page.extract_table()
        if not table:
            print(f"Warning: No table found on page {page_idx + 1}")
            continue
            
        for row in table:
            if not row or len(row) < 5:
                continue
            
            # Skip header rows
            row_str = ''.join([str(cell) for cell in row if cell])
            if 'Block Name' in row_str or 'Description of Residential' in row_str or '實用面積' in row_str or '售價' in row_str:
                continue
            
            # Extract block name if present, otherwise carry forward the current block name
            block_cell = row[0]
            if block_cell:
                cleaned_block = block_cell.strip().replace('\n', ' ')
                current_block = cleaned_block
            
            floor_cell = row[1]
            flat_cell = row[2]
            
            # Carry on only if we have floor and flat
            if not floor_cell or not flat_cell:
                continue
                
            floor = floor_cell.strip()
            flat = flat_cell.strip()
            
            # Validate that floor is numeric and flat is a letter
            if not re.match(r'^\d+$', floor) or not re.match(r'^[A-Z]$', flat):
                continue
            
            # Parse Saleable Area
            area_cell = row[3]
            size_sq_m = None
            size_sq_ft = None
            balcony = None
            utility_platform = None
            
            if area_cell:
                area_text = area_cell.strip()
                # Format: '39.457 (425)\n露台 Balcony: 2.010 (22);\n工作平台 Utility Platform: 1.500 (16)'
                m = re.match(r'^([\d\.]+)\s+\((\d+)\)', area_text)
                if m:
                    size_sq_m = float(m.group(1))
                    size_sq_ft = int(m.group(2))
                
                # Extract Balcony area
                m_bal = re.search(r'露台\s+Balcony:\s+([\d\.]+)\s*\((\d+)\)', area_text)
                if m_bal:
                    balcony = float(m_bal.group(1))
                
                # Extract Utility Platform area
                m_ut = re.search(r'工作平台\s+Utility Platform:\s+([\d\.]+)\s*\((\d+)\)', area_text)
                if m_ut:
                    utility_platform = float(m_ut.group(1))
            
            # Parse Price
            price_cell = row[4]
            price = None
            if price_cell:
                price_text = price_cell.strip().replace(',', '')
                try:
                    price = int(price_text)
                except ValueError:
                    pass
            
            # Parse Unit Rates
            rate_cell = row[5]
            rate_sq_m = None
            rate_sq_ft = None
            if rate_cell:
                rate_text = rate_cell.strip().replace(',', '')
                rates = re.findall(r'\d+', rate_text)
                if len(rates) >= 2:
                    rate_sq_m = int(rates[0])
                    rate_sq_ft = int(rates[1])
            
            records.append({
                'block': current_block,
                'floor': int(floor),
                'flat': flat,
                'size_sq_m': size_sq_m,
                'size_sq_ft': size_sq_ft,
                'price': price,
                'unit_rate_sq_m': rate_sq_m,
                'unit_rate_sq_ft': rate_sq_ft,
                'balcony': balcony,
                'utility_platform': utility_platform
            })

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

print(f"Extraction complete. Total records extracted: {len(records)}")

# Write to JavaScript file to prevent CORS issue on local browsers
with open(output_path, 'w', encoding='utf-8') as f:
    f.write("const allFlatsData = ")
    json.dump(records, f, indent=2, ensure_ascii=False)
    f.write(";\n")

print(f"Successfully saved {len(records)} records to {output_path}")
