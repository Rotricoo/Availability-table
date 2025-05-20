/* =========================
 * 1. THEME SWITCHING | TROCA DE TEMA
 * =========================
 */

const themeToggle = document.getElementById("theme-toggle");
const userPref = localStorage.getItem("theme");

// Apply saved theme or system preference
// Aplica o tema salvo ou o preferido do sistema
if (userPref) {
  document.body.classList.add(userPref);
  themeToggle.checked = userPref === "dark-mode";
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.add(prefersDark ? "dark-mode" : "light-mode");
  themeToggle.checked = prefersDark;
}

// Toggle between dark and light mode
// Alterna entre dark e light mode
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.replace("light-mode", "dark-mode");
    localStorage.setItem("theme", "dark-mode");
  } else {
    document.body.classList.replace("dark-mode", "light-mode");
    localStorage.setItem("theme", "light-mode");
  }
});

/* =========================
 * 2. TABLE INTERACTION | INTERAÇÃO COM A TABELA
 * =========================
 */

const cells = document.querySelectorAll("td");

// Popup for selecting availability
// Popup para seleção de disponibilidade
const popup = document.getElementById("popup");
const popupButtons = popup.querySelectorAll("button");
let activeCell = null;

// Show popup at click position
// Exibe o popup na posição do clique
function showPopup(cell, x, y) {
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.transform = "translateX(-35%)";
  popup.classList.remove("hidden");
  activeCell = cell;
}

// Apply and save selected availability
// Aplica e salva a disponibilidade escolhida
function applyAvailability(cell, value) {
  cell.classList.remove(
    "available-campusA",
    "available-campusB",
    "available-campusC"
  );
  cell.classList.add(`available-${value}`);
  const index = Array.from(cells).indexOf(cell);
  localStorage.setItem(`cell-${index}`, value);
}

// Popup button events
// Eventos dos botões do popup
popupButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.getAttribute("data-value");
    applyAvailability(activeCell, value);
    popup.classList.add("hidden");
  });
});

// Show popup when clicking a table cell
// Mostra popup ao clicar em uma célula da tabela
cells.forEach((cell) => {
  cell.addEventListener("click", (e) => {
    const rect = cell.getBoundingClientRect();
    showPopup(
      cell,
      rect.left + window.scrollX,
      rect.top + window.scrollY + cell.offsetHeight
    );
  });
});

// Restore saved availability in cells
// Restaura disponibilidade salva nas células
cells.forEach((cell, index) => {
  const saved = localStorage.getItem(`cell-${index}`);
  if (saved) {
    cell.classList.add(`available-${saved}`);
  }
});

// Hide popup when clicking outside
// Esconde popup ao clicar fora dele
document.addEventListener("click", (e) => {
  if (!popup.contains(e.target) && !e.target.matches("td")) {
    popup.classList.add("hidden");
  }
});

/* =========================
 * 3. TIME MANAGEMENT | GESTÃO DE HORÁRIOS
 * =========================
 */

// Get all <th> with .time-label
// Seleciona todos os <th> com .time-label
const allTimeCells = Array.from(document.querySelectorAll("th.time")).filter(
  (cell) => cell.querySelector(".time-label")
);

// Update all times from a new base value
// Atualiza todos os horários a partir de um novo valor base
function updateAllTimes(baseTime, index) {
  const allTimeCells = getAllTimeCells();
  for (let i = 0; i < allTimeCells.length; i++) {
    const offset = i - index;
    const newTime = addHoursToTime(baseTime, offset);
    allTimeCells[i].querySelector(".time-label").textContent =
      formatTime(newTime);
  }
}

// Allow editing time by clicking the label
// Permite editar o horário clicando no label
allTimeCells.forEach((cell, index) => {
  const label = cell.querySelector(".time-label");

  label.addEventListener("click", () => {
    label.contentEditable = "true";
    label.focus();
  });

  label.addEventListener("blur", () => {
    const newTime = label.textContent.trim();
    if (isValidTime(newTime)) {
      updateAllTimes(newTime, index);
    } else {
      label.textContent = formatTime(new Date(0, 0, 0, 8 + index)); // fallback
    }
    label.contentEditable = "false";
  });
});

// Validate time format "08:00 AM"
// Valida formato de hora "08:00 AM"
function isValidTime(str) {
  return /^([0]?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(str);
}

// Add hours to a base time and return Date
// Adiciona horas a um horário base e retorna Date
function addHoursToTime(baseTimeStr, offset) {
  const [time, modifier] = baseTimeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

  const base = new Date(2000, 0, 1, hours, minutes);
  base.setMinutes(base.getMinutes() + offset * 60);
  return base;
}

// Format Date to "08:00 AM"
// Formata Date para "08:00 AM"
function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

// Buttons to increase/decrease time
// Botões para subir/descer horário
document.querySelectorAll("th.time").forEach((cell, index) => {
  const label = cell.querySelector(".time-label");
  const up = cell.querySelector(".up");
  const down = cell.querySelector(".down");

  up?.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), -1);
    updateAllTimes(formatTime(newTime), index);
  });

  down?.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), 1);
    updateAllTimes(formatTime(newTime), index);
  });
});

/* =========================
 * 4. RESET & EXPORT | RESET E EXPORTAÇÃO
 * =========================
 */

// Clear all table selections
// Limpa todas as seleções da tabela
document.getElementById("reset-button").addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset the entire table?")) {
    return;
  }
  // Clear selections
  // Limpa seleções
  const allCells = document.querySelectorAll("td");
  allCells.forEach((cell, index) => {
    cell.classList.remove(
      "available-campusA",
      "available-campusB",
      "available-campusC"
    );
    localStorage.removeItem(`cell-${index}`);
    // Limpa nota visual e do localStorage
    cell.removeAttribute("data-note");
    localStorage.removeItem(`note-${index}`);
  });

  // Remove extra rows
  // Remove linhas extras
  const tbody = table.querySelector("tbody");
  while (tbody.rows.length > 5) {
    tbody.deleteRow(tbody.rows.length - 1);
  }

  // Restore original times
  // Restaura horários originais
  const baseTimes = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
  ];
  for (let i = 0; i < 5; i++) {
    const th = tbody.rows[i].querySelector(".time-label");
    if (th) th.textContent = baseTimes[i];
  }

  // Restore default labels
  // Restaura nomes padrão dos botões
  const defaultLabels = {
    label1: "Campus A",
    label2: "Campus B",
    label3: "Campus C",
  };

  ["label1", "label2", "label3"].forEach((key) => {
    localStorage.removeItem(key);
    // Update legend button text
    const legendBtn = document.querySelector(
      `.legend-button[data-key="${key}"]`
    );
    if (legendBtn) legendBtn.textContent = defaultLabels[key];
    // Update popup button text
    const popupBtn = document.querySelector(`.popup button[data-key="${key}"]`);
    if (popupBtn) popupBtn.textContent = defaultLabels[key];
  });

  updateAddRowBtnState();
});

// Export table as PNG
// Exporta a tabela como PNG
document.getElementById("export-button").addEventListener("click", () => {
  html2canvas(document.getElementById("capture-area"), {
    backgroundColor: "#1e5511",
    scale: 2,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "availability-table.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

/* =========================
 * 5. COLOR CUSTOMIZATION | PERSONALIZAÇÃO DE CORES
 * =========================
 */

const colorBlocks = document.querySelectorAll(".color-block");
const colorPicker = document.getElementById("color-picker");

let lastColorBlock = null;

colorBlocks.forEach((block) => {
  block.addEventListener("click", (event) => {
    // Only open color picker if not clicking the edit icon
    // Só abre o seletor se não clicar no ícone do lápis
    if (event.target.closest(".edit-icon")) {
      return;
    }

    // Open color picker at block position
    // Abre o seletor de cor ao clicar no bloco
    const rect = block.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    const currentColor = getComputedStyle(block).backgroundColor;
    colorPicker.value = rgbToHex(currentColor);

    colorPicker.style.left = `${
      rect.left + scrollLeft + rect.width / 2 - 16
    }px`;
    colorPicker.style.top = `${rect.top + scrollTop - 30}px`;

    colorPicker.classList.add("active");
    colorPicker.dataset.target = block.dataset.var;

    setTimeout(() => {
      colorPicker.click();
    }, 10);
  });

  block.addEventListener("keydown", (e) => {
    if (
      (e.key === "Enter" || e.key === " ") &&
      document.activeElement === block
    ) {
      lastColorBlock = block;
      block.click();
      e.preventDefault();
    }
  });
});

colorPicker.addEventListener("change", (e) => {
  const targetVar = e.target.dataset.target;
  document.documentElement.style.setProperty(targetVar, e.target.value);
  // Update color block visual immediately
  document.querySelector(
    `.color-block[data-var="${targetVar}"]`
  ).style.backgroundColor = e.target.value;
  colorPicker.classList.remove("active");
  // Return focus to color block
  if (lastColorBlock) lastColorBlock.focus();
});

colorPicker.addEventListener("blur", () => {
  colorPicker.classList.remove("active");
  if (lastColorBlock) lastColorBlock.focus();
});

// Convert RGB to hexadecimal
function rgbToHex(rgb) {
  if (rgb.startsWith("#")) return rgb;
  const result = rgb.match(/\d+/g);
  if (!result) return "#ffffff";
  return (
    "#" +
    result
      .slice(0, 3)
      .map((c) => parseInt(c).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Restore saved custom colors for color blocks
["--color1", "--color2", "--color3"].forEach((varName) => {
  const saved = localStorage.getItem(varName);
  if (saved) {
    document.documentElement.style.setProperty(varName, saved);
    const block = document.querySelector(`.color-block[data-var="${varName}"]`);
    if (block) block.style.backgroundColor = saved;
  }
});

/* =========================
 * 6. LABEL EDITING | EDIÇÃO DE RÓTULOS
 * =========================
 */

const labelButtons = document.querySelectorAll(".legend-button");

labelButtons.forEach((button) => {
  const key = button.dataset.key;
  const saved = localStorage.getItem(key);
  if (saved) button.textContent = saved;

  // Wrap the button with an alignment div
  const wrapper = document.createElement("div");
  wrapper.className = "legend-button-wrapper";

  // Replace the button with the wrapper (keeping the same position)
  const parent = button.parentElement;
  parent.replaceChild(wrapper, button);
  wrapper.appendChild(button);

  // Create the edit icon
  const editIcon = document.createElement("div");
  editIcon.className = "edit-icon";
  editIcon.textContent = "✏️";

  // Add the icon after the wrapper
  parent.appendChild(editIcon);

  // Click event for editing
  editIcon.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "legend-edit-input";
    input.value = button.textContent;
    input.maxLength = 18;

    wrapper.style.display = "none";
    editIcon.style.display = "none";

    parent.appendChild(input);
    input.focus();

    input.addEventListener("blur", () => {
      const newName = input.value.trim();
      if (newName !== "") {
        button.textContent = newName;
        localStorage.setItem(key, newName);

        // Update popup button text
        const popupBtn = document.querySelector(
          `.popup button[data-key="${key}"]`
        );
        if (popupBtn) popupBtn.textContent = newName;
      }
      input.remove();
      wrapper.style.display = "flex";
      editIcon.style.display = "block";
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });
  });
});

// Sync custom label names in popup buttons on load
["label1", "label2", "label3"].forEach((key) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    const popupBtn = document.querySelector(`.popup button[data-key="${key}"]`);
    if (popupBtn) popupBtn.textContent = saved;
  }
});

// Check if color is dark (returns true for dark)
// Verifica se a cor é escura (retorna true para escura)
function isDarkColor(rgb) {
  let r, g, b;
  if (rgb.startsWith("#")) {
    const hex = rgb.replace("#", "");
    r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  } else {
    [r, g, b] = rgb.match(/\d+/g).map(Number);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// Update legend button text color based on background
// Atualiza a cor da fonte do botão da legenda conforme o fundo
function updateLegendButtonTextColor(block) {
  const btn = block.querySelector(".legend-button");
  const bg = getComputedStyle(block).backgroundColor;
  if (isDarkColor(bg)) {
    btn.style.color = "#fff";
  } else {
    btn.style.color = "var(--color-text)";
  }
}

colorPicker.addEventListener("change", (e) => {
  const targetVar = e.target.dataset.target;
  document.documentElement.style.setProperty(targetVar, e.target.value);
  localStorage.setItem(targetVar, e.target.value);

  const block = document.querySelector(`.color-block[data-var="${targetVar}"]`);
  block.style.backgroundColor = e.target.value;

  // Update legend button text color
  updateLegendButtonTextColor(block);

  colorPicker.classList.remove("active");
});

["--color1", "--color2", "--color3"].forEach((varName) => {
  const saved = localStorage.getItem(varName);
  if (saved) {
    document.documentElement.style.setProperty(varName, saved);
    const block = document.querySelector(`.color-block[data-var="${varName}"]`);
    if (block) {
      block.style.backgroundColor = saved;
      updateLegendButtonTextColor(block);
    }
  }
});

/* =========================
 * 7. ROW MANAGEMENT | GESTÃO DE LINHAS
 * =========================
 */

const table = document.querySelector("table");
const addRowBtn = document.getElementById("add-row-btn");

function updateAddRowBtnState() {
  const tbody = table.querySelector("tbody");
  addRowBtn.disabled = tbody.rows.length >= 12;
  addRowBtn.style.opacity = addRowBtn.disabled ? "0.3" : "1";
  addRowBtn.style.cursor = addRowBtn.disabled ? "not-allowed" : "pointer";
}

addRowBtn.addEventListener("click", () => {
  const tbody = table.querySelector("tbody");
  if (tbody.rows.length >= 12) return;

  // Create new row
  // Cria nova linha
  const tr = document.createElement("tr");

  // Create time cell
  // Cria th do horário
  const th = document.createElement("th");
  th.className = "time";
  const label = document.createElement("span");
  label.className = "time-label";

  const lastRow = tbody.rows[tbody.rows.length - 1];
  let nextTime = "08:00 AM";
  if (lastRow) {
    const lastLabel = lastRow.querySelector(".time-label");
    if (lastLabel) {
      nextTime = formatTime(addHoursToTime(lastLabel.textContent.trim(), 1));
    }
  }
  label.textContent = nextTime;

  const upBtn = document.createElement("button");
  upBtn.className = "up";
  upBtn.textContent = "▲";
  const downBtn = document.createElement("button");
  downBtn.className = "down";
  downBtn.textContent = "▼";

  th.appendChild(upBtn);
  th.appendChild(label);
  th.appendChild(downBtn);
  tr.appendChild(th);

  // Create tds for each campus
  // Cria tds para cada campus
  for (let i = 0; i < 5; i++) {
    const td = document.createElement("td");
    td.addEventListener("click", (e) => {
      const rect = td.getBoundingClientRect();
      showPopup(
        td,
        rect.left + window.scrollX,
        rect.top + window.scrollY + td.offsetHeight
      );
    });
    tr.appendChild(td);
  }

  table.querySelector("tbody").appendChild(tr);

  // Time button events
  // Eventos dos botões
  upBtn.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), -1);
    updateAllTimes(formatTime(newTime), tbody.rows.length - 1);
  });
  downBtn.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), 1);
    updateAllTimes(formatTime(newTime), tbody.rows.length - 1);
  });

  // Allow editing time by clicking the label
  label.addEventListener("click", () => {
    label.contentEditable = "true";
    label.focus();
  });
  label.addEventListener("blur", () => {
    const newTime = label.textContent.trim();
    if (isValidTime(newTime)) {
      updateAllTimes(newTime, tbody.rows.length - 1);
    } else {
      label.textContent = nextTime;
    }
    label.contentEditable = "false";
  });

  updateAddRowBtnState();
});

// Attach time button events to all rows
// Função para anexar eventos de botão de horário
function attachTimeButtonEvents() {
  getAllTimeCells().forEach((cell, index) => {
    const label = cell.querySelector(".time-label");
    const up = cell.querySelector(".up");
    const down = cell.querySelector(".down");

    // Remove old events to avoid multiple triggers
    up?.replaceWith(up.cloneNode(true));
    down?.replaceWith(down.cloneNode(true));

    const newUp = cell.querySelector(".up");
    const newDown = cell.querySelector(".down");

    newUp?.addEventListener("click", () => {
      const newTime = addHoursToTime(label.textContent.trim(), -1);
      updateAllTimes(formatTime(newTime), index);
    });

    newDown?.addEventListener("click", () => {
      const newTime = addHoursToTime(label.textContent.trim(), 1);
      updateAllTimes(formatTime(newTime), index);
    });
  });
}

// Call on page load
// Chame ao carregar a página
updateAddRowBtnState();

// Auxiliary function to get all time cells
// FUNÇÃO AUXILIAR PARA OBTER TODAS AS CÉLULAS DE HORÁRIO
function getAllTimeCells() {
  return Array.from(document.querySelectorAll("th.time")).filter((cell) =>
    cell.querySelector(".time-label")
  );
}

/* =========================
 * 8. CELL NOTES | NOTAS NAS CÉLULAS
 * =========================
 */

document.querySelectorAll("td").forEach((cell, idx) => {
  cell.addEventListener("dblclick", () => {
    let note = localStorage.getItem(`note-${idx}`) || "";
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 100;
    input.className = "cell-note-input";
    input.value = note;
    cell.appendChild(input);
    input.focus();

    input.addEventListener("blur", () => {
      note = input.value.trim();
      if (note) {
        localStorage.setItem(`note-${idx}`, note);
        cell.setAttribute("data-note", note);
      } else {
        localStorage.removeItem(`note-${idx}`);
        cell.removeAttribute("data-note");
      }
      input.remove();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });
  });

  // Show saved note on load
  // Exibe nota salva ao carregar
  const note = localStorage.getItem(`note-${idx}`);
  if (note) cell.setAttribute("data-note", note);
});

/* =========================
 * 9. KEYBOARD SHORTCUTS & ACCESSIBILITY | ATALHOS E ACESSIBILIDADE
 * =========================
 */

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    document.getElementById("add-row-btn").click();
  }
  // Ctrl+Shift+R to reset (does not conflict with browser reload)
  // Ctrl+Shift+R para resetar (não conflita com recarregar)
  if (e.ctrlKey && e.shiftKey && (e.key === "r" || e.key === "R")) {
    document.getElementById("reset-button").click();
    e.preventDefault();
  }
  // Alternative: Alt+R
  // Alternativa: Alt+R
  // if (e.altKey && (e.key === "r" || e.key === "R")) {
  //   document.getElementById("reset-button").click();
  //   e.preventDefault();
  // }
});
