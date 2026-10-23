const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    const rows = await query(`
      MATCH (i:InventoryItem)
      WHERE ($category IS NULL OR i.category = $category)
        AND ($search IS NULL OR toLower(i.name) CONTAINS toLower($search) OR toLower(i.category) CONTAINS toLower($search))
      OPTIONAL MATCH (p:Procurement)-[:INCLUDES_ITEM]->(i)
      WITH i, coalesce(sum(p.quantity), 0) AS totalQuantity
      RETURN
        i.itemId AS item_id,
        i.itemId AS ItemID,
        i.name AS item_name,
        i.name AS name,
        i.name AS ItemName,
        i.category AS category,
        i.category AS Category,
        i.unit AS unit,
        i.unit AS Unit,
        totalQuantity AS quantity,
        100 AS min_required_quantity,
        CASE WHEN totalQuantity < 100 THEN 1 ELSE 0 END AS is_low_stock
      ORDER BY i.category ASC, i.name ASC
    `, {
      category: category && category.trim() ? category.trim() : null,
      search: search && search.trim() ? search.trim() : null
    });

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single inventory item
router.get('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const rows = await query(`
      MATCH (i:InventoryItem {itemId: $id})
      OPTIONAL MATCH (p:Procurement)-[:INCLUDES_ITEM]->(i)
      OPTIONAL MATCH (p)-[:SUPPLIED_BY]->(s:Supplier)
      WITH i, p, s
      WITH i, coalesce(sum(p.quantity), 0) AS totalQuantity,
           collect(DISTINCT {
             MessID: p.messId,
             SupplierID: p.supplierId,
             ItemID: i.itemId,
             quantity: p.quantity,
             supplier_name: s.name
           }) AS raw_procurements
      RETURN
        i.itemId AS item_id,
        i.itemId AS ItemID,
        i.name AS item_name,
        i.name AS name,
        i.name AS ItemName,
        i.category AS category,
        i.category AS Category,
        i.unit AS unit,
        i.unit AS Unit,
        totalQuantity AS quantity,
        100 AS min_required_quantity,
        raw_procurements
    `, { id: itemId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const row = rows[0];
    const procurements = (row.raw_procurements || []).filter(p => p && p.ItemID);

    res.json({
      success: true,
      data: {
        item_id: row.item_id,
        ItemID: row.ItemID,
        item_name: row.item_name,
        name: row.name,
        ItemName: row.ItemName,
        category: row.category,
        Category: row.Category,
        unit: row.unit,
        Unit: row.Unit,
        quantity: row.quantity,
        min_required_quantity: row.min_required_quantity,
        procurements
      }
    });
  } catch (error) {
    console.error('Error fetching inventory item by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create inventory item
router.post('/', async (req, res) => {
  try {
    const { ItemID, item_id, ItemName, item_name, name, Category, category, Unit, unit } = req.body;
    const finalId = ItemID || item_id || ('IT' + (100 + Math.floor(Math.random() * 900)));
    const finalName = ItemName || item_name || name;

    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    await execute(`
      MERGE (i:InventoryItem {itemId: $itemId})
      SET i.name = $name,
          i.category = $category,
          i.unit = $unit
    `, {
      itemId: finalId,
      name: finalName,
      category: Category || category || 'General',
      unit: Unit || unit || 'Kg'
    });

    res.status(201).json({ success: true, message: 'Item created successfully', itemId: finalId });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update inventory item
router.put('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const body = req.body || {};

    const check = await query(`MATCH (i:InventoryItem {itemId: $id}) RETURN i`, { id: itemId });
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const name = body.ItemName || body.item_name || body.name || null;
    const category = body.Category || body.category || null;
    const unit = body.Unit || body.unit || null;

    await execute(`
      MATCH (i:InventoryItem {itemId: $id})
      SET i.name = CASE WHEN $name IS NOT NULL THEN $name ELSE i.name END,
          i.category = CASE WHEN $category IS NOT NULL THEN $category ELSE i.category END,
          i.unit = CASE WHEN $unit IS NOT NULL THEN $unit ELSE i.unit END
    `, {
      id: itemId,
      name,
      category,
      unit
    });

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE inventory item
router.delete('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    await execute(`
      MATCH (i:InventoryItem {itemId: $id})
      DETACH DELETE i
    `, { id: itemId });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
