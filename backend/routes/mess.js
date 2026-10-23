const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all mess facilities with contacts
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      MATCH (m:Mess)
      OPTIONAL MATCH (ml:Meal)-[:SERVED_IN]->(m)
      OPTIONAL MATCH (st:Staff)-[:ASSIGNED_TO]->(m)
      WITH m, count(DISTINCT ml) AS total_meals_scheduled, count(DISTINCT st) AS staff_count
      RETURN
        m.messId AS mess_id,
        m.messId AS MessID,
        m.name AS mess_name,
        m.name AS name,
        m.name AS MessName,
        m.messType AS type,
        m.messType AS mess_type,
        m.messType AS MessType,
        m.location AS location,
        m.location AS Location,
        m.contacts AS contacts,
        total_meals_scheduled,
        staff_count
      ORDER BY m.messId ASC
    `);

    const formatted = rows.map(r => ({
      ...r,
      contact_numbers: Array.isArray(r.contacts) ? r.contacts.join(', ') : (r.contacts || '')
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching mess list:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single mess
router.get('/:id', async (req, res) => {
  try {
    const messId = req.params.id;
    const rows = await query(`
      MATCH (m:Mess {messId: $id})
      OPTIONAL MATCH (ml:Meal)-[:SERVED_IN]->(m)
      OPTIONAL MATCH (st:Staff)-[:ASSIGNED_TO]->(m)
      RETURN
        m.messId AS mess_id,
        m.messId AS MessID,
        m.name AS mess_name,
        m.name AS name,
        m.name AS MessName,
        m.messType AS type,
        m.messType AS mess_type,
        m.messType AS MessType,
        m.location AS location,
        m.location AS Location,
        m.contacts AS contacts,
        collect(DISTINCT { meal_id: ml.mealId, meal_name: ml.name, description: ml.description, cost: ml.cost }) AS raw_meals,
        collect(DISTINCT { staff_id: st.staffId, name: st.name, role: st.role }) AS raw_staff
    `, { id: messId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }

    const row = rows[0];
    const contacts = Array.isArray(row.contacts) ? row.contacts : [];
    const meals = (row.raw_meals || []).filter(m => m && m.meal_id);
    const staff = (row.raw_staff || []).filter(s => s && s.staff_id);

    res.json({
      success: true,
      data: {
        mess_id: row.mess_id,
        MessID: row.MessID,
        mess_name: row.mess_name,
        name: row.name,
        MessName: row.MessName,
        type: row.type,
        mess_type: row.mess_type,
        MessType: row.MessType,
        location: row.location,
        Location: row.Location,
        contacts,
        meals,
        staff
      }
    });
  } catch (error) {
    console.error('Error fetching mess by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create mess
router.post('/', async (req, res) => {
  try {
    const { MessID, mess_id, MessName, mess_name, name, MessType, type, mess_type, Location, location, contacts } = req.body;
    const finalId = MessID || mess_id || ('M' + (Math.floor(Math.random() * 90) + 10));
    const finalName = MessName || mess_name || name;
    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Mess name is required' });
    }

    const contactList = Array.isArray(contacts)
      ? contacts.map(c => String(c).trim()).filter(Boolean)
      : [];

    await execute(`
      MERGE (m:Mess {messId: $messId})
      SET m.name = $name,
          m.messType = $messType,
          m.location = $location,
          m.contacts = $contacts
    `, {
      messId: finalId,
      name: finalName,
      messType: MessType || type || mess_type || 'Mixed',
      location: Location || location || 'Campus Block',
      contacts: contactList
    });

    res.status(201).json({ success: true, message: 'Mess created successfully', messId: finalId });
  } catch (error) {
    console.error('Error creating mess:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update mess
router.put('/:id', async (req, res) => {
  try {
    const messId = req.params.id;
    const body = req.body || {};

    const check = await query(`MATCH (m:Mess {messId: $id}) RETURN m`, { id: messId });
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }

    const name = body.MessName || body.mess_name || body.name || null;
    const messType = body.MessType || body.type || body.mess_type || null;
    const location = body.Location || body.location || null;
    const contacts = Array.isArray(body.contacts)
      ? body.contacts.map(c => String(c).trim()).filter(Boolean)
      : null;

    await execute(`
      MATCH (m:Mess {messId: $id})
      SET m.name = CASE WHEN $name IS NOT NULL THEN $name ELSE m.name END,
          m.messType = CASE WHEN $messType IS NOT NULL THEN $messType ELSE m.messType END,
          m.location = CASE WHEN $location IS NOT NULL THEN $location ELSE m.location END,
          m.contacts = CASE WHEN $contacts IS NOT NULL THEN $contacts ELSE m.contacts END
    `, {
      id: messId,
      name,
      messType,
      location,
      contacts
    });

    res.json({ success: true, message: 'Mess updated successfully' });
  } catch (error) {
    console.error('Error updating mess:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE mess
router.delete('/:id', async (req, res) => {
  try {
    const messId = req.params.id;
    await execute(`
      MATCH (m:Mess {messId: $id})
      DETACH DELETE m
    `, { id: messId });
    res.json({ success: true, message: 'Mess deleted successfully' });
  } catch (error) {
    console.error('Error deleting mess:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
