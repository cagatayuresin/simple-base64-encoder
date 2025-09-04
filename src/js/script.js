// Helper: automatically resize textarea height based on content
function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

// Save all row data to localStorage
function saveToLocalStorage() {
  const data = [];
  document.querySelectorAll("[id^=row-]").forEach((rowEl) => {
    const base64El = rowEl.querySelector("[id^=base64-]");
    const plainEl = rowEl.querySelector("[id^=plain-]");
    if (base64El && plainEl) {
      data.push({
        base64: base64El.value,
        plain: plainEl.value,
      });
    }
  });
  localStorage.setItem("converterData", JSON.stringify(data));
}

// Create a new converter row
function createConverterRow(index, restoreData = null) {
  const row = document.createElement("div");
  row.className = "columns is-vcentered";
  row.id = `row-${index}`;

  // DELETE BUTTON COLUMN
  const deleteCol = document.createElement("div");
  deleteCol.className = "column is-narrow";
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "button is-danger is-outlined";
  deleteBtn.innerHTML = `<svg class="icon icon-tabler icon-tabler-trash" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 7l16 0"/>
    <path d="M10 11l0 6"/>
    <path d="M14 11l0 6"/>
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
  </svg>`;
  deleteBtn.title = "Delete this row";
  deleteBtn.addEventListener("click", () => {
    if (document.querySelectorAll("[id^=row-]").length > 1) {
      row.remove();
      saveToLocalStorage();
    } else {
      alert("At least one row must remain!");
    }
  });
  deleteCol.appendChild(deleteBtn);

  // LEFT COL
  const leftCol = document.createElement("div");
  leftCol.className = "column is-half";
  const leftField = document.createElement("div");
  leftField.className = "field has-addons";

  const base64Control = document.createElement("div");
  base64Control.className = "control is-expanded";
  const base64Input = document.createElement("textarea");
  base64Input.className = "textarea single-line";
  base64Input.placeholder = "Base64";
  base64Input.id = `base64-${index}`;
  base64Input.setAttribute("rows", "1");
  base64Input.addEventListener("input", () => {
    autoResize(base64Input);
    try {
      plainInput.value = atob(base64Input.value);
    } catch (e) {
      plainInput.value = "Invalid Base64";
    }
    autoResize(plainInput);
    saveToLocalStorage();
  });
  base64Control.appendChild(base64Input);
  leftField.appendChild(base64Control);

  const copyBtnLeft = document.createElement("button");
  copyBtnLeft.className = "button is-info";
  copyBtnLeft.innerHTML = `<svg class="icon icon-tabler icon-tabler-copy" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M8 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M16 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M9 15l6 0"/>
    <path d="M12 12l3 0"/>
  </svg>`;
  copyBtnLeft.addEventListener("click", () => {
    navigator.clipboard.writeText(base64Input.value).then(() => {
      copyBtnLeft.title = "Copied!";
      setTimeout(() => {
        copyBtnLeft.title = "";
      }, 2000);
    });
  });

  const clearBtnLeft = document.createElement("button");
  clearBtnLeft.className = "button is-light";
  clearBtnLeft.innerHTML = `<svg class="icon icon-tabler icon-tabler-x" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M18 6l-12 12"/>
    <path d="M6 6l12 12"/>
  </svg>`;
  clearBtnLeft.addEventListener("click", () => {
    base64Input.value = "";
    plainInput.value = "";
    autoResize(base64Input);
    autoResize(plainInput);
    saveToLocalStorage();
  });

  const btnGroupLeft = document.createElement("div");
  btnGroupLeft.className = "control buttons";
  btnGroupLeft.appendChild(copyBtnLeft);
  btnGroupLeft.appendChild(clearBtnLeft);
  leftField.appendChild(btnGroupLeft);
  leftCol.appendChild(leftField);

  // RIGHT COL
  const rightCol = document.createElement("div");
  rightCol.className = "column is-half";
  const rightField = document.createElement("div");
  rightField.className = "field has-addons";

  const plainControl = document.createElement("div");
  plainControl.className = "control is-expanded";
  const plainInput = document.createElement("textarea");
  plainInput.className = "textarea single-line";
  plainInput.placeholder = "Plain text";
  plainInput.id = `plain-${index}`;
  plainInput.setAttribute("rows", "1");
  plainInput.addEventListener("input", () => {
    autoResize(plainInput);
    try {
      base64Input.value = btoa(plainInput.value);
    } catch (e) {
      base64Input.value = "Invalid characters";
    }
    autoResize(base64Input);
    saveToLocalStorage();
  });
  plainControl.appendChild(plainInput);
  rightField.appendChild(plainControl);

  const copyBtnRight = document.createElement("button");
  copyBtnRight.className = "button is-info";
  copyBtnRight.innerHTML = `<svg class="icon icon-tabler icon-tabler-copy" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M8 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M16 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M9 15l6 0"/>
    <path d="M12 12l3 0"/>
  </svg>`;
  copyBtnRight.addEventListener("click", () => {
    navigator.clipboard.writeText(plainInput.value).then(() => {
      copyBtnRight.title = "Copied!";
      setTimeout(() => {
        copyBtnRight.title = "";
      }, 2000);
    });
  });

  const clearBtnRight = document.createElement("button");
  clearBtnRight.className = "button is-light";
  clearBtnRight.innerHTML = `<svg class="icon icon-tabler icon-tabler-x" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M18 6l-12 12"/>
    <path d="M6 6l12 12"/>
  </svg>`;
  clearBtnRight.addEventListener("click", () => {
    plainInput.value = "";
    base64Input.value = "";
    autoResize(plainInput);
    autoResize(base64Input);
    saveToLocalStorage();
  });

  const btnGroupRight = document.createElement("div");
  btnGroupRight.className = "control buttons";
  btnGroupRight.appendChild(copyBtnRight);
  btnGroupRight.appendChild(clearBtnRight);
  rightField.appendChild(btnGroupRight);
  rightCol.appendChild(rightField);

  row.appendChild(deleteCol);
  row.appendChild(leftCol);
  row.appendChild(rightCol);

  if (restoreData) {
    base64Input.value = restoreData.base64;
    plainInput.value = restoreData.plain;
  }
  // Delay resize after DOM attach
  setTimeout(() => {
    autoResize(base64Input);
    autoResize(plainInput);
  }, 0);

  return row;
}

let rowCount = 0;
const converterRows = document.getElementById("converterRows");

// Function to get next available row index
function getNextRowIndex() {
  return Date.now(); // Use timestamp to ensure unique IDs
}

// Load from localStorage if available
const savedData = JSON.parse(localStorage.getItem("converterData") || "[]");
if (savedData.length > 0) {
  savedData.forEach((data) => {
    const row = createConverterRow(getNextRowIndex(), data);
    converterRows.appendChild(row);
  });
} else {
  for (let i = 0; i < 7; i++) {
    const row = createConverterRow(getNextRowIndex());
    converterRows.appendChild(row);
  }
}

// Add new row
document.getElementById("addRowButton").addEventListener("click", () => {
  const newRow = createConverterRow(getNextRowIndex());
  converterRows.appendChild(newRow);
  saveToLocalStorage();
});

// Clear all
document.getElementById("clearAllButton").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all rows?")) {
    localStorage.removeItem("converterData");
    converterRows.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const row = createConverterRow(getNextRowIndex());
      converterRows.appendChild(row);
    }
  }
});

// Theme toggle (with icon change)
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeToggleIcon");

function updateThemeIcon() {
  if (document.body.classList.contains("dark-mode")) {
    themeIcon.innerHTML = `<svg class="icon icon-tabler icon-tabler-sun" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
      <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>
    </svg>`;
  } else {
    themeIcon.innerHTML = `<svg class="icon icon-tabler icon-tabler-moon" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>
    </svg>`;
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode")
  );
  document
    .getElementById("logo")
    .setAttribute(
      "src",
      localStorage.getItem("darkMode") === "true"
        ? "src/img/cagatayuresin-logo-w.png"
        : "src/img/cagatayuresin-logo.png"
    );
  updateThemeIcon();
});

function setLogo() {
  const imagePlaceholder = document.getElementById("imagePlaceholder");

  const imgElement = document.createElement("img");
  imgElement.id = "logo"; // ID ekliyoruz
  imgElement.src =
    localStorage.getItem("darkMode") === "true"
      ? "src/img/cagatayuresin-logo-w.png"
      : "src/img/cagatayuresin-logo.png";
  imgElement.alt = "Logo"; 
  imgElement.style.maxWidth = "60px"; 

  // Yeni resmi hedef bölgeye ekliyoruz
  imagePlaceholder.appendChild(imgElement);
}

// Apply saved theme
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}
updateThemeIcon();
setLogo();