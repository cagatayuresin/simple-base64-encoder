// Function to create a new converter row
function createConverterRow(index) {
    // Create row container
    const row = document.createElement('div');
    row.className = 'columns is-vcentered';

    // Left column: Base64 input with copy button
    const leftCol = document.createElement('div');
    leftCol.className = 'column is-half';

    // Field with addons for Base64 input and copy button
    const field = document.createElement('div');
    field.className = 'field has-addons';

    // Base64 input (left column)
    const base64Control = document.createElement('div');
    base64Control.className = 'control is-expanded';
    const base64Input = document.createElement('input');
    base64Input.className = 'input';
    base64Input.type = 'text';
    base64Input.placeholder = 'Base64';
    base64Input.id = `base64-${index}`;
    base64Control.appendChild(base64Input);
    field.appendChild(base64Control);

    // Copy button with FontAwesome icon
    const buttonControl = document.createElement('div');
    buttonControl.className = 'control';
    const copyButton = document.createElement('button');
    copyButton.className = 'button is-info';
    copyButton.innerHTML = '<i class="fa-solid fa-copy"></i>';
    copyButton.addEventListener('click', function () {
        navigator.clipboard.writeText(base64Input.value)
            .then(() => {
                copyButton.title = 'Copied!';
                setTimeout(() => { copyButton.title = ''; }, 2000);
            })
            .catch(err => {
                console.error('Copy error:', err);
            });
    });
    buttonControl.appendChild(copyButton);
    field.appendChild(buttonControl);

    leftCol.appendChild(field);

    // Right column: Plain text input
    const rightCol = document.createElement('div');
    rightCol.className = 'column is-half';
    const plainInput = document.createElement('input');
    plainInput.className = 'input';
    plainInput.type = 'text';
    plainInput.placeholder = 'Plain text';
    plainInput.id = `plain-${index}`;
    rightCol.appendChild(plainInput);

    // Append columns to the row (left: Base64, right: plain text)
    row.appendChild(leftCol);
    row.appendChild(rightCol);

    // Event listeners for conversion
    // Plain text to Base64 (encode)
    plainInput.addEventListener('input', function () {
        try {
            base64Input.value = btoa(plainInput.value);
        } catch (e) {
            base64Input.value = 'Invalid characters';
        }
    });

    // Base64 to plain text (decode)
    base64Input.addEventListener('input', function () {
        try {
            plainInput.value = atob(base64Input.value);
        } catch (e) {
            plainInput.value = 'Invalid Base64';
        }
    });

    return row;
}

let rowCount = 0;
const converterRows = document.getElementById('converterRows');

// Create initial 7 rows
for (let i = 0; i < 7; i++) {
    const row = createConverterRow(rowCount);
    converterRows.appendChild(row);
    rowCount++;
}

// Add row button event listener
const addRowButton = document.getElementById('addRowButton');
addRowButton.addEventListener('click', function () {
    const newRow = createConverterRow(rowCount);
    converterRows.appendChild(newRow);
    rowCount++;
});