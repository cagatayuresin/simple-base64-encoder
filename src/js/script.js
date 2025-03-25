// Helper: automatically resize textarea height based on content
function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

// Save all row data to localStorage
function saveToLocalStorage() {
  const data = [];
  document.querySelectorAll("[id^=base64-]").forEach((base64El, i) => {
    const plainEl = document.getElementById(`plain-${i}`);
    data.push({
      base64: base64El.value,
      plain: plainEl.value,
    });
  });
  localStorage.setItem("converterData", JSON.stringify(data));
}

// Create a new converter row
function createConverterRow(index, restoreData = null) {
  const row = document.createElement("div");
  row.className = "columns is-vcentered";

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
  copyBtnLeft.innerHTML = '<i class="fa-solid fa-copy"></i>';
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
  clearBtnLeft.innerHTML = '<i class="fa-solid fa-xmark"></i>';
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
  copyBtnRight.innerHTML = '<i class="fa-solid fa-copy"></i>';
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
  clearBtnRight.innerHTML = '<i class="fa-solid fa-xmark"></i>';
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

// Load from localStorage if available
const savedData = JSON.parse(localStorage.getItem("converterData") || "[]");
if (savedData.length > 0) {
  savedData.forEach((data) => {
    const row = createConverterRow(rowCount, data);
    converterRows.appendChild(row);
    rowCount++;
  });
} else {
  for (let i = 0; i < 7; i++) {
    const row = createConverterRow(rowCount);
    converterRows.appendChild(row);
    rowCount++;
  }
}

// Add new row
document.getElementById("addRowButton").addEventListener("click", () => {
  const newRow = createConverterRow(rowCount);
  converterRows.appendChild(newRow);
  rowCount++;
  saveToLocalStorage();
});

// Clear all
document.getElementById("clearAllButton").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all rows?")) {
    localStorage.removeItem("converterData");
    converterRows.innerHTML = "";
    rowCount = 0;
    for (let i = 0; i < 7; i++) {
      const row = createConverterRow(rowCount);
      converterRows.appendChild(row);
      rowCount++;
    }
  }
});

// Theme toggle (with icon change)
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeToggleIcon");

function updateThemeIcon() {
  if (document.body.classList.contains("dark-mode")) {
    themeIcon.className = "fa-solid fa-sun";
  } else {
    themeIcon.className = "fa-solid fa-moon";
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