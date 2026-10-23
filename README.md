# 🏢 HostelHub — Enterprise Hostel Management System

[![Database](https://img.shields.io/badge/Database-Neo4j%20AuraDB-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)](#-neo4j-graph-architecture)
[![Graph Schema](https://img.shields.io/badge/Schema-13%20Node%20Labels%20%7C%2010%20Relationships-4F46E5?style=for-the-badge)](GRAPH_MODEL.md)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

A modern, high-performance **University Hostel Administration & Campus Logistics Management System** engineered with **React 18**, **Vite**, **Node.js**, **Express**, and **Neo4j AuraDB**.

The platform equips university administrators, residence wardens, mess caterers, and accounting staff with an enterprise-grade operational hub for resident student allocation, multi-block room reservations, dining hall provisioning, staff payroll, vendor procurement, pre-compiled analytical intelligence reporting, and arbitrary Cypher / Graph query execution.

---

## 🏛 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER                                     │
│   React 18 Single-Page Application (Vite Bundler)                              │
│   • Cosmic Midnight SaaS Design System (Tailored Dark Theme & Micro-FX)        │
│   • Lucide Vector Iconography                                                  │
│   • Client-Side State Router (Zero Page-Reload Navigation)                     │
│   • Interactive Modals & Graph Entity Relationship Warnings                    │
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
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ Encrypted Bolt Protocol (`neo4j+s://`)
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                               DATABASE TIER                                    │
│   Neo4j AuraDB (Fully Managed Graph Database)                                 │
│   • 13 Distinct Node Labels with Uniqueness Constraints & Indexes              │
│   • 10 First-Class Directed Relationships with Native Graph Traversal           │
│   • Zero Join Latency & Efficient Property Graph Traversal                     │
│   • Idempotent MERGE Seed Mechanism for Safe Initializations                   │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents

- [Core System Features & Capabilities](#-core-system-features--capabilities)
- [Neo4j Graph Architecture](#-neo4j-graph-architecture)
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
- [Planned Production Deployment](#-planned-production-deployment)
- [License](#-license)

---

## 🌟 Core System Features & Capabilities

- **Graph Database Engine**: Powered by **Neo4j AuraDB** using the official `neo4j-driver` with encrypted connection pooling over `neo4j+s://`.
- **13 Graph Node Labels & 10 Relationships**: Re-modeled from normalized relational entities into a high-performance property graph (see [GRAPH_MODEL.md](GRAPH_MODEL.md)).
- **Uniqueness Constraints & Indexes**: 13 unique constraints protecting entity identifiers, plus performance indexes on student email and payment status.
- **Full Spectrum Query Studio**: Directly run arbitrary Cypher read queries (`MATCH ... RETURN`) and write operations (`CREATE`, `MERGE`, `SET`, `DELETE`) with live syntax highlighting and execution profiling.
- **13 Pre-Compiled Analytical Reports**: High-performance Cypher pattern-matching queries computing resident allocations, occupancy percentages, financial summaries, and inventory health with millisecond profiling and 1-click CSV export.
- **18 Unified Table Explorer Views**: Dedicated UI screens providing 100% table-equivalent views with primary keys, foreign keys, and live search.
- **Cosmic Midnight SaaS UI**: Tailored dark-mode interface with deep blue radial illumination, responsive layout, and modern Lucide iconography.

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

### Graph Relationships

```text
(:Hostel)-[:MANAGED_BY]->(:Warden)
(:Room)-[:LOCATED_IN]->(:Hostel)
(:Room)-[:OF_TYPE]->(:RoomType)
(:Student)-[:ALLOCATED_TO]->(:Room)
(:Student)-[:RESIDES_IN]->(:Hostel)
(:Student)-[:ENROLLED_IN]->(:Mess)
(:Student)-[:MENTORED_BY]->(:Student)
(:Meal)-[:SERVED_IN]->(:Mess)
(:Staff)-[:ASSIGNED_TO]->(:Mess)
(:Mess)-[:PLACED_ORDER]->(:Procurement)-[:SUPPLIED_BY]->(:Supplier)
(:Procurement)-[:INCLUDES_ITEM]->(:InventoryItem)
(:Payment)-[:PAID_BY]->(:Student)
(:Payment)-[:HAS_DETAIL]->(:PaymentDetail)
```

---

## 🗄 The 18 Unified Database Table Views

The application provides dedicated table views for all 18 standard tables:

1. `WARDEN`
2. `WARDEN_PHONE`
3. `HOSTEL`
4. `ROOM_TYPE`
5. `ROOM`
6. `STUDENT`
7. `STUDENT_PHONE`
8. `MESS`
9. `MESS_CONTACT`
10. `MEAL`
11. `STAFF`
12. `STAFF_PHONE`
13. `SUPPLIER`
14. `SUPPLIER_PHONE`
15. `INVENTORY_ITEM`
16. `PROCURES`
17. `PAYMENT`
18. `PAYMENT_DETAIL`

---

## 📡 Complete REST API Reference

| Domain | Endpoint | Methods Supported | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `/api/health` | `GET` | Service status, Neo4j AuraDB connection, and table count. |
| **Dashboard** | `/api/dashboard/stats` | `GET` | Aggregated KPI statistics, occupancy rate, financial summaries. |
| **Students** | `/api/students` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Full CRUD for resident student profiles. |
| **Hostels** | `/api/hostels` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Full CRUD for residence blocks & warden assignments. |
| **Rooms** | `/api/rooms` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Full CRUD for room inventory & pricing. |
| **Room Types** | `/api/room-types` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Room classifications & bed capacity settings. |
| **Wardens** | `/api/wardens` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Warden administration & multi-contact registry. |
| **Mess Halls** | `/api/mess` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Dining facility administration. |
| **Meals** | `/api/meals` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Meal scheduling, descriptions, and costs. |
| **Staff** | `/api/staff` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Workforce roles and payroll management. |
| **Suppliers** | `/api/suppliers` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Vendor directory & provision records. |
| **Inventory** | `/api/inventory` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` | Stock item tracking & low-stock alerts. |
| **Procurements** | `/api/procurements` | `GET`, `POST`, `DELETE` | Purchase ledger linking Mess, Supplier, and Item. |
| **Payments** | `/api/payments` | `GET`, `POST`, `GET /:id`, `DELETE /:id` | Student fee payments and detail line-items. |
| **Reports** | `/api/reports` | `GET`, `GET /:reportKey` | 13 pre-compiled analytical reports with profiling. |
| **Tables** | `/api/tables` | `GET`, `GET /:tableName`, `POST /:tableName`, `PUT /:tableName`, `DELETE /:tableName` | Generic table explorer CRUD across all 18 tables. |
| **Query Studio** | `/api/query` | `POST`, `GET /schema` | Cypher query runner and schema reflection. |

---

## 📁 Repository Structure

```text
DA3-database/
├── database/
│   ├── schema.cypher           # Neo4j graph schema (13 constraints + performance indexes)
│   ├── seed.cypher             # Idempotent MERGE seed script for all nodes & relationships
│   ├── schema_mysql.sql        # Reference SQL schema
│   └── seed.sql                # Reference SQL dataset
│
├── backend/
│   ├── package.json            # Express, neo4j-driver, cors, dotenv
│   ├── server.js               # Application entry point & health check
│   ├── database.js             # Unified database facade delegating to Neo4j
│   ├── db-neo4j.js             # Official neo4j-driver pool, sessions & type unwrapping
│   ├── init-neo4j.js           # Idempotent database initializer & seeder
│   ├── test-connection.js      # Neo4j AuraDB connection verification test
│   ├── verify-database.js      # Node & relationship count verifier
│   ├── test-endpoints-and-crud.js # Full integration test suite (all endpoints + CRUD)
│   └── routes/                 # Parameterized Cypher route controllers
│       ├── dashboard.js        # KPI summaries & occupancy aggregations
│       ├── students.js         # Student profile CRUD
│       ├── hostels.js          # Residence block CRUD
│       ├── rooms.js            # Room inventory CRUD
│       ├── roomTypes.js        # Room classification CRUD
│       ├── wardens.js          # Warden administration CRUD
│       ├── mess.js             # Mess dining facility CRUD
│       ├── meals.js            # Meal menu & pricing CRUD
│       ├── staff.js            # Workforce & payroll CRUD
│       ├── suppliers.js        # Vendor registry CRUD
│       ├── inventory.js        # Inventory catalog CRUD
│       ├── procurements.js     # Purchase batch order CRUD
│       ├── payments.js         # Payment billing CRUD
│       ├── reports.js          # 13 pre-compiled Cypher reports
│       ├── tables.js           # 18-table explorer view mapper
│       └── query.js            # Universal Cypher Query Studio engine
│
├── frontend/
│   ├── index.html              # HTML5 application shell & SVG favicon
│   ├── package.json            # React 18, Vite, Lucide React
│   ├── vite.config.js          # Vite configuration & development proxy
│   ├── vercel.json             # Vercel SPA client-side rewrite rules
│   └── src/
│       ├── index.css           # Cosmic Midnight design system
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Application router & toast container
│       ├── services/api.js     # Unified API service
│       ├── components/         # Reusable UI components (Navbar, Sidebar, Modals)
│       └── pages/              # View pages (Dashboard, Reports, Query Studio, Tables)
│
├── GRAPH_MODEL.md              # Detailed property graph model & relationships
├── .env.example                # Sample environment variables template
├── .gitignore                  # Git exclusions (.env, node_modules, dist)
└── README.md                   # Complete system documentation
```

---

## 🛠 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: Version `>= 18.0.0`
- **npm**: Version `>= 9.0.0`
- **Neo4j AuraDB Free Instance**: [https://neo4j.com/cloud/platform/aura-graph-database/](https://neo4j.com/cloud/platform/aura-graph-database/)

### 1. Configure Environment Variables
Create a local `.env` file in the root or `backend/` directory:
```bash
# Backend Server Configuration
PORT=5000
NODE_ENV=development

# Neo4j AuraDB Connection Parameters
NEO4J_URI=neo4j+s://<your-instance-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password_here

# Frontend API Target
VITE_API_URL=http://localhost:5000
```

> **Security Note**: Never commit `.env` files. Ensure they are listed in `.gitignore`.

### 2. Install Backend Dependencies & Initialize Neo4j
```bash
cd backend
npm install
npm run test-connection   # Verifies connection to Neo4j AuraDB
npm run init-db           # Creates constraints, indexes, and seeds graph nodes & relationships
npm run verify-db         # Verifies nodes and relationships count
```

### 3. Start Backend Server
```bash
npm start
```
The backend will launch at `http://localhost:5000`. Health check available at `http://localhost:5000/api/health`.

### 4. Install Frontend Dependencies & Start Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The React application will be available at `http://localhost:3000`.

---

## 🚀 Planned Production Deployment

The application is prepared for seamless cloud deployment:

- **Frontend**: **Vercel** (`frontend/vercel.json` configured for SPA routing).
- **Backend**: **Render** (Node.js web service running `node server.js`).
- **Database**: **Neo4j AuraDB Free Instance** (Fully managed cloud property graph database).

---

## 📄 License

This project is licensed under the **MIT License**.
