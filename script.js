// =========================
// 1. TEMA (DARK/LIGHT MODE) | THEME (DARK/LIGHT MODE)
// =========================

const themeToggle = document.getElementById("theme-toggle");
const userPref = localStorage.getItem("theme");

// Aplica o tema salvo ou o preferido do sistema
// Apply saved theme or system preference
if (userPref) {
  document.body.classList.add(userPref);
  themeToggle.checked = userPref === "dark-mode";
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.add(prefersDark ? "dark-mode" : "light-mode");
  themeToggle.checked = prefersDark;
}

// Alterna entre dark e light mode
// Toggle between dark and light mode
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.replace("light-mode", "dark-mode");
    localStorage.setItem("theme", "dark-mode");
  } else {
    document.body.classList.replace("dark-mode", "light-mode");
    localStorage.setItem("theme", "light-mode");
  }
});

// =========================
// 2. TABELA DE DISPONIBILIDADE | AVAILABILITY TABLE
// =========================

const cells = document.querySelectorAll("td");

// --- Popup para seleção de disponibilidade ---
// --- Popup for selecting availability ---
const popup = document.getElementById("popup");
const popupButtons = popup.querySelectorAll("button");
let activeCell = null;

// Exibe o popup na posição do clique
// Show popup at click position
function showPopup(cell, x, y) {
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.transform = "translateX(-35%)";
  popup.classList.remove("hidden");
  activeCell = cell;
}

// Aplica e salva a disponibilidade escolhida
// Apply and save selected availability
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

// Eventos dos botões do popup
// Popup button events
popupButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.getAttribute("data-value");
    applyAvailability(activeCell, value);
    popup.classList.add("hidden");
  });
});

// Mostra popup ao clicar em uma célula da tabela
// Show popup when clicking a table cell
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

// Restaura disponibilidade salva nas células
// Restore saved availability in cells
cells.forEach((cell, index) => {
  const saved = localStorage.getItem(`cell-${index}`);
  if (saved) {
    cell.classList.add(`available-${saved}`);
  }
});

// Esconde popup ao clicar fora dele
// Hide popup when clicking outside
document.addEventListener("click", (e) => {
  if (!popup.contains(e.target) && !e.target.matches("td")) {
    popup.classList.add("hidden");
  }
});

// =========================
// 3. EDIÇÃO DOS HORÁRIOS | TIME EDITING
// =========================

// Seleciona todos os <th> com .time-label
// Select all <th> with .time-label
const allTimeCells = Array.from(document.querySelectorAll("th.time")).filter(
  (cell) => cell.querySelector(".time-label")
);

// Atualiza todos os horários a partir de um novo valor base
// Update all times from a new base value
function updateAllTimes(baseTime, index) {
  const allTimeCells = getAllTimeCells();
  for (let i = 0; i < allTimeCells.length; i++) {
    const offset = i - index;
    const newTime = addHoursToTime(baseTime, offset);
    allTimeCells[i].querySelector(".time-label").textContent =
      formatTime(newTime);
  }
}

// Permite editar o horário clicando no label
// Allow editing time by clicking the label
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

// Valida formato de hora "08:00 AM"
// Validate time format "08:00 AM"
function isValidTime(str) {
  return /^([0]?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(str);
}

// Adiciona horas a um horário base e retorna Date
// Add hours to a base time and return Date
function addHoursToTime(baseTimeStr, offset) {
  const [time, modifier] = baseTimeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

  const base = new Date(2000, 0, 1, hours, minutes);
  base.setMinutes(base.getMinutes() + offset * 60);
  return base;
}

// Formata Date para "08:00 AM"
// Format Date to "08:00 AM"
function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

// Botões para subir/descer horário
// Buttons to increase/decrease time
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

// =========================
// 4. BOTÕES DE RESET E EXPORTAÇÃO | RESET AND EXPORT BUTTONS
// =========================

// Limpa todas as seleções da tabela
// Clear all table selections
document.getElementById("reset-button").addEventListener("click", () => {
  if (!confirm("Are you sure you want to reset the entire table?")) {
    return;
  }
  // Limpa seleções
  const allCells = document.querySelectorAll("td");
  allCells.forEach((cell, index) => {
    cell.classList.remove(
      "available-campusA",
      "available-campusB",
      "available-campusC"
    );
    localStorage.removeItem(`cell-${index}`);
  });

  // Remove linhas extras
  const tbody = table.querySelector("tbody");
  while (tbody.rows.length > 5) {
    tbody.deleteRow(tbody.rows.length - 1);
  }

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

  updateAddRowBtnState();
});

// Exporta a tabela como PNG
// Export table as PNG
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

// =========================
// 5. PERSONALIZAÇÃO DE CORES | COLOR CUSTOMIZATION
// =========================

// Seletores dos blocos de cor e do color picker
// Select color blocks and color picker
const colorBlocks = document.querySelectorAll(".color-block");
const colorPicker = document.getElementById("color-picker");

let lastColorBlock = null;

colorBlocks.forEach((block) => {
  block.addEventListener("click", () => {
    lastColorBlock = block; // Salva referência do bloco clicado
    const rect = block.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    const currentColor = getComputedStyle(block).backgroundColor;
    colorPicker.value = rgbToHex(currentColor);

    // Posiciona o color picker acima do bloco clicado
    // Position color picker above the clicked block
    colorPicker.style.left = `${
      rect.left + scrollLeft + rect.width / 2 - 16
    }px`; // 16 = metade da largura do picker (2rem)
    colorPicker.style.top = `${rect.top + scrollTop - 30}px`; // aparece acima | appears above

    colorPicker.classList.add("active");
    colorPicker.dataset.target = block.dataset.var;

    // Abre o seletor automaticamente
    // Open the color picker automatically
    setTimeout(() => {
      colorPicker.click();
    }, 10);
  });

  // Clique já está implementado
  block.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      lastColorBlock = block; // Salva referência do bloco ativado por teclado
      block.click();
      e.preventDefault();
    }
  });
});

colorPicker.addEventListener("change", (e) => {
  const targetVar = e.target.dataset.target;
  document.documentElement.style.setProperty(targetVar, e.target.value);
  // Atualiza visual do bloco imediatamente
  // Immediately update the color block's visual
  document.querySelector(
    `.color-block[data-var="${targetVar}"]`
  ).style.backgroundColor = e.target.value;
  colorPicker.classList.remove("active");
  // Devolve o foco ao bloco de cor
  if (lastColorBlock) lastColorBlock.focus();
});

colorPicker.addEventListener("blur", () => {
  colorPicker.classList.remove("active");
  // Devolve o foco ao bloco de cor (caso o usuário cancele o seletor)
  if (lastColorBlock) lastColorBlock.focus();
});

// Converte RGB para hexadecimal
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

// Restaura as cores personalizadas salvas
// Restore saved custom colors for color blocks
["--color1", "--color2", "--color3"].forEach((varName) => {
  const saved = localStorage.getItem(varName);
  if (saved) {
    document.documentElement.style.setProperty(varName, saved);
    // Atualiza visual do bloco imediatamente ao carregar
    // Immediately update the color block's visual on load
    const block = document.querySelector(`.color-block[data-var="${varName}"]`);
    if (block) block.style.backgroundColor = saved;
  }
});

// =========================
// 6. EDIÇÃO DOS NOMES DAS CORES | COLOR LABEL EDITING
// =========================

const labelButtons = document.querySelectorAll(".legend-button");

labelButtons.forEach((button) => {
  const key = button.dataset.key;
  const saved = localStorage.getItem(key);
  if (saved) button.textContent = saved;

  // Envolve o botão com uma div de alinhamento
  // Wrap the button with an alignment div
  const wrapper = document.createElement("div");
  wrapper.className = "legend-button-wrapper";

  // Substitui o botão pelo wrapper (mantendo na mesma posição)
  // Replace the button with the wrapper (keeping the same position)
  const parent = button.parentElement;
  parent.replaceChild(wrapper, button);
  wrapper.appendChild(button);

  // Cria o ícone de edição
  // Create the edit icon
  const editIcon = document.createElement("div");
  editIcon.className = "edit-icon";
  editIcon.textContent = "✏️";

  // Adiciona o ícone depois do wrapper
  // Add the icon after the wrapper
  parent.appendChild(editIcon);

  // Evento de clique para edição
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

        // Atualiza o texto do botão do popup correspondente
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

// Sincroniza nomes personalizados nos botões do popup ao carregar
["label1", "label2", "label3"].forEach((key) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    const popupBtn = document.querySelector(`.popup button[data-key="${key}"]`);
    if (popupBtn) popupBtn.textContent = saved;
  }
});

// Verifica se a cor é escura (retorna true para escura)
// Check if color is dark (returns true for dark)
function isDarkColor(rgb) {
  // Aceita rgb(r,g,b) ou #hex
  let r, g, b;
  if (rgb.startsWith("#")) {
    const hex = rgb.replace("#", "");
    r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  } else {
    [r, g, b] = rgb.match(/\d+/g).map(Number);
  }
  // Luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// Atualiza a cor da fonte do botão da legenda conforme o fundo
// Update legend button text color based on background
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

  // Atualiza cor da fonte do botão
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

// =========================
// 7. ADICIONAR LINHAS À TABELA | ADD ROWS TO TABLE
// =========================

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

  // Cria nova linha
  const tr = document.createElement("tr");

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

  // Eventos dos botões
  upBtn.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), -1);
    updateAllTimes(formatTime(newTime), tbody.rows.length - 1);
  });
  downBtn.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), 1);
    updateAllTimes(formatTime(newTime), tbody.rows.length - 1);
  });

  // Aqui você deve adicionar os mesmos eventos de popup, edição de horário, etc.
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

// Função para anexar eventos de botão de horário
// Function to attach time button events
function attachTimeButtonEvents() {
  getAllTimeCells().forEach((cell, index) => {
    const label = cell.querySelector(".time-label");
    const up = cell.querySelector(".up");
    const down = cell.querySelector(".down");

    // Remove eventos antigos para evitar múltiplos triggers
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

// Chame ao carregar a página
updateAddRowBtnState();

// =========================
// FUNÇÃO AUXILIAR PARA OBTER TODAS AS CÉLULAS DE HORÁRIO
// AUXILIARY FUNCTION TO GET ALL TIME CELLS
// =========================
function getAllTimeCells() {
  return Array.from(document.querySelectorAll("th.time")).filter((cell) =>
    cell.querySelector(".time-label")
  );
}

// =========================
// 8. ADICIONAR NOTAS ÀS CÉLULAS | ADD NOTES TO CELLS
// =========================

document.querySelectorAll("td").forEach((cell, idx) => {
  cell.addEventListener("dblclick", () => {
    let note = localStorage.getItem(`note-${idx}`) || "";
    const input = document.createElement("input");
    input.type = "text";
    input.value = note;
    input.className = "cell-note-input";
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

  // Exibe nota salva ao carregar
  const note = localStorage.getItem(`note-${idx}`);
  if (note) cell.setAttribute("data-note", note);
});

// =========================
// ATALHOS DE TECLADO
// KEYBOARD SHORTCUTS
// =========================

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    document.getElementById("add-row-btn").click();
  }
  // Ctrl+Shift+R para resetar (não conflita com recarregar)
  if (e.ctrlKey && e.shiftKey && (e.key === "r" || e.key === "R")) {
    document.getElementById("reset-button").click();
    e.preventDefault();
  }
  // Alternativa: Alt+R
  // if (e.altKey && (e.key === "r" || e.key === "R")) {
  //   document.getElementById("reset-button").click();
  //   e.preventDefault();
  // }
});
