const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

const REQUIRED_TABLES = [
  'WARDEN',
  'WARDEN_PHONE',
  'HOSTEL',
  'ROOM_TYPE',
  'ROOM',
  'STUDENT',
  'STUDENT_PHONE',
  'MESS',
  'MESS_CONTACT',
  'MEAL',
  'STAFF',
  'STAFF_PHONE',
  'SUPPLIER',
  'SUPPLIER_PHONE',
  'INVENTORY_ITEM',
  'PROCURES',
  'PAYMENT',
  'PAYMENT_DETAIL'
];

const TABLE_SCHEMAS = {
  WARDEN: [
    { cid: 1, name: 'WardenID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'WardenName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'Email', type: 'VARCHAR(100)', notnull: false, pk: false },
    { cid: 4, name: 'JoiningDate', type: 'VARCHAR(30)', notnull: false, pk: false }
  ],
  WARDEN_PHONE: [
    { cid: 1, name: 'WardenID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  HOSTEL: [
    { cid: 1, name: 'HostelID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'HostelName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'TotalFloors', type: 'INT', notnull: false, pk: false },
    { cid: 4, name: 'WardenID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  ROOM_TYPE: [
    { cid: 1, name: 'TypeID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'TypeName', type: 'VARCHAR(50)', notnull: true, pk: false },
    { cid: 3, name: 'AC_Type', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 4, name: 'Capacity', type: 'INT', notnull: false, pk: false }
  ],
  ROOM: [
    { cid: 1, name: 'RoomNo', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'FloorNo', type: 'INT', notnull: false, pk: false },
    { cid: 3, name: 'Type', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Capacity', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'RoomRent', type: 'INT', notnull: false, pk: false },
    { cid: 6, name: 'HostelID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STUDENT: [
    { cid: 1, name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'FirstName', type: 'VARCHAR(50)', notnull: true, pk: false },
    { cid: 3, name: 'LastName', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Gender', type: 'VARCHAR(15)', notnull: false, pk: false },
    { cid: 5, name: 'DOB', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 6, name: 'Email', type: 'VARCHAR(100)', notnull: false, pk: false },
    { cid: 7, name: 'BloodGroup', type: 'VARCHAR(10)', notnull: false, pk: false },
    { cid: 8, name: 'AllergyInfo', type: 'VARCHAR(150)', notnull: false, pk: false },
    { cid: 9, name: 'PlanType', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 10, name: 'RoomNo', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 11, name: 'HostelID', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 12, name: 'MessID', type: 'VARCHAR(20)', notnull: false, pk: false },
    { cid: 13, name: 'MentorStudentID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STUDENT_PHONE: [
    { cid: 1, name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  MESS: [
    { cid: 1, name: 'MessID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'MessName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'MessType', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Location', type: 'VARCHAR(100)', notnull: false, pk: false }
  ],
  MESS_CONTACT: [
    { cid: 1, name: 'MessID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'ContactNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  MEAL: [
    { cid: 1, name: 'MealID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'MealName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'Description', type: 'VARCHAR(255)', notnull: false, pk: false },
    { cid: 4, name: 'Cost', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'MessID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STAFF: [
    { cid: 1, name: 'StaffID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'StaffName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'JoinDate', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 4, name: 'Salary', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'Role', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 6, name: 'MessID', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  STAFF_PHONE: [
    { cid: 1, name: 'StaffID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  SUPPLIER: [
    { cid: 1, name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'SupplierName', type: 'VARCHAR(100)', notnull: true, pk: false }
  ],
  SUPPLIER_PHONE: [
    { cid: 1, name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pk: true }
  ],
  INVENTORY_ITEM: [
    { cid: 1, name: 'ItemID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'ItemName', type: 'VARCHAR(100)', notnull: true, pk: false },
    { cid: 3, name: 'Category', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 4, name: 'Unit', type: 'VARCHAR(20)', notnull: false, pk: false }
  ],
  PROCURES: [
    { cid: 1, name: 'MessID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 3, name: 'ItemID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 4, name: 'Quantity', type: 'INT', notnull: false, pk: false }
  ],
  PAYMENT: [
    { cid: 1, name: 'PaymentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pk: false },
    { cid: 3, name: 'Amount', type: 'INT', notnull: false, pk: false },
    { cid: 4, name: 'PaymentMode', type: 'VARCHAR(50)', notnull: false, pk: false },
    { cid: 5, name: 'Status', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 6, name: 'PaymentDay', type: 'INT', notnull: false, pk: false },
    { cid: 7, name: 'PaymentMonth', type: 'INT', notnull: false, pk: false },
    { cid: 8, name: 'PaymentYear', type: 'INT', notnull: false, pk: false }
  ],
  PAYMENT_DETAIL: [
    { cid: 1, name: 'PaymentID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 2, name: 'DetailID', type: 'VARCHAR(20)', notnull: true, pk: true },
    { cid: 3, name: 'Month', type: 'VARCHAR(30)', notnull: false, pk: false },
    { cid: 4, name: 'Year', type: 'INT', notnull: false, pk: false },
    { cid: 5, name: 'MessCharges', type: 'INT', notnull: false, pk: false },
    { cid: 6, name: 'OtherCharges', type: 'INT', notnull: false, pk: false }
  ]
};

function isReadQuery(text) {
  if (/\b(DELETE|DETACH|CREATE|MERGE|SET|REMOVE|DROP)\b/i.test(text)) {
    return false;
  }
  return /^\s*(MATCH|RETURN|CALL|SHOW|WITH|SELECT|EXPLAIN)\b/i.test(text);
}

// POST /api/query - Execute Cypher / Graph queries
router.post('/', async (req, res) => {
  try {
    const rawQuery = req.body.sql || req.body.cypher || req.body.query;
    if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query cannot be empty.',
        message: 'Query cannot be empty.'
      });
    }

    const cleanQuery = rawQuery.trim().replace(/;+$/, '');
    const startTime = process.hrtime();

    if (isReadQuery(cleanQuery)) {
      const rows = await query(cleanQuery);
      const diff = process.hrtime(startTime);
      const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

      let columns = [];
      if (Array.isArray(rows) && rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
        columns = Object.keys(rows[0]);
      }

      return res.json({
        success: true,
        type: 'READ',
        query: cleanQuery,
        count: Array.isArray(rows) ? rows.length : 0,
        columns,
        rows: Array.isArray(rows) ? rows : [],
        data: Array.isArray(rows) ? rows : [],
        executionTimeMs
      });
    }

    const result = await execute(cleanQuery);
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    return res.json({
      success: true,
      type: 'WRITE',
      query: cleanQuery,
      changes: 1,
      message: 'Cypher write operation executed successfully.',
      executionTimeMs
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(400).json({
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

// GET /api/query/schema - Schema reference for Studio
router.get('/schema', async (req, res) => {
  try {
    res.json({ success: true, tables: TABLE_SCHEMAS });
  } catch (error) {
    console.error('Error fetching schema for query studio:', error);
    res.status(500).json({ success: false, error: error.message, message: error.message });
  }
});

module.exports = router;
