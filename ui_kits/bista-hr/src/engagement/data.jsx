// BISTA HR · engagement/data — seed data for HR Management ▸ Employee Engagement.
// Field names mirror the real app types (Apartment, PendingAccommodationRequest,
// AccommodationRequestDetails, CircularListItem) so detail pages populate 1:1.

// Apartment types offered (constants/accommodation → APARTMENT_TYPES)
const APARTMENT_TYPES = [
  "Studio", "Single Room", "Chamber & Hall", "1 Bedroom", "2 Bedroom",
  "3 Bedroom", "Town House", "Bungalow", "Detached House",
];
const ACCOMMODATION_TYPES = ["Official", "Self-Contained", "Shared", "Guest House"];
const REQUEST_DURATIONS = ["Permanent", "Temporary"];

// Apartment[] — assignedEmployee is null when available. createdAt = date of vacancy/record.
const APARTMENTS_SEED = [
  { id: "apt-1", name: "Cantonments Villa", number: "BLK-A12", apartmentType: "2 Bedroom", createdAt: "2025-01-15",
    jobGradeId: "g2", jobGrade: "Grade 2", location: "Cantonments, Accra",
    description: "Fully furnished two-bedroom apartment with parking and 24/7 security.",
    attachments: ["img-1", "img-2", "img-3"],
    assignedEmployee: { employeeFullName: "Ama Mensah", employeeEmail: "ama.mensah@bista.com",
      employeePhoneNumber: "+233 24 123 4567", assignmentStartDate: "2025-02-01", assignmentEndDate: "2026-01-31",
      approvedRent: "GHS 2,400.00", previousRent: "GHS 2,100.00", handingOverDate: "2025-01-28", comments: "Renewed for a second tenancy term." } },
  { id: "apt-2", name: "Airport Residency", number: "BLK-B04", apartmentType: "3 Bedroom", createdAt: "2025-03-02",
    jobGradeId: "g4", jobGrade: "Grade 4", location: "Airport Residential, Accra",
    description: "Spacious three-bedroom unit close to the head office.",
    attachments: ["img-1", "img-2"], assignedEmployee: null },
  { id: "apt-3", name: "Adum Court", number: "BLK-C09", apartmentType: "1 Bedroom", createdAt: "2025-04-20",
    jobGradeId: "g1", jobGrade: "Grade 1", location: "Adum, Kumasi",
    description: "Compact one-bedroom apartment in the Kumasi business district.",
    attachments: ["img-1"], assignedEmployee: null },
  { id: "apt-4", name: "Takoradi Bungalow", number: "BLK-D02", apartmentType: "Bungalow", createdAt: "2024-09-10",
    jobGradeId: "g3", jobGrade: "Grade 3", location: "Beach Road, Takoradi",
    description: "Detached bungalow with a private garden, allocated to senior staff.",
    attachments: ["img-1", "img-2", "img-3", "img-4"],
    assignedEmployee: { employeeFullName: "Kofi Owusu", employeeEmail: "kofi.owusu@bista.com",
      employeePhoneNumber: "+233 20 987 6543", assignmentStartDate: "2024-09-15", assignmentEndDate: "2025-09-14",
      approvedRent: "GHS 3,200.00", previousRent: "—", handingOverDate: "2024-09-12", comments: "Initial allocation." } },
  { id: "apt-5", name: "Labone Flats", number: "BLK-E07", apartmentType: "Studio", createdAt: "2025-05-28",
    jobGradeId: "g1", jobGrade: "Grade 1", location: "Labone, Accra",
    description: "Modern studio for junior staff, walking distance to transport.",
    attachments: [], assignedEmployee: null },
];

// PendingAccommodationRequest[] — list rows shown under "Staff Requests" / the assign dialog.
const PENDING_REQUESTS_SEED = [
  { accommodationRequestId: "req-1", employeeFullName: "Yaa Asantewaa", employeeEmail: "yaa.asantewaa@bista.com",
    duration: "Permanent", accommodationType: "2 Bedroom", reason: "Relocating to the Accra head office and require company accommodation close to the workplace.",
    startDate: null, endDate: null, requestCreatedAt: "2025-11-02" },
  { accommodationRequestId: "req-2", employeeFullName: "James Brown", employeeEmail: "james.brown@bista.com",
    duration: "Temporary", accommodationType: "1 Bedroom", reason: "Six-month project deployment to the Kumasi branch; need temporary accommodation.",
    startDate: "2025-12-01", endDate: "2026-05-31", requestCreatedAt: "2025-11-05" },
  { accommodationRequestId: "req-3", employeeFullName: "Efua Sarpong", employeeEmail: "efua.sarpong@bista.com",
    duration: "Permanent", accommodationType: "3 Bedroom", reason: "Newly appointed branch manager requiring senior-grade official accommodation.",
    startDate: null, endDate: null, requestCreatedAt: "2025-11-08" },
];

// AccommodationRequestDetails — keyed by accommodationRequestId (what the dialog shows).
const REQUEST_DETAILS = {
  "req-1": { employeeFullName: "Yaa Asantewaa", employeeStaffId: "EMP-004", employeeJobGrade: "Grade 2",
    employeeDesignation: "Operations Officer", employeeDepartment: "Operations", employeePhoneNumber: "+233 24 555 1212",
    createdAt: "2025-11-02", accommodationType: "Official", apartmentType: "2 Bedroom", location: "Accra",
    duration: "Permanent", startDate: null, endDate: null, employeeEmail: "yaa.asantewaa@bista.com",
    reason: "Relocating to the Accra head office and require company accommodation close to the workplace." },
  "req-2": { employeeFullName: "James Brown", employeeStaffId: "EMP-003", employeeJobGrade: "Grade 3",
    employeeDesignation: "Field Analyst", employeeDepartment: "Operations", employeePhoneNumber: "+233 20 444 9090",
    createdAt: "2025-11-05", accommodationType: "Self-Contained", apartmentType: "1 Bedroom", location: "Kumasi",
    duration: "Temporary", startDate: "2025-12-01", endDate: "2026-05-31", employeeEmail: "james.brown@bista.com",
    reason: "Six-month project deployment to the Kumasi branch; need temporary accommodation for the assignment period." },
  "req-3": { employeeFullName: "Efua Sarpong", employeeStaffId: "EMP-007", employeeJobGrade: "Grade 4",
    employeeDesignation: "Branch Manager", employeeDepartment: "Support Services", employeePhoneNumber: "+233 27 333 7878",
    createdAt: "2025-11-08", accommodationType: "Official", apartmentType: "3 Bedroom", location: "Takoradi",
    duration: "Permanent", startDate: null, endDate: null, employeeEmail: "efua.sarpong@bista.com",
    reason: "Newly appointed branch manager requiring senior-grade official accommodation." },
};

// CircularListItem / CircularDetail — Welfare ▸ Announcement & Circulars.
const DEPT_REF = { hr: { id: "d1", name: "Human Resource" }, fin: { id: "d2", name: "Finance" }, ops: { id: "d3", name: "Operations" }, it: { id: "d4", name: "Information Technology" } };
const CIRCULARS_SEED = [
  { id: "circ-1", title: "Year-End Welfare Package 2025", type: "Announcement", status: "Approved",
    createdAt: "2025-11-20", dateOfEvent: "2025-12-20",
    submittedByEmployeeName: "Naomi Adjei", submittedByEmployeeJobTitle: "HR Manager", submittedByEmployeeProfileImage: "",
    submittedBy: { fullName: "Naomi Adjei", email: "naomi.adjei@bista.com", profileImage: "" },
    approvedBy: { fullName: "Daniel Mensah", email: "daniel.mensah@bista.com", phoneNumber: "+233 24 111 2222" },
    sendToDepartments: [DEPT_REF.hr, DEPT_REF.fin, DEPT_REF.ops, DEPT_REF.it], attachments: ["hamper.jpg"],
    eventDetails: "Details of the 2025 year-end welfare package, including hampers and the bonus disbursement timeline for all staff." },
  { id: "circ-2", title: "Updated Medical Reimbursement Policy", type: "Announcement", status: "Approved",
    createdAt: "2025-11-12", dateOfEvent: "2025-11-15",
    submittedByEmployeeName: "Naomi Adjei", submittedByEmployeeJobTitle: "HR Manager", submittedByEmployeeProfileImage: "",
    submittedBy: { fullName: "Naomi Adjei", email: "naomi.adjei@bista.com", profileImage: "" },
    approvedBy: { fullName: "Daniel Mensah", email: "daniel.mensah@bista.com", phoneNumber: "+233 24 111 2222" },
    sendToDepartments: [DEPT_REF.hr], attachments: [],
    eventDetails: "Revised limits and the new submission process for staff medical reimbursement claims, effective immediately." },
];

const PENDING_CIRCULARS_SEED = [
  { id: "circ-4", title: "Provident Fund Contribution Update", type: "Announcement", status: "Pending",
    createdAt: "2025-11-22", dateOfEvent: "2025-12-01",
    submittedByEmployeeName: "Kwabena Asare", submittedByEmployeeJobTitle: "Finance Analyst", submittedByEmployeeProfileImage: "",
    submittedBy: { fullName: "Kwabena Asare", email: "kwabena.asare@bista.com", profileImage: "" },
    approvedBy: null, sendToDepartments: [DEPT_REF.fin, DEPT_REF.hr], attachments: [],
    eventDetails: "Proposed change to the provident fund contribution rate, pending management approval." },
  { id: "circ-5", title: "Bereavement Support Guidelines", type: "Bereavement", status: "Pending",
    createdAt: "2025-11-21", dateOfEvent: "2025-11-30",
    submittedByEmployeeName: "Naomi Adjei", submittedByEmployeeJobTitle: "HR Manager", submittedByEmployeeProfileImage: "",
    submittedBy: { fullName: "Naomi Adjei", email: "naomi.adjei@bista.com", profileImage: "" },
    approvedBy: null, sendToDepartments: [DEPT_REF.hr], attachments: [],
    eventDetails: "Draft guidelines on bereavement leave and welfare support, awaiting HR director sign-off." },
];

Object.assign(window, {
  APARTMENT_TYPES, ACCOMMODATION_TYPES, REQUEST_DURATIONS,
  APARTMENTS_SEED, PENDING_REQUESTS_SEED, REQUEST_DETAILS,
  CIRCULARS_SEED, PENDING_CIRCULARS_SEED,
});

// ===== Disciplinary Cycle =====================================================
// Employee roster for the implicated-employee picker (Employee: id, firstName, lastName,
// fullName, designation, department, profilePictureUrl).
const DISC_EMPLOYEES = [
  { id: "e1", firstName: "Ama", lastName: "Mensah", fullName: "Ama Mensah", designation: "Operations Manager", department: "Operations" },
  { id: "e2", firstName: "Kofi", lastName: "Owusu", fullName: "Kofi Owusu", designation: "Software Engineer", department: "Information Technology" },
  { id: "e3", firstName: "James", lastName: "Brown", fullName: "James Brown", designation: "Field Analyst", department: "Operations" },
  { id: "e4", firstName: "Yaa", lastName: "Asantewaa", fullName: "Yaa Asantewaa", designation: "Operations Officer", department: "Operations" },
  { id: "e5", firstName: "Efua", lastName: "Sarpong", fullName: "Efua Sarpong", designation: "Branch Manager", department: "Support Services" },
  { id: "e6", firstName: "Samuel", lastName: "Boateng", fullName: "Samuel Boateng", designation: "Accountant", department: "Finance" },
  { id: "e7", firstName: "Naomi", lastName: "Adjei", fullName: "Naomi Adjei", designation: "HR Manager", department: "Human Resource" },
];
const REPORT_STAGES = ["Investigation", "Hearing", "Completed", "Cancelled"];
const empRef = (id) => { const e = DISC_EMPLOYEES.find(x => x.id === id); return e ? { employeeId: id, fullName: e.fullName, profilePictureUrl: "", designation: e.designation, department: e.department } : null; };

// DisciplinaryCase[] / DisciplinaryCaseDetail — list rows carry the detail fields too.
const DISCIPLINARY_SEED = [
  { id: "case-1", caseNumber: "DC-2025-001", title: "Unauthorized Absence", department: "Operations",
    createdAt: "2025-10-12", dateOfIncident: "2025-10-05", stage: "Investigation", status: "open",
    implicatedEmployees: [empRef("e3"), empRef("e4")], attachments: ["incident-report.pdf"],
    description: "Employee was absent for three consecutive working days without prior notice or approved leave, disrupting branch operations." },
  { id: "case-2", caseNumber: "DC-2025-002", title: "Breach of IT Security Policy", department: "Information Technology",
    createdAt: "2025-10-20", dateOfIncident: "2025-10-18", stage: "Hearing", status: "pending",
    implicatedEmployees: [empRef("e2")], attachments: ["access-logs.pdf", "policy.pdf"],
    description: "Shared privileged system credentials with an unauthorized third party, in breach of the IT security policy." },
  { id: "case-3", caseNumber: "DC-2025-003", title: "Cash Handling Discrepancy", department: "Finance",
    createdAt: "2025-09-28", dateOfIncident: "2025-09-25", stage: "Completed", status: "closed",
    implicatedEmployees: [empRef("e6")], attachments: ["audit.pdf"],
    hearings: [{ employeeId: "e6", feedback: "The employee acknowledged the reconciliation gap and explained it arose from a miscounted float at end of shift.", attachments: [] }],
    decisions: [{ employeeId: "e6", status: "Substantiated", action: "Warning", notes: "A written warning is issued; the employee must complete refresher training on cash-handling controls." }],
    description: "A discrepancy was identified during the monthly cash reconciliation for the assigned till." },
  { id: "case-4", caseNumber: "DC-2025-004", title: "Workplace Conduct Complaint", department: "Support Services",
    createdAt: "2025-11-01", dateOfIncident: "2025-10-29", stage: "Hearing", status: "pending",
    implicatedEmployees: [empRef("e5"), empRef("e1"), empRef("e7")], attachments: [],
    description: "A formal complaint was lodged regarding conduct during a team meeting that escalated into a verbal altercation." },
  { id: "case-5", caseNumber: "DC-2025-005", title: "Late Submission of Reports", department: "Operations",
    createdAt: "2025-11-04", dateOfIncident: "2025-10-30", stage: "Cancelled", status: "closed",
    implicatedEmployees: [empRef("e4")], attachments: [],
    description: "Repeated late submission of mandatory weekly operational reports despite reminders. Case later withdrawn." },
];

Object.assign(window, { DISC_EMPLOYEES, REPORT_STAGES, DISCIPLINARY_SEED });
