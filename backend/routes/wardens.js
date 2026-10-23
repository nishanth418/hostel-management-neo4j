const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all wardens with phone numbers and assigned hostel
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      MATCH (w:Warden)
      OPTIONAL MATCH (h:Hostel)-[:MANAGED_BY]->(w)
      RETURN
        w.wardenId AS warden_id,
        w.wardenId AS WardenID,
        w.name AS name,
        w.name AS WardenName,
        w.email AS email,
        w.email AS Email,
        w.joiningDate AS join_date,
        w.joiningDate AS JoiningDate,
        h.name AS hostel_name,
        h.hostelId AS hostel_id,
        w.phones AS phones
      ORDER BY w.wardenId ASC
    `);

    const formatted = rows.map(r => ({
      ...r,
      phone_numbers: Array.isArray(r.phones) ? r.phones.join(', ') : (r.phones || '')
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching wardens:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single warden
router.get('/:id', async (req, res) => {
  try {
    const wardenId = req.params.id;
    const rows = await query(`
      MATCH (w:Warden {wardenId: $id})
      OPTIONAL MATCH (h:Hostel)-[:MANAGED_BY]->(w)
      RETURN
        w.wardenId AS warden_id,
        w.wardenId AS WardenID,
        w.name AS name,
        w.name AS WardenName,
        w.email AS email,
        w.email AS Email,
        w.joiningDate AS join_date,
        w.joiningDate AS JoiningDate,
        h.name AS hostel_name,
        h.hostelId AS hostel_id,
        w.phones AS phones
    `, { id: wardenId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    const warden = rows[0];
    const phones = Array.isArray(warden.phones) ? warden.phones : [];

    res.json({ success: true, data: { ...warden, phones } });
  } catch (error) {
    console.error('Error fetching warden by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create warden
router.post('/', async (req, res) => {
  try {
    const { WardenID, warden_id, WardenName, name, Email, email, JoiningDate, join_date, phones } = req.body;
    const finalId = WardenID || warden_id || ('W' + (100 + Math.floor(Math.random() * 900)));
    const finalName = WardenName || name;
    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Warden name is required' });
    }

    const phoneList = Array.isArray(phones)
      ? phones.map(p => String(p).trim()).filter(Boolean)
      : [];

    await execute(`
      MERGE (w:Warden {wardenId: $wardenId})
      SET w.name = $name,
          w.email = $email,
          w.joiningDate = $joiningDate,
          w.phones = $phones
    `, {
      wardenId: finalId,
      name: finalName,
      email: Email || email || '',
      joiningDate: JoiningDate || join_date || '01-JAN-22',
      phones: phoneList
    });

    res.status(201).json({ success: true, message: 'Warden created successfully', wardenId: finalId });
  } catch (error) {
    console.error('Error creating warden:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update warden
router.put('/:id', async (req, res) => {
  try {
    const wardenId = req.params.id;
    const body = req.body || {};

    const check = await query(`MATCH (w:Warden {wardenId: $id}) RETURN w`, { id: wardenId });
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    const name = body.WardenName || body.name || null;
    const email = body.Email || body.email || null;
    const joiningDate = body.JoiningDate || body.join_date || null;
    const phones = Array.isArray(body.phones)
      ? body.phones.map(p => String(p).trim()).filter(Boolean)
      : null;

    await execute(`
      MATCH (w:Warden {wardenId: $id})
      SET w.name = CASE WHEN $name IS NOT NULL THEN $name ELSE w.name END,
          w.email = CASE WHEN $email IS NOT NULL THEN $email ELSE w.email END,
          w.joiningDate = CASE WHEN $joiningDate IS NOT NULL THEN $joiningDate ELSE w.joiningDate END,
          w.phones = CASE WHEN $phones IS NOT NULL THEN $phones ELSE w.phones END
    `, {
      id: wardenId,
      name,
      email,
      joiningDate,
      phones
    });

    res.json({ success: true, message: 'Warden updated successfully' });
  } catch (error) {
    console.error('Error updating warden:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE warden
router.delete('/:id', async (req, res) => {
  try {
    const wardenId = req.params.id;
    const check = await query(`
      MATCH (h:Hostel)-[:MANAGED_BY]->(w:Warden {wardenId: $id})
      RETURN count(h) AS count
    `, { id: wardenId });

    const count = check[0] ? Number(check[0].count) : 0;
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete warden: assigned to ${count} hostel(s). Reassign hostel first.`
      });
    }

    await execute(`
      MATCH (w:Warden {wardenId: $id})
      DETACH DELETE w
    `, { id: wardenId });

    res.json({ success: true, message: 'Warden deleted successfully' });
  } catch (error) {
    console.error('Error deleting warden:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
