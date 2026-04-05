#!/usr/bin/env python3
"""
jarvis-self-healing-test.py
Intentionally breaks a script to test the Self-Healing Guardian.
"""
import os
import subprocess

WORKSPACE = os.path.expanduser("~/.openclaw/workspace")
TEST_FILE = os.path.join(WORKSPACE, "lib/test-broken-script.sh")

# 1. Create a broken script
print("🧪 Creating a broken script...")
with open(TEST_FILE, "w") as f:
    f.write("#!/bin/bash\necho 'Hello World'\nif [ 1 -eq 1 \n")  # Missing 'fi'

# 2. Run the Guardian
print("🛡️  Running Self-Healing Guardian...")
result = subprocess.run(
    ["bash", os.path.join(WORKSPACE, "lib/self-healing-guardian.sh")],
    capture_output=True, text=True
)

print("stdout:", result.stdout)
print("stderr:", result.stderr)

# 3. Check the result
if os.path.exists(TEST_FILE):
    with open(TEST_FILE, "r") as f:
        content = f.read()
    if "fi" in content:
        print("✅ SUCCESS: The Guardian fixed the script!")
    else:
        print("⚠️  Partials: The script exists but might still be broken.")
else:
    print("❌ FAILED: The test file is missing.")
