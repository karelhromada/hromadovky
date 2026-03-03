import json

def parse_v4(val):
    if isinstance(val, (int, float)): return float(val)
    val = str(val).lower().strip()
    if 'km' in val:
        return float(val.replace('km', '').strip()) * 1000
    if 'm' in val:
        return float(val.replace('m', '').strip())
    try:
        return float(val)
    except:
        return 0.0

file_path = 'card_generator/temp_knights.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Refinement Logic
for d in data:
    # 1. Standardize V4 to numeric meters
    d['V4 (Dostřel objetí)'] = parse_v4(d['V4 (Dostřel objetí)'])
    
    # 2. Balance specific cards
    name = d['Název']
    
    # Buffing weak cards
    if name == 'Squire Čára':
        d['V2 (Velikost helmy)'] = 95 # Minimalist but perfect fit
    elif name == 'Lego-lás':
        d['V2 (Velikost helmy)'] = 110 # Blocky helmet
        d['V3 (Měkkost)'] = 15 # A bit less hard than 5
    elif name == 'Vojáček Olověný':
        d['V2 (Velikost helmy)'] = 105 # Classic high uniform
    elif name == 'Brouček Zbrojnoš':
        d['V4 (Dostřel objetí)'] = 45 # Very fast hugger
    elif name == 'Lord Citron':
        d['V1 (Roztomilost)'] = 78 # Sour but cute
        d['V4 (Dostřel objetí)'] = 40 # Reaching further
        
    # Standardize V4 scale (it was up to 10km, which is 10000m)
    # We'll cap the max to 2000 to keep it manageable in comparison
    if d['V4 (Dostřel objetí)'] > 2000:
        d['V4 (Dostřel objetí)'] = 2000

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Refined temp_knights.json successfully.")
