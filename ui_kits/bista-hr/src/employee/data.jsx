// BISTA HR · employee/data — employees list + full per-employee detail.
// Field sets per section mirror the production codebase (components/employees/details/*):
// PersonalDisplay, AddressDisplay, IdentificationDisplay, SpouseDisplay, ChildrenDisplay,
// EducationDisplay, ContactDisplay, EmergencyContactDisplay, EmploymentInformationCard,
// EmploymentHistoryCard, ReportingManagerTable, CompensationSummary, IdFinancialCard.

const EMPLOYEES = [
  { id: 1,  name: "Leslie Alexandre", code: "EMP1", email: "leslie@starret.com",  role: "HR Manager",    dept: "Human Resource", branch: "Kumasi", dateEmployed: "25/09/2025", active: true,  gender: "Female", phone: "0501234561" },
  { id: 2,  name: "Olivia Bennett",   code: "EMP2", email: "olivia@starret.com",  role: "Accountant",    dept: "Finance", branch: "Accra",  dateEmployed: "25/09/2025", active: true,  gender: "Female", phone: "0501234562" },
  { id: 3,  name: "Phoenix Carter",   code: "EMP3", email: "phoenix@starret.com", role: "Accountant",    dept: "Finance", branch: "Tamale", dateEmployed: "25/09/2025", active: true,  gender: "Male",   phone: "0501234563" },
  { id: 4,  name: "Lana Mensah",      code: "EMP4", email: "lana@starret.com",    role: "Sales Officer", dept: "Marketing",      branch: "Accra",  dateEmployed: "25/09/2025", active: true,  gender: "Female", phone: "0501234564" },
  { id: 5,  name: "Demi Owusu",       code: "EMP5", email: "demi@starret.com",    role: "Sales Officer", dept: "Marketing",      branch: "Kumasi", dateEmployed: "25/09/2025", active: true,  gender: "Female", phone: "0501234565" },
  { id: 6,  name: "Natalie Adjei",    code: "EMP6", email: "natali@starret.com",  role: "Teller",        dept: "Finance", branch: "Kumasi", dateEmployed: "25/09/2025", active: true,  gender: "Female", phone: "0501234566" },
  { id: 7,  name: "Drew Asante",      code: "EMP7", email: "drew@starret.com",    role: "Teller",        dept: "Finance", branch: "Accra",  dateEmployed: "25/09/2025", active: false, gender: "Male",   phone: "0501234567" },
  { id: 8,  name: "Orlando Boateng",  code: "EMP8", email: "orlando@starret.com", role: "Sales Officer", dept: "Marketing",      branch: "Accra",  dateEmployed: "25/09/2025", active: false, gender: "Male",   phone: "0501234568" },
];

// Rich detail for the profile. Built per-employee by merging identity over the sample.
function buildEmployeeDetail(emp) {
  const first = emp.name.split(" ")[0];
  const last = emp.name.split(" ").slice(1).join(" ") || "—";
  return {
    ...emp,
    title: emp.role,
    personal: {
      // Personal Information — exact set from PersonalDisplay.tsx
      basic: [
        { label: "Employee ID", value: emp.code },
        { label: "Title", value: "Mr." },
        { label: "First Name", value: first },
        { label: "Last Name", value: last },
        { label: "Other Name", value: "-" },
        { label: "Preferred Name", value: first },
        { label: "Gender", value: "Male" },
        { label: "Nationality", value: "Ghana" },
        { label: "HomeTown", value: "Kumasi" },
        { label: "Date of Birth", value: "06 June, 1990" },
        { label: "Marital Status", value: "Married" },
      ],
      // Address Information — exact set from AddressDisplay.tsx
      address: [
        { label: "Country", value: "Ghana" },
        { label: "Province/Region", value: "Greater Accra" },
        { label: "City", value: "Accra" },
        { label: "Street Name", value: "Obetsebi Lamptey St., Osu" },
        { label: "House Number", value: "Hse No. 1232" },
        { label: "Postal Address", value: "P.O. Box 123, Accra" },
        { label: "GPS Code", value: "5.60371, -0.18700" },
      ],
      // Identification Information — exact set from IdentificationDisplay.tsx
      identification: [
        { label: "ID Type", value: "Ghana Card" },
        { label: "ID Number", value: "GHA-123456789-00" },
        { label: "Created On", value: "06 June, 2015" },
        { label: "Expiry Date", value: "06 June, 2030" },
      ],
      // Spouse Details — exact set from SpouseDisplay.tsx
      spouse: [
        { label: "Full Name", value: "Edith " + last },
        { label: "Gender", value: "Female" },
        { label: "Date of Birth", value: "14 Feb, 1992" },
        { label: "Date of Marriage", value: "20 Dec, 2014" },
        { label: "Phone Number", value: "0244123456" },
        { label: "Email", value: "edith1234@gmail.com" },
        { label: "SSNIT Number", value: "C009876543210" },
        { label: "Ghana Card Number", value: "GHA-987654321-0" },
      ],
      // Children Details — per child: Gender · Date of Birth · Age (ChildrenDisplay.tsx)
      children: [
        { name: "James Alexandre", gender: "Male", dob: "06 June, 2010", age: "15" },
        { name: "Joana Alexandre", gender: "Female", dob: "14 Sept, 2012", age: "13" },
      ],
      // Education Details — per record: Degree · Qualification · Field of Study ·
      // Start Date · End Date · Status (EducationDisplay.tsx)
      education: [
        { institution: "University of Ghana", degree: "Bachelor's Degree", qualification: "Bsc. Accounting", fieldOfStudy: "Accounting",
          startDate: "06 June, 2015", endDate: "10 July, 2019", status: "Completed" },
        { institution: "GIMPA", degree: "Master's Degree", qualification: "MBA Finance", fieldOfStudy: "Finance",
          startDate: "10 Jan, 2021", endDate: "Ongoing", status: "Ongoing" },
      ],
    },
    contact: {
      // Contact Information — exact set from ContactDisplay.tsx
      personal: [
        { label: "Home Phone", value: "-" },
        { label: "Mobile Phone", value: "0201234567" },
        { label: "Work Phone", value: "030201234567" },
        { label: "Personal Email", value: "jbrown1234@gmail.com" },
        { label: "Work Email", value: emp.email },
        { label: "Postal Address", value: "P.O. Box 123, Accra" },
        { label: "Residential Address", value: "Hse No. 1232, Obetsebi Lamptey St., Osu" },
      ],
      // Emergency Contact — per contact: Relationship · Gender · Primary Phone · Home
      // Phone · Work Phone · Email · Address · Priority Order (EmergencyContactDisplay.tsx)
      emergency: [
        { name: "Isaac Brown", relationship: "Sibling", gender: "Male", phone: "0501234567", homePhone: "-", workPhone: "0302765432",
          email: "ibsbrown@gmail.com", address: "Hse No. 1232, Obetsebi Lamptey St., Osu", priority: "1" },
        { name: "Edith Brown", relationship: "Spouse", gender: "Female", phone: "0241234567", homePhone: "-", workPhone: "-",
          email: "edthbrown@gmail.com", address: "Hse No. 1232, Obetsebi Lamptey St., Osu", priority: "2" },
      ],
    },
    employment: {
      // Employment Information — Zone precedes Branch/ Unit (zone filters units) and
      // Department precedes Job Title (department filters titles); no separate Branch row.
      info: [
        { label: "Employee Status", value: emp.active ? "Active" : "Inactive" },
        { label: "Employee Type", value: "Full-time" },
        { label: "Zone", value: "South Zone" },
        { label: "Branch/ Unit", value: "Accra Main" },
        { label: "Department", value: emp.dept },
        { label: "Job Title", value: emp.role },
        { label: "Job Grade", value: "Grade 1" },
        { label: "Notch", value: "3" },
        { label: "Annual Salary", value: "GHS 96,000.00" },
        { label: "Date Employed", value: "06 June, 2015" },
        { label: "Date Confirmed", value: "06 Dec, 2015" },
        { label: "Date of Termination/Resignation", value: "-" },
      ],
      // Employment History — Date Assigned · Name (employment type) · Note · Status
      history: [
        { date: "06 Dec, 2015", type: "Permanent", note: "Confirmed after probation", status: "current" },
        { date: "06 June, 2015", type: "Probation", note: "Initial engagement", status: "past" },
      ],
      // Employment status timeline (EmploymentStatusTimeline)
      statusTimeline: [
        { date: "06 Dec, 2015", title: "Active", note: "Confirmed permanent staff", status: "current" },
        { date: "06 June, 2015", title: "Probation", note: "6-month probation period", status: "past" },
      ],
      jobTitles: [
        { date: "06 June, 2010", title: "HR Manager",      reportsTo: "Ethel Ama Amponsah Sedzro", status: "current" },
        { date: "06 June, 2010", title: "Finance Manager", reportsTo: "James Amponsah",            status: "past" },
        { date: "06 June, 2010", title: "Accountant",      reportsTo: "Kwabena Oduro",             status: "past" },
        { date: "12 Jan, 2008",  title: "Junior Officer",  reportsTo: "Abena Sarpong",             status: "past" },
      ],
      branches: [
        { date: "06 June, 2010", title: "Kumasi Branch", note: "Relocating to Kumasi",        status: "current" },
        { date: "06 June, 2010", title: "Accra Branch",  note: "Recommended by supervisor",   status: "past" },
        { date: "06 June, 2010", title: "Accra Branch",  note: "Relocating from Kumasi",      status: "past" },
        { date: "12 Jan, 2008",  title: "Tamale Branch", note: "Initial posting",             status: "past" },
      ],
      // Reporting Manager — Effective Date · Date Assigned · Manager · Note · Status
      reportingManagers: [
        { effectiveDate: "06 June, 2015", date: "06 June, 2015", name: "John Frimpong", note: "Changed Departments",       status: "current" },
        { effectiveDate: "06 June, 2012", date: "06 June, 2012", name: "John Frimpong", note: "Recommended by supervisor", status: "past" },
        { effectiveDate: "12 Jan, 2008",  date: "12 Jan, 2008",  name: "Abena Sarpong", note: "Initial posting",           status: "past" },
      ],
      // Job Grade entries carry grade + notch + effective date (JobGradeHistoryDetails)
      jobGrades: [
        { date: "06 June, 2015", title: "Grade 1", note: "Notch 3 · Effective 06 June, 2015", status: "current" },
        { date: "06 June, 2012", title: "Grade 2", note: "Notch 1 · Effective 06 June, 2012", status: "past" },
        { date: "12 Jan, 2008",  title: "Grade 3", note: "Notch 1 · Effective 12 Jan, 2008",  status: "past" },
      ],
      departments: [
        { date: "06 June, 2015", title: "Human Resource", note: "Kumasi Branch", status: "current" },
        { date: "06 June, 2012", title: "Finance",        note: "Accra Branch",  status: "past" },
        { date: "12 Jan, 2008",  title: "Operations",     note: "Tamale Branch", status: "past" },
      ],
      // Compensation — Current Salary (CompensationSummary.tsx)
      compensation: [
        { label: "Job Grade", value: "Grade 1" },
        { label: "Notch", value: "3" },
        { label: "Amount", value: "GHS 96,000.00" },
        { label: "Pay Frequency", value: "Monthly" },
        { label: "Payment Type", value: "Bank Transfer" },
        { label: "Structure Created", value: "06 June, 2015, 10:24 AM" },
        { label: "Effective Date", value: "06 June, 2015" },
      ],
      // National Identification and Financial Information (IdFinancialCard.tsx)
      finance: [
        { label: "SSNIT Number", value: "C001234567890" },
        { label: "Tin Number", value: "P0001234567" },
        { label: "Account Number", value: "001234455677654" },
        { label: "Account Name", value: emp.name },
        { label: "Account Type", value: "Savings Account" },
        { label: "Currency", value: "GHS" },
      ],
    },
    documents: [
      { name: "Employment Letter.pdf",  size: "1.2 MB", ext: "PDF",  docType: "Contract", type: "document", desc: "Signed offer and employment letter." },
      { name: "Acceptable Use Policy.docx", size: "340 KB", ext: "DOCX", docType: "Reference Letter", type: "document", desc: "Company IT acceptable-use policy." },
      { name: "Personal Commitment.pdf", size: "880 KB", ext: "PDF",  docType: "Reference Letter", type: "document", desc: "" },
      { name: "Salary Review 2025.xlsx", size: "56 KB",  ext: "XLSX", docType: "Other", type: "document", desc: "Annual salary review breakdown." },
      { name: "National ID Card.jpg",    size: "2.1 MB", ext: "JPG",  docType: "ID Card", type: "document", desc: "Scan of national ID card." },
      { name: "Degree Certificate.pdf",  size: "1.8 MB", ext: "PDF",  docType: "Degree", type: "document", desc: "" },
      { name: "Reference Notes.txt",     size: "4 KB",   ext: "TXT",  docType: "Other", type: "document", desc: "Internal reference notes." },
      { name: "Driver License.png",      size: "1.4 MB", ext: "PNG",  docType: "License", type: "document", desc: "" },
      { name: "Pay Slip - November 2025",  size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - October 2025",   size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - September 2025", size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - August 2025",    size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - July 2025",      size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - June 2025",      size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - May 2025",       size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - April 2025",     size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
      { name: "Pay Slip - March 2025",     size: "180 KB", ext: "PDF", docType: "Other", type: "payslip" },
    ],
  };
}

Object.assign(window, { EMPLOYEES, buildEmployeeDetail });
