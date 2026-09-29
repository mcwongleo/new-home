import os

pdf_dir = 'status_pdfs'
files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]

# Mapping from filename keyword to Chinese estate name
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

renamed_count = 0

for filename in sorted(files):
    # Check if already has a prefix from our list to prevent double renaming
    has_prefix = False
    for name in estate_map.values():
        if filename.startswith(f"{name}_"):
            has_prefix = True
            break
    if has_prefix:
        print(f"Skipping already renamed file: {filename}")
        continue

    # Find the matching estate name
    prefix = None
    for keyword, name in estate_map.items():
        if keyword in filename:
            prefix = name
            break
            
    if prefix:
        new_filename = f"{prefix}_{filename}"
        old_path = os.path.join(pdf_dir, filename)
        new_path = os.path.join(pdf_dir, new_filename)
        os.rename(old_path, new_path)
        print(f"Renamed: {filename} -> {new_filename}")
        renamed_count += 1
    else:
        print(f"Warning: No matching estate found for {filename}")

print(f"\nSuccessfully renamed {renamed_count} PDF files.")
