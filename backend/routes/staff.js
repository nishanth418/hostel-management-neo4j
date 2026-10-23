const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all staff with phones and mess info
router.get('/', async (req, res) => {
  try {
    const { role, mess_id, search } = req.query;

    const rows = await query(`
      MATCH (st:Staff)
      OPTIONAL MATCH (st)-[:ASSIGNED_TO]->(m:Mess)
      WHERE ($role IS NULL OR st.role = $role)
        AND ($messId IS NULL OR m.messId = $messId OR st.messId = $messId)
        AND ($search IS NULL OR toLower(st.name) CONTAINS toLower($search) OR toLower(st.role) CONTAINS toLower($search))
      RETURN
        st.staffId AS staff_id,
        st.staffId AS StaffID,
        st.name AS name,
        st.name AS StaffName,
        st.joinDate AS join_date,
        st.joinDate AS JoinDate,
        st.salary AS salary,
        st.salary AS Salary,
        st.role AS role,
        st.role AS Role,
        coalesce(m.messId, st.messId) AS mess_id,
        coalesce(m.messId, st.messId) AS MessID,
        m.name AS mess_name,
        st.phones AS phones
      ORDER BY st.staffId ASC
    `, {
      role: role && role.trim() ? role.trim() : null,
      messId: mess_id && mess_id.trim() ? mess_id.trim() : null,
      search: search && search.trim() ? search.trim() : null
    });

    const formatted = rows.map(r => ({
      ...r,
      phone_numbers: Array.isArray(r.phones) ? r.phones.join(', ') : (r.phones || '')
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single staff
router.get('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const rows = await query(`
      MATCH (st:Staff {staffId: $id})
      OPTIONAL MATCH (st)-[:ASSIGNED_TO]->(m:Mess)
      RETURN
        st.staffId AS staff_id,
        st.staffId AS StaffID,
        st.name AS name,
        st.name AS StaffName,
        st.joinDate AS join_date,
        st.joinDate AS JoinDate,
        st.salary AS salary,
        st.salary AS Salary,
        st.role AS role,
        st.role AS Role,
        coalesce(m.messId, st.messId) AS mess_id,
        coalesce(m.messId, st.messId) AS MessID,
        m.name AS mess_name,
        st.phones AS phones
    `, { id: staffId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const staff = rows[0];
    const phones = Array.isArray(staff.phones) ? staff.phones : [];

    res.json({ success: true, data: { ...staff, phones } });
  } catch (error) {
    console.error('Error fetching staff member by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create staff
router.post('/', async (req, res) => {
  try {
    const { StaffID, staff_id, StaffName, name, JoinDate, join_date, Salary, salary, Role, role, MessID, mess_id, phones } = req.body;
    const finalId = StaffID || staff_id || ('ST' + (Math.floor(Math.random() * 90) + 10));
    const finalName = StaffName || name;
    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Staff name is required' });
    }

    const phoneList = Array.isArray(phones)
      ? phones.map(p => String(p).trim()).filter(Boolean)
      : [];
    const finalMessId = MessID || mess_id || null;

    await execute(`
      MERGE (st:Staff {staffId: $staffId})
      SET st.name = $name,
          st.joinDate = $joinDate,
          st.salary = $salary,
          st.role = $role,
          st.messId = $messId,
          st.phones = $phones
    `, {
      staffId: finalId,
      name: finalName,
      joinDate: JoinDate || join_date || '01-JAN-22',
      salary: Number(Salary !== undefined ? Salary : (salary !== undefined ? salary : 25000)),
      role: Role || role || 'Support Staff',
      messId: finalMessId,
      phones: phoneList
    });

    if (finalMessId) {
      await execute(`
        MATCH (st:Staff {staffId: $staffId}), (m:Mess {messId: $messId})
        MERGE (st)-[:ASSIGNED_TO]->(m)
      `, { staffId: finalId, messId: finalMessId });
    }

    res.status(201).json({ success: true, message: 'Staff member created successfully', staffId: finalId });
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const body = req.body || {};

    const check = await query(`MATCH (st:Staff {staffId: $id}) RETURN st`, { id: staffId });
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const name = body.StaffName || body.name || null;
    const joinDate = body.JoinDate || body.join_date || null;
    const salaryVal = body.Salary !== undefined ? Number(body.Salary) : (body.salary !== undefined ? Number(body.salary) : null);
    const role = body.Role || body.role || null;
    const finalMessId = body.MessID || body.mess_id || null;
    const phones = Array.isArray(body.phones)
      ? body.phones.map(p => String(p).trim()).filter(Boolean)
      : null;

    await execute(`
      MATCH (st:Staff {staffId: $id})
      SET st.name = CASE WHEN $name IS NOT NULL THEN $name ELSE st.name END,
          st.joinDate = CASE WHEN $joinDate IS NOT NULL THEN $joinDate ELSE st.joinDate END,
          st.salary = CASE WHEN $salaryVal IS NOT NULL THEN $salaryVal ELSE st.salary END,
          st.role = CASE WHEN $role IS NOT NULL THEN $role ELSE st.role END,
          st.messId = CASE WHEN $finalMessId IS NOT NULL THEN $finalMessId ELSE st.messId END,
          st.phones = CASE WHEN $phones IS NOT NULL THEN $phones ELSE st.phones END
    `, {
      id: staffId,
      name,
      joinDate,
      salaryVal,
      role,
      finalMessId,
      phones
    });

    if (finalMessId) {
      await execute(`
        MATCH (st:Staff {staffId: $id})-[r:ASSIGNED_TO]->(:Mess)
        DELETE r
      `, { id: staffId });

      await execute(`
        MATCH (st:Staff {staffId: $id}), (m:Mess {messId: $messId})
        MERGE (st)-[:ASSIGNED_TO]->(m)
      `, { id: staffId, messId: finalMessId });
    }

    res.json({ success: true, message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    await execute(`
      MATCH (st:Staff {staffId: $id})
      DETACH DELETE st
    `, { id: staffId });
    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
