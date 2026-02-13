#!/usr/bin/env python3
"""Simple script to copy housing_data.json to docs folder for GitHub Pages"""
import shutil
import os

source = 'final_draft/housing_data.json'
destination = 'docs/housing_data.json'

if os.path.exists(source):
    shutil.copy(source, destination)
    print(f"Successfully copied {source} to {destination}")
else:
    print(f"Error: {source} not found")

