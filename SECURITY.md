# Security Policy

## Supported Versions

We currently support the latest released version. Security fixes will be issued for the most recent release when feasible.

## Data Handling and Privacy

- This application is fully client-side. All conversions and file processing happen in your browser.
- We do not send, collect, or store your input or files on any server.
- Theme preference is stored in localStorage under `theme`. Rows and the selected format are stored under `encoder-state`. Both stay on your device.
- Clear all removes the saved rows, or clear this site's storage in the browser.

## Analytics Notice (Google Analytics)

- We use Google Analytics 4 (GA4) to understand aggregate usage and improve the experience.
- GA cookies and measurement are enabled only if you explicitly allow them via the consent banner. The default is denied.
- If you do not consent, no analytics cookies are set and no analytics requests are sent.
- Your allow/decline choice is stored only in your browser via localStorage and can be changed at any time.
- All conversions and file operations happen locally in your browser; your input content is not sent to any server.
- You can opt out of GA at any time by clicking “Decline” on the banner or by using an ad/tracker blocker.

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

