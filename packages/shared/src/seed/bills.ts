import type { Bill } from '../types';

const vendors = [
  { name: 'Nexus Digital Solutions', gstin: '27AABCN1234F1ZP' },
  { name: 'Pinnacle Office Supplies', gstin: '29AABCP5678G1ZQ' },
  { name: 'CloudSync Technologies', gstin: '06AABCC9012H1ZR' },
  { name: 'Bharat Marketing Co.', gstin: '07AABCB3456I1ZS' },
  { name: 'Swiftway Logistics', gstin: '33AABCS7890J1ZT' },
  { name: 'GreenLeaf Utilities', gstin: '09AABCG1234K1ZU' },
  { name: 'TechVista Hardware', gstin: '27AABCT5678L1ZV' },
  { name: 'ProConsult Advisors', gstin: '06AABCP9012M1ZW' },
  { name: 'DataStream Networks', gstin: '29AABCD3456N1ZX' },
  { name: 'UrbanSpace Interiors', gstin: '33AABCU7890O1ZY' },
  { name: 'AeroComm Telecom', gstin: '07AABCA1234P1ZZ' },
  { name: 'Zenith Cloud Services', gstin: '09AABCZ5678Q1ZA' },
];

const categories = [
  'Software',
  'Office Supplies',
  'Marketing',
  'Travel',
  'Utilities',
  'Professional Services',
  'Hardware',
  'Telecommunications',
] as const;

const statuses = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Scheduled',
  'Paid',
  'Rejected',
] as const;

const approvers = [
  'Sai Krishna S',
  'Rajesh Iyer',
  'Ananya Gupta',
  'Vikram Patel',
  'Meera Reddy',
];

function makeDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0]!;
}

function makeLineItems(amount: number, category: string) {
  const descriptions: Record<string, string[]> = {
    Software: ['Annual SaaS License', 'Support & Maintenance', 'API Access Fee'],
    'Office Supplies': ['A4 Paper (10 reams)', 'Toner Cartridges', 'Stationery Kit'],
    Marketing: ['Social Media Campaign', 'Print Ads — Q3', 'Event Sponsorship'],
    Travel: ['Flight Tickets — BLR to DEL', 'Hotel Stay (3 nights)', 'Local Transport'],
    Utilities: ['Electricity — Sep 2026', 'Water Charges', 'Internet Service'],
    'Professional Services': ['Legal Consultation', 'Audit Fees', 'Tax Advisory'],
    Hardware: ['Dell Laptops (5 units)', 'Monitors (3 units)', 'Networking Equipment'],
    Telecommunications: ['Mobile Plans — Team', 'Conference Call Credits', 'SIP Trunk Charges'],
  };

  const items = descriptions[category] ?? ['Service Charge'];
  const count = Math.min(items.length, Math.ceil(Math.random() * 3));
  const perItem = Math.round(amount / count);

  return items.slice(0, count).map((desc, i) => ({
    id: `li-${i + 1}`,
    description: desc,
    quantity: Math.ceil(Math.random() * 5),
    unitPrice: Math.round(perItem / Math.ceil(Math.random() * 5)),
    amount: i === count - 1 ? amount - perItem * (count - 1) : perItem,
  }));
}

function bill(
  id: number,
  vendorIdx: number,
  amount: number,
  catIdx: number,
  statusIdx: number,
  dueDays: number,
  approverIdx: number,
  createdDaysAgo: number
): Bill {
  const vendor = vendors[vendorIdx % vendors.length]!;
  const category = categories[catIdx % categories.length]!;
  const gstAmount = Math.round(amount * 0.18);
  const totalAmount = amount + gstAmount;

  return {
    id: `BILL-${String(id).padStart(4, '0')}`,
    vendorName: vendor.name,
    vendorGstin: vendor.gstin,
    invoiceNumber: `INV-${2026}${String(id).padStart(5, '0')}`,
    amount,
    gstAmount,
    totalAmount,
    currency: 'INR',
    dueDate: makeDate(dueDays),
    category,
    status: statuses[statusIdx % statuses.length]!,
    approver: approvers[approverIdx % approvers.length]!,
    lineItems: makeLineItems(amount, category),
    notes: id % 5 === 0 ? 'Priority payment — vendor escalation' : undefined,
    createdAt: makeDate(-createdDaysAgo),
    updatedAt: makeDate(-Math.max(0, createdDaysAgo - 2)),
  };
}

export const seedBills: Bill[] = [
  // Draft bills (6)
  bill(1, 0, 245000, 0, 0, 14, 0, 3),
  bill(2, 3, 87500, 2, 0, 21, 1, 5),
  bill(3, 6, 432000, 6, 0, 10, 2, 2),
  bill(4, 9, 56000, 1, 0, 28, 3, 1),
  bill(5, 1, 178000, 4, 0, 7, 4, 4),
  bill(6, 11, 92000, 7, 0, 18, 0, 6),

  // Pending Approval (15)
  bill(7, 2, 560000, 0, 1, 5, 1, 8),
  bill(8, 4, 34500, 3, 1, 3, 2, 7),
  bill(9, 7, 890000, 5, 1, 7, 3, 10),
  bill(10, 10, 125000, 7, 1, 2, 4, 6),
  bill(11, 0, 67000, 2, 1, 4, 0, 9),
  bill(12, 5, 210000, 4, 1, 6, 1, 5),
  bill(13, 8, 445000, 0, 1, 8, 2, 12),
  bill(14, 1, 29000, 1, 1, 1, 3, 3),
  bill(15, 3, 156000, 3, 1, 9, 4, 11),
  bill(16, 6, 780000, 6, 1, 4, 0, 8),
  bill(17, 9, 43000, 2, 1, 5, 1, 7),
  bill(18, 11, 320000, 5, 1, 3, 2, 6),
  bill(19, 2, 58000, 1, 1, 7, 3, 4),
  bill(20, 4, 1200000, 0, 1, 10, 4, 15),
  bill(21, 7, 95000, 7, 1, 2, 0, 5),

  // Approved (12)
  bill(22, 0, 340000, 0, 2, 12, 1, 20),
  bill(23, 5, 78000, 4, 2, 8, 2, 18),
  bill(24, 8, 510000, 5, 2, 15, 3, 22),
  bill(25, 10, 165000, 7, 2, 6, 4, 16),
  bill(26, 3, 42000, 1, 2, 10, 0, 14),
  bill(27, 6, 890000, 6, 2, 20, 1, 25),
  bill(28, 1, 230000, 2, 2, 9, 2, 19),
  bill(29, 11, 67000, 3, 2, 5, 3, 13),
  bill(30, 2, 415000, 0, 2, 14, 4, 21),
  bill(31, 9, 38000, 1, 2, 7, 0, 17),
  bill(32, 4, 720000, 5, 2, 18, 1, 24),
  bill(33, 7, 195000, 4, 2, 11, 2, 20),

  // Scheduled (10)
  bill(34, 0, 280000, 0, 3, 3, 3, 30),
  bill(35, 3, 56000, 3, 3, 5, 4, 28),
  bill(36, 5, 430000, 4, 3, 2, 0, 32),
  bill(37, 8, 92000, 2, 3, 7, 1, 26),
  bill(38, 10, 610000, 5, 3, 1, 2, 35),
  bill(39, 1, 145000, 7, 3, 4, 3, 29),
  bill(40, 6, 38000, 1, 3, 6, 4, 27),
  bill(41, 11, 520000, 6, 3, 3, 0, 33),
  bill(42, 2, 87000, 3, 3, 8, 1, 31),
  bill(43, 9, 310000, 0, 3, 2, 2, 34),

  // Paid (15)
  bill(44, 0, 190000, 0, 4, -5, 3, 45),
  bill(45, 4, 42000, 1, 4, -3, 4, 40),
  bill(46, 7, 670000, 5, 4, -7, 0, 50),
  bill(47, 10, 88000, 3, 4, -2, 1, 38),
  bill(48, 1, 350000, 2, 4, -10, 2, 55),
  bill(49, 5, 125000, 4, 4, -4, 3, 42),
  bill(50, 8, 460000, 6, 4, -8, 4, 48),
  bill(51, 3, 73000, 7, 4, -1, 0, 36),
  bill(52, 6, 920000, 0, 4, -6, 1, 52),
  bill(53, 11, 54000, 1, 4, -3, 2, 39),
  bill(54, 2, 285000, 5, 4, -9, 3, 47),
  bill(55, 9, 160000, 2, 4, -5, 4, 44),
  bill(56, 0, 410000, 4, 4, -12, 0, 58),
  bill(57, 4, 97000, 3, 4, -2, 1, 37),
  bill(58, 7, 530000, 6, 4, -7, 2, 51),

  // Rejected (5)
  bill(59, 1, 1150000, 0, 5, 0, 3, 15),
  bill(60, 5, 78000, 2, 5, 0, 4, 12),
  bill(61, 8, 245000, 5, 5, 0, 0, 18),
  bill(62, 10, 34000, 1, 5, 0, 1, 10),
  bill(63, 3, 560000, 6, 5, 0, 2, 20),
];
