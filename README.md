# Public Toilet Cleaning and Complaint Register

## Problem
Public toilet blocks are cleaned on a schedule that nobody records, and complaints about their condition are made verbally. The supervising officer cannot tell which blocks were actually cleaned, which generate the most complaints, or whether a complaint led to any action.

## Solution
A web-based register that records each cleaning visit and each complaint against a block, showing the supervisor which blocks have gone longest without cleaning and which are generating repeated complaints.

## How to Run

1. Ensure you have Node.js installed (version 14 or higher)
2. Open a terminal in this directory
3. Run: `npm install`
4. Run: `npm start`
5. Open http://localhost:3000 in your browser

## Screenshots

![Main List](Screenshot%20and%20video/Screenshot%202026-07-26%20164036.png)
*Main screen showing the record list with search, filters, and status badges*

![Detail View](Screenshot%20and%20video/Screenshot%202026-07-26%20164053.png)
*Detail panel with derived statistics prominently displayed at the top*

![Dashboard](Screenshot%20and%20video/Screenshot%202026-07-26%20164102.png)
*Dashboard overview with status distribution, cleaner performance, and cleaning priority*

![Mobile View](Screenshot%20and%20video/Screenshot%202026-07-26%20164120.png)
*Responsive layout working on narrow screens*

## 🎥 Demo Video

<p align="center">
  <a href="https://youtu.be/rmdtfHlzYeQ">
    <img src="https://img.shields.io/badge/Watch%20on%20YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch on YouTube"/>
  </a>
</p>

Walkthrough of the main screen, search/filter, detail view, dashboard, and mobile responsiveness.

## Field Definitions

| Field | Description | Possible Values |
|-------|-------------|-----------------|
| `record_id` | Unique identifier for each cleaning or complaint record | REC001-REC046 |
| `block_id` | Identifier for the toilet block. Used to group records by location | BLOCK-A through BLOCK-X |
| `location` | Name or description of where the toilet block is situated | Market Square, Railway Station, Bus Stand, etc. |
| `cleaning_date` | Date when the block was cleaned | YYYY-MM-DD format, may be null if not recorded |
| `cleaner` | Name of the person who performed the cleaning | Rajesh Kumar, Rajesh Kumari, Suresh Patel, Mohan Singh, Unknown |
| `complaint_text` | Description of the complaint received | Free text, null if no complaint was made |
| `complaint_date` | Date when the complaint was received | YYYY-MM-DD format, null if no complaint |
| `status` | Current status of the record | `cleaned` (no complaint), `pending` (complaint awaiting action), `resolved` (complaint addressed) |

## Derived Figures — Calculation

### Days Since Last Cleaning
`today's date − most recent cleaning_date for the block`
Displayed as a number of days. Shows "N/A" if the block has no cleaning record at all.

### Total Cleanings
Count of records for the block where `cleaning_date` is not null.

### Total Complaints
Count of records for the block where `complaint_text` is not null.

### Pending Complaints
Count of records for the block with `status = "pending"`.

### Resolved Complaints
Count of records for the block with `status = "resolved"`.

### Complaint Rate
`(Total Complaints ÷ Total Cleanings) × 100`
Expressed as a percentage. Shows 0% if there are no cleanings.

### Avg Days Between Cleanings
If a block has 2+ cleaning dates: `(last cleaning date − first cleaning date) ÷ (number of cleanings − 1)`
Rounded to the nearest whole number. Shows "N/A" if fewer than 2 cleanings exist.

### Blocks Needing Attention
Blocks where the number of complaints exceeds the number of cleanings.

### Cleaning Priority
Blocks sorted by days since last cleaning (descending). Classified as:
- **Critical** — more than 14 days since last cleaning, or never cleaned
- **Warning** — 7 to 14 days since last cleaning
- **OK** — fewer than 7 days since last cleaning

## Awkward Test Cases

| Record | Awkwardness | How the App Handles It |
|--------|-------------|------------------------|
| REC043 | Has no `cleaning_date` (missing value) | Shows "-" in the date column and "N/A" for days-since calculations |
| REC044 | Has a `complaint_date` but no `complaint_text` | Shows "No complaint recorded" in the detail view |
| REC045 | Cleaner is "Rajesh Kumari" — very similar to "Rajesh Kumar" | Both names appear in the cleaner filter; search finds both independently |
| REC046 | Same block (BLOCK-X) as REC045, only cleaning record, no complaint | Block history shows one cleaning with a complaint and one without |

## Features

- Live search as you type (searches ID, block, location, cleaner, complaint text)
- Filter by status (all, cleaned, pending, resolved) via chips and dropdown
- Filter by cleaner
- Autocomplete suggestions with type labels while searching
- Record count showing filtered vs total results
- Sort by cleaning date, complaint date, record ID, or block ID
- Detail slide-in panel with derived statistics prominently at the top
- Dashboard with status distribution, cleaner performance bars, and cleaning priority table
- Blocks-needing-attention tags
- Animated count-up numbers in header
- Dark mode toggle
- Mobile-responsive (works on narrow screens without horizontal scroll)
- CSV export of filtered records
- Loading skeleton, empty state, and error state with retry
- Search term highlighting in results
- Pagination with page numbers and navigation

## What is Not Finished

- No persistent storage (data resets on page reload)
- No user authentication or role-based access
- No ability to add, edit, or delete records from the UI
- No charts or graphs for visual analytics (bar-based only)

## Built With

- React 18
- CSS custom properties for theming
