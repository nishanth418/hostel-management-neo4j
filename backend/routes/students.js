const express = require('express');
const router = express.Router();
const { query, execute } = require('../database');

// GET all students
router.get('/', async (req, res) => {
  try {
    const { search, hostel_id, status } = req.query;

    let cypher = `
      MATCH (s:Student)
      OPTIONAL MATCH (s)-[:ALLOCATED_TO]->(r:Room)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      OPTIONAL MATCH (r)-[:OF_TYPE]->(rt:RoomType)
      WHERE 1=1
    `;
    const params = {};

    if (search && search.trim()) {
      cypher += `
        AND (
          toLower(s.firstName) CONTAINS toLower($search)
          OR toLower(s.lastName) CONTAINS toLower($search)
          OR toLower(s.email) CONTAINS toLower($search)
          OR toLower(coalesce(r.roomNo, s.roomNo, '')) CONTAINS toLower($search)
        )
      `;
      params.search = search.trim();
    }

    if (hostel_id && hostel_id.trim()) {
      cypher += ` AND (h.hostelId = $hostel_id OR s.hostelId = $hostel_id) `;
      params.hostel_id = hostel_id.trim();
    }

    if (status && status.trim()) {
      cypher += ` AND s.planType = $status `;
      params.status = status.trim();
    }

    cypher += `
      RETURN
        s.studentId AS student_id,
        s.studentId AS StudentID,
        s.firstName AS first_name,
        s.firstName AS FirstName,
        s.lastName AS last_name,
        s.lastName AS LastName,
        s.gender AS gender,
        s.gender AS Gender,
        s.dob AS dob,
        s.dob AS DOB,
        s.email AS email,
        s.email AS Email,
        s.bloodGroup AS blood_group,
        s.bloodGroup AS BloodGroup,
        s.allergyInfo AS allergy_info,
        s.allergyInfo AS AllergyInfo,
        s.planType AS plan_type,
        s.planType AS PlanType,
        s.planType AS status,
        coalesce(r.roomNo, s.roomNo, '') AS room_number,
        coalesce(r.roomNo, s.roomNo, '') AS room_id,
        coalesce(r.roomNo, s.roomNo, '') AS RoomNo,
        coalesce(h.hostelId, s.hostelId, '') AS hostel_id,
        coalesce(h.hostelId, s.hostelId, '') AS HostelID,
        coalesce(s.messId, '') AS mess_id,
        coalesce(s.messId, '') AS MessID,
        coalesce(s.mentorStudentId, '') AS mentor_student_id,
        coalesce(s.mentorStudentId, '') AS MentorStudentID,
        r.floorNo AS floor,
        r.floorNo AS FloorNo,
        h.name AS hostel_name,
        h.name AS HostelName,
        rt.typeName AS room_type_name,
        r.roomRent AS fee_per_month,
        reduce(acc = '', p IN coalesce(s.phones, []) | CASE WHEN acc = '' THEN p ELSE acc + ', ' + p END) AS phone_numbers
      ORDER BY s.studentId ASC
    `;

    const rows = await query(cypher, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const cypher = `
      MATCH (s:Student {studentId: $studentId})
      OPTIONAL MATCH (s)-[:ALLOCATED_TO]->(r:Room)
      OPTIONAL MATCH (s)-[:RESIDES_IN]->(h:Hostel)
      OPTIONAL MATCH (r)-[:OF_TYPE]->(rt:RoomType)
      RETURN
        s.studentId AS student_id,
        s.studentId AS StudentID,
        s.firstName AS first_name,
        s.firstName AS FirstName,
        s.lastName AS last_name,
        s.lastName AS LastName,
        s.gender AS gender,
        s.gender AS Gender,
        s.dob AS dob,
        s.dob AS DOB,
        s.email AS email,
        s.email AS Email,
        s.bloodGroup AS blood_group,
        s.bloodGroup AS BloodGroup,
        s.allergyInfo AS allergy_info,
        s.allergyInfo AS AllergyInfo,
        s.planType AS plan_type,
        s.planType AS PlanType,
        s.planType AS status,
        coalesce(r.roomNo, s.roomNo, '') AS room_number,
        coalesce(r.roomNo, s.roomNo, '') AS room_id,
        coalesce(r.roomNo, s.roomNo, '') AS RoomNo,
        coalesce(h.hostelId, s.hostelId, '') AS hostel_id,
        coalesce(h.hostelId, s.hostelId, '') AS HostelID,
        coalesce(s.messId, '') AS mess_id,
        coalesce(s.messId, '') AS MessID,
        coalesce(s.mentorStudentId, '') AS mentor_student_id,
        coalesce(s.mentorStudentId, '') AS MentorStudentID,
        r.floorNo AS floor,
        r.floorNo AS FloorNo,
        h.name AS hostel_name,
        h.name AS HostelName,
        rt.typeName AS room_type_name,
        r.roomRent AS fee_per_month,
        coalesce(s.phones, []) AS phones
    `;
    const rows = await query(cypher, { studentId });

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new student
router.post('/', async (req, res) => {
  try {
    const {
      StudentID, student_id,
      FirstName, first_name,
      LastName, last_name,
      Gender, gender,
      DOB, dob,
      Email, email,
      BloodGroup, blood_group,
      AllergyInfo, allergy_info,
      PlanType, plan_type,
      RoomNo, room_id, room_number,
      HostelID, hostel_id,
      MessID, mess_id,
      MentorStudentID, mentor_student_id,
      phones
    } = req.body;

    const finalId = StudentID || student_id || ('S' + (1000 + Math.floor(Math.random() * 9000)));
    const finalFirstName = FirstName || first_name || '';
    const finalLastName = LastName || last_name || '';
    const finalEmail = Email || email || '';

    if (!finalFirstName || !finalLastName) {
      return res.status(400).json({ success: false, message: 'First and last name are required' });
    }

    const cleanPhones = Array.isArray(phones)
      ? phones.filter(p => p && String(p).trim()).map(p => String(p).trim())
      : [];

    const roomParam = RoomNo || room_number || room_id || null;
    const hostelParam = HostelID || hostel_id || null;
    const messParam = MessID || mess_id || null;
    const mentorParam = MentorStudentID || mentor_student_id || null;

    const createCypher = `
      MERGE (s:Student {studentId: $finalId})
      SET s.firstName = $finalFirstName,
          s.lastName = $finalLastName,
          s.gender = $gender,
          s.dob = $dob,
          s.email = $finalEmail,
          s.bloodGroup = $bloodGroup,
          s.allergyInfo = $allergyInfo,
          s.planType = $planType,
          s.roomNo = $roomParam,
          s.hostelId = $hostelParam,
          s.messId = $messParam,
          s.mentorStudentId = $mentorParam,
          s.phones = $cleanPhones
      WITH s
      // Remove old relationships
      OPTIONAL MATCH (s)-[rOld:ALLOCATED_TO|RESIDES_IN|ENROLLED_IN|MENTORED_BY]->()
      DELETE rOld
      WITH s
      // Link to Room
      FOREACH (_ IN CASE WHEN $roomParam IS NOT NULL THEN [1] ELSE [] END |
        MERGE (r:Room {roomNo: $roomParam})
        MERGE (s)-[:ALLOCATED_TO]->(r)
      )
      // Link to Hostel
      FOREACH (_ IN CASE WHEN $hostelParam IS NOT NULL THEN [1] ELSE [] END |
        MERGE (h:Hostel {hostelId: $hostelParam})
        MERGE (s)-[:RESIDES_IN]->(h)
      )
      // Link to Mess
      FOREACH (_ IN CASE WHEN $messParam IS NOT NULL THEN [1] ELSE [] END |
        MERGE (m:Mess {messId: $messParam})
        MERGE (s)-[:ENROLLED_IN]->(m)
      )
      // Link to Mentor
      FOREACH (_ IN CASE WHEN $mentorParam IS NOT NULL THEN [1] ELSE [] END |
        MERGE (mentor:Student {studentId: $mentorParam})
        MERGE (s)-[:MENTORED_BY]->(mentor)
      )
      RETURN s.studentId AS studentId
    `;

    await execute(createCypher, {
      finalId,
      finalFirstName,
      finalLastName,
      gender: Gender || gender || 'Male',
      dob: DOB || dob || '2004-01-01',
      finalEmail,
      bloodGroup: BloodGroup || blood_group || 'O+',
      allergyInfo: AllergyInfo || allergy_info || 'None',
      planType: PlanType || plan_type || 'Standard',
      roomParam,
      hostelParam,
      messParam,
      mentorParam,
      cleanPhones
    });

    res.status(201).json({ success: true, message: 'Student created successfully', studentId: finalId });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const body = req.body || {};

    const existingRows = await query(`MATCH (s:Student {studentId: $studentId}) RETURN s`, { studentId });
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const existing = existingRows[0].s || existingRows[0];

    const finalFirstName = body.FirstName || body.first_name || existing.firstName;
    const finalLastName = body.LastName || body.last_name || existing.lastName;
    const finalGender = body.Gender || body.gender || existing.gender;
    const finalDob = body.DOB || body.dob || existing.dob;
    const finalEmail = body.Email || body.email || existing.email;
    const finalBlood = body.BloodGroup !== undefined ? (body.BloodGroup || body.blood_group) : existing.bloodGroup;
    const finalAllergy = body.AllergyInfo !== undefined ? (body.AllergyInfo || body.allergy_info) : existing.allergyInfo;
    const finalPlan = body.PlanType || body.plan_type || body.status || existing.planType;
    const finalRoom = body.RoomNo || body.room_number || body.room_id || existing.roomNo || null;
    const finalHostel = body.HostelID || body.hostel_id || existing.hostelId || null;
    const finalMess = body.MessID || body.mess_id || existing.messId || null;
    const finalMentor = body.MentorStudentID || body.mentor_student_id || existing.mentorStudentId || null;

    let finalPhones = existing.phones || [];
    if (body.phones && Array.isArray(body.phones)) {
      finalPhones = body.phones.filter(p => p && String(p).trim()).map(p => String(p).trim());
    }

    const updateCypher = `
      MATCH (s:Student {studentId: $studentId})
      SET s.firstName = $finalFirstName,
          s.lastName = $finalLastName,
          s.gender = $finalGender,
          s.dob = $finalDob,
          s.email = $finalEmail,
          s.bloodGroup = $finalBlood,
          s.allergyInfo = $finalAllergy,
          s.planType = $finalPlan,
          s.roomNo = $finalRoom,
          s.hostelId = $finalHostel,
          s.messId = $finalMess,
          s.mentorStudentId = $finalMentor,
          s.phones = $finalPhones
      WITH s
      OPTIONAL MATCH (s)-[rOld:ALLOCATED_TO|RESIDES_IN|ENROLLED_IN|MENTORED_BY]->()
      DELETE rOld
      WITH s
      FOREACH (_ IN CASE WHEN $finalRoom IS NOT NULL THEN [1] ELSE [] END |
        MERGE (r:Room {roomNo: $finalRoom})
        MERGE (s)-[:ALLOCATED_TO]->(r)
      )
      FOREACH (_ IN CASE WHEN $finalHostel IS NOT NULL THEN [1] ELSE [] END |
        MERGE (h:Hostel {hostelId: $finalHostel})
        MERGE (s)-[:RESIDES_IN]->(h)
      )
      FOREACH (_ IN CASE WHEN $finalMess IS NOT NULL THEN [1] ELSE [] END |
        MERGE (m:Mess {messId: $finalMess})
        MERGE (s)-[:ENROLLED_IN]->(m)
      )
      FOREACH (_ IN CASE WHEN $finalMentor IS NOT NULL THEN [1] ELSE [] END |
        MERGE (mentor:Student {studentId: $finalMentor})
        MERGE (s)-[:MENTORED_BY]->(mentor)
      )
      RETURN s.studentId AS studentId
    `;

    await execute(updateCypher, {
      studentId,
      finalFirstName,
      finalLastName,
      finalGender,
      finalDob,
      finalEmail,
      finalBlood,
      finalAllergy,
      finalPlan,
      finalRoom,
      finalHostel,
      finalMess,
      finalMentor,
      finalPhones
    });

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const existing = await query(`MATCH (s:Student {studentId: $studentId}) RETURN s`, { studentId });
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [paymentCount] = await query(`
      MATCH (p:Payment)-[:PAID_BY]->(s:Student {studentId: $studentId})
      RETURN count(p) AS count
    `, { studentId });

    if (paymentCount && Number(paymentCount.count) > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete student with ${paymentCount.count} existing payment records. Foreign key protection active.`
      });
    }

    await execute(`
      MATCH (s:Student {studentId: $studentId})
      DETACH DELETE s
    `, { studentId });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
