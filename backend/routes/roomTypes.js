const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all room types
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      MATCH (rt:RoomType)
      OPTIONAL MATCH (r:Room)-[:OF_TYPE]->(rt)
      WITH rt, count(r) AS total_rooms_configured
      RETURN
        rt.typeId AS type_id,
        rt.typeId AS TypeID,
        rt.typeName AS type_name,
        rt.typeName AS TypeName,
        rt.acType AS ac_type,
        rt.acType AS AC_Type,
        rt.capacity AS capacity,
        rt.capacity AS Capacity,
        5000 AS fee_per_month,
        total_rooms_configured
      ORDER BY rt.typeId ASC
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single room type
router.get('/:id', async (req, res) => {
  try {
    const rows = await query(`
      MATCH (rt:RoomType {typeId: $id})
      RETURN
        rt.typeId AS type_id,
        rt.typeId AS TypeID,
        rt.typeName AS type_name,
        rt.typeName AS TypeName,
        rt.acType AS ac_type,
        rt.acType AS AC_Type,
        rt.capacity AS capacity,
        rt.capacity AS Capacity,
        5000 AS fee_per_month
    `, { id: req.params.id });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching room type by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create room type
router.post('/', async (req, res) => {
  try {
    const { TypeID, type_id, TypeName, type_name, AC_Type, ac_type, Capacity, capacity } = req.body;
    const finalId = TypeID || type_id || ('RT' + (Math.floor(Math.random() * 900) + 10));
    const finalName = TypeName || type_name;

    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Room type name is required' });
    }

    await execute(`
      MERGE (rt:RoomType {typeId: $typeId})
      SET rt.typeName = $typeName,
          rt.acType = $acType,
          rt.capacity = $capacity
    `, {
      typeId: finalId,
      typeName: finalName,
      acType: AC_Type || ac_type || 'Non-AC',
      capacity: Number(Capacity !== undefined ? Capacity : (capacity !== undefined ? capacity : 1))
    });

    res.status(201).json({ success: true, message: 'Room type created successfully', typeId: finalId });
  } catch (error) {
    console.error('Error creating room type:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update room type
router.put('/:id', async (req, res) => {
  try {
    const typeId = req.params.id;
    const body = req.body || {};

    const check = await query(`MATCH (rt:RoomType {typeId: $id}) RETURN rt`, { id: typeId });
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    const typeName = body.TypeName || body.type_name || null;
    const acType = body.AC_Type || body.ac_type || null;
    const capacityVal = body.Capacity !== undefined ? Number(body.Capacity) : (body.capacity !== undefined ? Number(body.capacity) : null);

    await execute(`
      MATCH (rt:RoomType {typeId: $id})
      SET rt.typeName = CASE WHEN $typeName IS NOT NULL THEN $typeName ELSE rt.typeName END,
          rt.acType = CASE WHEN $acType IS NOT NULL THEN $acType ELSE rt.acType END,
          rt.capacity = CASE WHEN $capacityVal IS NOT NULL THEN $capacityVal ELSE rt.capacity END
    `, {
      id: typeId,
      typeName,
      acType,
      capacityVal
    });

    res.json({ success: true, message: 'Room type updated successfully' });
  } catch (error) {
    console.error('Error updating room type:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE room type
router.delete('/:id', async (req, res) => {
  try {
    const typeId = req.params.id;
    await execute(`
      MATCH (rt:RoomType {typeId: $id})
      DETACH DELETE rt
    `, { id: typeId });
    res.json({ success: true, message: 'Room type deleted successfully' });
  } catch (error) {
    console.error('Error deleting room type:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
