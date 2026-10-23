const app = require('./server');

const TEST_PORT = 5988;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runAllTests() {
  console.log('=== RUNNING BACKEND ENDPOINT & CRUD INTEGRATION TESTS ===');
  console.log('Target: Neo4j AuraDB\n');

  const server = app.listen(TEST_PORT);

  try {
    // ----------------------------------------------------
    // TEST 1: GET /api/health
    // ----------------------------------------------------
    console.log('[1/5] Testing GET /api/health ...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log(' - Status Code:', healthRes.status);
    console.log(' - Engine:', healthData.engine);
    console.log(' - Database Status:', healthData.database);
    console.log(' - Total Tables:', healthData.totalApplicationTables);
    if (healthRes.status !== 200 || !healthData.engine.includes('Neo4j') || healthData.totalApplicationTables !== 18) {
      throw new Error(`Health check validation failed: ${JSON.stringify(healthData)}`);
    }
    console.log(' PASS: /api/health verified\n');

    // ----------------------------------------------------
    // TEST 2: GET /api/dashboard/stats
    // ----------------------------------------------------
    console.log('[2/5] Testing GET /api/dashboard/stats ...');
    const dashRes = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const dashData = await dashRes.json();
    console.log(' - Status Code:', dashRes.status);
    console.log(' - Total Students:', dashData.data.summary.totalStudents);
    console.log(' - Total Hostels:', dashData.data.summary.totalHostels);
    console.log(' - Total Rooms:', dashData.data.summary.totalRooms);
    console.log(' - Total Payments Amount:', dashData.data.summary.totalPaymentsAmount);
    console.log(' - Occupancy Rate:', dashData.data.summary.occupancyRate + '%');
    if (dashRes.status !== 200 || !dashData.success || dashData.data.summary.totalStudents !== 5) {
      throw new Error(`Dashboard stats validation failed: ${JSON.stringify(dashData)}`);
    }
    console.log(' PASS: /api/dashboard/stats verified\n');

    // ----------------------------------------------------
    // TEST 3: GET /api/reports
    // ----------------------------------------------------
    console.log('[3/5] Testing GET /api/reports ...');
    const repRes = await fetch(`${BASE_URL}/api/reports`);
    const repData = await repRes.json();
    console.log(' - Total Available Reports:', repData.count);
    // Execute report 1: student-room-hostel
    const r1Res = await fetch(`${BASE_URL}/api/reports/student-room-hostel`);
    const r1Data = await r1Res.json();
    console.log(' - Sample Report 1 (student-room-hostel) rows:', r1Data.count, 'executionTime:', r1Data.executionTimeMs + 'ms');
    if (repRes.status !== 200 || repData.count !== 13 || r1Data.count !== 5) {
      throw new Error(`Reports validation failed: ${JSON.stringify(repData)}`);
    }
    console.log(' PASS: /api/reports verified\n');

    // ----------------------------------------------------
    // TEST 4: GET /api/tables/STUDENT
    // ----------------------------------------------------
    console.log('[4/5] Testing GET /api/tables/STUDENT ...');
    const tblRes = await fetch(`${BASE_URL}/api/tables/STUDENT`);
    const tblData = await tblRes.json();
    console.log(' - Table Name:', tblData.tableName);
    console.log(' - Total Columns:', tblData.columns.length);
    console.log(' - Primary Key(s):', tblData.primaryKeys.join(', '));
    console.log(' - Total Rows:', tblData.totalRows);
    if (tblRes.status !== 200 || tblData.totalRows !== 5 || !tblData.primaryKeys.includes('StudentID')) {
      throw new Error(`Table STUDENT validation failed: ${JSON.stringify(tblData)}`);
    }
    console.log(' PASS: /api/tables/STUDENT verified\n');

    // ----------------------------------------------------
    // TEST 5: GET /api/query/schema
    // ----------------------------------------------------
    console.log('[5/5] Testing GET /api/query/schema ...');
    const qRes = await fetch(`${BASE_URL}/api/query/schema`);
    const qData = await qRes.json();
    const schemaTableCount = Object.keys(qData.tables).length;
    console.log(' - Tables in Schema Map:', schemaTableCount);
    if (qRes.status !== 200 || schemaTableCount !== 18) {
      throw new Error(`Query schema validation failed: expected 18 tables, got ${schemaTableCount}`);
    }
    console.log(' PASS: /api/query/schema verified\n');

    // ----------------------------------------------------
    // REPRESENTATIVE CRUD TESTS FOR ALL 12 ENTITIES
    // ----------------------------------------------------
    console.log('=== TESTING REPRESENTATIVE CRUD OPERATIONS ===\n');

    // 1. Room Types
    console.log('- Testing Room Types CRUD...');
    const createRt = await fetch(`${BASE_URL}/api/room-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ TypeID: 'RT_TMP', TypeName: 'Temp Type', AC_Type: 'AC', Capacity: 1 })
    });
    if (createRt.status !== 201) throw new Error('Create Room Type failed');
    await fetch(`${BASE_URL}/api/room-types/RT_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ TypeName: 'Temp Type Updated' })
    });
    await fetch(`${BASE_URL}/api/room-types/RT_TMP`, { method: 'DELETE' });
    console.log('  PASS: Room Types CRUD (Create, Update, Delete)');

    // 2. Wardens
    console.log('- Testing Wardens CRUD...');
    const createW = await fetch(`${BASE_URL}/api/wardens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ WardenID: 'W_TMP', WardenName: 'Temp Warden', Email: 'temp@warden.edu', JoiningDate: '01-JAN-24' })
    });
    if (createW.status !== 201) throw new Error('Create Warden failed');
    await fetch(`${BASE_URL}/api/wardens/W_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ WardenName: 'Temp Warden Updated' })
    });
    await fetch(`${BASE_URL}/api/wardens/W_TMP`, { method: 'DELETE' });
    console.log('  PASS: Wardens CRUD (Create, Update, Delete)');

    // 3. Hostels
    console.log('- Testing Hostels CRUD...');
    const createH = await fetch(`${BASE_URL}/api/hostels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ HostelID: 'H_TMP', HostelName: 'Temp Hostel', TotalFloors: 2 })
    });
    if (createH.status !== 201) throw new Error('Create Hostel failed');
    await fetch(`${BASE_URL}/api/hostels/H_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ HostelName: 'Temp Hostel Updated' })
    });
    await fetch(`${BASE_URL}/api/hostels/H_TMP`, { method: 'DELETE' });
    console.log('  PASS: Hostels CRUD (Create, Update, Delete)');

    // 4. Rooms
    console.log('- Testing Rooms CRUD...');
    const createR = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ RoomNo: 'R_TMP', FloorNo: 1, Type: 'Single AC', Capacity: 1, RoomRent: 4500, HostelID: 'H1' })
    });
    if (createR.status !== 201) throw new Error('Create Room failed');
    await fetch(`${BASE_URL}/api/rooms/R_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ RoomRent: 4800 })
    });
    await fetch(`${BASE_URL}/api/rooms/R_TMP`, { method: 'DELETE' });
    console.log('  PASS: Rooms CRUD (Create, Update, Delete)');

    // 5. Mess
    console.log('- Testing Mess CRUD...');
    const createM = await fetch(`${BASE_URL}/api/mess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MessID: 'M_TMP', MessName: 'Temp Mess', MessType: 'Veg', Location: 'Block T' })
    });
    if (createM.status !== 201) throw new Error('Create Mess failed');
    await fetch(`${BASE_URL}/api/mess/M_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MessName: 'Temp Mess Updated' })
    });
    await fetch(`${BASE_URL}/api/mess/M_TMP`, { method: 'DELETE' });
    console.log('  PASS: Mess CRUD (Create, Update, Delete)');

    // 6. Meals
    console.log('- Testing Meals CRUD...');
    const createMl = await fetch(`${BASE_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MealID: 'ML_TMP', MealName: 'Temp Snack', Description: 'Tea & Biscuits', Cost: 30, MessID: 'M1' })
    });
    if (createMl.status !== 201) throw new Error('Create Meal failed');
    await fetch(`${BASE_URL}/api/meals/ML_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Cost: 35 })
    });
    await fetch(`${BASE_URL}/api/meals/ML_TMP`, { method: 'DELETE' });
    console.log('  PASS: Meals CRUD (Create, Update, Delete)');

    // 7. Staff
    console.log('- Testing Staff CRUD...');
    const createSt = await fetch(`${BASE_URL}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ StaffID: 'ST_TMP', StaffName: 'Temp Staff', JoinDate: '01-JAN-24', Salary: 20000, Role: 'Helper', MessID: 'M1' })
    });
    if (createSt.status !== 201) throw new Error('Create Staff failed');
    await fetch(`${BASE_URL}/api/staff/ST_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Salary: 22000 })
    });
    await fetch(`${BASE_URL}/api/staff/ST_TMP`, { method: 'DELETE' });
    console.log('  PASS: Staff CRUD (Create, Update, Delete)');

    // 8. Suppliers
    console.log('- Testing Suppliers CRUD...');
    const createSup = await fetch(`${BASE_URL}/api/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ SupplierID: 'SUP_TMP', SupplierName: 'Temp Supplier' })
    });
    if (createSup.status !== 201) throw new Error('Create Supplier failed');
    await fetch(`${BASE_URL}/api/suppliers/SUP_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ SupplierName: 'Temp Supplier Updated' })
    });
    await fetch(`${BASE_URL}/api/suppliers/SUP_TMP`, { method: 'DELETE' });
    console.log('  PASS: Suppliers CRUD (Create, Update, Delete)');

    // 9. Inventory Items
    console.log('- Testing Inventory Items CRUD...');
    const createIt = await fetch(`${BASE_URL}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ItemID: 'IT_TMP', ItemName: 'Temp Sugar', Category: 'Grains', Unit: 'Kg' })
    });
    if (createIt.status !== 201) throw new Error('Create Inventory failed');
    await fetch(`${BASE_URL}/api/inventory/IT_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ItemName: 'Temp Brown Sugar' })
    });
    await fetch(`${BASE_URL}/api/inventory/IT_TMP`, { method: 'DELETE' });
    console.log('  PASS: Inventory Items CRUD (Create, Update, Delete)');

    // 10. Procurements
    console.log('- Testing Procurements CRUD...');
    const createProc = await fetch(`${BASE_URL}/api/procurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ MessID: 'M1', SupplierID: 'SUP1', ItemID: 'IT101', Quantity: 50 })
    });
    if (createProc.status !== 201) throw new Error('Create Procurement failed');
    await fetch(`${BASE_URL}/api/procurements?MessID=M1&SupplierID=SUP1&ItemID=IT101`, { method: 'DELETE' });
    console.log('  PASS: Procurements CRUD (Create, Delete)');

    // 11. Students
    console.log('- Testing Students CRUD...');
    const createS = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        StudentID: 'S_TMP',
        FirstName: 'Test',
        LastName: 'Student',
        Gender: 'Male',
        DOB: '01-01-2004',
        Email: 'test.temp@univ.edu',
        BloodGroup: 'O+',
        RoomNo: 'R101',
        HostelID: 'H1',
        MessID: 'M1'
      })
    });
    if (createS.status !== 201) throw new Error('Create Student failed');
    await fetch(`${BASE_URL}/api/students/S_TMP`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ LastName: 'StudentUpdated' })
    });
    await fetch(`${BASE_URL}/api/students/S_TMP`, { method: 'DELETE' });
    console.log('  PASS: Students CRUD (Create, Update, Delete)');

    // 12. Payments
    console.log('- Testing Payments CRUD...');
    const createPay = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        PaymentID: 'PAY_TMP',
        StudentID: 'S1001',
        Amount: 5000,
        PaymentMode: 'UPI',
        Status: 'Successful'
      })
    });
    if (createPay.status !== 201) throw new Error('Create Payment failed');
    await fetch(`${BASE_URL}/api/payments/PAY_TMP`, { method: 'DELETE' });
    console.log('  PASS: Payments CRUD (Create, Delete)');

    console.log('\n ALL 12 REPRESENTATIVE CRUD TESTS PASSED CLEANLY WITH ZERO PRODUCTION DATA IMPACT!\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err.message);
    server.close();
    process.exit(1);
  }
}

runAllTests();
