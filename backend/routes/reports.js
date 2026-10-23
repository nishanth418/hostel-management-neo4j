const express = require('express');
const router = express.Router();
const { query } = require('../database');

const REPORT_DEFINITIONS = {
  'student-room-hostel': {
    title: '1. Student + Room + Hostel Report',
    description: 'Detailed allocation listing of students with their assigned rooms, floors, and hostels.',
    cypher: `
      MATCH (s:Student)
      OPTIONAL MATCH (s)-[:ALLOCATED_TO]->(r:Room)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      RETURN
        s.studentId AS StudentID,
        rtrim(coalesce(s.firstName, '') + ' ' + coalesce(s.lastName, '')) AS StudentName,
        s.email AS Email,
        s.gender AS Gender,
        s.planType AS PlanType,
        coalesce(r.roomNo, s.roomNo, 'Unassigned') AS RoomNo,
        coalesce(r.floorNo, 0) AS FloorNo,
        coalesce(h.name, 'Unassigned') AS HostelName
      ORDER BY s.studentId ASC
    `
  },
  'student-phones': {
    title: '2. Student + Student Phone Report',
    description: 'Multi-phone contact registry mapping all contact numbers per student.',
    cypher: `
      MATCH (s:Student)
      UNWIND s.phones AS PhoneNo
      RETURN
        s.studentId AS StudentID,
        rtrim(coalesce(s.firstName, '') + ' ' + coalesce(s.lastName, '')) AS StudentName,
        s.email AS Email,
        PhoneNo
      ORDER BY s.studentId, PhoneNo
    `
  },
  'hostel-warden': {
    title: '3. Hostel + Warden Report',
    description: 'Administrative hierarchy connecting each hostel building to its presiding warden and phone numbers.',
    cypher: `
      MATCH (h:Hostel)
      OPTIONAL MATCH (h)-[:MANAGED_BY]->(w:Warden)
      RETURN
        h.hostelId AS HostelID,
        h.name AS HostelName,
        h.totalFloors AS TotalFloors,
        w.wardenId AS WardenID,
        coalesce(w.name, 'No Warden Assigned') AS WardenName,
        coalesce(w.email, '-') AS WardenEmail,
        w.phones AS phones
      ORDER BY h.hostelId ASC
    `,
    formatter: (rows) => rows.map(r => ({
      ...r,
      WardenPhones: Array.isArray(r.phones) ? r.phones.join(', ') : (r.phones || '')
    }))
  },
  'room-type-hostel': {
    title: '4. Room + Hostel Report',
    description: 'Inventory of all rooms with room configurations, bed capacities, room rents, and hostel locations.',
    cypher: `
      MATCH (r:Room)
      OPTIONAL MATCH (r)-[:LOCATED_IN]->(h:Hostel)
      RETURN
        r.roomNo AS RoomNo,
        r.floorNo AS FloorNo,
        r.type AS RoomType,
        r.capacity AS Capacity,
        r.roomRent AS RoomRent,
        coalesce(h.name, 'Campus Hostel') AS HostelName
      ORDER BY HostelName, r.floorNo, r.roomNo
    `
  },
  'mess-meal': {
    title: '5. Mess + Meal Report',
    description: 'Meal menus, descriptions, and costs across all mess halls.',
    cypher: `
      MATCH (ml:Meal)
      OPTIONAL MATCH (ml)-[:SERVED_IN]->(m:Mess)
      RETURN
        m.messId AS MessID,
        m.name AS MessName,
        m.messType AS MessType,
        m.location AS Location,
        ml.mealId AS MealID,
        ml.name AS MealName,
        ml.description AS Description,
        ml.cost AS Cost
      ORDER BY m.messId, ml.mealId
    `
  },
  'mess-staff': {
    title: '6. Mess + Staff Report',
    description: 'Kitchen and service personnel assigned to each mess hall with roles and contacts.',
    cypher: `
      MATCH (st:Staff)
      OPTIONAL MATCH (st)-[:ASSIGNED_TO]->(m:Mess)
      RETURN
        m.messId AS MessID,
        m.name AS MessName,
        st.staffId AS StaffID,
        st.name AS StaffName,
        st.role AS Role,
        st.salary AS Salary,
        st.phones AS phones
      ORDER BY m.name, st.role, st.name
    `,
    formatter: (rows) => rows.map(r => ({
      ...r,
      StaffPhones: Array.isArray(r.phones) ? r.phones.join(', ') : (r.phones || '')
    }))
  },
  'supplier-inventory': {
    title: '7. Supplier + Inventory Report',
    description: 'Matrix of verified vendors and the inventory items procured.',
    cypher: `
      MATCH (p:Procurement)
      OPTIONAL MATCH (p)-[:SUPPLIED_BY]->(s:Supplier)
      OPTIONAL MATCH (p)-[:INCLUDES_ITEM]->(i:InventoryItem)
      RETURN
        s.supplierId AS SupplierID,
        s.name AS SupplierName,
        i.itemId AS ItemID,
        i.name AS ItemName,
        i.category AS Category,
        i.unit AS Unit,
        p.quantity AS Quantity
      ORDER BY s.name, i.name
    `
  },
  'procurement-supplier-inventory': {
    title: '8. Procurement + Supplier + Inventory Report',
    description: 'Purchase ledger linking procurement quantities to mess halls, vendors, and items.',
    cypher: `
      MATCH (p:Procurement)
      OPTIONAL MATCH (m:Mess)-[:PLACED_ORDER]->(p)
      OPTIONAL MATCH (p)-[:SUPPLIED_BY]->(s:Supplier)
      OPTIONAL MATCH (p)-[:INCLUDES_ITEM]->(i:InventoryItem)
      RETURN
        m.name AS MessName,
        s.name AS SupplierName,
        i.name AS ItemName,
        i.category AS Category,
        p.quantity AS Quantity,
        i.unit AS Unit
      ORDER BY m.name, s.name
    `
  },
  'student-payment': {
    title: '9. Student + Payment Report',
    description: 'Complete fee payment transactions joined with student records.',
    cypher: `
      MATCH (p:Payment)
      OPTIONAL MATCH (p)-[:PAID_BY]->(s:Student)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      RETURN
        p.paymentId AS PaymentID,
        p.amount AS Amount,
        p.paymentMode AS PaymentMode,
        p.status AS Status,
        toString(p.paymentDay) + '-' + toString(p.paymentMonth) + '-' + toString(p.paymentYear) AS PaymentDate,
        s.studentId AS StudentID,
        rtrim(coalesce(s.firstName, '') + ' ' + coalesce(s.lastName, '')) AS StudentName,
        s.email AS Email,
        s.roomNo AS RoomNo,
        h.name AS HostelName
      ORDER BY p.paymentId ASC
    `
  },
  'hostel-occupancy': {
    title: '10. Overall Hostel Occupancy Report',
    description: 'High-level aggregation of hostels, total rooms, and bed capacity.',
    cypher: `
      MATCH (h:Hostel)
      OPTIONAL MATCH (r:Room)-[:LOCATED_IN]->(h)
      WITH h, count(r) AS TotalRooms, coalesce(sum(r.capacity), 0) AS TotalBedCapacity
      OPTIONAL MATCH (s:Student)-[:RESIDES_IN]->(h)
      RETURN
        h.hostelId AS HostelID,
        h.name AS HostelName,
        h.totalFloors AS TotalFloors,
        TotalRooms,
        TotalBedCapacity,
        count(s) AS AssignedStudents
      ORDER BY h.hostelId
    `
  },
  'available-rooms': {
    title: '11. Available Rooms Report',
    description: 'Directory of rooms and student assignments across campus.',
    cypher: `
      MATCH (r:Room)
      OPTIONAL MATCH (r)-[:LOCATED_IN]->(h:Hostel)
      OPTIONAL MATCH (s:Student)-[:ALLOCATED_TO]->(r)
      RETURN
        r.roomNo AS RoomNo,
        r.floorNo AS FloorNo,
        r.type AS RoomType,
        r.capacity AS Capacity,
        r.roomRent AS RoomRent,
        coalesce(h.name, 'Campus Hostel') AS HostelName,
        count(s) AS OccupantsCount
      ORDER BY HostelName, r.floorNo, r.roomNo
    `
  },
  'student-payment-summary': {
    title: '12. Student Payment Summary Report',
    description: 'Financial rollup calculating total payment amounts aggregated per student.',
    cypher: `
      MATCH (s:Student)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      OPTIONAL MATCH (p:Payment)-[:PAID_BY]->(s)
      RETURN
        s.studentId AS StudentID,
        rtrim(coalesce(s.firstName, '') + ' ' + coalesce(s.lastName, '')) AS StudentName,
        s.email AS Email,
        s.roomNo AS RoomNo,
        h.name AS HostelName,
        count(p) AS TotalTransactions,
        coalesce(sum(p.amount), 0) AS TotalPaidAmount
      ORDER BY TotalPaidAmount DESC
    `
  },
  'inventory-procurement-summary': {
    title: '13. Inventory & Procurement Summary Report',
    description: 'Combined stock and procurement totals grouped by inventory item.',
    cypher: `
      MATCH (i:InventoryItem)
      OPTIONAL MATCH (p:Procurement)-[:INCLUDES_ITEM]->(i)
      RETURN
        i.itemId AS ItemID,
        i.name AS ItemName,
        i.category AS Category,
        i.unit AS Unit,
        count(p) AS ProcurementOrdersCount,
        coalesce(sum(p.quantity), 0) AS TotalProcuredQuantity
      ORDER BY i.category, i.name
    `
  }
};

// GET list of all available reports
router.get('/', (req, res) => {
  const list = Object.keys(REPORT_DEFINITIONS).map(key => ({
    key,
    title: REPORT_DEFINITIONS[key].title,
    description: REPORT_DEFINITIONS[key].description
  }));
  res.json({ success: true, count: list.length, data: list });
});

// GET execution of specific report
router.get('/:reportKey', async (req, res) => {
  try {
    const { reportKey } = req.params;
    const report = REPORT_DEFINITIONS[reportKey];
    if (!report) {
      return res.status(404).json({ success: false, message: `Report '${reportKey}' not found` });
    }

    const startTime = process.hrtime();
    let rows = await query(report.cypher);
    if (typeof report.formatter === 'function') {
      rows = report.formatter(rows);
    }
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    res.json({
      success: true,
      reportKey,
      title: report.title,
      description: report.description,
      sql: report.cypher.trim(),
      cypher: report.cypher.trim(),
      executionTimeMs,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error(`Error running report '${req.params.reportKey}':`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
