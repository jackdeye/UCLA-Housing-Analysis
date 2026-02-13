#!/usr/bin/env python3
"""Simple script to copy housing_data.json to docs folder for GitHub Pages"""
import shutil
import os

source = '../data/processed/housing_data.json'
destination = '../docs/housing_data.json'

if os.path.exists(source):
    shutil.copy(source, destination)
    print(f"Successfully copied {source} to {destination}")
else:
    # Try alternative location
    alt_source = '../final_draft/housing_data.json'
    if os.path.exists(alt_source):
        shutil.copy(alt_source, destination)
        print(f"Successfully copied {alt_source} to {destination}")
    else:
        print(f"Error: Could not find housing_data.json in expected locations")

