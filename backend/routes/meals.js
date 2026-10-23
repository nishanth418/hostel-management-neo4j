const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET meals with optional filtering by mess
router.get('/', async (req, res) => {
  try {
    const { mess_id, search } = req.query;

    const rows = await query(`
      MATCH (m:Meal)
      OPTIONAL MATCH (m)-[:SERVED_IN]->(ms:Mess)
      WHERE ($messId IS NULL OR ms.messId = $messId OR m.messId = $messId)
        AND ($search IS NULL OR toLower(m.name) CONTAINS toLower($search) OR toLower(m.description) CONTAINS toLower($search))
      RETURN
        m.mealId AS meal_id,
        m.mealId AS MealID,
        m.name AS meal_name,
        m.name AS name,
        m.name AS MealName,
        m.description AS description,
        m.description AS Description,
        m.cost AS cost,
        m.cost AS Cost,
        coalesce(ms.messId, m.messId) AS mess_id,
        coalesce(ms.messId, m.messId) AS MessID,
        ms.name AS mess_name,
        ms.messType AS mess_type
      ORDER BY coalesce(ms.messId, m.messId) ASC, m.mealId ASC
    `, {
      messId: mess_id && mess_id.trim() ? mess_id.trim() : null,
      search: search && search.trim() ? search.trim() : null
    });

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single meal
router.get('/:id', async (req, res) => {
  try {
    const mealId = req.params.id;
    const rows = await query(`
      MATCH (m:Meal {mealId: $id})
      OPTIONAL MATCH (m)-[:SERVED_IN]->(ms:Mess)
      RETURN
        m.mealId AS meal_id,
        m.mealId AS MealID,
        m.name AS meal_name,
        m.name AS name,
        m.name AS MealName,
        m.description AS description,
        m.description AS Description,
        m.cost AS cost,
        m.cost AS Cost,
        coalesce(ms.messId, m.messId) AS mess_id,
        coalesce(ms.messId, m.messId) AS MessID,
        ms.name AS mess_name
    `, { id: mealId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching meal by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create meal
router.post('/', async (req, res) => {
  try {
    const { MealID, meal_id, MealName, meal_name, name, Description, description, Cost, cost, MessID, mess_id } = req.body;
    const finalId = MealID || meal_id || ('ML' + (Math.floor(Math.random() * 90) + 10));
    const finalName = MealName || meal_name || name;
    const finalMessId = MessID || mess_id;

    if (!finalName || !finalMessId) {
      return res.status(400).json({ success: false, message: 'Meal name and Mess ID are required' });
    }

    await execute(`
      MERGE (m:Meal {mealId: $mealId})
      SET m.name = $name,
          m.description = $description,
          m.cost = $cost,
          m.messId = $messId
      WITH m
      MATCH (ms:Mess {messId: $messId})
      MERGE (m)-[:SERVED_IN]->(ms)
    `, {
      mealId: finalId,
      name: finalName,
      description: Description || description || '',
      cost: Number(Cost !== undefined ? Cost : (cost !== undefined ? cost : 100)),
      messId: finalMessId
    });

    res.status(201).json({ success: true, message: 'Meal created successfully', mealId: finalId });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update meal
router.put('/:id', async (req, res) => {
  try {
    const mealId = req.params.id;
    const body = req.body || {};

    const check = await query(`MATCH (m:Meal {mealId: $id}) RETURN m`, { id: mealId });
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    const name = body.MealName || body.meal_name || body.name || null;
    const description = body.Description !== undefined ? (body.Description || body.description) : (body.description !== undefined ? body.description : null);
    const costVal = body.Cost !== undefined ? Number(body.Cost) : (body.cost !== undefined ? Number(body.cost) : null);
    const finalMessId = body.MessID || body.mess_id || null;

    await execute(`
      MATCH (m:Meal {mealId: $id})
      SET m.name = CASE WHEN $name IS NOT NULL THEN $name ELSE m.name END,
          m.description = CASE WHEN $description IS NOT NULL THEN $description ELSE m.description END,
          m.cost = CASE WHEN $costVal IS NOT NULL THEN $costVal ELSE m.cost END,
          m.messId = CASE WHEN $finalMessId IS NOT NULL THEN $finalMessId ELSE m.messId END
    `, {
      id: mealId,
      name,
      description,
      costVal,
      finalMessId
    });

    if (finalMessId) {
      await execute(`
        MATCH (m:Meal {mealId: $id})-[r:SERVED_IN]->(:Mess)
        DELETE r
      `, { id: mealId });

      await execute(`
        MATCH (m:Meal {mealId: $id}), (ms:Mess {messId: $messId})
        MERGE (m)-[:SERVED_IN]->(ms)
      `, { id: mealId, messId: finalMessId });
    }

    res.json({ success: true, message: 'Meal updated successfully' });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE meal
router.delete('/:id', async (req, res) => {
  try {
    const mealId = req.params.id;
    await execute(`
      MATCH (m:Meal {mealId: $id})
      DETACH DELETE m
    `, { id: mealId });
    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
