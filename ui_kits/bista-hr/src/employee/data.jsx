// BISTA HR · employee/data — employees list + full per-employee detail (matches Figma).
// The list rows come from the Figma "All Employees" table. Clicking a row opens the
// detail page; the clicked row's identity is merged onto the rich sample profile so the
// header reflects who you clicked while the cards show the comprehensive data set.

const EMPLOYEES = [
  { id: 1,  name: "Leslie Alexandre", code: "EMP1", email: "leslie@starret.com",  role: "HR Manager",    dept: "Human Resource", branch: "Kumasi", dateEmployed: "25/09/2025", active: true  },
  { id: 2,  name: "Olivia Bennett",   code: "EMP2", email: "olivia@starret.com",  role: "Accountant",    dept: "Finance", branch: "Accra",  dateEmployed: "25/09/2025", active: true  },
  { id: 3,  name: "Phoenix Carter",   code: "EMP3", email: "phoenix@starret.com", role: "Accountant",    dept: "Finance", branch: "Tamale", dateEmployed: "25/09/2025", active: true  },
  { id: 4,  name: "Lana Mensah",      code: "EMP4", email: "lana@starret.com",    role: "Sales Officer", dept: "Marketing",      branch: "Accra",  dateEmployed: "25/09/2025", active: true  },
  { id: 5,  name: "Demi Owusu",       code: "EMP5", email: "demi@starret.com",    role: "Sales Officer", dept: "Marketing",      branch: "Kumasi", dateEmployed: "25/09/2025", active: true  },
  { id: 6,  name: "Natalie Adjei",    code: "EMP6", email: "natali@starret.com",  role: "Teller",        dept: "Finance", branch: "Kumasi", dateEmployed: "25/09/2025", active: true  },
  { id: 7,  name: "Drew Asante",      code: "EMP7", email: "drew@starret.com",    role: "Teller",        dept: "Finance", branch: "Accra",  dateEmployed: "25/09/2025", active: false },
  { id: 8,  name: "Orlando Boateng",  code: "EMP8", email: "orlando@starret.com", role: "Sales Officer", dept: "Marketing",      branch: "Accra",  dateEmployed: "25/09/2025", active: false },
];

// Rich detail for the profile. Built per-employee by merging identity over the sample.
function buildEmployeeDetail(emp) {
  const first = emp.name.split(" ")[0];
  const last = emp.name.split(" ").slice(1).join(" ") || "—";
  return {
    ...emp,
    title: emp.role,
    personal: {
      basic: [
        { label: "First Name", value: first },
        { label: "Last Name", value: last },
        { label: "Gender", value: "Male" },
        { label: "Date of Birth", value: "06 June, 1990" },
        { label: "Age", value: "35" },
        { label: "Marital Status", value: "Married" },
        { label: "Nationality", value: "Ghanaian" },
        { label: "Religion", value: "Christianity" },
      ],
      address: [
        { label: "Country", value: "Ghana" },
        { label: "Province/Region", value: "Greater Accra" },
        { label: "City", value: "Accra" },
        { label: "Ghana Post Number", value: "GA-123-4567" },
        { label: "Street Name", value: "Obetsebi Lamptey St., Osu" },
        { label: "Hometown", value: "Kumasi" },
      ],
      identification: [
        { label: "ID Type", value: "Ghana Card" },
        { label: "ID Number", value: "GHA-123456789-00" },
        { label: "Created On", value: "06 June, 2015" },
        { label: "Expiry Date", value: "06 June, 2030" },
      ],
      education: [
        { course: "Accounting", institution: "University of Ghana", qualification: "Bsc. Accounting", startDate: "06 June, 2015",
          endDate: "10 July, 2019", majorField: "Accounting", gpa: "3.2", verificationStatus: "Verified",
          verificationDate: "28 Nov, 2024", status: "Completed" },
      ],
      spouse: [
        { course: "Accounting", institution: "University of Ghana", qualification: "Bsc. Accounting", startDate: "06 June, 2015",
          endDate: "10 July, 2019", majorField: "Accounting", gpa: "3.2", verificationStatus: "Verified",
          verificationDate: "28 Nov, 2024", status: "Completed" },
      ],
      children: [
        { name: "James Alexandre", gender: "Male", dob: "06 June, 2010", age: "15" },
        { name: "Joana Alexandre", gender: "Female", dob: "14 Sept, 2012", age: "13" },
      ],
    },
    contact: {
      personal: [
        { label: "Home Phone", value: "-" },
        { label: "Mobile Phone", value: "0201234567" },
        { label: "Work Phone", value: "030201234567" },
        { label: "Work Mail", value: "jamesbrown@starret.com" },
        { label: "Personal Email", value: "jbrown1234@gmail.com" },
      ],
      emergency: [
        { name: "Isaac Brown", phone: "0501234567", email: "ibsbrown@gmail.com", address: "Hse No. 1232, Obetsebi Lamptey St., Osu" },
        { name: "Edith Brown", phone: "0241234567", email: "edthbrown@gmail.com", address: "Hse No. 1232, Obetsebi Lamptey St., Osu" },
      ],
      nextOfKin: [
        { label: "Name", value: "Isaac Brown" },
        { label: "Relationship", value: "Brother" },
        { label: "Mobile Phone", value: "0501234567" },
        { label: "Email", value: "ibsbrown@gmail.com" },
      ],
    },
    employment: {
      info: [
        { label: "Employee Status", value: emp.active ? "Active" : "Inactive" },
        { label: "Employment Type", value: "Full-time" },
        { label: "Date Employed", value: "06 June, 2015" },
        { label: "Job Title", value: emp.role },
        { label: "Job Grade", value: "Grade 1" },
        { label: "Department", value: emp.dept },
        { label: "Branch", value: emp.branch + " Branch" },
        { label: "Contract Expiry Date", value: "06 June, 2016" },
        { label: "Reporting Manager", value: "Samuel Asante" },
        { label: "Date of Termination/Resignation", value: "-" },
        { label: "Reason for Termination", value: "-" },
      ],
      history: [
        { date: "06 June, 2010", role: "UX Designer", position: "Permanent", note: "Recommended by supervisor", status: "current" },
        { date: "06 June, 2010", role: "UX Designer", position: "Probation", note: "Recommended by supervisor", status: "past" },
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
      reportingManagers: [
        { date: "06 June, 2010", name: "John Frimpong", jobTitle: "HR Manager",        jobCode: "06 June, 2010", note: "Changed Departments",        status: "current" },
        { date: "06 June, 2010", name: "John Frimpong", jobTitle: "Senior Accountant", jobCode: "06 June, 2010", note: "Recommended by supervisor",  status: "past" },
        { date: "12 Jan, 2008",  name: "Abena Sarpong", jobTitle: "Branch Manager",    jobCode: "12 Jan, 2008",  note: "Initial posting",            status: "past" },
      ],
      jobGrades: [
        { date: "06 June, 2010", title: "Grade 1", note: "Recommended by supervisor", status: "current" },
        { date: "06 June, 2010", title: "Grade 2", note: "Recommended by supervisor", status: "past" },
        { date: "12 Jan, 2008",  title: "Grade 3", note: "Initial appointment",       status: "past" },
      ],
      departments: [
        { date: "06 June, 2010", title: "HR Manager",      note: "Kumasi Branch", status: "current" },
        { date: "06 June, 2010", title: "Finance Manager", note: "Accra Branch",  status: "past" },
        { date: "06 June, 2010", title: "Accountant",      note: "Accra Branch",  status: "past" },
        { date: "12 Jan, 2008",  title: "Junior Officer",  note: "Tamale Branch", status: "past" },
      ],
      finance: [
        { label: "SSNIT Number", value: "1234567" },
        { label: "TIN (Tax Identification Number)", value: "1234567" },
        { label: "Bank Name", value: "Access Bank" },
        { label: "Bank Account Number", value: "001234455677654" },
        { label: "Bank Account Type", value: "Savings Account" },
        { label: "SSNIT Code Act", value: "247/766" },
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
