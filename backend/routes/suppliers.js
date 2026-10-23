const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all suppliers with phone numbers
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    const rows = await query(`
      MATCH (s:Supplier)
      WHERE ($search IS NULL OR toLower(s.name) CONTAINS toLower($search))
      OPTIONAL MATCH (p:Procurement)-[:SUPPLIED_BY]->(s)
      WITH s, count(p) AS total_orders, coalesce(sum(p.quantity * 100), 0) AS total_procured_value
      RETURN
        s.supplierId AS supplier_id,
        s.supplierId AS SupplierID,
        s.name AS name,
        s.name AS supplier_name,
        s.name AS SupplierName,
        'Provisions' AS category,
        s.phones AS phones,
        total_orders,
        total_procured_value
      ORDER BY s.name ASC
    `, {
      search: search && search.trim() ? search.trim() : null
    });

    const formatted = rows.map(r => ({
      ...r,
      phone_numbers: Array.isArray(r.phones) ? r.phones.join(', ') : (r.phones || '')
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single supplier
router.get('/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const rows = await query(`
      MATCH (s:Supplier {supplierId: $id})
      OPTIONAL MATCH (p:Procurement)-[:SUPPLIED_BY]->(s)
      OPTIONAL MATCH (p)-[:INCLUDES_ITEM]->(i:InventoryItem)
      RETURN
        s.supplierId AS supplier_id,
        s.supplierId AS SupplierID,
        s.name AS name,
        s.name AS supplier_name,
        s.name AS SupplierName,
        'Provisions' AS category,
        s.phones AS phones,
        collect(DISTINCT {
          MessID: p.messId,
          SupplierID: s.supplierId,
          ItemID: i.itemId,
          quantity: p.quantity,
          item_name: i.name,
          unit: i.unit
        }) AS raw_procurements
    `, { id: supplierId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const row = rows[0];
    const phones = Array.isArray(row.phones) ? row.phones : [];
    const procurements = (row.raw_procurements || []).filter(p => p && p.ItemID);

    res.json({
      success: true,
      data: {
        supplier_id: row.supplier_id,
        SupplierID: row.SupplierID,
        name: row.name,
        supplier_name: row.supplier_name,
        SupplierName: row.SupplierName,
        category: row.category,
        phones,
        procurements
      }
    });
  } catch (error) {
    console.error('Error fetching supplier by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create supplier
router.post('/', async (req, res) => {
  try {
    const { SupplierID, supplier_id, SupplierName, supplier_name, name, phones } = req.body;
    const finalId = SupplierID || supplier_id || ('SUP' + (Math.floor(Math.random() * 90) + 10));
    const finalName = SupplierName || supplier_name || name;
    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const phoneList = Array.isArray(phones)
      ? phones.map(p => String(p).trim()).filter(Boolean)
      : [];

    await execute(`
      MERGE (s:Supplier {supplierId: $supplierId})
      SET s.name = $name,
          s.phones = $phones
    `, {
      supplierId: finalId,
      name: finalName,
      phones: phoneList
    });

    res.status(201).json({ success: true, message: 'Supplier created successfully', supplierId: finalId });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    const body = req.body || {};

    const check = await query(`MATCH (s:Supplier {supplierId: $id}) RETURN s`, { id: supplierId });
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const name = body.SupplierName || body.supplier_name || body.name || null;
    const phones = Array.isArray(body.phones)
      ? body.phones.map(p => String(p).trim()).filter(Boolean)
      : null;

    await execute(`
      MATCH (s:Supplier {supplierId: $id})
      SET s.name = CASE WHEN $name IS NOT NULL THEN $name ELSE s.name END,
          s.phones = CASE WHEN $phones IS NOT NULL THEN $phones ELSE s.phones END
    `, {
      id: supplierId,
      name,
      phones
    });

    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    await execute(`
      MATCH (s:Supplier {supplierId: $id})
      DETACH DELETE s
    `, { id: supplierId });
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
