const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all rooms with hostel and type details
router.get('/', async (req, res) => {
  try {
    const { hostel_id, type_id, search } = req.query;

    let cypher = `
      MATCH (r:Room)
      OPTIONAL MATCH (r)-[:LOCATED_IN]->(h:Hostel)
      OPTIONAL MATCH (r)<-[:ALLOCATED_TO]-(s:Student)
      WHERE 1=1
    `;
    const params = {};

    if (hostel_id && hostel_id.trim()) {
      cypher += ` AND (h.hostelId = $hostel_id OR r.hostelId = $hostel_id) `;
      params.hostel_id = hostel_id.trim();
    }

    if (type_id && type_id.trim()) {
      cypher += ` AND (toLower(r.type) CONTAINS toLower($type_id)) `;
      params.type_id = type_id.trim();
    }

    if (search && search.trim()) {
      cypher += `
        AND (
          toLower(r.roomNo) CONTAINS toLower($search)
          OR toLower(coalesce(h.name, '')) CONTAINS toLower($search)
          OR toLower(coalesce(r.type, '')) CONTAINS toLower($search)
        )
      `;
      params.search = search.trim();
    }

    cypher += `
      WITH r, h, count(DISTINCT s) AS current_occupants
      RETURN
        r.roomNo AS room_id,
        r.roomNo AS room_number,
        r.roomNo AS RoomNo,
        r.floorNo AS floor,
        r.floorNo AS FloorNo,
        r.type AS room_type,
        r.type AS type_name,
        r.type AS Type,
        r.capacity AS capacity,
        r.capacity AS Capacity,
        r.roomRent AS fee_per_month,
        r.roomRent AS RoomRent,
        coalesce(h.hostelId, r.hostelId, '') AS hostel_id,
        coalesce(h.hostelId, r.hostelId, '') AS HostelID,
        'Available' AS status,
        coalesce(h.name, '') AS hostel_name,
        'Campus Block' AS hostel_type,
        current_occupants
      ORDER BY hostel_name ASC, r.floorNo ASC, r.roomNo ASC
    `;

    const rows = await query(cypher, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single room
router.get('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const cypher = `
      MATCH (r:Room {roomNo: $roomId})
      OPTIONAL MATCH (r)-[:LOCATED_IN]->(h:Hostel)
      RETURN
        r.roomNo AS room_id,
        r.roomNo AS room_number,
        r.roomNo AS RoomNo,
        r.floorNo AS floor,
        r.floorNo AS FloorNo,
        r.type AS room_type,
        r.type AS type_name,
        r.type AS Type,
        r.capacity AS capacity,
        r.capacity AS Capacity,
        r.roomRent AS fee_per_month,
        r.roomRent AS RoomRent,
        coalesce(h.hostelId, r.hostelId, '') AS hostel_id,
        coalesce(h.hostelId, r.hostelId, '') AS HostelID,
        'Available' AS status,
        coalesce(h.name, '') AS hostel_name
    `;
    const rows = await query(cypher, { roomId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = rows[0];
    const students = await query(`
      MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room {roomNo: $roomId})
      RETURN
        s.studentId AS student_id,
        s.firstName AS first_name,
        s.lastName AS last_name,
        s.email AS email
    `, { roomId });

    res.json({ success: true, data: { ...room, students } });
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create room
router.post('/', async (req, res) => {
  try {
    const { RoomNo, room_number, FloorNo, floor, Type, type, Capacity, capacity, RoomRent, room_rent, HostelID, hostel_id } = req.body;
    const finalRoomNo = RoomNo || room_number;
    const finalHostelId = HostelID || hostel_id;

    if (!finalRoomNo || !finalHostelId) {
      return res.status(400).json({ success: false, message: 'Room number and hostel ID are required' });
    }

    const finalFloor = Number(FloorNo !== undefined ? FloorNo : (floor || 1));
    const finalType = Type || type || 'Single Non-AC';
    const finalCapacity = Number(Capacity !== undefined ? Capacity : (capacity || 1));
    const finalRent = Number(RoomRent !== undefined ? RoomRent : (room_rent || 4000));

    const createCypher = `
      MERGE (r:Room {roomNo: $finalRoomNo})
      SET r.floorNo = $finalFloor,
          r.type = $finalType,
          r.capacity = $finalCapacity,
          r.roomRent = $finalRent,
          r.hostelId = $finalHostelId
      WITH r
      OPTIONAL MATCH (r)-[rOld:LOCATED_IN]->()
      DELETE rOld
      WITH r
      MATCH (h:Hostel {hostelId: $finalHostelId})
      MERGE (r)-[:LOCATED_IN]->(h)
      RETURN r.roomNo AS roomId
    `;

    await execute(createCypher, {
      finalRoomNo,
      finalFloor,
      finalType,
      finalCapacity,
      finalRent,
      finalHostelId
    });

    res.status(201).json({ success: true, message: 'Room created successfully', roomId: finalRoomNo });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update room
router.put('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const body = req.body || {};

    const existingRows = await query(`MATCH (r:Room {roomNo: $roomId}) RETURN r`, { roomId });
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const existing = existingRows[0].r || existingRows[0];

    const finalFloor = body.FloorNo !== undefined ? Number(body.FloorNo) : (body.floor !== undefined ? Number(body.floor) : Number(existing.floorNo));
    const finalType = body.Type || body.type || body.type_name || existing.type;
    const finalCapacity = body.Capacity !== undefined ? Number(body.Capacity) : (body.capacity !== undefined ? Number(body.capacity) : Number(existing.capacity));
    const finalRent = body.RoomRent !== undefined ? Number(body.RoomRent) : (body.room_rent !== undefined ? Number(body.room_rent) : Number(existing.roomRent));
    const finalHostelId = body.HostelID || body.hostel_id || existing.hostelId;

    const updateCypher = `
      MATCH (r:Room {roomNo: $roomId})
      SET r.floorNo = $finalFloor,
          r.type = $finalType,
          r.capacity = $finalCapacity,
          r.roomRent = $finalRent,
          r.hostelId = $finalHostelId
      WITH r
      OPTIONAL MATCH (r)-[rOld:LOCATED_IN]->()
      DELETE rOld
      WITH r
      FOREACH (_ IN CASE WHEN $finalHostelId IS NOT NULL THEN [1] ELSE [] END |
        MERGE (h:Hostel {hostelId: $finalHostelId})
        MERGE (r)-[:LOCATED_IN]->(h)
      )
      RETURN r.roomNo AS roomId
    `;

    await execute(updateCypher, {
      roomId,
      finalFloor,
      finalType,
      finalCapacity,
      finalRent,
      finalHostelId
    });

    res.json({ success: true, message: 'Room updated successfully' });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE room
router.delete('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const [studentCount] = await query(`
      MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room {roomNo: $roomId})
      RETURN count(s) AS count
    `, { roomId });

    if (studentCount && Number(studentCount.count) > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room: ${studentCount.count} students are currently assigned to it. Please reassign them first.`
      });
    }

    await execute(`
      MATCH (r:Room {roomNo: $roomId})
      DETACH DELETE r
    `, { roomId });

    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
