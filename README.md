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

## Field Definitions

| Field | Description | Possible Values |
|-------|-------------|-----------------|
| `record_id` | Unique identifier for each record | REC001-REC044 |
| `block_id` | Identifier for the toilet block | BLOCK-A through BLOCK-W |
| `location` | Name/description of block location | Market Square, Railway Station, etc. |
| `cleaning_date` | Date when block was cleaned | YYYY-MM-DD or null |
| `cleaner` | Name of person who cleaned | Rajesh Kumar, Suresh Patel, Mohan Singh, Unknown |
| `complaint_text` | Description of complaint | Text or null |
| `complaint_date` | Date complaint received | YYYY-MM-DD or null |
| `status` | Current status | cleaned, pending, resolved |

## Derived Figures Calculation

- **Days Since Last Cleaning**: Calculated as today's date minus the most recent cleaning_date for the block
- **Total Cleanings**: Count of records with non-null cleaning_date for the block
- **Total Complaints**: Count of records with non-null complaint_text for the block
- **Pending Complaints**: Count of records with status="pending" for the block

## Awkward Test Cases

1. **REC043**: Has no cleaning_date (missing value) - shows "-" in list
2. **REC044**: Has complaint_date but no complaint_text - shows "No complaint recorded" in detail
3. **BLOCK-V and BLOCK-W**: Similar location names that test search functionality

## Features

- Live search as you type (no button press required)
- Filter by status (cleaned, pending, resolved)
- Filter by cleaner
- Record count showing filtered vs total
- Detail view with derived statistics prominently displayed
- Mobile-responsive design
- Handles loading, empty, and error states

## What is Not Finished

- No persistent storage (data resets on page reload)
- No user authentication
- No ability to add/edit/delete records
- No export functionality
- No charts or graphs for visual analytics
