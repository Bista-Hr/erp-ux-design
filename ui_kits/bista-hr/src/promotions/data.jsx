// BISTA HR · promotions/data — seed promotions + the employee directory used to
// auto-populate current job title / grade / department / zone / branch / staff ID /
// salary / performance rating when an employee is picked in the promotion form
// (mirrors the "Auto populated" fields in the Electronic Promotion Form spec).
// EMPLOYEE_DIRECTORY is shared and reusable across Promotions / Transfers / Job-Title flows.

const EMPLOYEE_DIRECTORY = {
  "Aaron Appiah":      { staffId: "EMP-18330", title: "Ag. Assurance Supervisor", grade: "Grade 4", dept: "Finance",              zone: "Accra East",   branch: "Abossey Okai", salary: "GHS 8,000.00", rating: "Very Good" },
  "Aba Odum":          { staffId: "EMP-18389", title: "Data Scientist",           grade: "Grade 5", dept: "Information Technology", zone: "Accra West",   branch: "Ridge",        salary: "GHS 9,500.00", rating: "Outstanding" },
  "Abass Abdul Mumin": { staffId: "EMP-17431", title: "Branch Support",           grade: "Grade 3", dept: "Operations",           zone: "Central Zones", branch: "Cape Coast",   salary: "GHS 5,200.00", rating: "Good" },
  "Franklin Brobbey":  { staffId: "EMP-10231", title: "Accountant",               grade: "Grade 2", dept: "Finance",              zone: "South Zone",   branch: "Accra",        salary: "GHS 6,000.00", rating: "Very Good" },
  "Emmanuel Ansah":    { staffId: "EMP-10412", title: "HR Officer",               grade: "Grade 2", dept: "Human Resource",       zone: "South Zone",   branch: "Accra",        salary: "GHS 5,800.00", rating: "Good" },
  "Bright Manu":       { staffId: "EMP-10876", title: "Software Engineer",        grade: "Grade 3", dept: "Information Technology", zone: "East Zone",    branch: "Tema",         salary: "GHS 7,400.00", rating: "Outstanding" },
  "Samuel Boateng":    { staffId: "EMP-11002", title: "Sales Officer",            grade: "Grade 1", dept: "Marketing",            zone: "West Zone",    branch: "Kumasi",       salary: "GHS 4,500.00", rating: "Above Average" },
  "Samuel Asante":     { staffId: "EMP-11233", title: "Teller",                   grade: "Grade 1", dept: "Finance",              zone: "West Zone",    branch: "Takoradi",     salary: "GHS 4,200.00", rating: "Good" },
  "Abdul-Gadaf Abubakar": { staffId: "EMP-08141", title: "Retail Sales Manager",   grade: "Grade 5", dept: "Operations",           zone: "North Zone",   branch: "Tamale",       salary: "GHS 8,600.00", rating: "Outstanding" },
};
const EMPLOYEE_NAMES = Object.keys(EMPLOYEE_DIRECTORY);

const PROMO_DOC = (name, ext, size, docType) => ({ name, ext, size, docType });

const PROMOTION_SEED = [
  { id: 1, employees: ["Aaron Appiah"], staffIds: "EMP-18330",
    previousRole: "Ag. Assurance Supervisor", newRole: "Branch Support", previousGrade: "Grade 4", grade: "Grade 5",
    deptUnit: "Finance", department: "Finance", zone: "Accra East", branch: "Abossey Okai",
    previousSalary: "GHS 8,000.00", salary: "GHS 9,200.00", performanceRating: "Very Good",
    effectiveDate: "Jun 01, 2026", dateSubmitted: "May 14, 2026", status: "Approved",
    justification: "Consistently strong assurance performance and readiness for a broader operational remit.",
    allowances: [], documents: [PROMO_DOC("Promotion Recommendation.pdf", "PDF", "1.2 MB", "Reference Letter"), PROMO_DOC("Performance Summary.xlsx", "XLSX", "84 KB", "Other")],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/16/2026, 2:08:34 PM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 2, employees: ["Abass Abdul Mumin"], staffIds: "EMP-17431",
    previousRole: "Branch Support", newRole: "Retail Sales Manager", previousGrade: "Grade 3", grade: "Grade 5",
    deptUnit: "Operations", department: "Operations", zone: "Central Zones", branch: "Cape Coast",
    previousSalary: "GHS 5,200.00", salary: "GHS 8,600.00", performanceRating: "Good",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 10, 2026", status: "Approved",
    justification: "Demonstrated leadership in branch support; promotion fills a vacant retail management role.",
    allowances: [{ label: "Transport Allowance", value: "GHS 800.00" }, { label: "Responsibility Allowance", value: "GHS 1,200.00" }],
    documents: [PROMO_DOC("Approval Memo.pdf", "PDF", "640 KB", "Contract")],
    approvedBy: "Peter Bosrotsi", approverEmail: "pybosrotsi@gcb.com.gh", approvedAt: "5/12/2026, 10:22:10 AM",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 3, employees: ["Abdul-Gadaf Abubakar"], staffIds: "EMP-08141",
    previousRole: "Retail Sales Manager", newRole: "Retail Relationship Officer", previousGrade: "Grade 5", grade: "Grade 6",
    deptUnit: "Operations", department: "Operations", zone: "North Zone", branch: "Tamale",
    previousSalary: "GHS 8,600.00", salary: "GHS 10,400.00", performanceRating: "Outstanding",
    effectiveDate: "Jul 08, 2026", dateSubmitted: "May 18, 2026", status: "Pending",
    justification: "Top performer in the zone; succession plan recommends elevation to relationship management.",
    allowances: [], documents: [PROMO_DOC("Talent Review Notes.docx", "DOCX", "120 KB", "Other")],
    docUrls: ["https://files.bistasol.com/promotions/Talent-Review-Notes.docx", "https://files.bistasol.com/promotions/Recommendation.pdf"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 4, employees: ["Aba Odum"], staffIds: "EMP-18389",
    previousRole: "Data Scientist", newRole: "Ag. Retail Relationship Manager", previousGrade: "Grade 5", grade: "Grade 6",
    deptUnit: "Information Technology", department: "Information Technology", zone: "Accra West", branch: "Ridge",
    previousSalary: "GHS 9,500.00", salary: "GHS 11,800.00", performanceRating: "Outstanding",
    effectiveDate: "May 28, 2026", dateSubmitted: "May 09, 2026", status: "Pending",
    justification: "Cross-functional impact and analytics leadership justify an acting management appointment.",
    allowances: [], documents: [PROMO_DOC("Business Case.pdf", "PDF", "2.1 MB", "Other"), PROMO_DOC("ID Verification.jpg", "JPG", "1.4 MB", "ID Card")],
    docUrls: ["https://files.bistasol.com/promotions/Business-Case.pdf", "https://files.bistasol.com/promotions/Analytics-Summary.xlsx"],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "N/A", rejectorEmail: "N/A", rejectedAt: "N/A" },
  { id: 5, employees: ["Samuel Boateng"], staffIds: "EMP-11002",
    previousRole: "Sales Officer", newRole: "Senior Sales Officer", previousGrade: "Grade 1", grade: "Grade 2",
    deptUnit: "Marketing", department: "Marketing", zone: "West Zone", branch: "Kumasi",
    previousSalary: "GHS 4,500.00", salary: "GHS 5,600.00", performanceRating: "Above Average",
    effectiveDate: "Apr 30, 2026", dateSubmitted: "Apr 12, 2026", status: "Declined",
    justification: "Recommended for promotion based on sales targets met over four consecutive quarters.",
    allowances: [], documents: [PROMO_DOC("Sales Record.xlsx", "XLSX", "210 KB", "Other")],
    approvedBy: "N/A", approverEmail: "N/A", approvedAt: "N/A",
    rejectedBy: "Peter Bosrotsi", rejectorEmail: "pybosrotsi@gcb.com.gh", rejectedAt: "4/18/2026, 9:14:02 AM" },
];

Object.assign(window, { EMPLOYEE_DIRECTORY, EMPLOYEE_NAMES, PROMOTION_SEED });
