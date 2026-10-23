const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all procurements
router.get('/', async (req, res) => {
  try {
    const { supplier_id, item_id, mess_id } = req.query;

    const rows = await query(`
      MATCH (p:Procurement)
      OPTIONAL MATCH (m:Mess)-[:PLACED_ORDER]->(p)
      OPTIONAL MATCH (p)-[:SUPPLIED_BY]->(s:Supplier)
      OPTIONAL MATCH (p)-[:INCLUDES_ITEM]->(i:InventoryItem)
      WHERE ($supplierId IS NULL OR p.supplierId = $supplierId OR s.supplierId = $supplierId)
        AND ($itemId IS NULL OR p.itemId = $itemId OR i.itemId = $itemId)
        AND ($messId IS NULL OR p.messId = $messId OR m.messId = $messId)
      RETURN
        p.procureId AS procure_id,
        p.messId AS mess_id,
        p.messId AS MessID,
        coalesce(m.name, 'Campus Dining') AS mess_name,
        p.supplierId AS supplier_id,
        p.supplierId AS SupplierID,
        coalesce(s.name, 'Supplier') AS supplier_name,
        p.itemId AS item_id,
        p.itemId AS ItemID,
        coalesce(i.name, 'Item') AS item_name,
        coalesce(i.category, 'General') AS item_category,
        coalesce(i.unit, 'Units') AS item_unit,
        p.quantity AS quantity,
        p.quantity AS Quantity,
        (p.quantity * 100) AS total_cost,
        'Completed' AS status
      ORDER BY p.messId ASC, p.supplierId ASC
    `, {
      supplierId: supplier_id && supplier_id.trim() ? supplier_id.trim() : null,
      itemId: item_id && item_id.trim() ? item_id.trim() : null,
      messId: mess_id && mess_id.trim() ? mess_id.trim() : null
    });

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching procurements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create procurement
router.post('/', async (req, res) => {
  try {
    const { MessID, mess_id, SupplierID, supplier_id, ItemID, item_id, Quantity, quantity } = req.body;
    const finalMessId = MessID || mess_id;
    const finalSupplierId = SupplierID || supplier_id;
    const finalItemId = ItemID || item_id;
    const finalQty = Number(Quantity !== undefined ? Quantity : (quantity || 10));

    if (!finalMessId || !finalSupplierId || !finalItemId) {
      return res.status(400).json({ success: false, message: 'MessID, SupplierID, and ItemID are required' });
    }

    const procureId = `${finalMessId}-${finalSupplierId}-${finalItemId}`;

    await execute(`
      MERGE (p:Procurement {procureId: $procureId})
      SET p.quantity = $quantity,
          p.messId = $messId,
          p.supplierId = $supplierId,
          p.itemId = $itemId
      WITH p
      MATCH (m:Mess {messId: $messId})
      MATCH (s:Supplier {supplierId: $supplierId})
      MATCH (i:InventoryItem {itemId: $itemId})
      MERGE (m)-[:PLACED_ORDER]->(p)
      MERGE (p)-[:SUPPLIED_BY]->(s)
      MERGE (p)-[:INCLUDES_ITEM]->(i)
    `, {
      procureId,
      quantity: finalQty,
      messId: finalMessId,
      supplierId: finalSupplierId,
      itemId: finalItemId
    });

    res.status(201).json({ success: true, message: 'Procurement recorded successfully' });
  } catch (error) {
    console.error('Error recording procurement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update procurement
router.put('/:id?', async (req, res) => {
  try {
    const { MessID, mess_id, SupplierID, supplier_id, ItemID, item_id, Quantity, quantity } = req.body;
    let finalMessId = MessID || mess_id;
    let finalSupplierId = SupplierID || supplier_id;
    let finalItemId = ItemID || item_id;

    if (req.params.id && req.params.id.includes('-')) {
      const parts = req.params.id.split('-');
      if (!finalMessId) finalMessId = parts[0];
      if (!finalSupplierId) finalSupplierId = parts[1];
      if (!finalItemId) finalItemId = parts[2];
    }

    const finalQty = Number(Quantity !== undefined ? Quantity : (quantity !== undefined ? quantity : 10));

    if (!finalMessId || !finalSupplierId || !finalItemId) {
      return res.status(400).json({ success: false, message: 'MessID, SupplierID, and ItemID are required' });
    }

    const procureId = `${finalMessId}-${finalSupplierId}-${finalItemId}`;

    await execute(`
      MERGE (p:Procurement {procureId: $procureId})
      SET p.quantity = $quantity,
          p.messId = $messId,
          p.supplierId = $supplierId,
          p.itemId = $itemId
      WITH p
      MATCH (m:Mess {messId: $messId})
      MATCH (s:Supplier {supplierId: $supplierId})
      MATCH (i:InventoryItem {itemId: $itemId})
      MERGE (m)-[:PLACED_ORDER]->(p)
      MERGE (p)-[:SUPPLIED_BY]->(s)
      MERGE (p)-[:INCLUDES_ITEM]->(i)
    `, {
      procureId,
      quantity: finalQty,
      messId: finalMessId,
      supplierId: finalSupplierId,
      itemId: finalItemId
    });

    res.json({ success: true, message: 'Procurement updated successfully' });
  } catch (error) {
    console.error('Error updating procurement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE procurement
router.delete('/', async (req, res) => {
  try {
    const { MessID, mess_id, SupplierID, supplier_id, ItemID, item_id } = req.query;
    const finalMessId = MessID || mess_id;
    const finalSupplierId = SupplierID || supplier_id;
    const finalItemId = ItemID || item_id;

    if (!finalMessId || !finalSupplierId || !finalItemId) {
      return res.status(400).json({ success: false, message: 'MessID, SupplierID, and ItemID parameters are required' });
    }

    await execute(`
      MATCH (p:Procurement)
      WHERE p.messId = $messId AND p.supplierId = $supplierId AND p.itemId = $itemId
      DETACH DELETE p
    `, {
      messId: finalMessId,
      supplierId: finalSupplierId,
      itemId: finalItemId
    });

    res.json({ success: true, message: 'Procurement removed successfully' });
  } catch (error) {
    console.error('Error deleting procurement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
