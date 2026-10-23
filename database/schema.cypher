// ==========================================================
// Hostel Management System - Neo4j Graph Schema
// Constraints and Indexes for 13 Node Labels
// ==========================================================

// 1. Uniqueness Constraints
CREATE CONSTRAINT warden_id_unique IF NOT EXISTS
FOR (w:Warden) REQUIRE w.wardenId IS UNIQUE;

CREATE CONSTRAINT hostel_id_unique IF NOT EXISTS
FOR (h:Hostel) REQUIRE h.hostelId IS UNIQUE;

CREATE CONSTRAINT room_type_id_unique IF NOT EXISTS
FOR (rt:RoomType) REQUIRE rt.typeId IS UNIQUE;

CREATE CONSTRAINT room_no_unique IF NOT EXISTS
FOR (r:Room) REQUIRE r.roomNo IS UNIQUE;

CREATE CONSTRAINT student_id_unique IF NOT EXISTS
FOR (s:Student) REQUIRE s.studentId IS UNIQUE;

CREATE CONSTRAINT mess_id_unique IF NOT EXISTS
FOR (m:Mess) REQUIRE m.messId IS UNIQUE;

CREATE CONSTRAINT meal_id_unique IF NOT EXISTS
FOR (ml:Meal) REQUIRE ml.mealId IS UNIQUE;

CREATE CONSTRAINT staff_id_unique IF NOT EXISTS
FOR (st:Staff) REQUIRE st.staffId IS UNIQUE;

CREATE CONSTRAINT supplier_id_unique IF NOT EXISTS
FOR (sup:Supplier) REQUIRE sup.supplierId IS UNIQUE;

CREATE CONSTRAINT inventory_item_id_unique IF NOT EXISTS
FOR (i:InventoryItem) REQUIRE i.itemId IS UNIQUE;

CREATE CONSTRAINT procurement_id_unique IF NOT EXISTS
FOR (p:Procurement) REQUIRE p.procureId IS UNIQUE;

CREATE CONSTRAINT payment_id_unique IF NOT EXISTS
FOR (pay:Payment) REQUIRE pay.paymentId IS UNIQUE;

CREATE CONSTRAINT payment_detail_id_unique IF NOT EXISTS
FOR (pd:PaymentDetail) REQUIRE pd.id IS UNIQUE;

// 2. Performance Indexes
CREATE INDEX student_email_idx IF NOT EXISTS
FOR (s:Student) ON (s.email);

CREATE INDEX payment_status_idx IF NOT EXISTS
FOR (p:Payment) ON (p.status);
