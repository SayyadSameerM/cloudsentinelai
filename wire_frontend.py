import os, re

API_URL   = "https://cbrg5o4rv9.execute-api.us-east-1.amazonaws.com/dev"
POOL_ID   = "us-east-1_nsa2fJTq6"
CLIENT_ID = "2oic9j2thbd97o9phnj2fuuh1l"
REGION    = "us-east-1"

replacements = [
    (r"window\.ENV_API_URL\s*=\s*'[^']*'",           f"window.ENV_API_URL           = '{API_URL}'"),
    (r'window\.ENV_API_URL\s*=\s*"[^"]*"',           f'window.ENV_API_URL           = "{API_URL}"'),
    (r"window\.ENV_COGNITO_POOL_ID\s*=\s*'[^']*'",   f"window.ENV_COGNITO_POOL_ID   = '{POOL_ID}'"),
    (r'window\.ENV_COGNITO_POOL_ID\s*=\s*"[^"]*"',   f'window.ENV_COGNITO_POOL_ID   = "{POOL_ID}"'),
    (r"window\.ENV_COGNITO_CLIENT_ID\s*=\s*'[^']*'", f"window.ENV_COGNITO_CLIENT_ID = '{CLIENT_ID}'"),
    (r'window\.ENV_COGNITO_CLIENT_ID\s*=\s*"[^"]*"', f'window.ENV_COGNITO_CLIENT_ID = "{CLIENT_ID}"'),
    (r"window\.ENV_REGION\s*=\s*'[^']*'",            f"window.ENV_REGION            = '{REGION}'"),
    (r'window\.ENV_REGION\s*=\s*"[^"]*"',            f'window.ENV_REGION            = "{REGION}"'),
]

frontend_dir = r"d:\CloudSentinel_AI\modules\frontend"
updated = []

for fname in os.listdir(frontend_dir):
    if not fname.endswith(".html"):
        continue
    path = os.path.join(frontend_dir, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        updated.append(fname)

if updated:
    print(f"Updated {len(updated)} files:")
    for name in sorted(updated):
        print(f"  {name}")
else:
    print("No ENV_ placeholders found in HTML files.")
    print("Listing HTML files found:")
    for fname in os.listdir(frontend_dir):
        if fname.endswith(".html"):
            print(f"  {fname}")
