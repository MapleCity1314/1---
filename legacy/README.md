# Encrypted Inventory Page

This project converts the local Excel inventory workbook into a static GitHub Pages table. The data committed to the repository is encrypted.

## Security model

- Commit `data.enc.json`, not the source `.xlsx`, plaintext JSON, or decryption key.
- The key is shared only in the URL fragment, for example `https://user.github.io/repo/#key=...`.
- Visitors without the key can download only ciphertext and cannot view the table data.
- Anyone with the full URL can view and copy decrypted data in the browser. GitHub Pages is static hosting and does not provide real account-level access control.

## Build

```bash
python build.py --base-url https://user.github.io/repo/
```

If there is more than one `.xlsx` file in this directory, pass the workbook explicitly:

```bash
python build.py --excel workbook.xlsx --base-url https://user.github.io/repo/
```

The script writes `data.enc.json` and prints a one-time access key. Do not commit the key or paste it into docs, code, or commit messages.

## Deploy

Commit these files:

- `index.html`
- `app.js`
- `styles.css`
- `data.enc.json`
- `build.py`

Do not commit `.xlsx`, plaintext JSON, or key files. Configure GitHub Pages from the repository settings using the `main` branch root directory.

## Update data

Edit the workbook, run `python build.py` again, and commit the new `data.enc.json`. Each build creates a new key, so old links stop working.
