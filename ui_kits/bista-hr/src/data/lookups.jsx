// BISTA HR · data/lookups — central option lists for every dropdown in the app.
// Reference these from field configs (via `lookup: "<key>"`) instead of repeating inline
// arrays, so option sets stay consistent and live in one place.

// Circular country flags from the HatScripts/circle-flags CDN (by ISO alpha-2 code).
const flagUrl = (code) => `https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags/${code}.svg`;
const COUNTRY_LIST = [
  { name: "Ghana", code: "gh" }, { name: "Nigeria", code: "ng" }, { name: "Kenya", code: "ke" },
  { name: "South Africa", code: "za" }, { name: "Côte d'Ivoire", code: "ci" }, { name: "Togo", code: "tg" },
  { name: "United States", code: "us" }, { name: "United Kingdom", code: "gb" }, { name: "Canada", code: "ca" },
  { name: "Germany", code: "de" }, { name: "France", code: "fr" }, { name: "Netherlands", code: "nl" },
  { name: "United Arab Emirates", code: "ae" }, { name: "India", code: "in" }, { name: "China", code: "cn" },
];

const LOOKUPS = {
  departments: ["Finance", "Human Resource", "Information Technology", "Marketing"],
  orgUnits:    ["Operations", "Technology", "Support Services"],
  branches:    ["Accra", "Kumasi", "Tamale", "Cape Coast", "Takoradi"],
  zones:       ["West Zone", "Central Zones", "East Zone", "North Zone", "South Zone"],
  roles:       ["HR Manager", "Accountant", "Sales Officer", "Teller", "Engineer", "Analyst", "Officer"],
  jobGrades:   ["Grade 1", "Grade 2", "Grade 3", "Grade 4"],
  jobTitles:   ["Software Engineer", "HR Manager", "Finance Analyst", "Accountant", "Sales Officer"],
  performanceRatings: ["Outstanding", "Very Good", "Good", "Above Average", "Below Average"],
  employees:   ["Franklin Brobbey", "Emmanuel Ansah", "Bright Manu", "Samuel Boateng", "Samuel Asante"],
  maritalStatus: ["Single", "Married", "Divorced", "Widowed"],
  genders:     ["Male", "Female"],
  idTypes:     ["Ghana Card", "Passport", "Driver's License", "Voter ID"],
  // countries carry flag images so the Combobox renders a circular flag per option
  countries:   COUNTRY_LIST.map(c => ({ value: c.name, label: c.name, image: flagUrl(c.code) })),
};

// deriveLookups — overlay LIVE entity data onto the static base so every dropdown
// reflects what the user actually manages. Departments created on the Departments page
// immediately appear in the Employee "Department" select; the Head-of-Department picker
// pulls from the real employee roster (unioned with seeded heads so edit-prefill still
// renders), and so on. Falls back to the static list when an entity has no rows.
function deriveLookups(data = {}) {
  const dedupe = (arr) => [...new Set(arr.filter(Boolean))];
  const names = (key) => dedupe((data[key] || []).map((r) => r.name));
  const live = (key, fallback) => (names(key).length ? names(key) : fallback);
  // Employee selects show staff ID + department under the name. Build option objects keyed on
  // NAME (existing records store the name) with `name` for the avatar and `sublabel` for ID · dept.
  const dir = window.EMPLOYEE_LIST || [];
  const byName = {}; dir.forEach(e => { byName[e.name] = e; });
  const empNames = dedupe([...names("Employees"), ...LOOKUPS.employees, ...dir.map(e => e.name)]);
  const employees = empNames.map(n => {
    const e = byName[n];
    const sub = e ? `${e.staffId || e.id}${e.dept ? " · " + e.dept : ""}` : "";
    return sub ? { value: n, label: n, name: n, sublabel: sub } : { value: n, label: n, name: n };
  });
  return {
    ...LOOKUPS,
    departments: live("Departments", LOOKUPS.departments),
    jobGrades:   live("Job Grades", LOOKUPS.jobGrades),
    jobTitles:   live("Job Titles", LOOKUPS.jobTitles),
    // "Branches/Units" is the Organizational Units entity → feeds the org-unit picker
    // (Department ▸ Organizational Unit). City branches stay on the static `branches` list.
    orgUnits:    live("Branches/Units", LOOKUPS.orgUnits),
    zones:       live("Zones", LOOKUPS.zones),
    // employees feed Head of Department / reporting selects — rich options (name + ID · dept)
    employees,
  };
}

Object.assign(window, { LOOKUPS, COUNTRY_LIST, flagUrl, deriveLookups });
