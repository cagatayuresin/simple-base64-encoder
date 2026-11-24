# Simple Base64 Encoder

Encode and decode Base64, URL-safe Base64, hexadecimal, binary, URL encoding, and JSON in the browser. Nothing you type or drop is uploaded.

Live site: [https://cagatayuresin.github.io/simple-base64-encoder/](https://cagatayuresin.github.io/simple-base64-encoder/)

## Use

1. The page opens with three rows. The left field is the encoded value and the right field is the text. Typing in either one updates the other.
2. Use + to add a row and - to remove the last one. Each row also has its own delete button. Clear all restores three empty rows.
3. Choose Base64, Base64 URL, Hex, Binary, URL, or JSON. JSON keeps pretty text on the left and compact JSON on the right.
4. Drop a file on the sheet, or use Open file. Text files fill the text side. Binary files are encoded on the left.
5. Pick System, Light, or Dark. System follows the operating system and updates if it changes.

Files larger than 5 MB are refused so the page stays responsive. Rows and the selected format are stored in `localStorage` under `encoder-state`. The theme preference is stored under `theme`.

## Run locally

Modules need a local server. Opening the file directly will not load them.

```bash
git clone https://github.com/cagatayuresin/simple-base64-encoder.git
cd simple-base64-encoder
python -m http.server 8080
```

Then open [http://127.0.0.1:8080](http://127.0.0.1:8080).

## Checks

```bash
npm ci
npm run lint
npm test
```

GitHub Actions runs the same commands on pushes and pull requests.

## Layout

```plaintext
index.html
manifest.json
sw.js
src/css/style.css
src/js/app.js
src/js/converters.js
src/js/fileHandler.js
src/js/theme.js
src/img/
tests/converters.test.js
```

## Privacy

Conversion and file reading happen locally. Google Analytics stays off until you choose Allow. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
