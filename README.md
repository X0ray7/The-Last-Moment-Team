# Ghurir — Interactive Web Security Sandbox

**Live Demo URL:** `https://<your-github-username>.github.io/<your-repo-name>/` *(Update this line after enabling GitHub Pages in Settings -> Pages)*

An interactive, 100% client-side educational security sandbox built for the **42 Amman / 42 Irbid Final Project** using pure HTML5, CSS3, and Vanilla JavaScript (zero backend, zero database, zero frameworks).

## Included Security Labs

1. **Lab 1: Open Redirect** (`lab-open-redirect.html`)
   - **Classification:** OWASP A01:2021 (Broken Access Control) | CWE-601
   - **Demo:** Simulated browser login flow demonstrating external and protocol-relative (`//`) redirect abuse, fixed by strict same-origin relative path validation.
2. **Lab 2: Regular Expression Denial of Service — ReDoS** (`lab-redos.html`)
   - **Classification:** OWASP A04:2021 (Insecure Design) | CWE-1333
   - **Demo:** Real `performance.now()` execution latency comparison between a nested-quantifier regex and a safe linear-time regex.
3. **Lab 3: Prototype Pollution (Challenge Lab)** (`lab-prototype-pollution.html`)
   - **Classification:** OWASP A03:2021 (Injection) / A08:2021 | CWE-1321
   - **Demo:** Unsafe recursive JSON merge polluting JavaScript object prototypes via `__proto__` and `constructor.prototype` to escalate a standard user to Admin, fixed by blocking dangerous keys.

## Running Locally

No build step or server is required. Open `index.html` directly in any modern browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Safety Notice

All demonstrations are isolated client-side simulations designed strictly for educational purposes. No real targets, credentials, or external systems are used.
