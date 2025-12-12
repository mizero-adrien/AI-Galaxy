# Backend Connection Issues - Fix Instructions

## Problem
Frontend requests are timing out because the backend is not accessible.

## Solution

### 1. Make sure Django backend is running:

```bash
cd AIGalaxyBackend
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### 2. Verify backend is accessible:

Open in browser or use curl:
```
http://localhost:8000/api/categories/
```

You should see JSON data, not a timeout error.

### 3. Check backend logs:

Look for any errors in the Django terminal. Common issues:
- Database migrations not applied
- Port 8000 already in use
- CORS errors

### 4. If port 8000 is busy:

Stop the process using port 8000 or use a different port:
```bash
python manage.py runserver 8001
```

Then update frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### 5. Check Django settings:

Make sure in `AIGalaxyBackend/settings.py`:
- `DEBUG = True`
- `ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']`
- `CORS_ALLOW_ALL_ORIGINS = True`

### 6. Test the API endpoint directly:

```bash
curl http://localhost:8000/api/categories/
```

If this works, the backend is fine and it's a frontend connection issue.
If this fails, the backend has a problem.


