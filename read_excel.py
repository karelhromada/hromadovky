import pandas as pd
import sys

file_path = 'Sešit1.xlsx'
try:
    df = pd.read_excel(file_path)
    print(f"Content of {file_path}:")
    print(df.to_string())
except Exception as e:
    print(f"Error reading {file_path}: {e}")
