# Security Policy

## Supported Versions

We currently support the latest released version. Security fixes will be issued for the most recent release when feasible.

## Data Handling and Privacy

- This application is fully client-side. All conversions and file processing happen in your browser.
- We do not send, collect, or store your input or files on any server.
- If you use features like theme or row auto-save, data is stored only in your browser via localStorage and remains on your device.
- You can clear saved data at any time from the UI (Clear All) or by clearing your browser storage for this site.

## Reporting a Vulnerability

- Email: cagatayuresin@gmail.com
- Alternatively, open a security advisory on GitHub (preferred if available) rather than a public issue.

Please include:
- A clear description of the vulnerability and impact
- Steps to reproduce or a proof-of-concept
- Affected version/commit and environment details

We aim to respond within 7 days. If accepted, we will coordinate a fix and disclosure timeline with you.

## Disclosure Policy

- We prefer responsible disclosure. Please do not disclose publicly until a fix is available.
- We will credit reporters in the CHANGELOG unless anonymity is requested.

## Best Practices in This Project

- Input validation and error handling
- Clipboard and storage operations with safe fallbacks
- XSS hardening in dynamic DOM updates
- UTF-8 safe encoding/decoding to prevent data corruption
- Dependency-free runtime to minimize supply-chain risk

If you have suggestions to improve our security posture, please contact us.

