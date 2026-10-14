# Excel Export Skill

## Purpose

This skill defines how to export structured data into a professional, readable, and production-ready Microsoft Excel `.xlsx` file.

The goal is to make every exported Excel file:

- Professional and visually clean
- Easy to read
- Easy to filter and sort
- Ready for printing
- Suitable for executive reports
- Suitable for operational data
- Consistent in formatting
- Usable without requiring manual formatting after export

---

# 1. General Rules

When the user asks to:

- Export to Excel
- Download as Excel
- Generate `.xlsx`
- Create an Excel report
- Create an Excel table
- Export data to spreadsheet
- Generate an Excel dashboard

The AI MUST generate a real `.xlsx` file.

Do not generate CSV unless the user explicitly requests CSV.

Do not simply dump raw data into Excel.

The exported workbook MUST be formatted professionally.

---

# 2. Workbook Structure

Use multiple worksheets when appropriate.

Recommended structure:

```text
Workbook
│
├── Summary
├── Data
├── Reference
└── README
```

### Summary

Use this sheet when the data is suitable for reporting.

Include:

- Report title
- Report description
- Export date/time
- Total records
- Important summary metrics
- Summary tables
- Charts when useful

### Data

Contains the complete source data.

The Data sheet should normally be the main operational table.

### Reference

Use this sheet for:

- Lookup values
- Dropdown options
- Categories
- Status values
- Supporting data

### README

Use when the workbook is complex.

Explain:

- Purpose
- Data source
- Meaning of important columns
- How to use filters
- Important notes

Do not create unnecessary sheets for simple exports.

---

# 3. Excel Table

The main dataset SHOULD be converted into a real Excel Table.

Example:

```text
Table Name: tblData
```

Requirements:

- Header row
- AutoFilter
- Alternating row style
- Sortable columns
- Structured references when formulas are used

Do not manually simulate a table using only cell borders.

---

# 4. Header Formatting

Headers should be visually distinct.

Recommended:

- Bold text
- Center alignment
- Vertical center
- Appropriate background color
- White or high-contrast text
- Wrap text when necessary

Example:

```text
┌────────────┬──────────────┬─────────┬────────────┐
│ ชื่อ       │ หน่วยงาน     │ จำนวน   │ วันที่     │
├────────────┼──────────────┼─────────┼────────────┤
│ ภพ         │ IT           │ 25      │ 02/10/2026 │
└────────────┴──────────────┴─────────┴────────────┘
```

Avoid excessive colors.

Use a consistent corporate-style color palette.

---

# 5. Column Width

Automatically adjust column widths based on the content.

Rules:

- Do not allow extremely narrow columns.
- Do not allow extremely wide columns.
- Set reasonable maximum widths.
- Wrap long text where appropriate.

Recommended logic:

```text
Column Width =
MAX(header length, longest relevant value length)
```

Then apply reasonable minimum and maximum limits.

For example:

```text
Minimum width: 10
Maximum width: 40
```

Long descriptions should use text wrapping rather than creating extremely wide columns.

---

# 6. Data Type Formatting

Detect and format data types correctly.

## Date

Use:

```text
dd/mm/yyyy
```

Example:

```text
02/10/2026
```

Do not store dates as plain text when a real Excel date value is possible.

---

## DateTime

Use:

```text
dd/mm/yyyy hh:mm
```

Example:

```text
02/10/2026 16:30
```

---

## Currency

Use appropriate thousand separators.

Example:

```text
1,250,000.00
```

For Thai Baht:

```text
฿1,250,000.00
```

Do not add currency symbols to unrelated numeric fields.

---

## Percentage

Use:

```text
0.00%
```

Example:

```text
85.50%
```

---

## Integer

Use:

```text
#,##0
```

Example:

```text
1,250
```

---

## Decimal

Use:

```text
#,##0.00
```

Example:

```text
1,250.50
```

---

# 7. Alignment

Use appropriate alignment based on data type.

### Text

Usually:

```text
Left
```

### Numbers

Usually:

```text
Right
```

### Dates

Usually:

```text
Center
```

### Headers

Usually:

```text
Center
```

Do not center-align every cell by default.

---

# 8. Freeze Panes

For large datasets, freeze the header row.

Example:

```text
Freeze Pane: A2
```

For reports with multiple header rows, freeze below the final header row.

The user should still see column headers while scrolling.

---

# 9. Filters

The main Data sheet SHOULD have filters enabled.

Users should be able to:

- Filter
- Sort
- Search through columns
- Select categories

Use an Excel Table whenever possible because filtering is then built in.

---

# 10. Conditional Formatting

Use conditional formatting when it improves readability.

Examples:

### Status

```text
Success → Green
Pending → Yellow
Failed → Red
Cancelled → Gray
```

### Percentage

Example:

```text
>= 80% → Positive
50%-79% → Warning
< 50% → Attention
```

### Duplicate Data

Highlight duplicate values when duplicate detection is relevant.

Do not use conditional formatting unnecessarily.

---

# 11. Summary Sheet

When the dataset contains meaningful metrics, create a Summary sheet.

Example:

```text
REPORT SUMMARY

Total Records       1,250
Completed             980
Pending               170
Cancelled             100

Completion Rate      78.40%
```

Use clear KPI cards where appropriate.

Example:

```text
┌─────────────────┐
│ TOTAL RECORDS   │
│     1,250       │
└─────────────────┘
```

---

# 12. Charts

Create charts only when they provide useful information.

Suitable charts include:

### Column Chart

For:

- Category comparison
- Monthly totals
- Department comparison

### Pie / Doughnut Chart

For:

- Status distribution
- Category distribution

### Line Chart

For:

- Trends over time
- Monthly growth
- Daily activity

### Bar Chart

For:

- Ranking of categories
- Department comparisons

Do not create charts when the dataset is too small or a chart would not provide meaningful insight.

---

# 13. Summary Formulas

When appropriate, use real Excel formulas instead of hardcoded values.

Examples:

```excel
=SUM(D2:D100)
```

```excel
=COUNT(A2:A100)
```

```excel
=COUNTIF(E2:E100,"Completed")
```

```excel
=AVERAGE(D2:D100)
```

Use formulas when the workbook is expected to remain editable.

---

# 14. Total Row

For numeric datasets, consider adding a Total Row.

Example:

```text
Total Records: 1,250
Total Amount: 2,450,000
```

Use Excel formulas where appropriate.

Do not add totals to columns where summation has no meaningful interpretation.

---

# 15. Report Title

For report-style worksheets, add a clear title.

Example:

```text
รายงานสรุปการลงทะเบียน
Wet Run 2026
```

Recommended structure:

```text
Row 1: Report Title
Row 2: Description
Row 3: Export Date
Row 5+: Table
```

Avoid merging cells unnecessarily.

If merging is used, use it only for report titles or visual presentation.

Do not merge cells inside the main data table.

---

# 16. Thai Language Support

The workbook MUST correctly support Thai characters.

Examples:

```text
ชื่อ
นามสกุล
หน่วยงาน
วันที่สมัคร
จำนวนเงิน
สถานะ
```

Use a Unicode-compatible font.

Recommended:

```text
Aptos
TH Sarabun New
Tahoma
Noto Sans Thai
```

Use one consistent font throughout the workbook unless there is a specific reason to use another.

---

# 17. Print Settings

For report-style Excel files, configure print settings.

Recommended:

```text
Orientation:
Landscape for wide tables
Portrait for narrow tables

Paper:
A4

Fit to Width:
1 page

Repeat Header Rows:
Yes
```

Set print area when appropriate.

Avoid generating a report that prints across many unnecessary pages.

---

# 18. Page Header / Footer

For professional reports, consider adding:

Header:

```text
Organization / Department
```

Footer:

```text
Generated by AI
Page 1 of N
```

If the organization name is provided by the user, use the provided organization name.

Do not invent organization names.

---

# 19. File Naming

Use meaningful filenames.

Recommended format:

```text
<report-name>_<YYYY-MM-DD>.xlsx
```

Example:

```text
wet-run-registration_2026-10-02.xlsx
```

Thai filenames may be used when appropriate, but English filenames are generally preferred for compatibility.

Avoid:

```text
export.xlsx
test.xlsx
new.xlsx
final.xlsx
final-final.xlsx
```

---

# 20. Data Validation

When the workbook is intended for data entry, use Excel Data Validation.

Examples:

### Status

```text
Pending
Approved
Rejected
Cancelled
```

### Gender

```text
Male
Female
Other
```

### Department

Use a dropdown based on the Reference sheet.

Do not hardcode repeated dropdown lists in every cell if a Reference sheet can be used.

---

# 21. Protection

Use worksheet protection only when necessary.

If formulas should not be edited, consider protecting formula cells.

Do not apply passwords unless the user explicitly requests password protection.

---

# 22. Empty / Null Values

Handle empty values consistently.

Preferred:

```text
-
```

or blank cells where appropriate.

Do not output:

```text
null
undefined
NaN
None
```

unless these are actual business values.

---

# 23. Duplicate Data

If duplicate records are detected:

- Do not silently delete them.
- Preserve the original data unless the user explicitly requests deduplication.
- Optionally highlight duplicates.
- If appropriate, add a Summary note indicating the number of duplicates.

---

# 24. Large Datasets

For large datasets:

- Use Excel Tables.
- Freeze header rows.
- Enable filters.
- Avoid excessive formatting on every cell.
- Avoid unnecessary formulas.
- Avoid unnecessary charts.
- Keep workbook performance in mind.

If the dataset is extremely large, consider splitting logically into multiple sheets.

---

# 25. Security

Do not expose sensitive information unnecessarily.

Before exporting, consider whether the dataset contains:

- Passwords
- Access tokens
- API keys
- Secret keys
- Personal identification numbers
- Private credentials
- Internal security information

Never include secrets in an exported Excel file unless the user explicitly requests it and the context permits it.

---

# 26. Final Validation

Before delivering the `.xlsx` file, validate:

### Structure

- [ ] Workbook opens successfully
- [ ] Correct worksheets exist
- [ ] Correct headers exist
- [ ] Data is complete

### Formatting

- [ ] Headers are formatted
- [ ] Column widths are readable
- [ ] Dates are formatted correctly
- [ ] Numbers are formatted correctly
- [ ] Thai text displays correctly
- [ ] Freeze panes are configured
- [ ] Filters are enabled

### Reporting

- [ ] Summary exists when appropriate
- [ ] Formulas calculate correctly
- [ ] Charts are meaningful
- [ ] Print settings are reasonable

### Data Quality

- [ ] No `undefined`
- [ ] No unintended `null`
- [ ] No accidental duplicate rows
- [ ] No unexpected truncation
- [ ] No sensitive credentials exposed

---

# 27. Recommended Excel Style

Use a modern professional style.

Recommended visual hierarchy:

```text
Report Title
    ↓
Report Description
    ↓
KPI / Summary
    ↓
Chart
    ↓
Main Data Table
```

For ordinary operational exports:

```text
Header
    ↓
Excel Table
    ↓
Total Row
```

Keep the design clean.

Avoid:

- Too many colors
- Excessive borders
- Excessive merged cells
- Huge fonts
- Unnecessary icons
- Decorative elements that reduce usability

---

# 28. When the User Requests "Excel สวยๆ"

Interpret this request as:

> Create a professional `.xlsx` workbook with clean formatting, readable columns, proper data types, filters, freeze panes, appropriate colors, and useful summary information.

Do NOT interpret it as merely changing the header color.

At minimum:

1. Create `.xlsx`
2. Create Excel Table
3. Format headers
4. Auto-size columns
5. Format dates and numbers
6. Freeze header
7. Enable filters
8. Use professional typography
9. Validate the workbook
10. Provide the generated `.xlsx` file

---

# 29. Example User Request

User:

```text
Export รายชื่อผู้สมัครเป็น Excel สวยๆ
```

AI should produce:

```text
Workbook:
├── Summary
│   ├── Total Applicants
│   ├── Applicants by Category
│   └── Registration Chart
│
└── Applicants
    └── Excel Table
```

Columns:

```text
ลำดับ
ชื่อ
นามสกุล
ประเภทการสมัคร
เบอร์โทรศัพท์
อีเมล
วันที่สมัคร
สถานะ
```

Formatting:

```text
Header      → Professional style
Date        → dd/mm/yyyy
Phone       → Text
Email       → Text
Status      → Conditional formatting
Rows        → Alternating table style
Filter      → Enabled
Freeze      → Header row
```

---

# 30. Implementation Principle

The AI should prioritize:

```text
Correctness
    >
Data Integrity
    >
Readability
    >
Usability
    >
Visual Design
```

Never sacrifice data integrity merely to make the spreadsheet look attractive.

The final Excel file should be something a user can immediately open, understand, filter, analyze, print, and share.