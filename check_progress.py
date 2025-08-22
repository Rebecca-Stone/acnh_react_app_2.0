#!/usr/bin/env python3
"""
Simple progress checker for the ACNH villager scraping script.
"""

import json
import os
import time
from pathlib import Path

def check_progress():
    json_file = Path("acnh_villagers.json")
    
    if json_file.exists():
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"🎉 COMPLETE! Found {len(data)} villagers in the dataset")
            
            # Show a sample villager
            if data:
                sample = data[0]
                print(f"\n📋 Sample villager: {sample.get('name', 'Unknown')}")
                print(f"   Species: {sample.get('species', 'Unknown')}")
                print(f"   Personality: {sample.get('personality', 'Unknown')}")
                print(f"   Has poster: {'✅' if sample.get('poster_image_url') else '❌'}")
                print(f"   Has gifts: {'✅' if sample.get('favorite_gifts') else '❌'}")
                print(f"   Game appearances: {len(sample.get('appearances', []))} games")
            
            # Data quality check
            complete_count = sum(1 for v in data if all(v.get(field) for field in 
                ['name', 'species', 'gender', 'personality', 'birthday', 'catchphrase']))
            print(f"\n📊 Data Quality:")
            print(f"   Complete records: {complete_count}/{len(data)} ({complete_count/len(data)*100:.1f}%)")
            
            return True
            
        except json.JSONDecodeError:
            print("⏳ File exists but incomplete - still writing...")
            return False
    else:
        print("⏳ Still scraping data... (no output file yet)")
        return False

if __name__ == "__main__":
    check_progress()
