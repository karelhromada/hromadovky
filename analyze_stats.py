import json

with open('card_generator/temp_knights.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

stats = ['V1 (Roztomilost)', 'V2 (Velikost helmy)', 'V3 (Měkkost)', 'V4 (Dostřel objetí)']

def parse_v4(val):
    if isinstance(val, (int, float)): return float(val)
    val = str(val).lower()
    if 'km' in val:
        return float(val.replace('km', '')) * 1000
    if 'm' in val:
        return float(val.replace('m', ''))
    return 0.0

print("Initial Stats Analysis:")
for s in stats:
    if s == 'V4 (Dostřel objetí)':
        values = [parse_v4(d[s]) for d in data]
    else:
        values = [d[s] for d in data]
    print(f"{s}: Min={min(values)}, Max={max(values)}, Avg={sum(values)/len(data):.2f}")

# Find OP cards (Sum of normalized stats)
# Normalize each stat to 0-100 range for comparison
norm_data = []
for d in data:
    v1 = d['V1 (Roztomilost)']
    v2 = d['V2 (Velikost helmy)']
    v3 = d['V3 (Měkkost)']
    v4_raw = parse_v4(d['V4 (Dostřel objetí)'])
    # For V4, let's caps it at 1000 for normalization points
    v4_norm = min(v4_raw / 10, 100) 
    
    total = v1 + v2 + v3 + v4_norm
    norm_data.append((d['Název'], total, v1, v2, v3, v4_raw))

norm_data.sort(key=lambda x: x[1], reverse=True)

print("\nTop 5 Strongest (by sum of stats):")
for name, total, v1, v2, v3, v4 in norm_data[:5]:
    print(f"{name}: Total={total:.2f} (V1={v1}, V2={v2}, V3={v3}, V4={v4})")

print("\nTop 5 Weakest:")
for name, total, v1, v2, v3, v4 in norm_data[-5:]:
    print(f"{name}: Total={total:.2f} (V1={v1}, V2={v2}, V3={v3}, V4={v4})")
