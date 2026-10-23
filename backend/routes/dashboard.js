const express = require('express');
const router = express.Router();
const { query } = require('../database');

router.get('/stats', async (req, res) => {
  try {
    // 1. Core KPIs
    const [studentsRow] = await query(`MATCH (s:Student) RETURN count(s) AS count`);
    const [hostelsRow] = await query(`MATCH (h:Hostel) RETURN count(h) AS count`);
    const [roomsRow] = await query(`MATCH (r:Room) RETURN count(r) AS count`);
    const [staffRow] = await query(`MATCH (st:Staff) RETURN count(st) AS count`);
    const [suppliersRow] = await query(`MATCH (sup:Supplier) RETURN count(sup) AS count`);
    const [inventoryRow] = await query(`MATCH (i:InventoryItem) RETURN count(i) AS count`);
    const [paymentsAmountRow] = await query(`
      MATCH (p:Payment)
      WHERE p.status = 'Successful'
      RETURN coalesce(sum(p.amount), 0) AS total
    `);
    const [paymentsCountRow] = await query(`MATCH (p:Payment) RETURN count(p) AS count`);

    const totalStudents = Number(studentsRow?.count || 0);
    const totalHostels = Number(hostelsRow?.count || 0);
    const totalRooms = Number(roomsRow?.count || 0);
    const totalStaff = Number(staffRow?.count || 0);
    const totalSuppliers = Number(suppliersRow?.count || 0);
    const totalInventoryItems = Number(inventoryRow?.count || 0);
    const totalPaymentsAmount = Number(paymentsAmountRow?.total || 0);
    const totalPaymentsCount = Number(paymentsCountRow?.count || 0);

    const occupiedRooms = totalStudents;
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 2. Hostel occupancy breakdown
    const hostelOccupancy = await query(`
      MATCH (h:Hostel)
      OPTIONAL MATCH (h)<-[:LOCATED_IN]-(r:Room)
      OPTIONAL MATCH (h)<-[:RESIDES_IN]-(s:Student)
      WITH h, count(DISTINCT r) AS total_rooms, count(DISTINCT s) AS occupied_rooms
      RETURN
        h.hostelId AS HostelID,
        h.name AS name,
        'Campus Block' AS type,
        total_rooms,
        occupied_rooms,
        round((occupied_rooms * 100.0 / CASE WHEN total_rooms = 0 THEN 1 ELSE total_rooms END), 1) AS occupancy_rate
      ORDER BY h.hostelId ASC
    `);

    // 3. Low stock / inventory items
    const lowStockItems = await query(`
      MATCH (i:InventoryItem)
      OPTIONAL MATCH (p:Procurement)-[:INCLUDES_ITEM]->(i)
      WITH i, coalesce(p.quantity, 0) AS quantity
      RETURN
        i.itemId AS item_id,
        i.name AS item_name,
        i.category AS category,
        quantity,
        100 AS min_required_quantity,
        i.unit AS unit
      LIMIT 5
    `);

    // 4. Recent payments
    const recentPayments = await query(`
      MATCH (p:Payment)-[:PAID_BY]->(s:Student)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      RETURN
        p.paymentId AS payment_id,
        p.paymentId AS transaction_id,
        toString(p.paymentDay) + '-' + toString(p.paymentMonth) + '-' + toString(p.paymentYear) AS payment_date,
        p.amount AS total_amount,
        p.paymentMode AS payment_method,
        p.status AS payment_status,
        s.firstName + ' ' + s.lastName AS student_name,
        coalesce(s.roomNo, '') AS room_number,
        coalesce(h.name, '') AS hostel_name
      ORDER BY p.paymentId DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalHostels,
          totalRooms,
          availableRooms,
          occupiedRooms,
          totalStaff,
          totalSuppliers,
          totalInventoryItems,
          totalPaymentsAmount,
          totalPaymentsCount,
          occupancyRate
        },
        hostelOccupancy,
        lowStockItems,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats from Neo4j:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
