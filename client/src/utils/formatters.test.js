/* global process */
import {
  formatINR,
  formatIndianNumber,
  formatDateIST,
  formatTimeIST,
  formatDateTimeIST,
  formatScheduleIST
} from './formatters.js';

const tests = [
  { name: 'Zero INR', actual: formatINR(0), expected: '₹0' },
  { name: 'Small Entry Fee', actual: formatINR(250), expected: '₹250' },
  { name: 'Standard Prize Pool', actual: formatINR(15000), expected: '₹15,000' },
  { name: 'One Lakh INR', actual: formatINR(100000), expected: '₹1,00,000' },
  { name: 'Five Lakh INR', actual: formatINR(500000), expected: '₹5,00,000' },
  { name: 'Ten Lakh INR', actual: formatINR(1000000), expected: '₹10,00,000' },
  { name: 'One Crore INR', actual: formatINR(10000000), expected: '₹1,00,00,000' },
  { name: 'Paise / Decimal', actual: formatINR(49.50), expected: '₹49.50' },
  { name: 'Non-numeric Free Entry', actual: formatINR('Free Entry'), expected: 'Free Entry' },
  { name: 'Non-numeric Trophy', actual: formatINR('Trophy / Glory'), expected: 'Trophy / Glory' },
  { name: 'Indian Number 1,00,000', actual: formatIndianNumber(100000), expected: '1,00,000' },
  { name: 'Indian Number 10,00,000', actual: formatIndianNumber(1000000), expected: '10,00,000' },
  { name: 'Date IST (UTC to IST)', actual: formatDateIST('2026-11-08T00:00:00.000Z'), expected: '08 Nov 2026' },
  { name: 'Time IST (12hr AM/PM)', actual: formatTimeIST('2026-11-08T11:00:00.000Z'), expected: '04:30 PM' },
  { name: 'DateTime IST with timezone', actual: formatDateTimeIST('2026-11-08T11:00:00.000Z'), expected: '08 Nov 2026, 04:30 PM IST' },
  { name: 'Schedule Range IST', actual: formatScheduleIST('2026-11-08T00:00:00.000Z', '2026-11-12T00:00:00.000Z'), expected: '08 Nov 2026 – 12 Nov 2026' },
];

let passed = 0;
for (const t of tests) {
  if (t.actual === t.expected) {
    console.log(`✅ PASS: ${t.name} => ${t.actual}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${t.name} | Expected: ${t.expected} | Got: ${t.actual}`);
  }
}

console.log(`\nTest Result: ${passed}/${tests.length} tests passed.`);
if (passed !== tests.length) {
  process.exit(1);
}
