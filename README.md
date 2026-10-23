# 🏢 HostelHub — Enterprise Hostel Management System

[![Live Website](https://img.shields.io/badge/LIVE%20WEBSITE-VERCEL-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://da-3-database.vercel.app/)
[![Database](https://img.shields.io/badge/DATABASE-NEO4J%20%7C%20AURADB-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)](#-neo4j-graph-architecture)
[![Schema](https://img.shields.io/badge/SCHEMA-13%20LABELS%20%7C%2014%20RELATIONSHIPS-4F46E5?style=for-the-badge)](GRAPH_MODEL.md)
[![Frontend](https://img.shields.io/badge/FRONTEND-REACT%2018%20%2B%20VITE-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Backend](https://img.shields.io/badge/BACKEND-NODE.JS%20%2B%20EXPRESS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/LICENSE-MIT-10B981?style=for-the-badge)](LICENSE)

A modern, high-performance **University Hostel Administration & Campus Logistics Management System** engineered with **React 18**, **Vite**, **Node.js**, **Express**, and **Neo4j AuraDB**.

The platform equips university administrators, residence wardens, mess caterers, and accounting staff with an enterprise-grade operational hub for resident student allocation, multi-block room reservations, dining hall provisioning, staff payroll, vendor procurement, pre-compiled analytical intelligence reporting, and arbitrary Cypher / Graph query execution.

---

## 🌐 Live Website

| Service | Hosting Platform | Working Application Link | Status |
| :--- | :--- | :--- | :--- |
| **HostelHub Application** | **Vercel** | [da-3-database.vercel.app](https://da-3-database.vercel.app/) | [![Status: Live & Operational](https://img.shields.io/badge/Status-Live%20%26%20Operational-2ea44f)](https://da-3-database.vercel.app/) |

> 🚀 **Public Access**: The live application is hosted on Vercel and publicly accessible without any login wall.

---

## 🏛 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER                                     │
│   React 18 Single-Page Application (Vite Bundler)                              │
│   • Cosmic Midnight SaaS Design System (Tailored Dark Theme & Micro-FX)        │
│   • Lucide Vector Iconography                                                  │
│   • Client-Side State Router (Zero Page-Reload Navigation)                     │
│   • Interactive Modals, Confirmations & Graph Relationship Warnings            │
│   • Unified REST API Service Layer with Configurable Base URL                  │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ JSON over HTTPS / REST API
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                                SERVER TIER                                     │
│   Node.js + Express REST API Server                                            │
│   • Standardized REST API Envelopes ({ success: true, count, data })           │
│   • Connection Pooling & Session Lifecycle via official `neo4j-driver`        │
│   • Parameterized Cypher Queries (Injection-proof)                             │
│   • Type-safe Native Graph Type Unwrapper (recursive Integer/Node unwrap)      │
│   • Live Health & Graph Schema Reflection Engine                               │
│   • Dynamic CORS Configuration for Local & Cloud Deployments                   │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ Encrypted Bolt Protocol (`neo4j+s://`)
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                               DATABASE TIER                                    │
│   Neo4j AuraDB (Fully Managed Graph Database)                                 │
│   • 13 Distinct Node Labels with 13 Uniqueness Constraints                     │
│   • 2 Dedicated Performance Indexes (Student email & Payment status)           │
│   • 14 First-Class Directed Relationships with Native Graph Traversal          │
│   • Zero Join Latency & Sub-Millisecond Deep Graph Traversals                  │
│   • Idempotent MERGE Seed Mechanism for Zero-Downtime Safe Initializations     │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents

- [Live Website](#-live-website)
- [System Architecture](#-system-architecture)
- [Core System Features & Capabilities](#-core-system-features--capabilities)
- [Neo4j Graph Architecture](#-neo4j-graph-architecture)
  - [Node Labels & Entities](#node-labels--entities)
  - [Graph Topology Diagram](#graph-topology-diagram)
  - [The 14 Graph Relationships](#the-14-graph-relationships)
- [The 18 Unified Database Table Views](#-the-18-unified-database-table-views)
- [Detailed Functionalities Breakdown](#-detailed-functionalities-breakdown)
  - [1. Executive Operations Dashboard](#1-executive-operations-dashboard)
  - [2. Student Profile & Resident Management](#2-student-profile--resident-management)
  - [3. Hostel Building & Block Administration](#3-hostel-building--block-administration)
  - [4. Room Inventory & Vacancy Tracking](#4-room-inventory--vacancy-tracking)
  - [5. Room Classification Catalog](#5-room-classification-catalog)
  - [6. Warden Administration & Contact Registry](#6-warden-administration--contact-registry)
  - [7. Mess Facilities & Dining Hall Operations](#7-mess-facilities--dining-hall-operations)
  - [8. Meal Menus, Scheduling & Pricing](#8-meal-menus-scheduling--pricing)
  - [9. Staff Workforce & Payroll Directory](#9-staff-workforce--payroll-directory)
  - [10. Supplier Network & Vendor Registry](#10-supplier-network--vendor-registry)
  - [11. Consumable Inventory & Provision Tracking](#11-consumable-inventory--provision-tracking)
  - [12. Procurement Ledger & Purchase Batches](#12-procurement-ledger--purchase-batches)
  - [13. Student Billing & Payment Transactions](#13-student-billing--payment-transactions)
  - [14. 13 Pre-Compiled Analytical Reports](#14-13-pre-compiled-analytical-reports)
  - [15. Interactive Query Studio](#15-interactive-query-studio)
  - [16. 18 Dedicated Database Table Explorers](#16-18-dedicated-database-table-explorers)
- [Complete REST API Reference](#-complete-rest-api-reference)
- [Repository Structure](#-repository-structure)
- [Local Installation & Setup Guide](#-local-installation--setup-guide)
- [Database Verification & Integrity](#-database-verification--integrity)
- [Live Production Deployment](#-live-production-deployment)
- [License](#-license)

---

## 🌟 Core System Features & Capabilities

- **Native Graph Database Engine**: Powered by **Neo4j AuraDB** using the official `neo4j-driver` with encrypted connection pooling over `neo4j+s://`.
- **13 Graph Node Labels & 14 Directed Relationships**: Fully re-modeled from traditional normalized relational entities into an expressive, performant property graph (see [GRAPH_MODEL.md](GRAPH_MODEL.md)).
- **Uniqueness Constraints & Performance Indexes**: 13 unique constraints protecting entity identifiers, plus dedicated B-Tree indexes on student email and payment status.
- **Full Spectrum Cypher Query Studio**: Directly run arbitrary Cypher read queries (`MATCH ... RETURN`) and write operations (`CREATE`, `MERGE`, `SET`, `DELETE`) with real-time syntax highlighting, execution time profiling, and interactive graph schema inspection.
- **13 Pre-Compiled Analytical Reports**: High-performance Cypher pattern-matching queries computing resident allocations, occupancy percentages, financial rollups, and inventory health with millisecond profiling and 1-click CSV export.
- **18 Unified Table Explorer Views**: Dedicated UI screens providing 100% table-equivalent views for all 18 standard tables with primary keys, foreign key badges, live search, and sorting.
- **Full CRUD Capabilities**: Create, read, update, and delete support across students, hostels, rooms, room types, wardens, mess halls, meals, staff, suppliers, inventory, procurements, and payments.
- **Cosmic Midnight SaaS UI**: Tailored dark-mode interface with deep blue radial illumination, responsive navigation, glassmorphic card containers, and modern Lucide iconography.

---

## 🌐 Neo4j Graph Architecture

### Node Labels & Entities

| Label | Primary Key | Key Properties | Relational Equivalent |
| :--- | :--- | :--- | :--- |
| **`:Warden`** | `wardenId` | `name`, `email`, `joiningDate`, `phones: String[]` | `WARDEN` + `WARDEN_PHONE` |
| **`:Hostel`** | `hostelId` | `name`, `totalFloors`, `wardenId` | `HOSTEL` |
| **`:RoomType`** | `typeId` | `typeName`, `acType`, `capacity` | `ROOM_TYPE` |
| **`:Room`** | `roomNo` | `floorNo`, `type`, `capacity`, `roomRent`, `hostelId` | `ROOM` |
| **`:Student`** | `studentId` | `firstName`, `lastName`, `gender`, `dob`, `email`, `bloodGroup`, `allergyInfo`, `planType`, `phones: String[]`, `roomNo`, `hostelId`, `messId`, `mentorStudentId` | `STUDENT` + `STUDENT_PHONE` |
| **`:Mess`** | `messId` | `name`, `messType`, `location`, `contacts: String[]` | `MESS` + `MESS_CONTACT` |
| **`:Meal`** | `mealId` | `name`, `description`, `cost`, `messId` | `MEAL` |
| **`:Staff`** | `staffId` | `name`, `joinDate`, `salary`, `role`, `messId`, `phones: String[]` | `STAFF` + `STAFF_PHONE` |
| **`:Supplier`** | `supplierId` | `name`, `phones: String[]` | `SUPPLIER` + `SUPPLIER_PHONE` |
| **`:InventoryItem`** | `itemId` | `name`, `category`, `unit` | `INVENTORY_ITEM` |
| **`:Procurement`** | `procureId` | `quantity`, `messId`, `supplierId`, `itemId` | `PROCURES` |
| **`:Payment`** | `paymentId` | `amount`, `paymentMode`, `status`, `paymentDay`, `paymentMonth`, `paymentYear`, `studentId` | `PAYMENT` |
| **`:PaymentDetail`** | `id` | `paymentId`, `detailId`, `month`, `year`, `messCharges`, `otherCharges` | `PAYMENT_DETAIL` |

### Graph Topology Diagram

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

### The 14 Graph Relationships

| # | Source Node | Relationship Type | Target Node | Cardinality | Semantics |
| :-: | :--- | :---: | :--- | :---: | :--- |
| 1 | `(:Hostel)` | `[:MANAGED_BY]` | `(:Warden)` | N : 1 | Hostel supervised by presiding warden |
| 2 | `(:Room)` | `[:LOCATED_IN]` | `(:Hostel)` | N : 1 | Physical room located in hostel building |
| 3 | `(:Room)` | `[:OF_TYPE]` | `(:RoomType)` | N : 1 | Room classification, capacity & amenities |
| 4 | `(:Student)` | `[:ALLOCATED_TO]` | `(:Room)` | N : 1 | Resident student assigned to room |
| 5 | `(:Student)` | `[:RESIDES_IN]` | `(:Hostel)` | N : 1 | Student assigned to hostel block |
| 6 | `(:Student)` | `[:ENROLLED_IN]` | `(:Mess)` | N : 1 | Student dining subscription |
| 7 | `(:Student)` | `[:MENTORED_BY]` | `(:Student)` | N : 1 | Junior resident advised by senior student mentor |
| 8 | `(:Meal)` | `[:SERVED_IN]` | `(:Mess)` | N : 1 | Meal served at designated dining hall |
| 9 | `(:Staff)` | `[:ASSIGNED_TO]` | `(:Mess)` | N : 1 | Kitchen/service staff assigned to mess |
| 10 | `(:Mess)` | `[:PLACED_ORDER]` | `(:Procurement)` | 1 : N | Dining hall placing procurement order |
| 11 | `(:Procurement)` | `[:SUPPLIED_BY]` | `(:Supplier)` | N : 1 | Vendor supplying provisions |
| 12 | `(:Procurement)` | `[:INCLUDES_ITEM]` | `(:InventoryItem)` | N : 1 | Stock item procured in order |
| 13 | `(:Payment)` | `[:PAID_BY]` | `(:Student)` | N : 1 | Fee payment made by student |
| 14 | `(:Payment)` | `[:HAS_DETAIL]` | `(:PaymentDetail)` | 1 : N | Sub-ledger breakdown per payment |

---

## 🗄 The 18 Unified Database Table Views

HostelHub exposes unified table views representing all 18 database tables. For graph-native multi-valued list properties (such as phone numbers and mess contacts), the backend dynamically unwinds the list arrays into standard relational tuples:

| View Name | Primary Key | Backing Graph Source & Mapping |
| :--- | :--- | :--- |
| `WARDEN` | `WardenID` | Direct properties on `:Warden` nodes (`wardenId`, `name`, `email`, `joiningDate`) |
| `WARDEN_PHONE` | `(WardenID, PhoneNo)` | Unwound `phones: String[]` list property on `:Warden` |
| `HOSTEL` | `HostelID` | Direct properties on `:Hostel` (`hostelId`, `name`, `totalFloors`, `wardenId`) |
| `ROOM_TYPE` | `TypeID` | Direct properties on `:RoomType` (`typeId`, `typeName`, `acType`, `capacity`) |
| `ROOM` | `RoomNo` | Direct properties on `:Room` (`roomNo`, `floorNo`, `type`, `capacity`, `roomRent`, `hostelId`) |
| `STUDENT` | `StudentID` | Direct properties on `:Student` (`studentId`, `firstName`, `lastName`, `gender`, `dob`, `email`, etc.) |
| `STUDENT_PHONE` | `(StudentID, PhoneNo)` | Unwound `phones: String[]` list property on `:Student` |
| `MESS` | `MessID` | Direct properties on `:Mess` (`messId`, `name`, `messType`, `location`) |
| `MESS_CONTACT` | `(MessID, ContactNo)` | Unwound `contacts: String[]` list property on `:Mess` |
| `MEAL` | `MealID` | Direct properties on `:Meal` (`mealId`, `name`, `description`, `cost`, `messId`) |
| `STAFF` | `StaffID` | Direct properties on `:Staff` (`staffId`, `name`, `joinDate`, `salary`, `role`, `messId`) |
| `STAFF_PHONE` | `(StaffID, PhoneNo)` | Unwound `phones: String[]` list property on `:Staff` |
| `SUPPLIER` | `SupplierID` | Direct properties on `:Supplier` (`supplierId`, `name`) |
| `SUPPLIER_PHONE` | `(SupplierID, PhoneNo)` | Unwound `phones: String[]` list property on `:Supplier` |
| `INVENTORY_ITEM` | `ItemID` | Direct properties on `:InventoryItem` (`itemId`, `name`, `category`, `unit`) |
| `PROCURES` | `(MessID, SupplierID, ItemID)` | Properties on `:Procurement` connecting `:Mess`, `:Supplier`, and `:InventoryItem` |
| `PAYMENT` | `PaymentID` | Direct properties on `:Payment` (`paymentId`, `amount`, `paymentMode`, `status`, `paymentDay`, etc.) |
| `PAYMENT_DETAIL` | `(PaymentID, DetailID)` | Direct properties on `:PaymentDetail` (`paymentId`, `detailId`, `month`, `year`, charges) |

---

## 🔍 Detailed Functionalities Breakdown

### 1. Executive Operations Dashboard
- Real-time KPI summary cards: Total Students, Total Hostels, Total Rooms, Total Mess Halls, Active Wardens, and Registered Staff.
- Global bed occupancy rate calculation: Computed dynamically via Cypher aggregation `(assigned_students / total_bed_capacity) * 100`.
- Financial transaction overview: Total fees collected, pending fee balances, and payment mode distributions.
- Quick navigation shortcuts to core administrative modules and analytical reports.

### 2. Student Profile & Resident Management
- Resident profile directory with search, filter, and pagination.
- Comprehensive student details: First/Last name, gender, date of birth, blood group, medical allergies, dining plan subscription, and multi-contact numbers.
- Automated graph relationship linking upon creation and update:
  - `(:Student)-[:ALLOCATED_TO]->(:Room)`
  - `(:Student)-[:RESIDES_IN]->(:Hostel)`
  - `(:Student)-[:ENROLLED_IN]->(:Mess)`
  - `(:Student)-[:MENTORED_BY]->(:Student)` (self-referential peer advising)

### 3. Hostel Building & Block Administration
- Multi-block residential hall directory (Boys' Block, Girls' Block, International Scholars' Wing, etc.).
- Total floor management, room count aggregations, and presiding warden assignments via `[:MANAGED_BY]`.

### 4. Room Inventory & Vacancy Tracking
- Room directory with floor numbering, room classification, bed capacities, monthly rental pricing, and building allocation.
- Live vacancy and occupancy indicators based on active student assignments.

### 5. Room Classification Catalog
- Standardized room categories: Single Standard, Double Deluxe, Triple Economy, Executive Suite.
- Climate control flags (AC vs. Non-AC) and baseline bed capacity rules.

### 6. Warden Administration & Contact Registry
- Residence warden directory with join dates, assigned email addresses, and multi-contact telephone numbers.
- Supervision oversight linking wardens directly to their managed residential buildings.

### 7. Mess Facilities & Dining Hall Operations
- Dining hall facility directory (Vegetarian Hall, Non-Vegetarian Hall, Special Catering Wing).
- Physical campus locations, operating contact numbers, and meal subscription plans.

### 8. Meal Menus, Scheduling & Pricing
- Scheduled meal catalog: Breakfast, Lunch, High Tea, Dinner, and Special Weekend Feasts.
- Menu descriptions, dietary details, unit pricing, and dining hall assignments via `[:SERVED_IN]`.

### 9. Staff Workforce & Payroll Directory
- Kitchen and service workforce registry: Head Chefs, Assistant Cooks, Mess Supervisors, Cleaning Crew.
- Join dates, monthly compensation/salary records, multi-phone contact listings, and dining hall allocations.

### 10. Supplier Network & Vendor Registry
- Provision supplier directory providing fresh produce, poultry, dairy, dry rations, and cleaning supplies.
- Vendor contact registry with multiple telephone numbers per supplier.

### 11. Consumable Inventory & Provision Tracking
- Inventory catalog with categorized classification (Grains, Dairy, Vegetables, Meat, Beverages, Cleaning).
- Measurement units (kg, liters, bags, cans) and provision stock monitoring.

### 12. Procurement Ledger & Purchase Batches
- Centralized purchase order ledger linking dining halls (`:Mess`), vendors (`:Supplier`), and items (`:InventoryItem`).
- Quantity tracking, delivery records, and batch procurement tracking.

### 13. Student Billing & Payment Transactions
- Student fee payment ledger recording transaction amounts, payment dates (Day/Month/Year), and status flags (Completed, Pending, Failed).
- Payment methods supported: Cash, UPI, Net Banking, Credit Card, Debit Card.
- Itemized billing breakdown (`:PaymentDetail`) tracking mess charges, maintenance dues, and additional fees.

### 14. 13 Pre-Compiled Analytical Reports
High-performance Cypher pattern-matching queries with millisecond profiling and 1-click CSV download:

| # | Report Key | Report Title | Purpose & Description |
| :-: | :--- | :--- | :--- |
| 1 | `student-room-hostel` | **Student + Room + Hostel Report** | Detailed allocation listing of students with assigned rooms, floors, and hostels. |
| 2 | `student-phones` | **Student + Student Phone Report** | Multi-phone contact registry unwinding all phone numbers per student. |
| 3 | `hostel-warden` | **Hostel + Warden Report** | Administrative hierarchy connecting hostel buildings to wardens and contacts. |
| 4 | `room-type-hostel` | **Room + Hostel Report** | Inventory of all rooms with room configurations, capacities, rents, and hostels. |
| 5 | `mess-meal` | **Mess + Meal Report** | Meal menus, descriptions, and costs across all dining halls. |
| 6 | `mess-staff` | **Mess + Staff Report** | Kitchen and service personnel assigned to each mess hall with roles and contacts. |
| 7 | `supplier-inventory` | **Supplier + Inventory Report** | Matrix of verified vendors and the inventory items procured from each. |
| 8 | `procurement-supplier-inventory` | **Procurement Ledger Report** | Purchase ledger linking procurement quantities to mess halls, vendors, and items. |
| 9 | `student-payment` | **Student + Payment Report** | Complete fee payment transactions joined with student and hostel records. |
| 10 | `hostel-occupancy` | **Overall Hostel Occupancy Report** | High-level aggregation of hostels, total rooms, total bed capacity, and assigned students. |
| 11 | `available-rooms` | **Available Rooms Report** | Room directory showing occupancy counts against maximum capacity. |
| 12 | `student-payment-summary` | **Student Payment Summary Report** | Financial rollup calculating total payment amounts aggregated per student. |
| 13 | `inventory-procurement-summary` | **Inventory & Procurement Summary Report** | Combined stock and procurement totals grouped by inventory item. |

### 15. Interactive Query Studio
- **Arbitrary Cypher Execution**: Run both read (`MATCH ... RETURN`) and write (`CREATE`, `MERGE`, `SET`, `DELETE`) Cypher queries directly against Neo4j AuraDB.
- **Performance Profiling**: Real-time measurement of query execution duration in milliseconds.
- **Export & Formatting**: Dynamic tabular rendering with 1-click CSV export of result sets.
- **Schema Explorer**: Interactive live schema inspector displaying node labels, record counts, and relationship types.

### 16. 18 Dedicated Database Table Explorers
- Full tabular exploration for each of the 18 entities.
- Live keyword search, column sorting, pagination, and direct record creation/editing/deletion.

---

## 📡 Complete REST API Reference

| Domain | Endpoint | Methods | Description |
| :--- | :--- | :---: | :--- |
| **Health** | `/api/health` | `GET` | Service status, Neo4j AuraDB connection, and table count. |
| **Dashboard** | `/api/dashboard/stats` | `GET` | Aggregated KPI statistics, occupancy rate, financial summaries. |
| **Students** | `/api/students` | `GET`, `POST` | List students (with search/filter) or create a new student. |
| | `/api/students/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or remove student and relationships. |
| **Hostels** | `/api/hostels` | `GET`, `POST` | List all hostel buildings or create a new hostel block. |
| | `/api/hostels/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or remove hostel and relationships. |
| **Rooms** | `/api/rooms` | `GET`, `POST` | List all rooms (optional `?hostelId=`) or create a room. |
| | `/api/rooms/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete room inventory. |
| **Room Types** | `/api/room-types` | `GET`, `POST` | List room classification types or create a new type. |
| | `/api/room-types/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete room classification. |
| **Wardens** | `/api/wardens` | `GET`, `POST` | List wardens with phone numbers or register a new warden. |
| | `/api/wardens/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete warden record. |
| **Mess Halls** | `/api/mess` | `GET`, `POST` | List mess dining halls or register a new mess hall. |
| | `/api/mess/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete mess hall record. |
| **Meals** | `/api/meals` | `GET`, `POST` | List menu meals (optional `?messId=`) or create a meal. |
| | `/api/meals/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete meal record. |
| **Staff** | `/api/staff` | `GET`, `POST` | List mess staff members or register a new staff member. |
| | `/api/staff/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete staff member record. |
| **Suppliers** | `/api/suppliers` | `GET`, `POST` | List provision suppliers or register a new supplier. |
| | `/api/suppliers/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete supplier record. |
| **Inventory** | `/api/inventory` | `GET`, `POST` | List inventory items or create a new inventory stock item. |
| | `/api/inventory/:id` | `GET`, `PUT`, `DELETE` | Retrieve, update, or delete inventory item. |
| **Procurements** | `/api/procurements` | `GET`, `POST`, `DELETE` | List procurement purchase orders, create order, or delete. |
| **Payments** | `/api/payments` | `GET`, `POST` | List payment transactions or record a new fee payment. |
| | `/api/payments/:id` | `GET`, `DELETE` | Retrieve payment with itemized details, or delete payment. |
| **Reports** | `/api/reports` | `GET` | List metadata for all 13 pre-compiled analytical reports. |
| | `/api/reports/:reportKey` | `GET` | Execute specific pre-compiled Cypher report with profiling. |
| **Tables** | `/api/tables` | `GET` | List all 18 database table definitions and record counts. |
| | `/api/tables/:tableName` | `GET`, `POST`, `PUT`, `DELETE` | Generic table explorer CRUD across any of the 18 tables. |
| **Query Studio** | `/api/query` | `POST` | Execute arbitrary Cypher queries with execution profiling. |
| | `/api/query/schema` | `GET` | Reflect live node labels, relationship types, and constraints. |

---

## 📁 Repository Structure

```text
DA3-database/
├── database/
│   ├── schema.cypher             # Neo4j graph schema (13 constraints + 2 performance indexes)
│   ├── seed.cypher               # Idempotent MERGE seed dataset (63 nodes, 68 relationships)
│   ├── schema_mysql.sql          # Reference relational SQL schema
│   └── seed.sql                  # Reference relational SQL dataset
│
├── backend/
│   ├── package.json              # Express, neo4j-driver, cors, dotenv
│   ├── server.js                 # Application entry point & health check
│   ├── database.js               # Unified database facade delegating to Neo4j
│   ├── db-neo4j.js               # Official neo4j-driver pool, sessions & type unwrapping
│   ├── init-neo4j.js             # Idempotent database initializer & seeder
│   ├── test-connection.js        # Neo4j AuraDB connection verification test
│   ├── verify-database.js        # Node & relationship count verifier (baseline audit)
│   ├── test-endpoints-and-crud.js# Full integration test suite (all endpoints + CRUD)
│   └── routes/                   # Parameterized Cypher route controllers
│       ├── dashboard.js          # KPI summaries & occupancy aggregations
│       ├── students.js           # Student profile CRUD
│       ├── hostels.js            # Residence block CRUD
│       ├── rooms.js              # Room inventory CRUD
│       ├── roomTypes.js          # Room classification CRUD
│       ├── wardens.js            # Warden administration CRUD
│       ├── mess.js               # Mess dining facility CRUD
│       ├── meals.js              # Meal menu & pricing CRUD
│       ├── staff.js              # Workforce & payroll CRUD
│       ├── suppliers.js          # Vendor registry CRUD
│       ├── inventory.js          # Inventory catalog CRUD
│       ├── procurements.js       # Purchase batch order CRUD
│       ├── payments.js           # Payment billing CRUD
│       ├── reports.js            # 13 pre-compiled Cypher reports
│       ├── tables.js             # 18-table explorer view mapper
│       └── query.js              # Universal Cypher Query Studio engine
│
├── frontend/
│   ├── index.html                # HTML5 application shell & SVG favicon
│   ├── package.json              # React 18, Vite, Lucide React
│   ├── vite.config.js            # Vite configuration & development proxy
│   ├── vercel.json               # Vercel SPA client-side rewrite rules
│   └── src/
│       ├── index.css             # Cosmic Midnight design system & CSS variables
│       ├── main.jsx              # React root mount
│       ├── App.jsx               # Application router & toast container
│       ├── services/api.js       # Unified API service
│       ├── components/           # Reusable UI components (Navbar, Sidebar, Modals)
│       └── pages/                # View pages (Dashboard, Reports, Query Studio, Tables)
│
├── GRAPH_MODEL.md                # Detailed property graph model & relationships
├── .env.example                  # Sample environment variables template
├── .gitignore                    # Git exclusions (.env, node_modules, dist)
└── README.md                     # Complete system documentation
```

---

## 🛠 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: Version `>= 18.0.0`
- **npm**: Version `>= 9.0.0`
- **Neo4j AuraDB Free Instance**: [Create a free cloud database on Neo4j AuraDB](https://neo4j.com/cloud/platform/aura-graph-database/)

### 1. Configure Environment Variables
Create a `backend/.env` file with your Neo4j AuraDB credentials:

```env
PORT=5000
NODE_ENV=development

# Neo4j AuraDB Connection Parameters
NEO4J_URI=neo4j+s://<your-instance-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password_here

# Frontend CORS Origin (comma-separated or single URL)
FRONTEND_URL=http://localhost:3000
```

> **Security Note**: Never commit `backend/.env` to source control. It is explicitly protected in `.gitignore`.

### 2. Install Backend Dependencies & Initialize Neo4j
```bash
cd backend
npm install
```

Verify connection to your Neo4j AuraDB instance:
```bash
npm run test-connection
```

Initialize the database schema, constraints, indexes, and seed dataset:
```bash
npm run init-db
```

Verify that all nodes, relationships, and constraints were created successfully:
```bash
npm run verify-db
```

Run the automated integration test suite:
```bash
npm test
```

### 3. Start Backend Server
```bash
npm start
```
The backend server will launch at `http://localhost:5000`. Verify system health at `http://localhost:5000/api/health`.

### 4. Install Frontend Dependencies & Start Application
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React application will launch at `http://localhost:3000`.

---

## 📊 Database Verification & Integrity

The database baseline has been audited and verified:

```text
=== VERIFYING NEO4J AURADB GRAPH DATABASE ===

1. NODE LABELS AND RECORD COUNTS:
 - Warden          : 3 nodes
 - Hostel          : 3 nodes
 - RoomType        : 4 nodes
 - Room            : 8 nodes
 - Student         : 10 nodes
 - Mess            : 3 nodes
 - Meal            : 6 nodes
 - Staff           : 6 nodes
 - Supplier        : 4 nodes
 - InventoryItem   : 6 nodes
 - Procurement     : 5 nodes
 - Payment         : 4 nodes
 - PaymentDetail   : 1 nodes
 Total nodes across all 13 labels: 63 nodes

2. GRAPH RELATIONSHIP COUNTS:
 - [:ALLOCATED_TO   ]: 10 relationships
 - [:RESIDES_IN     ]: 10 relationships
 - [:ENROLLED_IN    ]: 10 relationships
 - [:LOCATED_IN     ]: 8 relationships
 - [:OF_TYPE        ]: 8 relationships
 - [:SERVED_IN      ]: 6 relationships
 - [:ASSIGNED_TO    ]: 6 relationships
 - [:SUPPLIED_BY    ]: 5 relationships
 - [:INCLUDES_ITEM  ]: 5 relationships
 - [:PAID_BY        ]: 4 relationships
 - [:MANAGED_BY     ]: 3 relationships
 - [:MENTORED_BY    ]: 3 relationships
 - [:PLACED_ORDER   ]: 3 relationships
 - [:HAS_DETAIL     ]: 1 relationships
 Total relationships in graph: 68 relationships

3. CONSTRAINT VERIFICATION:
 Verified 13 uniqueness constraints + 2 performance indexes active in Neo4j.
 SUCCESS: Neo4j AuraDB graph database verified.
```

---

## 🚀 Live Production Deployment

The application is deployed live and fully operational:

- **🌐 Live Web Application**: [https://da-3-database.vercel.app/](https://da-3-database.vercel.app/)

```text
React 18 + Vite (Frontend)        Node.js + Express (Backend)          Neo4j AuraDB (Database)
    Hosted on Vercel                   Hosted on Render                   Cloud Managed Graph
           │                                  │                                    │
           ▼                                  ▼                                    ▼
https://da-3-database.vercel.app ──HTTPS─► https://<api>.onrender.com ──Bolt+s──► neo4j+s://<db>.databases.neo4j.io
```

- **Frontend (Vercel)**:
  - Deployed at: [https://da-3-database.vercel.app/](https://da-3-database.vercel.app/)
  - Client-side Single Page Application bundled with Vite.
  - Configured with `frontend/vercel.json` rewrite rules (`"source": "/(.*)", "destination": "/index.html"`).
  - Environment variable: `VITE_API_URL=https://<your-render-backend-url>`.
- **Backend (Render)**:
  - Node.js Web Service running `node server.js`.
  - Environment variables: `PORT=10000`, `NODE_ENV=production`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, and `FRONTEND_URL=https://da-3-database.vercel.app`.
- **Database (Neo4j AuraDB)**:
  - Free cloud graph database with automatic daily snapshots, encryption in transit and at rest.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
