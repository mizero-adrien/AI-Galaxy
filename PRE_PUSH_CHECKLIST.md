# Pre-Push Checklist for GitHub

## ✅ Security Check - Before Pushing

### 1. Credentials Verification

Run these commands to verify sensitive files are ignored:

```bash
# Check if Firebase files are ignored
git check-ignore -v ai-galaxy-*-firebase-adminsdk-*.json

# Check if database is ignored
git check-ignore -v **/db.sqlite3

# Check if env files are ignored
git check-ignore -v **/.env.local
```

### 2. Files That Should NOT Be Committed

These files are in `.gitignore` and should NOT appear in `git status`:

- ✅ `*-firebase-adminsdk-*.json` (Firebase Admin SDK credentials)
- ✅ `db.sqlite3` (Database file)
- ✅ `.env.local` (Environment variables)
- ✅ `.env.*` (All environment files except `.env.example`)
- ✅ `node_modules/` (Node.js dependencies)
- ✅ `venv/` (Python virtual environment)
- ✅ `__pycache__/` (Python cache)
- ✅ `.next/` (Next.js build output)
- ✅ `*.log` (Log files)
- ✅ `README_FIREBASE.md`, `FIREBASE_SETUP.md` (May contain credentials)

### 3. Files That SHOULD Be Committed

These files are safe to commit:

- ✅ `package.json`, `package-lock.json`
- ✅ `requirements.txt`
- ✅ `next.config.js`
- ✅ `settings.py` (contains development SECRET_KEY - acceptable for dev)
- ✅ Source code files (`.tsx`, `.ts`, `.py`)
- ✅ Configuration files (`.json`, `.js`, `.ts`)
- ✅ Documentation (`.md` files except Firebase ones)

### 4. Final Check Before Push

```bash
# 1. Check what will be committed
git status

# 2. Verify no sensitive files are staged
git diff --cached --name-only | Select-String -Pattern "firebase|\.env|secret|credential|\.key|\.pem|db\.sqlite"

# 3. If the above command returns anything, DO NOT PUSH
# Remove those files from staging:
# git reset HEAD <file>

# 4. Review all staged files
git diff --cached --stat
```

### 5. Important Notes

⚠️ **SECRET_KEY in settings.py**: 
- The `SECRET_KEY` in `AIGalaxyBackend/AIGalaxyBackend/settings.py` is a development key
- For production, this should be moved to environment variables
- It's acceptable to commit for development, but consider using environment variables

⚠️ **Firebase Credentials**:
- Never commit Firebase Admin SDK JSON files
- Never commit `.env.local` files
- Firebase documentation files are ignored (they may contain API keys)

### 6. If You Accidentally Committed Sensitive Files

If you've already committed sensitive files:

1. **Remove from git history** (if not pushed yet):
   ```bash
   git rm --cached <file>
   git commit --amend
   ```

2. **If already pushed**, you need to:
   - Rotate all exposed credentials (API keys, secrets)
   - Use `git filter-branch` or BFG Repo-Cleaner to remove from history
   - Force push (⚠️ coordinate with team first)

### 7. Safe to Push Checklist

Before pushing, ensure:

- [ ] No `.env.local` or `.env.*` files in staging
- [ ] No Firebase Admin SDK JSON files in staging
- [ ] No `db.sqlite3` files in staging
- [ ] No credential files (`.key`, `.pem`, etc.) in staging
- [ ] `node_modules/` is not in staging
- [ ] `venv/` is not in staging
- [ ] `.next/` build folder is not in staging
- [ ] All sensitive markdown files are ignored

### 8. Quick Verification Command

Run this before every push:

```bash
# This should return empty (no sensitive files staged)
git diff --cached --name-only | Select-String -Pattern "firebase.*\.json|\.env\.local|db\.sqlite3|\.key|\.pem|secret|credential"
```

If it returns anything, **DO NOT PUSH** until you remove those files.

## ✅ Ready to Push

Once all checks pass, you're safe to push:

```bash
git push origin main
# or
git push origin master
```

