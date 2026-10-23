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

const TABLE_DEFINITIONS = {
  WARDEN: {
    columns: [
      { name: 'WardenID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'WardenName', type: 'VARCHAR(100)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Email', type: 'VARCHAR(100)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'JoiningDate', type: 'VARCHAR(30)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['WardenID'],
    foreignKeys: [],
    queryCypher: `
      MATCH (w:Warden)
      RETURN w.wardenId AS WardenID, w.name AS WardenName, w.email AS Email, w.joiningDate AS JoiningDate
      ORDER BY w.wardenId ASC
    `,
    countCypher: `MATCH (w:Warden) RETURN count(w) AS count`
  },
  WARDEN_PHONE: {
    columns: [
      { name: 'WardenID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'WARDEN', to: 'WardenID' } },
      { name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pkOrder: 2, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null }
    ],
    primaryKeys: ['WardenID', 'PhoneNo'],
    foreignKeys: [{ from: 'WardenID', table: 'WARDEN', to: 'WardenID' }],
    queryCypher: `
      MATCH (w:Warden)
      UNWIND w.phones AS PhoneNo
      RETURN w.wardenId AS WardenID, PhoneNo
      ORDER BY w.wardenId, PhoneNo
    `,
    countCypher: `
      MATCH (w:Warden)
      UNWIND w.phones AS PhoneNo
      RETURN count(PhoneNo) AS count
    `
  },
  HOSTEL: {
    columns: [
      { name: 'HostelID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'HostelName', type: 'VARCHAR(100)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'TotalFloors', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'WardenID', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'WARDEN', to: 'WardenID' } }
    ],
    primaryKeys: ['HostelID'],
    foreignKeys: [{ from: 'WardenID', table: 'WARDEN', to: 'WardenID' }],
    queryCypher: `
      MATCH (h:Hostel)
      OPTIONAL MATCH (h)-[:MANAGED_BY]->(w:Warden)
      RETURN h.hostelId AS HostelID, h.name AS HostelName, h.totalFloors AS TotalFloors, coalesce(w.wardenId, h.wardenId) AS WardenID
      ORDER BY h.hostelId ASC
    `,
    countCypher: `MATCH (h:Hostel) RETURN count(h) AS count`
  },
  ROOM_TYPE: {
    columns: [
      { name: 'TypeID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'TypeName', type: 'VARCHAR(50)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'AC_Type', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Capacity', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['TypeID'],
    foreignKeys: [],
    queryCypher: `
      MATCH (rt:RoomType)
      RETURN rt.typeId AS TypeID, rt.typeName AS TypeName, rt.acType AS AC_Type, rt.capacity AS Capacity
      ORDER BY rt.typeId ASC
    `,
    countCypher: `MATCH (rt:RoomType) RETURN count(rt) AS count`
  },
  ROOM: {
    columns: [
      { name: 'RoomNo', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'FloorNo', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Type', type: 'VARCHAR(50)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Capacity', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'RoomRent', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'HostelID', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'HOSTEL', to: 'HostelID' } }
    ],
    primaryKeys: ['RoomNo'],
    foreignKeys: [{ from: 'HostelID', table: 'HOSTEL', to: 'HostelID' }],
    queryCypher: `
      MATCH (r:Room)
      OPTIONAL MATCH (r)-[:LOCATED_IN]->(h:Hostel)
      RETURN r.roomNo AS RoomNo, r.floorNo AS FloorNo, r.type AS Type, r.capacity AS Capacity, r.roomRent AS RoomRent, coalesce(h.hostelId, r.hostelId) AS HostelID
      ORDER BY r.roomNo ASC
    `,
    countCypher: `MATCH (r:Room) RETURN count(r) AS count`
  },
  STUDENT: {
    columns: [
      { name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'FirstName', type: 'VARCHAR(50)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'LastName', type: 'VARCHAR(50)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Gender', type: 'VARCHAR(15)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'DOB', type: 'VARCHAR(30)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Email', type: 'VARCHAR(100)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'BloodGroup', type: 'VARCHAR(10)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'AllergyInfo', type: 'VARCHAR(150)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'PlanType', type: 'VARCHAR(50)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'RoomNo', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'ROOM', to: 'RoomNo' } },
      { name: 'HostelID', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'HOSTEL', to: 'HostelID' } },
      { name: 'MessID', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'MESS', to: 'MessID' } },
      { name: 'MentorStudentID', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'STUDENT', to: 'StudentID' } }
    ],
    primaryKeys: ['StudentID'],
    foreignKeys: [
      { from: 'RoomNo', table: 'ROOM', to: 'RoomNo' },
      { from: 'HostelID', table: 'HOSTEL', to: 'HostelID' },
      { from: 'MessID', table: 'MESS', to: 'MessID' },
      { from: 'MentorStudentID', table: 'STUDENT', to: 'StudentID' }
    ],
    queryCypher: `
      MATCH (s:Student)
      OPTIONAL MATCH (s)-[:ALLOCATED_TO]->(r:Room)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      OPTIONAL MATCH (s)-[:ENROLLED_IN]->(m:Mess)
      OPTIONAL MATCH (s)-[:MENTORED_BY]->(mentor:Student)
      RETURN
        s.studentId AS StudentID, s.firstName AS FirstName, s.lastName AS LastName,
        s.gender AS Gender, s.dob AS DOB, s.email AS Email, s.bloodGroup AS BloodGroup,
        s.allergyInfo AS AllergyInfo, s.planType AS PlanType,
        coalesce(r.roomNo, s.roomNo) AS RoomNo,
        coalesce(h.hostelId, s.hostelId) AS HostelID,
        coalesce(m.messId, s.messId) AS MessID,
        coalesce(mentor.studentId, s.mentorStudentId) AS MentorStudentID
      ORDER BY s.studentId ASC
    `,
    countCypher: `MATCH (s:Student) RETURN count(s) AS count`
  },
  STUDENT_PHONE: {
    columns: [
      { name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'STUDENT', to: 'StudentID' } },
      { name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pkOrder: 2, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null }
    ],
    primaryKeys: ['StudentID', 'PhoneNo'],
    foreignKeys: [{ from: 'StudentID', table: 'STUDENT', to: 'StudentID' }],
    queryCypher: `
      MATCH (s:Student)
      UNWIND s.phones AS PhoneNo
      RETURN s.studentId AS StudentID, PhoneNo
      ORDER BY s.studentId, PhoneNo
    `,
    countCypher: `
      MATCH (s:Student)
      UNWIND s.phones AS PhoneNo
      RETURN count(PhoneNo) AS count
    `
  },
  MESS: {
    columns: [
      { name: 'MessID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'MessName', type: 'VARCHAR(100)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'MessType', type: 'VARCHAR(50)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Location', type: 'VARCHAR(100)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['MessID'],
    foreignKeys: [],
    queryCypher: `
      MATCH (m:Mess)
      RETURN m.messId AS MessID, m.name AS MessName, m.messType AS MessType, m.location AS Location
      ORDER BY m.messId ASC
    `,
    countCypher: `MATCH (m:Mess) RETURN count(m) AS count`
  },
  MESS_CONTACT: {
    columns: [
      { name: 'MessID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'MESS', to: 'MessID' } },
      { name: 'ContactNo', type: 'VARCHAR(20)', notnull: true, pkOrder: 2, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null }
    ],
    primaryKeys: ['MessID', 'ContactNo'],
    foreignKeys: [{ from: 'MessID', table: 'MESS', to: 'MessID' }],
    queryCypher: `
      MATCH (m:Mess)
      UNWIND m.contacts AS ContactNo
      RETURN m.messId AS MessID, ContactNo
      ORDER BY m.messId, ContactNo
    `,
    countCypher: `
      MATCH (m:Mess)
      UNWIND m.contacts AS ContactNo
      RETURN count(ContactNo) AS count
    `
  },
  MEAL: {
    columns: [
      { name: 'MealID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'MealName', type: 'VARCHAR(100)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Description', type: 'VARCHAR(255)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Cost', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'MessID', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'MESS', to: 'MessID' } }
    ],
    primaryKeys: ['MealID'],
    foreignKeys: [{ from: 'MessID', table: 'MESS', to: 'MessID' }],
    queryCypher: `
      MATCH (ml:Meal)
      OPTIONAL MATCH (ml)-[:SERVED_IN]->(m:Mess)
      RETURN ml.mealId AS MealID, ml.name AS MealName, ml.description AS Description, ml.cost AS Cost, coalesce(m.messId, ml.messId) AS MessID
      ORDER BY ml.mealId ASC
    `,
    countCypher: `MATCH (ml:Meal) RETURN count(ml) AS count`
  },
  STAFF: {
    columns: [
      { name: 'StaffID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'StaffName', type: 'VARCHAR(100)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'JoinDate', type: 'VARCHAR(30)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Salary', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Role', type: 'VARCHAR(50)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'MessID', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'MESS', to: 'MessID' } }
    ],
    primaryKeys: ['StaffID'],
    foreignKeys: [{ from: 'MessID', table: 'MESS', to: 'MessID' }],
    queryCypher: `
      MATCH (st:Staff)
      OPTIONAL MATCH (st)-[:ASSIGNED_TO]->(m:Mess)
      RETURN st.staffId AS StaffID, st.name AS StaffName, st.joinDate AS JoinDate, st.salary AS Salary, st.role AS Role, coalesce(m.messId, st.messId) AS MessID
      ORDER BY st.staffId ASC
    `,
    countCypher: `MATCH (st:Staff) RETURN count(st) AS count`
  },
  STAFF_PHONE: {
    columns: [
      { name: 'StaffID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'STAFF', to: 'StaffID' } },
      { name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pkOrder: 2, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null }
    ],
    primaryKeys: ['StaffID', 'PhoneNo'],
    foreignKeys: [{ from: 'StaffID', table: 'STAFF', to: 'StaffID' }],
    queryCypher: `
      MATCH (st:Staff)
      UNWIND st.phones AS PhoneNo
      RETURN st.staffId AS StaffID, PhoneNo
      ORDER BY st.staffId, PhoneNo
    `,
    countCypher: `
      MATCH (st:Staff)
      UNWIND st.phones AS PhoneNo
      RETURN count(PhoneNo) AS count
    `
  },
  SUPPLIER: {
    columns: [
      { name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'SupplierName', type: 'VARCHAR(100)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['SupplierID'],
    foreignKeys: [],
    queryCypher: `
      MATCH (sup:Supplier)
      RETURN sup.supplierId AS SupplierID, sup.name AS SupplierName
      ORDER BY sup.supplierId ASC
    `,
    countCypher: `MATCH (sup:Supplier) RETURN count(sup) AS count`
  },
  SUPPLIER_PHONE: {
    columns: [
      { name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'SUPPLIER', to: 'SupplierID' } },
      { name: 'PhoneNo', type: 'VARCHAR(20)', notnull: true, pkOrder: 2, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null }
    ],
    primaryKeys: ['SupplierID', 'PhoneNo'],
    foreignKeys: [{ from: 'SupplierID', table: 'SUPPLIER', to: 'SupplierID' }],
    queryCypher: `
      MATCH (sup:Supplier)
      UNWIND sup.phones AS PhoneNo
      RETURN sup.supplierId AS SupplierID, PhoneNo
      ORDER BY sup.supplierId, PhoneNo
    `,
    countCypher: `
      MATCH (sup:Supplier)
      UNWIND sup.phones AS PhoneNo
      RETURN count(PhoneNo) AS count
    `
  },
  INVENTORY_ITEM: {
    columns: [
      { name: 'ItemID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'ItemName', type: 'VARCHAR(100)', notnull: true, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Category', type: 'VARCHAR(50)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Unit', type: 'VARCHAR(20)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['ItemID'],
    foreignKeys: [],
    queryCypher: `
      MATCH (i:InventoryItem)
      RETURN i.itemId AS ItemID, i.name AS ItemName, i.category AS Category, i.unit AS Unit
      ORDER BY i.itemId ASC
    `,
    countCypher: `MATCH (i:InventoryItem) RETURN count(i) AS count`
  },
  PROCURES: {
    columns: [
      { name: 'MessID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'MESS', to: 'MessID' } },
      { name: 'SupplierID', type: 'VARCHAR(20)', notnull: true, pkOrder: 2, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'SUPPLIER', to: 'SupplierID' } },
      { name: 'ItemID', type: 'VARCHAR(20)', notnull: true, pkOrder: 3, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'INVENTORY_ITEM', to: 'ItemID' } },
      { name: 'Quantity', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['MessID', 'SupplierID', 'ItemID'],
    foreignKeys: [
      { from: 'MessID', table: 'MESS', to: 'MessID' },
      { from: 'SupplierID', table: 'SUPPLIER', to: 'SupplierID' },
      { from: 'ItemID', table: 'INVENTORY_ITEM', to: 'ItemID' }
    ],
    queryCypher: `
      MATCH (p:Procurement)
      RETURN p.messId AS MessID, p.supplierId AS SupplierID, p.itemId AS ItemID, p.quantity AS Quantity
      ORDER BY p.messId, p.supplierId, p.itemId
    `,
    countCypher: `MATCH (p:Procurement) RETURN count(p) AS count`
  },
  PAYMENT: {
    columns: [
      { name: 'PaymentID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'StudentID', type: 'VARCHAR(20)', notnull: true, pkOrder: 0, isPk: false, isFk: true, keyBadge: 'FK', fkRef: { table: 'STUDENT', to: 'StudentID' } },
      { name: 'Amount', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'PaymentMode', type: 'VARCHAR(50)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Status', type: 'VARCHAR(30)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'PaymentDay', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'PaymentMonth', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'PaymentYear', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['PaymentID'],
    foreignKeys: [{ from: 'StudentID', table: 'STUDENT', to: 'StudentID' }],
    queryCypher: `
      MATCH (p:Payment)
      OPTIONAL MATCH (p)-[:PAID_BY]->(s:Student)
      RETURN
        p.paymentId AS PaymentID, coalesce(p.studentId, s.studentId) AS StudentID,
        p.amount AS Amount, p.paymentMode AS PaymentMode, p.status AS Status,
        p.paymentDay AS PaymentDay, p.paymentMonth AS PaymentMonth, p.paymentYear AS PaymentYear
      ORDER BY p.paymentId ASC
    `,
    countCypher: `MATCH (p:Payment) RETURN count(p) AS count`
  },
  PAYMENT_DETAIL: {
    columns: [
      { name: 'PaymentID', type: 'VARCHAR(20)', notnull: true, pkOrder: 1, isPk: true, isFk: true, keyBadge: 'PK, FK', fkRef: { table: 'PAYMENT', to: 'PaymentID' } },
      { name: 'DetailID', type: 'VARCHAR(20)', notnull: true, pkOrder: 2, isPk: true, isFk: false, keyBadge: 'PK', fkRef: null },
      { name: 'Month', type: 'VARCHAR(30)', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'Year', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'MessCharges', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null },
      { name: 'OtherCharges', type: 'INT', notnull: false, pkOrder: 0, isPk: false, isFk: false, keyBadge: null, fkRef: null }
    ],
    primaryKeys: ['PaymentID', 'DetailID'],
    foreignKeys: [{ from: 'PaymentID', table: 'PAYMENT', to: 'PaymentID' }],
    queryCypher: `
      MATCH (pd:PaymentDetail)
      RETURN
        pd.paymentId AS PaymentID, pd.detailId AS DetailID,
        pd.month AS Month, pd.year AS Year,
        pd.messCharges AS MessCharges, pd.otherCharges AS OtherCharges
      ORDER BY pd.paymentId, pd.detailId
    `,
    countCypher: `MATCH (pd:PaymentDetail) RETURN count(pd) AS count`
  }
};

// Middleware to validate table name
function validateTableName(req, res, next) {
  const rawName = req.params.tableName;
  const upperName = (rawName || '').toUpperCase();
  if (!REQUIRED_TABLES.includes(upperName)) {
    return res.status(404).json({
      success: false,
      message: `Table '${rawName}' is not one of the 18 application database tables.`
    });
  }
  req.tableName = upperName;
  next();
}

// GET all 18 table summaries
router.get('/', async (req, res) => {
  try {
    const list = [];
    for (const table of REQUIRED_TABLES) {
      const def = TABLE_DEFINITIONS[table];
      let rowCount = 0;
      try {
        const countRes = await query(def.countCypher);
        rowCount = countRes[0] ? Number(countRes[0].count) : 0;
      } catch (e) {
        console.warn(`Could not count rows for ${table}:`, e.message);
      }
      list.push({
        name: table,
        rowCount,
        columnCount: def.columns.length,
        hasCompositeKey: def.primaryKeys.length > 1
      });
    }
    res.json({ success: true, count: list.length, tables: list });
  } catch (err) {
    console.error('Error fetching table list:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET specific table schema and all records
router.get('/:tableName', validateTableName, async (req, res) => {
  try {
    const table = req.tableName;
    const { search } = req.query;
    const def = TABLE_DEFINITIONS[table];

    let rows = await query(def.queryCypher);

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      rows = rows.filter(r => {
        return Object.values(r).some(val => val !== null && val !== undefined && String(val).toLowerCase().includes(term));
      });
    }

    const countRes = await query(def.countCypher);
    const totalCount = countRes[0] ? Number(countRes[0].count) : rows.length;

    res.json({
      success: true,
      tableName: table,
      columns: def.columns,
      primaryKeys: def.primaryKeys,
      foreignKeys: def.foreignKeys,
      totalRows: totalCount,
      filteredRows: rows.length,
      data: rows
    });
  } catch (err) {
    console.error(`Error querying table '${req.params.tableName}':`, err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST insert new record into table
router.post('/:tableName', validateTableName, async (req, res) => {
  try {
    const table = req.tableName;
    const body = req.body || {};

    if (table === 'WARDEN') {
      await execute(`
        MERGE (w:Warden {wardenId: $WardenID})
        SET w.name = $WardenName, w.email = $Email, w.joiningDate = $JoiningDate
      `, {
        WardenID: body.WardenID,
        WardenName: body.WardenName || '',
        Email: body.Email || '',
        JoiningDate: body.JoiningDate || '01-JAN-22'
      });
    } else if (table === 'WARDEN_PHONE') {
      await execute(`
        MATCH (w:Warden {wardenId: $WardenID})
        SET w.phones = CASE WHEN $PhoneNo IN coalesce(w.phones, []) THEN w.phones ELSE coalesce(w.phones, []) + $PhoneNo END
      `, { WardenID: body.WardenID, PhoneNo: String(body.PhoneNo).trim() });
    } else if (table === 'HOSTEL') {
      await execute(`
        MERGE (h:Hostel {hostelId: $HostelID})
        SET h.name = $HostelName, h.totalFloors = $TotalFloors, h.wardenId = $WardenID
      `, {
        HostelID: body.HostelID,
        HostelName: body.HostelName || '',
        TotalFloors: Number(body.TotalFloors || 3),
        WardenID: body.WardenID || null
      });
      if (body.WardenID) {
        await execute(`
          MATCH (h:Hostel {hostelId: $HostelID}), (w:Warden {wardenId: $WardenID})
          MERGE (h)-[:MANAGED_BY]->(w)
        `, { HostelID: body.HostelID, WardenID: body.WardenID });
      }
    } else if (table === 'ROOM_TYPE') {
      await execute(`
        MERGE (rt:RoomType {typeId: $TypeID})
        SET rt.typeName = $TypeName, rt.acType = $AC_Type, rt.capacity = $Capacity
      `, {
        TypeID: body.TypeID,
        TypeName: body.TypeName || '',
        AC_Type: body.AC_Type || 'Non-AC',
        Capacity: Number(body.Capacity || 1)
      });
    } else if (table === 'ROOM') {
      await execute(`
        MERGE (r:Room {roomNo: $RoomNo})
        SET r.floorNo = $FloorNo, r.type = $Type, r.capacity = $Capacity, r.roomRent = $RoomRent, r.hostelId = $HostelID
      `, {
        RoomNo: body.RoomNo,
        FloorNo: Number(body.FloorNo || 1),
        Type: body.Type || 'Standard',
        Capacity: Number(body.Capacity || 1),
        RoomRent: Number(body.RoomRent || 5000),
        HostelID: body.HostelID || null
      });
      if (body.HostelID) {
        await execute(`
          MATCH (r:Room {roomNo: $RoomNo}), (h:Hostel {hostelId: $HostelID})
          MERGE (r)-[:LOCATED_IN]->(h)
        `, { RoomNo: body.RoomNo, HostelID: body.HostelID });
      }
    } else if (table === 'STUDENT') {
      await execute(`
        MERGE (s:Student {studentId: $StudentID})
        SET s.firstName = $FirstName, s.lastName = $LastName, s.gender = $Gender, s.dob = $DOB,
            s.email = $Email, s.bloodGroup = $BloodGroup, s.allergyInfo = $AllergyInfo, s.planType = $PlanType,
            s.roomNo = $RoomNo, s.hostelId = $HostelID, s.messId = $MessID, s.mentorStudentId = $MentorStudentID
      `, {
        StudentID: body.StudentID,
        FirstName: body.FirstName || '',
        LastName: body.LastName || '',
        Gender: body.Gender || 'Other',
        DOB: body.DOB || '',
        Email: body.Email || '',
        BloodGroup: body.BloodGroup || '',
        AllergyInfo: body.AllergyInfo || '',
        PlanType: body.PlanType || 'Standard',
        RoomNo: body.RoomNo || null,
        HostelID: body.HostelID || null,
        MessID: body.MessID || null,
        MentorStudentID: body.MentorStudentID || null
      });
      if (body.RoomNo) {
        await execute(`MATCH (s:Student {studentId: $sId}), (r:Room {roomNo: $rNo}) MERGE (s)-[:ALLOCATED_TO]->(r)`, { sId: body.StudentID, rNo: body.RoomNo });
      }
      if (body.HostelID) {
        await execute(`MATCH (s:Student {studentId: $sId}), (h:Hostel {hostelId: $hId}) MERGE (s)-[:RESIDES_IN]->(h)`, { sId: body.StudentID, hId: body.HostelID });
      }
      if (body.MessID) {
        await execute(`MATCH (s:Student {studentId: $sId}), (m:Mess {messId: $mId}) MERGE (s)-[:ENROLLED_IN]->(m)`, { sId: body.StudentID, mId: body.MessID });
      }
    } else if (table === 'STUDENT_PHONE') {
      await execute(`
        MATCH (s:Student {studentId: $StudentID})
        SET s.phones = CASE WHEN $PhoneNo IN coalesce(s.phones, []) THEN s.phones ELSE coalesce(s.phones, []) + $PhoneNo END
      `, { StudentID: body.StudentID, PhoneNo: String(body.PhoneNo).trim() });
    } else if (table === 'MESS') {
      await execute(`
        MERGE (m:Mess {messId: $MessID})
        SET m.name = $MessName, m.messType = $MessType, m.location = $Location
      `, {
        MessID: body.MessID,
        MessName: body.MessName || '',
        MessType: body.MessType || 'Mixed',
        Location: body.Location || ''
      });
    } else if (table === 'MESS_CONTACT') {
      await execute(`
        MATCH (m:Mess {messId: $MessID})
        SET m.contacts = CASE WHEN $ContactNo IN coalesce(m.contacts, []) THEN m.contacts ELSE coalesce(m.contacts, []) + $ContactNo END
      `, { MessID: body.MessID, ContactNo: String(body.ContactNo).trim() });
    } else if (table === 'MEAL') {
      await execute(`
        MERGE (ml:Meal {mealId: $MealID})
        SET ml.name = $MealName, ml.description = $Description, ml.cost = $Cost, ml.messId = $MessID
      `, {
        MealID: body.MealID,
        MealName: body.MealName || '',
        Description: body.Description || '',
        Cost: Number(body.Cost || 100),
        MessID: body.MessID || null
      });
      if (body.MessID) {
        await execute(`MATCH (ml:Meal {mealId: $MealID}), (m:Mess {messId: $MessID}) MERGE (ml)-[:SERVED_IN]->(m)`, { MealID: body.MealID, MessID: body.MessID });
      }
    } else if (table === 'STAFF') {
      await execute(`
        MERGE (st:Staff {staffId: $StaffID})
        SET st.name = $StaffName, st.joinDate = $JoinDate, st.salary = $Salary, st.role = $Role, st.messId = $MessID
      `, {
        StaffID: body.StaffID,
        StaffName: body.StaffName || '',
        JoinDate: body.JoinDate || '01-JAN-22',
        Salary: Number(body.Salary || 25000),
        Role: body.Role || 'Staff',
        MessID: body.MessID || null
      });
      if (body.MessID) {
        await execute(`MATCH (st:Staff {staffId: $StaffID}), (m:Mess {messId: $MessID}) MERGE (st)-[:ASSIGNED_TO]->(m)`, { StaffID: body.StaffID, MessID: body.MessID });
      }
    } else if (table === 'STAFF_PHONE') {
      await execute(`
        MATCH (st:Staff {staffId: $StaffID})
        SET st.phones = CASE WHEN $PhoneNo IN coalesce(st.phones, []) THEN st.phones ELSE coalesce(st.phones, []) + $PhoneNo END
      `, { StaffID: body.StaffID, PhoneNo: String(body.PhoneNo).trim() });
    } else if (table === 'SUPPLIER') {
      await execute(`
        MERGE (sup:Supplier {supplierId: $SupplierID})
        SET sup.name = $SupplierName
      `, { SupplierID: body.SupplierID, SupplierName: body.SupplierName || '' });
    } else if (table === 'SUPPLIER_PHONE') {
      await execute(`
        MATCH (sup:Supplier {supplierId: $SupplierID})
        SET sup.phones = CASE WHEN $PhoneNo IN coalesce(sup.phones, []) THEN sup.phones ELSE coalesce(sup.phones, []) + $PhoneNo END
      `, { SupplierID: body.SupplierID, PhoneNo: String(body.PhoneNo).trim() });
    } else if (table === 'INVENTORY_ITEM') {
      await execute(`
        MERGE (i:InventoryItem {itemId: $ItemID})
        SET i.name = $ItemName, i.category = $Category, i.unit = $Unit
      `, {
        ItemID: body.ItemID,
        ItemName: body.ItemName || '',
        Category: body.Category || 'General',
        Unit: body.Unit || 'Kg'
      });
    } else if (table === 'PROCURES') {
      const procureId = `${body.MessID}-${body.SupplierID}-${body.ItemID}`;
      await execute(`
        MERGE (p:Procurement {procureId: $procureId})
        SET p.messId = $MessID, p.supplierId = $SupplierID, p.itemId = $ItemID, p.quantity = $Quantity
        WITH p
        MATCH (m:Mess {messId: $MessID}), (sup:Supplier {supplierId: $SupplierID}), (i:InventoryItem {itemId: $ItemID})
        MERGE (m)-[:PLACED_ORDER]->(p)
        MERGE (p)-[:SUPPLIED_BY]->(sup)
        MERGE (p)-[:INCLUDES_ITEM]->(i)
      `, {
        procureId,
        MessID: body.MessID,
        SupplierID: body.SupplierID,
        ItemID: body.ItemID,
        Quantity: Number(body.Quantity || 10)
      });
    } else if (table === 'PAYMENT') {
      await execute(`
        MERGE (p:Payment {paymentId: $PaymentID})
        SET p.studentId = $StudentID, p.amount = $Amount, p.paymentMode = $PaymentMode, p.status = $Status,
            p.paymentDay = $PaymentDay, p.paymentMonth = $PaymentMonth, p.paymentYear = $PaymentYear
        WITH p
        MATCH (s:Student {studentId: $StudentID})
        MERGE (p)-[:PAID_BY]->(s)
      `, {
        PaymentID: body.PaymentID,
        StudentID: body.StudentID,
        Amount: Number(body.Amount || 0),
        PaymentMode: body.PaymentMode || 'UPI',
        Status: body.Status || 'Successful',
        PaymentDay: Number(body.PaymentDay || 1),
        PaymentMonth: Number(body.PaymentMonth || 1),
        PaymentYear: Number(body.PaymentYear || 2026)
      });
    } else if (table === 'PAYMENT_DETAIL') {
      const id = `${body.PaymentID}-${body.DetailID}`;
      await execute(`
        MERGE (pd:PaymentDetail {id: $id})
        SET pd.paymentId = $PaymentID, pd.detailId = $DetailID, pd.month = $Month, pd.year = $Year,
            pd.messCharges = $MessCharges, pd.otherCharges = $OtherCharges
        WITH pd
        MATCH (p:Payment {paymentId: $PaymentID})
        MERGE (p)-[:HAS_DETAIL]->(pd)
      `, {
        id,
        PaymentID: body.PaymentID,
        DetailID: body.DetailID,
        Month: body.Month || '',
        Year: Number(body.Year || 2026),
        MessCharges: Number(body.MessCharges || 0),
        OtherCharges: Number(body.OtherCharges || 0)
      });
    }

    res.status(201).json({
      success: true,
      message: `Record added to ${table} successfully`
    });
  } catch (err) {
    console.error(`Error inserting into ${req.params.tableName}:`, err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update record in table
router.put('/:tableName', validateTableName, async (req, res) => {
  try {
    const table = req.tableName;
    const { keyCriteria, values } = req.body;

    if (!keyCriteria || !values) {
      return res.status(400).json({ success: false, message: 'keyCriteria and values objects are required' });
    }

    const merged = { ...keyCriteria, ...values };

    // Re-use POST logic since MERGE / SET updates existing nodes idempotently!
    req.body = merged;
    return router.handle({ ...req, method: 'POST', url: `/${table}` }, res);
  } catch (err) {
    console.error(`Error updating record in ${req.params.tableName}:`, err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE record from table
router.delete('/:tableName', validateTableName, async (req, res) => {
  try {
    const table = req.tableName;
    const keyCriteria = req.query;

    if (table === 'WARDEN') {
      await execute(`MATCH (w:Warden {wardenId: $WardenID}) DETACH DELETE w`, { WardenID: keyCriteria.WardenID });
    } else if (table === 'WARDEN_PHONE') {
      await execute(`
        MATCH (w:Warden {wardenId: $WardenID})
        SET w.phones = [p IN coalesce(w.phones, []) WHERE p <> $PhoneNo]
      `, { WardenID: keyCriteria.WardenID, PhoneNo: keyCriteria.PhoneNo });
    } else if (table === 'HOSTEL') {
      await execute(`MATCH (h:Hostel {hostelId: $HostelID}) DETACH DELETE h`, { HostelID: keyCriteria.HostelID });
    } else if (table === 'ROOM_TYPE') {
      await execute(`MATCH (rt:RoomType {typeId: $TypeID}) DETACH DELETE rt`, { TypeID: keyCriteria.TypeID });
    } else if (table === 'ROOM') {
      await execute(`MATCH (r:Room {roomNo: $RoomNo}) DETACH DELETE r`, { RoomNo: keyCriteria.RoomNo });
    } else if (table === 'STUDENT') {
      await execute(`MATCH (s:Student {studentId: $StudentID}) DETACH DELETE s`, { StudentID: keyCriteria.StudentID });
    } else if (table === 'STUDENT_PHONE') {
      await execute(`
        MATCH (s:Student {studentId: $StudentID})
        SET s.phones = [p IN coalesce(s.phones, []) WHERE p <> $PhoneNo]
      `, { StudentID: keyCriteria.StudentID, PhoneNo: keyCriteria.PhoneNo });
    } else if (table === 'MESS') {
      await execute(`MATCH (m:Mess {messId: $MessID}) DETACH DELETE m`, { MessID: keyCriteria.MessID });
    } else if (table === 'MESS_CONTACT') {
      await execute(`
        MATCH (m:Mess {messId: $MessID})
        SET m.contacts = [c IN coalesce(m.contacts, []) WHERE c <> $ContactNo]
      `, { MessID: keyCriteria.MessID, ContactNo: keyCriteria.ContactNo });
    } else if (table === 'MEAL') {
      await execute(`MATCH (ml:Meal {mealId: $MealID}) DETACH DELETE ml`, { MealID: keyCriteria.MealID });
    } else if (table === 'STAFF') {
      await execute(`MATCH (st:Staff {staffId: $StaffID}) DETACH DELETE st`, { StaffID: keyCriteria.StaffID });
    } else if (table === 'STAFF_PHONE') {
      await execute(`
        MATCH (st:Staff {staffId: $StaffID})
        SET st.phones = [p IN coalesce(st.phones, []) WHERE p <> $PhoneNo]
      `, { StaffID: keyCriteria.StaffID, PhoneNo: keyCriteria.PhoneNo });
    } else if (table === 'SUPPLIER') {
      await execute(`MATCH (sup:Supplier {supplierId: $SupplierID}) DETACH DELETE sup`, { SupplierID: keyCriteria.SupplierID });
    } else if (table === 'SUPPLIER_PHONE') {
      await execute(`
        MATCH (sup:Supplier {supplierId: $SupplierID})
        SET sup.phones = [p IN coalesce(sup.phones, []) WHERE p <> $PhoneNo]
      `, { SupplierID: keyCriteria.SupplierID, PhoneNo: keyCriteria.PhoneNo });
    } else if (table === 'INVENTORY_ITEM') {
      await execute(`MATCH (i:InventoryItem {itemId: $ItemID}) DETACH DELETE i`, { ItemID: keyCriteria.ItemID });
    } else if (table === 'PROCURES') {
      await execute(`
        MATCH (p:Procurement)
        WHERE p.messId = $MessID AND p.supplierId = $SupplierID AND p.itemId = $ItemID
        DETACH DELETE p
      `, { MessID: keyCriteria.MessID, SupplierID: keyCriteria.SupplierID, ItemID: keyCriteria.ItemID });
    } else if (table === 'PAYMENT') {
      await execute(`
        MATCH (p:Payment {paymentId: $PaymentID})
        OPTIONAL MATCH (p)-[:HAS_DETAIL]->(pd:PaymentDetail)
        DETACH DELETE pd, p
      `, { PaymentID: keyCriteria.PaymentID });
    } else if (table === 'PAYMENT_DETAIL') {
      await execute(`
        MATCH (pd:PaymentDetail {paymentId: $PaymentID, detailId: $DetailID})
        DETACH DELETE pd
      `, { PaymentID: keyCriteria.PaymentID, DetailID: keyCriteria.DetailID });
    }

    res.json({ success: true, message: `Record deleted from ${table} successfully` });
  } catch (err) {
    console.error(`Error deleting from ${req.params.tableName}:`, err);
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
