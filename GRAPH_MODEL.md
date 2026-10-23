# 🌐 Neo4j Graph Model Architecture

This document describes the property graph data model migrated from the 18-table normalized relational schema to **Neo4j AuraDB**.

---

## 1. Architectural Philosophy

Relational databases enforce scalar normalization (1NF, 2NF, 3NF), splitting multi-valued attributes like phone numbers and contacts into auxiliary bridge tables (`STUDENT_PHONE`, `WARDEN_PHONE`, `MESS_CONTACT`, `STAFF_PHONE`, `SUPPLIER_PHONE`).

In **Neo4j AuraDB**:
1. **Core Business Entities** become labeled Graph Nodes.
2. **Foreign Key Associations** become First-Class Directed Relationships (`(:NodeA)-[:REL_TYPE]->(:NodeB)`).
3. **Multi-Valued Scalar Attributes** (such as telephone numbers and mess contacts) are naturally modeled as native `String[]` list properties on parent nodes, eliminating costly join operations while preserving dedicated table view access via array unwinding.
4. **Ternary Associations** (such as `PROCURES(MessID, SupplierID, ItemID, Quantity)`) are modeled as intermediate `:Procurement` nodes connecting `:Mess`, `:Supplier`, and `:InventoryItem`.
5. **Hierarchical Self-References** (such as student mentor allocations) are modeled as recursive `(:Student)-[:MENTORED_BY]->(:Student)` graph relationships.

---

## 2. Graph Node Labels & Properties

| Label | Primary Identifier | Properties | Description |
| :--- | :--- | :--- | :--- |
| **`:Warden`** | `wardenId` (Unique) | `name`, `email`, `joiningDate`, `phones: String[]` | Resident hall wardens and contact numbers. |
| **`:Hostel`** | `hostelId` (Unique) | `name`, `totalFloors`, `wardenId` | University residence halls and blocks. |
| **`:RoomType`** | `typeId` (Unique) | `typeName`, `acType`, `capacity` | Classification for room occupancy & amenities. |
| **`:Room`** | `roomNo` (Unique) | `floorNo`, `type`, `capacity`, `roomRent`, `hostelId` | Individual residence room numbers and pricing. |
| **`:Student`** | `studentId` (Unique) | `firstName`, `lastName`, `gender`, `dob`, `email`, `bloodGroup`, `allergyInfo`, `planType`, `phones: String[]`, `roomNo`, `hostelId`, `messId`, `mentorStudentId` | Resident students enrolled in campus housing. |
| **`:Mess`** | `messId` (Unique) | `name`, `messType`, `location`, `contacts: String[]` | Dining facilities and contact registries. |
| **`:Meal`** | `mealId` (Unique) | `name`, `description`, `cost`, `messId` | Daily menu items, descriptions, and pricing. |
| **`:Staff`** | `staffId` (Unique) | `name`, `joinDate`, `salary`, `role`, `messId`, `phones: String[]` | Dining hall workforce, roles, and payroll. |
| **`:Supplier`** | `supplierId` (Unique) | `name`, `phones: String[]` | Registered vendors providing raw provisions. |
| **`:InventoryItem`** | `itemId` (Unique) | `name`, `category`, `unit` | Raw materials and provisioning stock items. |
| **`:Procurement`** | `procureId` (Unique) | `quantity`, `messId`, `supplierId`, `itemId` | Purchase ledger connecting Mess, Supplier, & Item. |
| **`:Payment`** | `paymentId` (Unique) | `amount`, `paymentMode`, `status`, `paymentDay`, `paymentMonth`, `paymentYear`, `studentId` | Financial fee payment transactions. |
| **`:PaymentDetail`** | `id` (Unique) | `paymentId`, `detailId`, `month`, `year`, `messCharges`, `otherCharges` | Detailed billing breakdown per payment. |

---

## 3. Graph Relationships

```text
       ┌───────────┐         MANAGED_BY         ┌───────────┐
       │  Hostel   ├───────────────────────────►│  Warden   │
       └─────┬─────┘                            └───────────┘
             │ ▲
             │ │ RESIDES_IN
  LOCATED_IN │ │
             ▼ │
       ┌───────┴───┐         ALLOCATED_TO       ┌───────────┐
       │   Room    │◄───────────────────────────┤  Student  │
       └─────┬─────┘                            └──┬──┬──┬──┘
             │                                     │  │  │
     OF_TYPE │                     ENROLLED_IN     │  │  │ MENTORED_BY (Self)
             ▼                       ┌─────────────┘  │  └───────┐
       ┌───────────┐                 │                │          ▼
       │ RoomType  │                 ▼                │     ┌───────────┐
       └───────────┘           ┌───────────┐          │     │  Student  │
                               │   Mess    │          │     └───────────┘
                               └─────┬─────┘          │
                                     │                │ PAID_BY
                                     │ PLACED_ORDER   ▼
                                     ▼          ┌───────────┐
                               ┌─────────────┐  │  Payment  │
                               │ Procurement │  └─────┬─────┘
                               └──┬───────┬──┘        │ HAS_DETAIL
                      SUPPLIED_BY │       │           ▼
             ┌────────────────────┘       │ INCLUDES  ┌───────────────┐
             ▼                            ▼           │ PaymentDetail │
       ┌───────────┐             ┌───────────────┐    └───────────────┘
       │ Supplier  │             │ InventoryItem │
       └───────────┘             └───────────────┘
```

| Source Node | Relationship | Target Node | Cardinality | Semantics |
| :--- | :---: | :--- | :---: | :--- |
| `(:Hostel)` | `[:MANAGED_BY]` | `(:Warden)` | N : 1 | Hostel supervised by presiding warden |
| `(:Room)` | `[:LOCATED_IN]` | `(:Hostel)` | N : 1 | Physical room situated inside a hostel |
| `(:Room)` | `[:OF_TYPE]` | `(:RoomType)` | N : 1 | Room categorised by type & amenities |
| `(:Student)` | `[:ALLOCATED_TO]` | `(:Room)` | N : 1 | Student assigned to specific bed/room |
| `(:Student)` | `[:RESIDES_IN]` | `(:Hostel)` | N : 1 | Student assigned to hostel building |
| `(:Student)` | `[:ENROLLED_IN]` | `(:Mess)` | N : 1 | Student dining subscription |
| `(:Student)` | `[:MENTORED_BY]` | `(:Student)` | N : 1 | Junior resident advised by senior mentor |
| `(:Meal)` | `[:SERVED_IN]` | `(:Mess)` | N : 1 | Meal served at designated dining facility |
| `(:Staff)` | `[:ASSIGNED_TO]` | `(:Mess)` | N : 1 | Workforce employee assigned to kitchen |
| `(:Mess)` | `[:PLACED_ORDER]` | `(:Procurement)` | 1 : N | Mess procuring inventory items |
| `(:Procurement)`| `[:SUPPLIED_BY]` | `(:Supplier)` | N : 1 | Vendor fulfilling the procurement order |
| `(:Procurement)`| `[:INCLUDES_ITEM]`| `(:InventoryItem)`| N : 1 | Provision stock being supplied |
| `(:Payment)` | `[:PAID_BY]` | `(:Student)` | N : 1 | Student responsible for fee transaction |
| `(:Payment)` | `[:HAS_DETAIL]` | `(:PaymentDetail)`| 1 : N | Sub-ledger billing breakdown |

---

## 4. Idempotency & Seeding

All initialization scripts (`database/schema.cypher`, `database/seed.cypher`, and `backend/init-neo4j.js`) utilize:
- `CREATE CONSTRAINT ... IF NOT EXISTS` for all 13 primary keys.
- Parameterized `MERGE` statements with `SET` clauses.
- Zero duplicate node creation upon repeated execution.
