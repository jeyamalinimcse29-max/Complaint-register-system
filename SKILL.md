# SKILL.md — Public Toilet Cleaning & Complaint Register

## Project Overview

A web-based register that records each cleaning visit and each complaint against a toilet block, showing the supervisor which blocks have gone longest without cleaning and which are generating repeated complaints. Built with React, loaded from a plain JSON file.

---

## Tools & Technologies Used

### Frontend Framework
| Tool | Version | Purpose |
|------|---------|---------|
| **React** | 18.2.0 | UI component library for building interactive interfaces |
| **ReactDOM** | 18.2.0 | Renders React components to the DOM |

### Languages
| Language | Purpose |
|----------|---------|
| **JavaScript (ES6+)** | Core logic, state management, event handling, animations |
| **HTML5** | Semantic markup, accessibility (ARIA labels) |
| **CSS3** | Styling, animations (keyframes, transitions), responsive design, dark theme |

### Build Tool
| Tool | Purpose |
|------|---------|
| **React Scripts (Create React App)** | Project scaffolding, development server, production build |
| **npm** | Package manager for dependencies |

### Data Format
| Format | Purpose |
|--------|---------|
| **JSON** | Store sample dataset (46 records), loaded via fetch API |

---

## Key React Concepts Used

### 1. **useState Hook**
- Manages component state for records, loading, error, search term, filters, sort, selected record, pagination, theme, and toast notifications
```js
const [records, setRecords] = useState([]);
const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
```

### 2. **useEffect Hook**
- Loads JSON data on mount, syncs theme with DOM and localStorage, resets pagination when filters change
```js
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);
```

### 3. **useMemo Hook**
- Memoizes filtered/sorted records, stats computation, and block priority data
```js
const filteredRecords = useMemo(() => {
  return records.filter(record => { /* filter logic */ });
}, [records, searchTerm, statusFilter, cleanerFilter]);
```

### 4. **useCallback Hook**
- Memoizes event handlers (record click, sort, page change, clear filters, export)
```js
const handleRecordClick = useCallback((record) => {
  setSelectedRecord(record);
}, []);
```

### 5. **Props & Component Composition**
- Parent-child data flow via props through 4 child components:
  - **SearchFilter** — search input, dropdown filters, filter chips, action buttons, suggestions
  - **RecordList** — paginated table with search highlighting
  - **RecordDetail** — slide-in panel with block stats and history
  - **Dashboard** — stat cards, bar charts, cleaning priority table, attention blocks

---

## CSS Features Used

| Feature | Purpose |
|---------|---------|
| **CSS Variables** | Theme colors, shadows, transitions — swapped entirely for dark mode via `[data-theme="dark"]` |
| **Flexbox & Grid** | Layout for cards, stats, header, record list, dashboard charts |
| **Backdrop Filter** | Glass morphism effect (blur + transparency) |
| **CSS Keyframes** | fadeInUp, slideDown, slideInRight, shake, shimmer, cleaningSweep, mopLine, countFadeIn |
| **Media Queries** | Responsive at 900px, 768px, 600px, 480px breakpoints |
| **Transitions** | Hover effects, smooth state changes, transform transitions |
| **Gradient Backgrounds** | Header gradient, stat badge gradients, action buttons |
| **Pseudo-elements** | `::before`/`::after` for cleaning sweep animation, mop line, record row accents |

---

## JavaScript Features Used

| Feature | Purpose |
|---------|---------|
| **ES6 Arrow Functions** | Concise function syntax |
| **Template Literals** | Dynamic string interpolation |
| **Destructuring** | Extract props and object properties |
| **Spread Operator** | Clone arrays for sorting |
| **Async/Await** | Handle data fetching |
| **Date API** | Calculate days since last cleaning |
| **CSV Export** | Generate downloadable CSV via Blob API |
| **localStorage** | Persist dark/light theme preference |
| **requestAnimationFrame** | Smooth animated counter (counts up from 0) |

---

## API Methods Used

| Method | Purpose |
|--------|---------|
| `fetch()` | Load JSON data from `/data.json` |
| `toLocaleDateString()` | Format dates in Indian English format |
| `Array.filter()` | Filter records by search/status/cleaner |
| `Array.sort()` | Sort records by date/ID/block |
| `Array.map()` | Transform data for display |
| `Array.reduce()` | Calculate statistics |
| `new Set()` | Get unique cleaner names |
| `Blob` + `URL.createObjectURL()` | Generate CSV download |
| `performance.now()` | Drive requestAnimationFrame counter |

---

## Features Implemented

### Task 1: Sample Data
- 46 records with 8 fields each: record_id, block_id, location, cleaning_date, cleaner, complaint_text, complaint_date, status
- Field definitions documented in `data.json`
- **Awkward cases:**
  - Missing values: null cleaning_date (REC043), null complaint_text (REC002, REC006, etc.)
  - Similar names: "Rajesh Kumar" (REC001) vs "Rajesh Kumari" (REC045) — tests search precision
  - Isolated record: REC043 (no cleaning history, only a complaint, cleaner "Unknown")

### Task 2: Main Screen
- Live search (instant filtering on keystroke via onChange)
- Status filter + Cleaner filter
- **Filter chips** — clickable pills with counts (All, Pending, Resolved, Cleaned)
- Record count with "X of Y total" display
- **Search highlighting** — matched terms highlighted in yellow in results
- **Clear Filters** button appears when any filter is active
- **Pagination** — 10 records per page, full page navigation (first/prev/next/last + page numbers)
- **Sort by** dropdown (Cleaning Date, Complaint Date, Record ID, Block ID)

### Detail View (Slide-in Panel)
- Animated overlay panel slides in from right
- Quick stats bar: days since last cleaning, total cleanings, total complaints, complaint rate
- Stats grid: days since last cleaning (highlighted), total cleanings, complaints, pending/resolved, avg days between
- Current record card with all fields
- Block history table with all records for the same block

### Dashboard
- 4 stat cards with SVG icons: Total Records, Pending, Resolved, Cleaned
- **Status Distribution** horizontal bar chart
- **Cleaner Performance** bar chart (cleanings per cleaner)
- **Blocks Needing Attention** — blocks where complaints exceed cleanings
- **Cleaning Priority Table** — all blocks sorted by days since last cleaning (most urgent first), color-coded: critical (red, >14d), warning (amber, >7d), ok (green)

### Header
- **Cleaning sweep animation** — light streak glides across the header (3.5s loop)
- **Mop line animation** — highlight slides along the bottom edge (2.5s alternate)
- **Animated stat counters** — numbers count up from 0 with fade+scale on load
- Dark/light theme toggle button (persisted to localStorage)

### Screen States
- **Skeleton loading** — shimmer placeholder cards while data loads
- **Empty state** — search icon + message when no records match
- **Error state** — red alert with icon, message, and retry button
- **Mobile-responsive** — adaptive grid, hidden columns on small screens
- **Touch-friendly** — larger tap targets on touch devices

### Additional Features
- CSV export with all visible fields
- Refresh button
- Toast notifications (success, error, info) with slide-in animation
- Keyboard navigation on record list (Enter/Space to open detail)

---

## How to Run

```bash
npm install      # Install dependencies
npm start        # Start dev server (http://localhost:3000)
npm run build    # Production build (outputs to build/)
```

---

## Common Interview Questions & Answers

### Q: Why React over vanilla JS?
**A:** Component-based architecture, virtual DOM for performance, easy state management with hooks (useState, useEffect, useMemo, useCallback).

### Q: How does the search work without a button?
**A:** The `onChange` event on the input updates state on every keystroke, triggering re-filtering via useMemo. The same logic powers autocomplete suggestions for Record ID, Block, Location, Cleaner, and Complaint text.

### Q: How is the dark theme implemented?
**A:** A `data-theme` attribute on `<html>` toggles CSS variables. All colors, shadows, and backgrounds are defined as CSS custom properties that swap entirely in `[data-theme="dark"]`. Preference is saved to localStorage.

### Q: How does the cleaning priority table work?
**A:** For each block, the app calculates the most recent cleaning date, then computes `daysSinceLastCleaning`. Blocks are sorted descending (longest first). Color coding: red if >14 days, amber if >7 days, green otherwise.

### Q: How does the animated counter work?
**A:** `requestAnimationFrame` drives a smooth count-up from 0 to the target value over ~700ms using cubic ease-out timing. Each header stat independently animates on page load.

### Q: How is the data structured and loaded?
**A:** A static `data.json` file with a `records` array and a `field_definitions` object is fetched via `fetch('/data.json')` on mount. No backend or database needed.

### Q: How do you handle mobile responsiveness?
**A:** CSS media queries at 900px, 768px, 600px, and 480px progressively collapse multi-column layouts to single columns, hide less important columns, and adjust font sizes and tap targets.

### Q: How does the slide-in detail panel work?
**A:** Clicking a record sets `selectedRecord` state, which renders a fixed overlay (`detail-overlay`) with a right-aligned panel (`detail-panel`). CSS animation `panelSlideIn` uses cubic-bezier for a smooth slide. Clicking the overlay or close button dismisses it.

### Q: What happens when data has null values?
**A:** Null cleaning_dates show as "-" in the list, "Not recorded" in detail. Null complaint_text shows "No complaint" in the list, "No complaint recorded" in detail. Blocks with no cleaning date appear at the bottom of the priority table with "N/A" and a critical indicator.

---

## File Structure

```
SIH ass/
├── public/
│   └── index.html            # HTML entry point
├── src/
│   ├── index.js              # React entry point
│   ├── App.js                # Main component (state, filters, pagination, theme)
│   ├── App.css               # All styles (~1850 lines)
│   └── components/
│       ├── SearchFilter.js   # Search, dropdowns, filter chips, suggestions
│       ├── RecordList.js     # Paginated record table, search highlighting
│       ├── RecordDetail.js   # Slide-in panel with stats, card, block history
│       └── Dashboard.js      # Stat cards, charts, cleaning priority table
├── data.json                 # Sample dataset (46 records + field definitions)
├── package.json              # Dependencies and scripts
├── SKILL.md                  # This file
└── README.md                 # Basic documentation
```
