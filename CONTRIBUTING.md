# Contributing

Issues and pull requests are welcome.

## Setup

```bash
git clone https://github.com/cagatayuresin/simple-base64-encoder.git
cd simple-base64-encoder
npm ci
python -m http.server 8080
```

## Checks

Run these before opening a pull request. CI runs the same commands.

```bash
npm run lint
npm test
```

`npm run lint` covers ESLint, Stylelint, and html-validate. `npm test` runs the unit tests and requires at least 90% line, branch, and function coverage of `src/js`.

## Notes

- Keep conversions in `src/js/converters.js` and cover behavior changes with a test.
- The page is a static GitHub Pages site. Asset URLs stay relative so they work under `/simple-base64-encoder/`.
- Do not send input or file contents to a server.
