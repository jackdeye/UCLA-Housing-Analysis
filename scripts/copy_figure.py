#!/usr/bin/env python3
"""Copy density_vs_distance.png to docs folder for the webpage"""
import shutil
import os

source = '../figures/density_vs_distance.png'
destination = '../docs/density_vs_distance.png'

if os.path.exists(source):
    shutil.copy(source, destination)
    print(f"Successfully copied {source} to {destination}")
else:
    print(f"Error: {source} not found")

