// ==========================================================
// Hostel Management System - Neo4j Graph Seed Data
// Authentic Seed Records for all 13 Node Labels & Graph Relationships
// Safe to re-run (idempotent MERGE operations)
// ==========================================================

// 1. WARDENS
MERGE (w:Warden {wardenId: 'W101'})
SET w.name = 'Dr. Rajesh Kumar', w.email = 'rajesh.k@univ.edu', w.joiningDate = '15-JUN-18', w.phones = ['9876500001', '9876500002'];

MERGE (w:Warden {wardenId: 'W102'})
SET w.name = 'Prof. Anita Sharma', w.email = 'anita@univ.edu', w.joiningDate = '01-AUG-19', w.phones = ['9876500003'];

MERGE (w:Warden {wardenId: 'W103'})
SET w.name = 'Dr. Suresh Menon', w.email = 'suresh.m@univ.edu', w.joiningDate = '10-JAN-20', w.phones = ['9876500004'];

MERGE (w:Warden {wardenId: 'W104'})
SET w.name = 'Prof. Priya Nair', w.email = 'priya.n@univ.edu', w.joiningDate = '20-JUL-21', w.phones = ['9876500005'];

MERGE (w:Warden {wardenId: 'W105'})
SET w.name = 'Dr. Amit Verma', w.email = 'amit.v@univ.edu', w.joiningDate = '05-MAR-22', w.phones = [];

// 2. HOSTELS & WARDEN RELATIONSHIPS
MERGE (h:Hostel {hostelId: 'H1'})
SET h.name = 'Cauvery Boys Hostel', h.totalFloors = 4, h.wardenId = 'W101';

MERGE (h:Hostel {hostelId: 'H2'})
SET h.name = 'Ganga Girls Hostel', h.totalFloors = 4, h.wardenId = 'W102';

MERGE (h:Hostel {hostelId: 'H3'})
SET h.name = 'Yamuna Boys Hostel', h.totalFloors = 3, h.wardenId = 'W103';

MERGE (h:Hostel {hostelId: 'H4'})
SET h.name = 'Krishna Girls Hostel', h.totalFloors = 3, h.wardenId = 'W104';

MERGE (h:Hostel {hostelId: 'H5'})
SET h.name = 'Narmada PG Hostel', h.totalFloors = 2, h.wardenId = 'W105';

// Connect Hostels to Wardens
MATCH (h:Hostel {hostelId: 'H1'}), (w:Warden {wardenId: 'W101'}) MERGE (h)-[:MANAGED_BY]->(w);
MATCH (h:Hostel {hostelId: 'H2'}), (w:Warden {wardenId: 'W102'}) MERGE (h)-[:MANAGED_BY]->(w);
MATCH (h:Hostel {hostelId: 'H3'}), (w:Warden {wardenId: 'W103'}) MERGE (h)-[:MANAGED_BY]->(w);
MATCH (h:Hostel {hostelId: 'H4'}), (w:Warden {wardenId: 'W104'}) MERGE (h)-[:MANAGED_BY]->(w);
MATCH (h:Hostel {hostelId: 'H5'}), (w:Warden {wardenId: 'W105'}) MERGE (h)-[:MANAGED_BY]->(w);

// 3. ROOM TYPES
MERGE (rt:RoomType {typeId: 'RT1'})
SET rt.typeName = 'Single', rt.acType = 'AC', rt.capacity = 1;

MERGE (rt:RoomType {typeId: 'RT2'})
SET rt.typeName = 'Double', rt.acType = 'Non-AC', rt.capacity = 2;

MERGE (rt:RoomType {typeId: 'RT3'})
SET rt.typeName = 'Triple', rt.acType = 'Non-AC', rt.capacity = 3;

// 4. ROOMS & HOSTEL/TYPE RELATIONSHIPS
MERGE (r:Room {roomNo: 'R101'})
SET r.floorNo = 1, r.type = 'Single AC', r.capacity = 1, r.roomRent = 5000, r.hostelId = 'H1';
MATCH (r:Room {roomNo: 'R101'}), (h:Hostel {hostelId: 'H1'}) MERGE (r)-[:LOCATED_IN]->(h);
MATCH (r:Room {roomNo: 'R101'}), (rt:RoomType {typeId: 'RT1'}) MERGE (r)-[:OF_TYPE]->(rt);

MERGE (r:Room {roomNo: 'R102'})
SET r.floorNo = 1, r.type = 'Double Non-AC', r.capacity = 2, r.roomRent = 4000, r.hostelId = 'H1';
MATCH (r:Room {roomNo: 'R102'}), (h:Hostel {hostelId: 'H1'}) MERGE (r)-[:LOCATED_IN]->(h);
MATCH (r:Room {roomNo: 'R102'}), (rt:RoomType {typeId: 'RT2'}) MERGE (r)-[:OF_TYPE]->(rt);

MERGE (r:Room {roomNo: 'R201'})
SET r.floorNo = 2, r.type = 'Triple Non-AC', r.capacity = 3, r.roomRent = 3500, r.hostelId = 'H2';
MATCH (r:Room {roomNo: 'R201'}), (h:Hostel {hostelId: 'H2'}) MERGE (r)-[:LOCATED_IN]->(h);
MATCH (r:Room {roomNo: 'R201'}), (rt:RoomType {typeId: 'RT3'}) MERGE (r)-[:OF_TYPE]->(rt);

MERGE (r:Room {roomNo: 'R202'})
SET r.floorNo = 2, r.type = 'Double Non-AC', r.capacity = 2, r.roomRent = 4000, r.hostelId = 'H3';
MATCH (r:Room {roomNo: 'R202'}), (h:Hostel {hostelId: 'H3'}) MERGE (r)-[:LOCATED_IN]->(h);
MATCH (r:Room {roomNo: 'R202'}), (rt:RoomType {typeId: 'RT2'}) MERGE (r)-[:OF_TYPE]->(rt);

MERGE (r:Room {roomNo: 'R301'})
SET r.floorNo = 3, r.type = 'Single AC', r.capacity = 1, r.roomRent = 5000, r.hostelId = 'H4';
MATCH (r:Room {roomNo: 'R301'}), (h:Hostel {hostelId: 'H4'}) MERGE (r)-[:LOCATED_IN]->(h);
MATCH (r:Room {roomNo: 'R301'}), (rt:RoomType {typeId: 'RT1'}) MERGE (r)-[:OF_TYPE]->(rt);

// 5. MESS
MERGE (m:Mess {messId: 'M1'})
SET m.name = 'North Dining Hall', m.messType = 'Pure Veg', m.location = 'North Campus Block A', m.contacts = ['044-220011', '044-220012'];

MERGE (m:Mess {messId: 'M2'})
SET m.name = 'South Dining Hall', m.messType = 'Non-Veg Special', m.location = 'South Campus Block B', m.contacts = ['044-220021'];

MERGE (m:Mess {messId: 'M3'})
SET m.name = 'Central Mess', m.messType = 'Mixed', m.location = 'Central Plaza Block C', m.contacts = ['044-220031'];

MERGE (m:Mess {messId: 'M4'})
SET m.name = 'Executive Dining', m.messType = 'Continental', m.location = 'Guest House Block D', m.contacts = ['044-220041'];

MERGE (m:Mess {messId: 'M5'})
SET m.name = 'Fast Food and Snacks', m.messType = 'Quick Bites', m.location = 'Student Activity Center', m.contacts = [];

// 6. MEALS & MESS RELATIONSHIPS
MERGE (ml:Meal {mealId: 'ML1'})
SET ml.name = 'North Indian Thali', ml.description = 'Roti, Dhal Makhni, Paneer, Rice', ml.cost = 120, ml.messId = 'M1';
MATCH (ml:Meal {mealId: 'ML1'}), (m:Mess {messId: 'M1'}) MERGE (ml)-[:SERVED_IN]->(m);

MERGE (ml:Meal {mealId: 'ML2'})
SET ml.name = 'South Indian Meals', ml.description = 'Sambhar, Rasam, Curd Rice, Pori, Payasam', ml.cost = 90, ml.messId = 'M1';
MATCH (ml:Meal {mealId: 'ML2'}), (m:Mess {messId: 'M1'}) MERGE (ml)-[:SERVED_IN]->(m);

MERGE (ml:Meal {mealId: 'ML3'})
SET ml.name = 'Chicken Biryani', ml.description = 'Chicken Dum Biryani, Raita', ml.cost = 180, ml.messId = 'M2';
MATCH (ml:Meal {mealId: 'ML3'}), (m:Mess {messId: 'M2'}) MERGE (ml)-[:SERVED_IN]->(m);

MERGE (ml:Meal {mealId: 'ML4'})
SET ml.name = 'Continental Breakfast', ml.description = 'Toast, Omlette, Juice, Coffee', ml.cost = 150, ml.messId = 'M4';
MATCH (ml:Meal {mealId: 'ML4'}), (m:Mess {messId: 'M4'}) MERGE (ml)-[:SERVED_IN]->(m);

MERGE (ml:Meal {mealId: 'ML5'})
SET ml.name = 'Mini Executive Thali', ml.description = 'Chapati, Mixed Veg Curry, Pulao', ml.cost = 110, ml.messId = 'M3';
MATCH (ml:Meal {mealId: 'ML5'}), (m:Mess {messId: 'M3'}) MERGE (ml)-[:SERVED_IN]->(m);

// 7. STUDENTS & HOUSING/MESS ALLOCATIONS
MERGE (s:Student {studentId: 'S1001'})
SET s.firstName = 'Rahul', s.lastName = 'Sharma', s.gender = 'Male', s.dob = '12-04-2003',
    s.email = 'rahul.s@univ.edu', s.bloodGroup = 'B+', s.allergyInfo = 'None', s.planType = 'Premium',
    s.roomNo = 'R101', s.hostelId = 'H1', s.messId = 'M1', s.mentorStudentId = null,
    s.phones = ['9876543210', '9876543211'];
MATCH (s:Student {studentId: 'S1001'}), (r:Room {roomNo: 'R101'}) MERGE (s)-[:ALLOCATED_TO]->(r);
MATCH (s:Student {studentId: 'S1001'}), (h:Hostel {hostelId: 'H1'}) MERGE (s)-[:RESIDES_IN]->(h);
MATCH (s:Student {studentId: 'S1001'}), (m:Mess {messId: 'M1'}) MERGE (s)-[:ENROLLED_IN]->(m);

MERGE (s:Student {studentId: 'S1002'})
SET s.firstName = 'Sneha', s.lastName = 'Patel', s.gender = 'Female', s.dob = '25-08-2004',
    s.email = 'sneha.p@univ.edu', s.bloodGroup = 'O+', s.allergyInfo = 'None', s.planType = 'Standard',
    s.roomNo = 'R201', s.hostelId = 'H2', s.messId = 'M2', s.mentorStudentId = null,
    s.phones = ['9876543212'];
MATCH (s:Student {studentId: 'S1002'}), (r:Room {roomNo: 'R201'}) MERGE (s)-[:ALLOCATED_TO]->(r);
MATCH (s:Student {studentId: 'S1002'}), (h:Hostel {hostelId: 'H2'}) MERGE (s)-[:RESIDES_IN]->(h);
MATCH (s:Student {studentId: 'S1002'}), (m:Mess {messId: 'M2'}) MERGE (s)-[:ENROLLED_IN]->(m);

MERGE (s:Student {studentId: 'S1003'})
SET s.firstName = 'Rohan', s.lastName = 'Verma', s.gender = 'Male', s.dob = '15-01-2005',
    s.email = 'rohan.v@univ.edu', s.bloodGroup = 'A+', s.allergyInfo = 'None', s.planType = 'Standard',
    s.roomNo = 'R102', s.hostelId = 'H1', s.messId = 'M1', s.mentorStudentId = 'S1001',
    s.phones = ['9876543213'];
MATCH (s:Student {studentId: 'S1003'}), (r:Room {roomNo: 'R102'}) MERGE (s)-[:ALLOCATED_TO]->(r);
MATCH (s:Student {studentId: 'S1003'}), (h:Hostel {hostelId: 'H1'}) MERGE (s)-[:RESIDES_IN]->(h);
MATCH (s:Student {studentId: 'S1003'}), (m:Mess {messId: 'M1'}) MERGE (s)-[:ENROLLED_IN]->(m);
MATCH (s:Student {studentId: 'S1003'}), (mentor:Student {studentId: 'S1001'}) MERGE (s)-[:MENTORED_BY]->(mentor);

MERGE (s:Student {studentId: 'S1004'})
SET s.firstName = 'Ananya', s.lastName = 'Iyer', s.gender = 'Female', s.dob = '30-09-2005',
    s.email = 'ananya.i@univ.edu', s.bloodGroup = 'AB+', s.allergyInfo = 'Lactose', s.planType = 'Standard',
    s.roomNo = 'R201', s.hostelId = 'H2', s.messId = 'M2', s.mentorStudentId = 'S1002',
    s.phones = ['9876543214'];
MATCH (s:Student {studentId: 'S1004'}), (r:Room {roomNo: 'R201'}) MERGE (s)-[:ALLOCATED_TO]->(r);
MATCH (s:Student {studentId: 'S1004'}), (h:Hostel {hostelId: 'H2'}) MERGE (s)-[:RESIDES_IN]->(h);
MATCH (s:Student {studentId: 'S1004'}), (m:Mess {messId: 'M2'}) MERGE (s)-[:ENROLLED_IN]->(m);
MATCH (s:Student {studentId: 'S1004'}), (mentor:Student {studentId: 'S1002'}) MERGE (s)-[:MENTORED_BY]->(mentor);

MERGE (s:Student {studentId: 'S1005'})
SET s.firstName = 'Vikram', s.lastName = 'Singh', s.gender = 'Male', s.dob = '05-11-2004',
    s.email = 'vikram.s@univ.edu', s.bloodGroup = 'B-', s.allergyInfo = 'Dust', s.planType = 'Premium',
    s.roomNo = 'R202', s.hostelId = 'H3', s.messId = 'M3', s.mentorStudentId = 'S1001',
    s.phones = ['9876543215'];
MATCH (s:Student {studentId: 'S1005'}), (r:Room {roomNo: 'R202'}) MERGE (s)-[:ALLOCATED_TO]->(r);
MATCH (s:Student {studentId: 'S1005'}), (h:Hostel {hostelId: 'H3'}) MERGE (s)-[:RESIDES_IN]->(h);
MATCH (s:Student {studentId: 'S1005'}), (m:Mess {messId: 'M3'}) MERGE (s)-[:ENROLLED_IN]->(m);
MATCH (s:Student {studentId: 'S1005'}), (mentor:Student {studentId: 'S1001'}) MERGE (s)-[:MENTORED_BY]->(mentor);

// 8. STAFF & MESS ASSIGNMENTS
MERGE (st:Staff {staffId: 'ST1'})
SET st.name = 'Ramesh Chandra', st.joinDate = '01-FEB-19', st.salary = 35000, st.role = 'Head Chef', st.messId = 'M1', st.phones = ['9444100001'];
MATCH (st:Staff {staffId: 'ST1'}), (m:Mess {messId: 'M1'}) MERGE (st)-[:ASSIGNED_TO]->(m);

MERGE (st:Staff {staffId: 'ST2'})
SET st.name = 'Murugan P.', st.joinDate = '15-MAY-20', st.salary = 28000, st.role = 'Assistant Cook', st.messId = 'M1', st.phones = ['9444100002'];
MATCH (st:Staff {staffId: 'ST2'}), (m:Mess {messId: 'M1'}) MERGE (st)-[:ASSIGNED_TO]->(m);

MERGE (st:Staff {staffId: 'ST3'})
SET st.name = 'Joseph D\'souza', st.joinDate = '10-NOV-18', st.salary = 38000, st.role = 'Master Chef', st.messId = 'M2', st.phones = ['9444100003', '9444100004'];
MATCH (st:Staff {staffId: 'ST3'}), (m:Mess {messId: 'M2'}) MERGE (st)-[:ASSIGNED_TO]->(m);

MERGE (st:Staff {staffId: 'ST4'})
SET st.name = 'Sunita Devi', st.joinDate = '01-AUG-21', st.salary = 18000, st.role = 'Cleaner', st.messId = 'M2', st.phones = ['9444100005'];
MATCH (st:Staff {staffId: 'ST4'}), (m:Mess {messId: 'M2'}) MERGE (st)-[:ASSIGNED_TO]->(m);

MERGE (st:Staff {staffId: 'ST5'})
SET st.name = 'Govind Ram', st.joinDate = '20-JAN-22', st.salary = 22000, st.role = 'Store Keeper', st.messId = 'M3', st.phones = [];
MATCH (st:Staff {staffId: 'ST5'}), (m:Mess {messId: 'M3'}) MERGE (st)-[:ASSIGNED_TO]->(m);

// 9. SUPPLIERS
MERGE (sup:Supplier {supplierId: 'SUP1'})
SET sup.name = 'Fresh Farm Provisions', sup.phones = ['9884011111'];

MERGE (sup:Supplier {supplierId: 'SUP2'})
SET sup.name = 'Metro Dairy Products', sup.phones = ['9884022222'];

MERGE (sup:Supplier {supplierId: 'SUP3'})
SET sup.name = 'Coastal Poultry & Meats', sup.phones = ['9884033333', '9884033334'];

MERGE (sup:Supplier {supplierId: 'SUP4'})
SET sup.name = 'National Grain Traders', sup.phones = ['9884044444'];

MERGE (sup:Supplier {supplierId: 'SUP5'})
SET sup.name = 'Green Valley Vegetables', sup.phones = [];

// 10. INVENTORY ITEMS
MERGE (i:InventoryItem {itemId: 'IT101'})
SET i.name = 'Basmati Rice', i.category = 'Grains', i.unit = 'Kg';

MERGE (i:InventoryItem {itemId: 'IT102'})
SET i.name = 'Toned Milk', i.category = 'Dairy', i.unit = 'Litre';

MERGE (i:InventoryItem {itemId: 'IT103'})
SET i.name = 'Refined Sunflower Oil', i.category = 'Cooking Oil', i.unit = 'Litre';

MERGE (i:InventoryItem {itemId: 'IT104'})
SET i.name = 'Fresh Broiler Chicken', i.category = 'Meat', i.unit = 'Kg';

MERGE (i:InventoryItem {itemId: 'IT105'})
SET i.name = 'Potato', i.category = 'Vegetables', i.unit = 'Kg';

// 11. PROCUREMENTS (Ternary Relationship between Mess, Supplier, and InventoryItem)
MERGE (p:Procurement {procureId: 'M1-SUP4-IT101'})
SET p.quantity = 500, p.messId = 'M1', p.supplierId = 'SUP4', p.itemId = 'IT101';
MATCH (m:Mess {messId: 'M1'}), (sup:Supplier {supplierId: 'SUP4'}), (i:InventoryItem {itemId: 'IT101'}), (p:Procurement {procureId: 'M1-SUP4-IT101'})
MERGE (m)-[:PLACED_ORDER]->(p)
MERGE (p)-[:SUPPLIED_BY]->(sup)
MERGE (p)-[:INCLUDES_ITEM]->(i);

MERGE (p:Procurement {procureId: 'M1-SUP2-IT102'})
SET p.quantity = 200, p.messId = 'M1', p.supplierId = 'SUP2', p.itemId = 'IT102';
MATCH (m:Mess {messId: 'M1'}), (sup:Supplier {supplierId: 'SUP2'}), (i:InventoryItem {itemId: 'IT102'}), (p:Procurement {procureId: 'M1-SUP2-IT102'})
MERGE (m)-[:PLACED_ORDER]->(p)
MERGE (p)-[:SUPPLIED_BY]->(sup)
MERGE (p)-[:INCLUDES_ITEM]->(i);

MERGE (p:Procurement {procureId: 'M2-SUP3-IT104'})
SET p.quantity = 150, p.messId = 'M2', p.supplierId = 'SUP3', p.itemId = 'IT104';
MATCH (m:Mess {messId: 'M2'}), (sup:Supplier {supplierId: 'SUP3'}), (i:InventoryItem {itemId: 'IT104'}), (p:Procurement {procureId: 'M2-SUP3-IT104'})
MERGE (m)-[:PLACED_ORDER]->(p)
MERGE (p)-[:SUPPLIED_BY]->(sup)
MERGE (p)-[:INCLUDES_ITEM]->(i);

MERGE (p:Procurement {procureId: 'M2-SUP1-IT105'})
SET p.quantity = 300, p.messId = 'M2', p.supplierId = 'SUP1', p.itemId = 'IT105';
MATCH (m:Mess {messId: 'M2'}), (sup:Supplier {supplierId: 'SUP1'}), (i:InventoryItem {itemId: 'IT105'}), (p:Procurement {procureId: 'M2-SUP1-IT105'})
MERGE (m)-[:PLACED_ORDER]->(p)
MERGE (p)-[:SUPPLIED_BY]->(sup)
MERGE (p)-[:INCLUDES_ITEM]->(i);

MERGE (p:Procurement {procureId: 'M3-SUP4-IT103'})
SET p.quantity = 100, p.messId = 'M3', p.supplierId = 'SUP4', p.itemId = 'IT103';
MATCH (m:Mess {messId: 'M3'}), (sup:Supplier {supplierId: 'SUP4'}), (i:InventoryItem {itemId: 'IT103'}), (p:Procurement {procureId: 'M3-SUP4-IT103'})
MERGE (m)-[:PLACED_ORDER]->(p)
MERGE (p)-[:SUPPLIED_BY]->(sup)
MERGE (p)-[:INCLUDES_ITEM]->(i);

// 12. PAYMENTS
MERGE (p:Payment {paymentId: 'PAY1001'})
SET p.studentId = 'S1001', p.amount = 12500, p.paymentMode = 'NetBanking', p.status = 'Successful',
    p.paymentDay = 5, p.paymentMonth = 8, p.paymentYear = 2026;
MATCH (p:Payment {paymentId: 'PAY1001'}), (s:Student {studentId: 'S1001'}) MERGE (p)-[:PAID_BY]->(s);

MERGE (p:Payment {paymentId: 'PAY1002'})
SET p.studentId = 'S1002', p.amount = 14000, p.paymentMode = 'UPI', p.status = 'Successful',
    p.paymentDay = 6, p.paymentMonth = 8, p.paymentYear = 2026;
MATCH (p:Payment {paymentId: 'PAY1002'}), (s:Student {studentId: 'S1002'}) MERGE (p)-[:PAID_BY]->(s);

MERGE (p:Payment {paymentId: 'PAY1003'})
SET p.studentId = 'S1003', p.amount = 11000, p.paymentMode = 'Credit Card', p.status = 'Successful',
    p.paymentDay = 7, p.paymentMonth = 8, p.paymentYear = 2026;
MATCH (p:Payment {paymentId: 'PAY1003'}), (s:Student {studentId: 'S1003'}) MERGE (p)-[:PAID_BY]->(s);

MERGE (p:Payment {paymentId: 'PAY1004'})
SET p.studentId = 'S1004', p.amount = 11000, p.paymentMode = 'UPI', p.status = 'Pending',
    p.paymentDay = 10, p.paymentMonth = 8, p.paymentYear = 2026;
MATCH (p:Payment {paymentId: 'PAY1004'}), (s:Student {studentId: 'S1004'}) MERGE (p)-[:PAID_BY]->(s);

MERGE (p:Payment {paymentId: 'PAY1005'})
SET p.studentId = 'S1005', p.amount = 15000, p.paymentMode = 'Debit Card', p.status = 'Successful',
    p.paymentDay = 12, p.paymentMonth = 8, p.paymentYear = 2026;
MATCH (p:Payment {paymentId: 'PAY1005'}), (s:Student {studentId: 'S1005'}) MERGE (p)-[:PAID_BY]->(s);

// 13. PAYMENT DETAILS
MERGE (pd:PaymentDetail {id: 'PAY1001-D1'})
SET pd.paymentId = 'PAY1001', pd.detailId = 'D1', pd.month = 'August', pd.year = 2026, pd.messCharges = 11500, pd.otherCharges = 1000;
MATCH (p:Payment {paymentId: 'PAY1001'}), (pd:PaymentDetail {id: 'PAY1001-D1'}) MERGE (p)-[:HAS_DETAIL]->(pd);

MERGE (pd:PaymentDetail {id: 'PAY1002-D1'})
SET pd.paymentId = 'PAY1002', pd.detailId = 'D1', pd.month = 'August', pd.year = 2026, pd.messCharges = 13000, pd.otherCharges = 1000;
MATCH (p:Payment {paymentId: 'PAY1002'}), (pd:PaymentDetail {id: 'PAY1002-D1'}) MERGE (p)-[:HAS_DETAIL]->(pd);

MERGE (pd:PaymentDetail {id: 'PAY1003-D1'})
SET pd.paymentId = 'PAY1003', pd.detailId = 'D1', pd.month = 'August', pd.year = 2026, pd.messCharges = 10000, pd.otherCharges = 1000;
MATCH (p:Payment {paymentId: 'PAY1003'}), (pd:PaymentDetail {id: 'PAY1003-D1'}) MERGE (p)-[:HAS_DETAIL]->(pd);

MERGE (pd:PaymentDetail {id: 'PAY1003-D2'})
SET pd.paymentId = 'PAY1003', pd.detailId = 'D2', pd.month = 'July (Arrears)', pd.year = 2026, pd.messCharges = 0, pd.otherCharges = 1000;
MATCH (p:Payment {paymentId: 'PAY1003'}), (pd:PaymentDetail {id: 'PAY1003-D2'}) MERGE (p)-[:HAS_DETAIL]->(pd);

MERGE (pd:PaymentDetail {id: 'PAY1005-D1'})
SET pd.paymentId = 'PAY1005', pd.detailId = 'D1', pd.month = 'August', pd.year = 2026, pd.messCharges = 14000, pd.otherCharges = 1000;
MATCH (p:Payment {paymentId: 'PAY1005'}), (pd:PaymentDetail {id: 'PAY1005-D1'}) MERGE (p)-[:HAS_DETAIL]->(pd);
