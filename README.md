# Availability Table

A customizable and interactive availability table for scheduling, campus management, or team planning.  
Easily manage, color, and annotate time slots for different locations or purposes.

---

## 📘 Project Background

This project was originally inspired by a freeCodeCamp CSS variables challenge.  
Using the final result from that task, I decided to extend it into a fully interactive scheduling table — adding dynamic functionality, accessibility, and real-time customization.

---

## Features

- Dark/Light Mode: Toggle between light and dark themes.
- Customizable Colors: Pick custom colors for each campus/label block.
- Editable Labels: Rename labels according to your needs.
- Interactive Table: Click or tap cells to assign availability.
- Add/Remove Rows: Dynamically add up to 12 rows with custom times.
- Time Editing: Adjust each row's time via inline text or buttons.
- Notes per Cell: Double-click any cell to add a short note.
- Keyboard Shortcuts:
  - `Ctrl + Enter`: Add a new row
  - `Ctrl + Shift + R`: Reset the table
- Responsive Design: Works well on both desktop and mobile devices.
- Export as PNG: Capture the full table as an image.
- Accessibility:
  - Keyboard support
  - ARIA labels and roles
  - Visible focus states

---

## How to Use

1. **Set Availability**: Click a cell to choose availability status.
2. **Edit Time**: Click or use the arrows next to each time label.
3. **Customize Colors**: Click a color block in the legend to pick a new color.
4. **Rename Labels**: Use the pencil icon below each label to rename it.
5. **Add Notes**: Double-click any table cell to add a note.
6. **Add Row**: Click the "Add Row" button (up to 12 rows).
7. **Reset Table**: Use the "Reset" button to clear all content.
8. **Export**: Save the table as an image using the "Export as PNG" button.
9. **Switch Theme**: Use the toggle at the top of the screen.

---

## Keyboard Shortcuts

| Action        | Shortcut         |
|---------------|------------------|
| Add Row       | Ctrl + Enter     |
| Reset Table   | Ctrl + Shift + R |

---

## Accessibility

- All interactive elements are keyboard-accessible.
- ARIA labels and roles enhance screen reader compatibility.
- Visual focus indicators improve usability.

---

## Developer Notes

- All JavaScript code is **organized and commented in English and Portuguese**.
- Comments are structured by **sections**, helping you follow the logic step-by-step:
  - Section 1: Theme Switching
  - Section 2: Cell Interaction
  - Section 3: LocalStorage
  - Section 4: Time Management
  - Section 5: Export
  - Section 6: Label Editing
  - (and so on…)

This structure makes it easier for learners and collaborators to understand and modify the project.

---

## Tech Stack

- HTML5
- CSS3 (with CSS custom properties and responsive design)
- Vanilla JavaScript
- html2canvas (for PNG export)

---

## Screenshots

### Light Mode
![Availability Table - Light Mode](./@assets/screenshot-light.png)

### Dark Mode
![Availability Table - Dark Mode](./@assets/screenshot-dark.png)
