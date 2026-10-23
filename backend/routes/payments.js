const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all payments with student name & payment details
router.get('/', async (req, res) => {
  try {
    const { student_id, status, search } = req.query;

    const rows = await query(`
      MATCH (p:Payment)
      OPTIONAL MATCH (p)-[:PAID_BY]->(s:Student)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      OPTIONAL MATCH (p)-[:HAS_DETAIL]->(pd:PaymentDetail)
      WHERE ($studentId IS NULL OR p.studentId = $studentId OR s.studentId = $studentId)
        AND ($status IS NULL OR toLower(p.status) = toLower($status))
        AND ($search IS NULL OR toLower(p.paymentId) CONTAINS toLower($search) OR toLower(s.firstName) CONTAINS toLower($search) OR toLower(s.lastName) CONTAINS toLower($search))
      WITH p, s, h, count(pd) AS details_count
      RETURN
        p.paymentId AS payment_id,
        p.paymentId AS PaymentID,
        coalesce(p.studentId, s.studentId) AS student_id,
        coalesce(p.studentId, s.studentId) AS StudentID,
        p.amount AS total_amount,
        p.amount AS amount,
        p.amount AS Amount,
        p.paymentMode AS payment_method,
        p.paymentMode AS PaymentMode,
        p.status AS payment_status,
        p.status AS status,
        p.status AS Status,
        p.paymentDay AS PaymentDay,
        p.paymentMonth AS PaymentMonth,
        p.paymentYear AS PaymentYear,
        toString(p.paymentDay) + '-' + toString(p.paymentMonth) + '-' + toString(p.paymentYear) AS payment_date,
        p.paymentId AS transaction_id,
        rtrim(coalesce(s.firstName, '') + ' ' + coalesce(s.lastName, '')) AS student_name,
        s.email AS student_email,
        s.roomNo AS room_number,
        h.name AS hostel_name,
        details_count
      ORDER BY p.paymentId DESC
    `, {
      studentId: student_id && student_id.trim() ? student_id.trim() : null,
      status: status && status.trim() ? status.trim() : null,
      search: search && search.trim() ? search.trim() : null
    });

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single payment with detail items
router.get('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const rows = await query(`
      MATCH (p:Payment {paymentId: $id})
      OPTIONAL MATCH (p)-[:PAID_BY]->(s:Student)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      OPTIONAL MATCH (p)-[:HAS_DETAIL]->(pd:PaymentDetail)
      WITH p, s, h, collect(DISTINCT {
        PaymentID: p.paymentId,
        DetailID: pd.detailId,
        Month: pd.month,
        Year: pd.year,
        MessCharges: pd.messCharges,
        OtherCharges: pd.otherCharges,
        total: coalesce(pd.messCharges, 0) + coalesce(pd.otherCharges, 0)
      }) AS raw_details
      RETURN
        p.paymentId AS payment_id,
        p.paymentId AS PaymentID,
        coalesce(p.studentId, s.studentId) AS student_id,
        coalesce(p.studentId, s.studentId) AS StudentID,
        p.amount AS total_amount,
        p.amount AS amount,
        p.amount AS Amount,
        p.paymentMode AS payment_method,
        p.paymentMode AS PaymentMode,
        p.status AS payment_status,
        p.status AS status,
        p.status AS Status,
        p.paymentDay AS PaymentDay,
        p.paymentMonth AS PaymentMonth,
        p.paymentYear AS PaymentYear,
        toString(p.paymentDay) + '-' + toString(p.paymentMonth) + '-' + toString(p.paymentYear) AS payment_date,
        p.paymentId AS transaction_id,
        rtrim(coalesce(s.firstName, '') + ' ' + coalesce(s.lastName, '')) AS student_name,
        s.email AS student_email,
        s.roomNo AS room_number,
        h.name AS hostel_name,
        raw_details
    `, { id: paymentId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const payment = rows[0];
    const details = (payment.raw_details || []).filter(d => d && d.DetailID);

    res.json({
      success: true,
      data: {
        payment_id: payment.payment_id,
        PaymentID: payment.PaymentID,
        student_id: payment.student_id,
        StudentID: payment.StudentID,
        total_amount: payment.total_amount,
        amount: payment.amount,
        Amount: payment.Amount,
        payment_method: payment.payment_method,
        PaymentMode: payment.PaymentMode,
        payment_status: payment.payment_status,
        status: payment.status,
        Status: payment.Status,
        PaymentDay: payment.PaymentDay,
        PaymentMonth: payment.PaymentMonth,
        PaymentYear: payment.PaymentYear,
        payment_date: payment.payment_date,
        transaction_id: payment.transaction_id,
        student_name: payment.student_name,
        student_email: payment.student_email,
        room_number: payment.room_number,
        hostel_name: payment.hostel_name,
        details
      }
    });
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  try {
    const { PaymentID, payment_id, StudentID, student_id, Amount, total_amount, amount, PaymentMode, payment_method, Status, status, payment_status, PaymentDay, PaymentMonth, PaymentYear, details } = req.body;
    const finalId = PaymentID || payment_id || ('PAY' + (1000 + Math.floor(Math.random() * 9000)));
    const finalStudentId = StudentID || student_id;
    const finalAmount = Number(Amount !== undefined ? Amount : (total_amount !== undefined ? total_amount : (amount || 10000)));
    const now = new Date();
    const day = Number(PaymentDay || now.getDate());
    const month = Number(PaymentMonth || (now.getMonth() + 1));
    const year = Number(PaymentYear || now.getFullYear());

    if (!finalStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    await execute(`
      MERGE (p:Payment {paymentId: $paymentId})
      SET p.studentId = $studentId,
          p.amount = $amount,
          p.paymentMode = $paymentMode,
          p.status = $status,
          p.paymentDay = $paymentDay,
          p.paymentMonth = $paymentMonth,
          p.paymentYear = $paymentYear
      WITH p
      MATCH (s:Student {studentId: $studentId})
      MERGE (p)-[:PAID_BY]->(s)
    `, {
      paymentId: finalId,
      studentId: finalStudentId,
      amount: finalAmount,
      paymentMode: PaymentMode || payment_method || 'UPI',
      status: Status || payment_status || status || 'Successful',
      paymentDay: day,
      paymentMonth: month,
      paymentYear: year
    });

    if (details && Array.isArray(details) && details.length > 0) {
      for (let i = 0; i < details.length; i++) {
        const d = details[i];
        const detailId = d.DetailID || d.detail_id || ('D' + (i + 1));
        const id = `${finalId}-${detailId}`;
        await execute(`
          MERGE (pd:PaymentDetail {id: $id})
          SET pd.paymentId = $paymentId,
              pd.detailId = $detailId,
              pd.month = $month,
              pd.year = $year,
              pd.messCharges = $messCharges,
              pd.otherCharges = $otherCharges
          WITH pd
          MATCH (p:Payment {paymentId: $paymentId})
          MERGE (p)-[:HAS_DETAIL]->(pd)
        `, {
          id,
          paymentId: finalId,
          detailId,
          month: d.Month || d.month || 'Current',
          year: Number(d.Year || d.year || year),
          messCharges: Number(d.MessCharges || d.mess_charges || 0),
          otherCharges: Number(d.OtherCharges || d.other_charges || 0)
        });
      }
    }

    res.status(201).json({ success: true, message: 'Payment recorded successfully', paymentId: finalId });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update payment
router.put('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { Amount, amount, total_amount, PaymentMode, payment_method, Status, status, payment_status, PaymentDay, PaymentMonth, PaymentYear } = req.body;

    const existing = await query(`MATCH (p:Payment {paymentId: $id}) RETURN p`, { id: paymentId });
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const current = existing[0];
    const finalAmount = Number(Amount !== undefined ? Amount : (amount !== undefined ? amount : (total_amount !== undefined ? total_amount : current.amount)));
    const finalMode = PaymentMode || payment_method || current.paymentMode || 'UPI';
    const finalStatus = Status || status || payment_status || current.status || 'Successful';
    const finalDay = PaymentDay !== undefined ? Number(PaymentDay) : (current.paymentDay || 1);
    const finalMonth = PaymentMonth !== undefined ? Number(PaymentMonth) : (current.paymentMonth || 1);
    const finalYear = PaymentYear !== undefined ? Number(PaymentYear) : (current.paymentYear || 2026);

    await execute(`
      MATCH (p:Payment {paymentId: $id})
      SET p.amount = $amount,
          p.paymentMode = $paymentMode,
          p.status = $status,
          p.paymentDay = $paymentDay,
          p.paymentMonth = $paymentMonth,
          p.paymentYear = $paymentYear
    `, {
      id: paymentId,
      amount: finalAmount,
      paymentMode: finalMode,
      status: finalStatus,
      paymentDay: finalDay,
      paymentMonth: finalMonth,
      paymentYear: finalYear
    });

    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    await execute(`
      MATCH (p:Payment {paymentId: $id})
      OPTIONAL MATCH (p)-[:HAS_DETAIL]->(pd:PaymentDetail)
      DETACH DELETE pd, p
    `, { id: paymentId });
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
