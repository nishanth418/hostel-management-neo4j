const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all hostels with warden info & room count summary
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      MATCH (h:Hostel)
      OPTIONAL MATCH (h)-[:MANAGED_BY]->(w:Warden)
      OPTIONAL MATCH (h)<-[:LOCATED_IN]-(r:Room)
      OPTIONAL MATCH (h)<-[:RESIDES_IN]-(s:Student)
      WITH h, w, count(DISTINCT r) AS total_rooms, count(DISTINCT s) AS occupied_rooms, coalesce(sum(r.capacity), 0) AS total_capacity
      RETURN
        h.hostelId AS hostel_id,
        h.hostelId AS HostelID,
        h.name AS name,
        h.name AS HostelName,
        h.totalFloors AS total_floors,
        h.totalFloors AS TotalFloors,
        w.wardenId AS warden_id,
        w.wardenId AS WardenID,
        'Campus Block' AS type,
        'Campus' AS address,
        w.name AS warden_name,
        w.name AS WardenName,
        w.email AS warden_email,
        total_rooms,
        occupied_rooms,
        (CASE WHEN total_rooms >= occupied_rooms THEN total_rooms - occupied_rooms ELSE 0 END) AS available_rooms,
        total_capacity
      ORDER BY h.hostelId ASC
    `);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single hostel
router.get('/:id', async (req, res) => {
  try {
    const hostelId = req.params.id;
    const rows = await query(`
      MATCH (h:Hostel {hostelId: $hostelId})
      OPTIONAL MATCH (h)-[:MANAGED_BY]->(w:Warden)
      RETURN
        h.hostelId AS hostel_id,
        h.hostelId AS HostelID,
        h.name AS name,
        h.name AS HostelName,
        h.totalFloors AS total_floors,
        h.totalFloors AS TotalFloors,
        w.wardenId AS warden_id,
        w.wardenId AS WardenID,
        'Campus Block' AS type,
        'Campus' AS address,
        w.name AS warden_name,
        w.name AS WardenName,
        w.email AS warden_email
    `, { hostelId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const hostel = rows[0];
    const rooms = await query(`
      MATCH (r:Room)-[:LOCATED_IN]->(h:Hostel {hostelId: $hostelId})
      RETURN
        r.roomNo AS room_id,
        r.roomNo AS room_number,
        r.roomNo AS RoomNo,
        r.floorNo AS floor,
        r.floorNo AS FloorNo,
        r.type AS room_type,
        r.type AS Type,
        r.capacity AS capacity,
        r.capacity AS Capacity,
        r.roomRent AS fee_per_month,
        r.roomRent AS RoomRent,
        h.hostelId AS HostelID
      ORDER BY r.floorNo, r.roomNo
    `, { hostelId });

    res.json({ success: true, data: { ...hostel, rooms } });
  } catch (error) {
    console.error('Error fetching hostel by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create hostel
router.post('/', async (req, res) => {
  try {
    const { HostelID, hostel_id, HostelName, name, TotalFloors, total_floors, WardenID, warden_id } = req.body;
    const finalId = HostelID || hostel_id || ('H' + (Math.floor(Math.random() * 900) + 10));
    const finalName = HostelName || name;
    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Hostel name is required' });
    }
    const finalFloors = Number(TotalFloors || total_floors || 3);
    const finalWardenId = WardenID || warden_id || null;

    const createCypher = `
      MERGE (h:Hostel {hostelId: $finalId})
      SET h.name = $finalName,
          h.totalFloors = $finalFloors,
          h.wardenId = $finalWardenId
      WITH h
      OPTIONAL MATCH (h)-[rOld:MANAGED_BY]->()
      DELETE rOld
      WITH h
      FOREACH (_ IN CASE WHEN $finalWardenId IS NOT NULL THEN [1] ELSE [] END |
        MERGE (w:Warden {wardenId: $finalWardenId})
        MERGE (h)-[:MANAGED_BY]->(w)
      )
      RETURN h.hostelId AS hostelId
    `;

    await execute(createCypher, {
      finalId,
      finalName,
      finalFloors,
      finalWardenId
    });

    res.status(201).json({ success: true, message: 'Hostel created successfully', hostelId: finalId });
  } catch (error) {
    console.error('Error creating hostel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update hostel
router.put('/:id', async (req, res) => {
  try {
    const hostelId = req.params.id;
    const { HostelName, name, TotalFloors, total_floors, WardenID, warden_id } = req.body;

    const existingRows = await query(`MATCH (h:Hostel {hostelId: $hostelId}) RETURN h`, { hostelId });
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }
    const existing = existingRows[0].h || existingRows[0];

    const finalName = HostelName || name || existing.name;
    const finalFloors = TotalFloors !== undefined ? Number(TotalFloors) : (total_floors !== undefined ? Number(total_floors) : Number(existing.totalFloors));
    const finalWardenId = WardenID !== undefined ? WardenID : (warden_id !== undefined ? warden_id : existing.wardenId);

    const updateCypher = `
      MATCH (h:Hostel {hostelId: $hostelId})
      SET h.name = $finalName,
          h.totalFloors = $finalFloors,
          h.wardenId = $finalWardenId
      WITH h
      OPTIONAL MATCH (h)-[rOld:MANAGED_BY]->()
      DELETE rOld
      WITH h
      FOREACH (_ IN CASE WHEN $finalWardenId IS NOT NULL THEN [1] ELSE [] END |
        MERGE (w:Warden {wardenId: $finalWardenId})
        MERGE (h)-[:MANAGED_BY]->(w)
      )
      RETURN h.hostelId AS hostelId
    `;

    await execute(updateCypher, {
      hostelId,
      finalName,
      finalFloors,
      finalWardenId
    });

    res.json({ success: true, message: 'Hostel updated successfully' });
  } catch (error) {
    console.error('Error updating hostel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE hostel
router.delete('/:id', async (req, res) => {
  try {
    const hostelId = req.params.id;
    const [roomCount] = await query(`
      MATCH (r:Room)-[:LOCATED_IN]->(h:Hostel {hostelId: $hostelId})
      RETURN count(r) AS count
    `, { hostelId });

    if (roomCount && Number(roomCount.count) > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete hostel: it currently contains ${roomCount.count} rooms. Please reassign or delete rooms first.`
      });
    }

    await execute(`
      MATCH (h:Hostel {hostelId: $hostelId})
      DETACH DELETE h
    `, { hostelId });

    res.json({ success: true, message: 'Hostel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hostel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
