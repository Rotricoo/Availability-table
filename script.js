const themeToggle = document.getElementById("theme-toggle");
const userPref = localStorage.getItem("theme");

// If the user has previously selected a theme
if (userPref) {
  document.body.classList.add(userPref);
} else {
  // Otherwise, use the system's color scheme preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.add(prefersDark ? "dark-mode" : "light-mode");
}

themeToggle.addEventListener("click", () => {
  if (document.body.classList.contains("dark-mode")) {
    document.body.classList.replace("dark-mode", "light-mode");
    localStorage.setItem("theme", "light-mode");
  } else {
    document.body.classList.replace("light-mode", "dark-mode");
    localStorage.setItem("theme", "dark-mode");
  }
});

const cells = document.querySelectorAll("td");

const popup = document.getElementById("popup");
const popupButtons = popup.querySelectorAll("button");
let activeCell = null;

// Function to display the popup
function showPopup(cell, x, y) {
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.transform = "translateX(-35%)";
  popup.classList.remove("hidden");
  activeCell = cell;
}

// Function to apply and save the selected availability
function applyAvailability(cell, value) {
  cell.classList.remove(
    "available-free",
    "available-campus1",
    "available-campus2"
  );
  cell.classList.add(`available-${value}`);
  const index = Array.from(cells).indexOf(cell);
  localStorage.setItem(`cell-${index}`, value);
}

// Add event listener to popup buttons
popupButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.getAttribute("data-value");
    applyAvailability(activeCell, value);
    popup.classList.add("hidden");
  });
});

// Show popup when a table cell is clicked
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

cells.forEach((cell, index) => {
  const saved = localStorage.getItem(`cell-${index}`);
  if (saved) {
    cell.classList.add(`available-${saved}`);
  }
});

document.addEventListener("click", (e) => {
  if (!popup.contains(e.target) && !e.target.matches("td")) {
    popup.classList.add("hidden");
  }
});

// Select all <th> elements with class="time" that contain a .time-label
const allTimeCells = Array.from(document.querySelectorAll("th.time")).filter(
  (cell) => cell.querySelector(".time-label")
);

function updateAllTimes(baseTime, index) {
  for (let i = 0; i < allTimeCells.length; i++) {
    const offset = i - index;
    const newTime = addHoursToTime(baseTime, offset);
    allTimeCells[i].querySelector(".time-label").textContent =
      formatTime(newTime);
  }
}

// Make time cells editable and update others based on the new time
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

// Validate time format like "08:00 AM"
function isValidTime(str) {
  return /^([0]?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(str);
}

// Add hours and return a Date object
function addHoursToTime(baseTimeStr, offset) {
  const [time, modifier] = baseTimeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

  const base = new Date(2000, 0, 1, hours, minutes);
  base.setMinutes(base.getMinutes() + offset * 60);
  return base;
}

// Format time as "08:00 AM"
function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

document.querySelectorAll("th.time").forEach((cell, index) => {
  const label = cell.querySelector(".time-label");
  const up = cell.querySelector(".up");
  const down = cell.querySelector(".down");

  up.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), -1);
    updateAllTimes(formatTime(newTime), index);
  });

  down.addEventListener("click", () => {
    const newTime = addHoursToTime(label.textContent.trim(), 1);
    updateAllTimes(formatTime(newTime), index);
  });
});

// Autosave feedback

const saveFeedback = document.createElement("span");
saveFeedback.textContent = "Saved!";
saveFeedback.classList.add("save-feedback");
document.body.appendChild(saveFeedback);
setTimeout(() => saveFeedback.remove(), 1000);

// Reset button
document.getElementById("reset-button").addEventListener("click", () => {
  cells.forEach((cell, index) => {
    cell.classList.remove(
      "available-free",
      "available-campus1",
      "available-campus2"
    );
    localStorage.removeItem(`cell-${index}`);
  });
});

// Button export png

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

// Color changer

const colorBlocks = document.querySelectorAll(".color-block");
const colorPicker = document.getElementById("color-picker");

colorBlocks.forEach((block) => {
  const cssVar = block.dataset.var;
  block.style.backgroundColor = getComputedStyle(
    document.documentElement
  ).getPropertyValue(cssVar);

  block.addEventListener("click", (e) => {
    const cssVar = block.dataset.var;
    const currentColor = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();

    colorPicker.value = rgbToHex(currentColor);
    colorPicker.dataset.target = cssVar;

    const rect = block.getBoundingClientRect();
    colorPicker.style.position = "absolute";
    colorPicker.style.left = `${rect.left + rect.width / 2}px`;
    colorPicker.style.top = `${rect.top + rect.height + window.scrollY}px`;
    colorPicker.style.display = "block";
    colorPicker.style.visibility = "visible";

    colorPicker.focus(); // Focus the picker instead of triggering click
  });
});

// Update color and save on input change
colorPicker.addEventListener("change", (e) => {
  const targetVar = e.target.dataset.target;
  document.documentElement.style.setProperty(targetVar, e.target.value);
  localStorage.setItem(targetVar, e.target.value);

  // Immediately update the color block's visual
  document.querySelector(
    `.color-block[data-var="${targetVar}"]`
  ).style.backgroundColor = e.target.value;

  colorPicker.dataset.target = ""; // clear target after use
});

// Convert RGB to hexadecimal format
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g).map(Number);
  return (
    "#" +
    result
      .slice(0, 3)
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
  );
}

// Restore saved custom colors for color blocks
["--color1", "--color2", "--color3"].forEach((varName) => {
  const saved = localStorage.getItem(varName);
  if (saved) {
    document.documentElement.style.setProperty(varName, saved);
  }
});

colorPicker.addEventListener("blur", () => {
  setTimeout(() => {
    colorPicker.style.display = "none";
  }, 200); // tempo suficiente para permitir um novo clique
});
