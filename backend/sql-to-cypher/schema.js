/**
 * Centralized Logical Relational Schema to Neo4j Graph Model Mapping
 * 
 * Defines the bidirectional mapping between the 18 normalized SQL tables and 
 * Neo4j AuraDB node labels, properties, and directed relationships.
 */

const ENTITIES = {
  Student: {
    label: 'Student',
    primaryKey: 'studentId',
    defaultAlias: 's',
    properties: {
      studentId: 'studentId',
      studentid: 'studentId',
      StudentID: 'studentId',
      id: 'studentId',
      ID: 'studentId',
      firstName: 'firstName',
      firstname: 'firstName',
      FirstName: 'firstName',
      lastName: 'lastName',
      lastname: 'lastName',
      LastName: 'lastName',
      gender: 'gender',
      Gender: 'gender',
      dob: 'dob',
      DOB: 'dob',
      email: 'email',
      Email: 'email',
      bloodGroup: 'bloodGroup',
      bloodgroup: 'bloodGroup',
      BloodGroup: 'bloodGroup',
      allergyInfo: 'allergyInfo',
      allergyinfo: 'allergyInfo',
      AllergyInfo: 'allergyInfo',
      planType: 'planType',
      plantype: 'planType',
      PlanType: 'planType',
      phones: 'phones',
      Phones: 'phones',
      roomNo: 'roomNo',
      roomno: 'roomNo',
      RoomNo: 'roomNo',
      hostelId: 'hostelId',
      hostelid: 'hostelId',
      HostelID: 'hostelId',
      messId: 'messId',
      messid: 'messId',
      MessID: 'messId',
      mentorStudentId: 'mentorStudentId',
      mentorstudentid: 'mentorStudentId',
      MentorStudentID: 'mentorStudentId'
    }
  },
  Room: {
    label: 'Room',
    primaryKey: 'roomNo',
    defaultAlias: 'r',
    properties: {
      roomNo: 'roomNo',
      roomno: 'roomNo',
      RoomNo: 'roomNo',
      floorNo: 'floorNo',
      floorno: 'floorNo',
      FloorNo: 'floorNo',
      type: 'type',
      Type: 'type',
      capacity: 'capacity',
      Capacity: 'capacity',
      roomRent: 'roomRent',
      roomrent: 'roomRent',
      RoomRent: 'roomRent',
      rent: 'roomRent',
      Rent: 'roomRent',
      hostelId: 'hostelId',
      hostelid: 'hostelId',
      HostelID: 'hostelId'
    }
  },
  Hostel: {
    label: 'Hostel',
    primaryKey: 'hostelId',
    defaultAlias: 'h',
    properties: {
      hostelId: 'hostelId',
      hostelid: 'hostelId',
      HostelID: 'hostelId',
      name: 'name',
      Name: 'name',
      hostelName: 'name',
      HostelName: 'name',
      totalFloors: 'totalFloors',
      totalfloors: 'totalFloors',
      TotalFloors: 'totalFloors',
      wardenId: 'wardenId',
      wardenid: 'wardenId',
      WardenID: 'wardenId'
    }
  },
  Warden: {
    label: 'Warden',
    primaryKey: 'wardenId',
    defaultAlias: 'w',
    properties: {
      wardenId: 'wardenId',
      wardenid: 'wardenId',
      WardenID: 'wardenId',
      name: 'name',
      Name: 'name',
      wardenName: 'name',
      WardenName: 'name',
      email: 'email',
      Email: 'email',
      joiningDate: 'joiningDate',
      joiningdate: 'joiningDate',
      JoiningDate: 'joiningDate',
      phones: 'phones',
      Phones: 'phones'
    }
  },
  RoomType: {
    label: 'RoomType',
    primaryKey: 'typeId',
    defaultAlias: 'rt',
    properties: {
      typeId: 'typeId',
      typeid: 'typeId',
      TypeID: 'typeId',
      typeName: 'typeName',
      typename: 'typeName',
      TypeName: 'typeName',
      acType: 'acType',
      actype: 'acType',
      AC_Type: 'acType',
      capacity: 'capacity',
      Capacity: 'capacity'
    }
  },
  Mess: {
    label: 'Mess',
    primaryKey: 'messId',
    defaultAlias: 'm',
    properties: {
      messId: 'messId',
      messid: 'messId',
      MessID: 'messId',
      name: 'name',
      Name: 'name',
      messName: 'name',
      MessName: 'name',
      messType: 'messType',
      messtype: 'messType',
      MessType: 'messType',
      location: 'location',
      Location: 'location',
      contacts: 'contacts',
      Contacts: 'contacts'
    }
  },
  Meal: {
    label: 'Meal',
    primaryKey: 'mealId',
    defaultAlias: 'ml',
    properties: {
      mealId: 'mealId',
      mealid: 'mealId',
      MealID: 'mealId',
      name: 'name',
      Name: 'name',
      mealName: 'name',
      MealName: 'name',
      description: 'description',
      Description: 'description',
      cost: 'cost',
      Cost: 'cost',
      messId: 'messId',
      messid: 'messId',
      MessID: 'messId'
    }
  },
  Staff: {
    label: 'Staff',
    primaryKey: 'staffId',
    defaultAlias: 'st',
    properties: {
      staffId: 'staffId',
      staffid: 'staffId',
      StaffID: 'staffId',
      name: 'name',
      Name: 'name',
      staffName: 'name',
      StaffName: 'name',
      joinDate: 'joinDate',
      joindate: 'joinDate',
      JoinDate: 'joinDate',
      salary: 'salary',
      Salary: 'salary',
      role: 'role',
      Role: 'role',
      messId: 'messId',
      messid: 'messId',
      MessID: 'messId',
      phones: 'phones',
      Phones: 'phones'
    }
  },
  Supplier: {
    label: 'Supplier',
    primaryKey: 'supplierId',
    defaultAlias: 'sup',
    properties: {
      supplierId: 'supplierId',
      supplierid: 'supplierId',
      SupplierID: 'supplierId',
      name: 'name',
      Name: 'name',
      supplierName: 'name',
      SupplierName: 'name',
      phones: 'phones',
      Phones: 'phones'
    }
  },
  InventoryItem: {
    label: 'InventoryItem',
    primaryKey: 'itemId',
    defaultAlias: 'i',
    properties: {
      itemId: 'itemId',
      itemid: 'itemId',
      ItemID: 'itemId',
      name: 'name',
      Name: 'name',
      itemName: 'name',
      ItemName: 'name',
      category: 'category',
      Category: 'category',
      unit: 'unit',
      Unit: 'unit'
    }
  },
  Procurement: {
    label: 'Procurement',
    primaryKey: 'procureId',
    defaultAlias: 'p',
    properties: {
      procureId: 'procureId',
      procureid: 'procureId',
      ProcureID: 'procureId',
      quantity: 'quantity',
      Quantity: 'quantity',
      messId: 'messId',
      messid: 'messId',
      MessID: 'messId',
      supplierId: 'supplierId',
      supplierid: 'supplierId',
      SupplierID: 'supplierId',
      itemId: 'itemId',
      itemid: 'itemId',
      ItemID: 'itemId'
    }
  },
  Payment: {
    label: 'Payment',
    primaryKey: 'paymentId',
    defaultAlias: 'pay',
    properties: {
      paymentId: 'paymentId',
      paymentid: 'paymentId',
      PaymentID: 'paymentId',
      studentId: 'studentId',
      studentid: 'studentId',
      StudentID: 'studentId',
      amount: 'amount',
      Amount: 'amount',
      paymentMode: 'paymentMode',
      paymentmode: 'paymentMode',
      PaymentMode: 'paymentMode',
      status: 'status',
      Status: 'status',
      paymentDay: 'paymentDay',
      paymentday: 'paymentDay',
      PaymentDay: 'paymentDay',
      paymentMonth: 'paymentMonth',
      paymentmonth: 'paymentMonth',
      PaymentMonth: 'paymentMonth',
      paymentYear: 'paymentYear',
      paymentyear: 'paymentYear',
      PaymentYear: 'paymentYear'
    }
  },
  PaymentDetail: {
    label: 'PaymentDetail',
    primaryKey: 'id',
    defaultAlias: 'pd',
    properties: {
      id: 'id',
      ID: 'id',
      paymentId: 'paymentId',
      paymentid: 'paymentId',
      PaymentID: 'paymentId',
      detailId: 'detailId',
      detailid: 'detailId',
      DetailID: 'detailId',
      month: 'month',
      Month: 'month',
      year: 'year',
      Year: 'year',
      messCharges: 'messCharges',
      messcharges: 'messCharges',
      MessCharges: 'messCharges',
      otherCharges: 'otherCharges',
      othercharges: 'otherCharges',
      OtherCharges: 'otherCharges'
    }
  }
};

const TABLE_ALIASES = {
  student: 'Student',
  students: 'Student',
  hostel: 'Hostel',
  hostels: 'Hostel',
  room: 'Room',
  rooms: 'Room',
  room_type: 'RoomType',
  roomtype: 'RoomType',
  room_types: 'RoomType',
  roomtypes: 'RoomType',
  warden: 'Warden',
  wardens: 'Warden',
  mess: 'Mess',
  messes: 'Mess',
  meal: 'Meal',
  meals: 'Meal',
  staff: 'Staff',
  staffs: 'Staff',
  supplier: 'Supplier',
  suppliers: 'Supplier',
  inventory_item: 'InventoryItem',
  inventoryitem: 'InventoryItem',
  inventory: 'InventoryItem',
  inventory_items: 'InventoryItem',
  procurement: 'Procurement',
  procurements: 'Procurement',
  procures: 'Procurement',
  payment: 'Payment',
  payments: 'Payment',
  payment_detail: 'PaymentDetail',
  paymentdetail: 'PaymentDetail',
  payment_details: 'PaymentDetail',
  paymentdetails: 'PaymentDetail'
};

const AUX_PHONE_TABLES = {
  student_phone: { parent: 'Student', phoneProp: 'phones', key: 'studentId', colKey: 'StudentID', colPhone: 'PhoneNo' },
  warden_phone: { parent: 'Warden', phoneProp: 'phones', key: 'wardenId', colKey: 'WardenID', colPhone: 'PhoneNo' },
  staff_phone: { parent: 'Staff', phoneProp: 'phones', key: 'staffId', colKey: 'StaffID', colPhone: 'PhoneNo' },
  supplier_phone: { parent: 'Supplier', phoneProp: 'phones', key: 'supplierId', colKey: 'SupplierID', colPhone: 'PhoneNo' },
  mess_contact: { parent: 'Mess', phoneProp: 'contacts', key: 'messId', colKey: 'MessID', colPhone: 'ContactNo' }
};

const GRAPH_RELATIONSHIPS = [
  {
    type: 'ALLOCATED_TO',
    from: 'Student',
    to: 'Room',
    fromKey: 'roomNo',
    toKey: 'roomNo',
    dir: 'OUT',
    desc: 'Student allocated to Room'
  },
  {
    type: 'RESIDES_IN',
    from: 'Student',
    to: 'Hostel',
    fromKey: 'hostelId',
    toKey: 'hostelId',
    dir: 'OUT',
    desc: 'Student resides in Hostel'
  },
  {
    type: 'ENROLLED_IN',
    from: 'Student',
    to: 'Mess',
    fromKey: 'messId',
    toKey: 'messId',
    dir: 'OUT',
    desc: 'Student enrolled in Mess'
  },
  {
    type: 'MENTORED_BY',
    from: 'Student',
    to: 'Student',
    fromKey: 'mentorStudentId',
    toKey: 'studentId',
    dir: 'OUT',
    desc: 'Junior student mentored by Senior student'
  },
  {
    type: 'MANAGED_BY',
    from: 'Hostel',
    to: 'Warden',
    fromKey: 'wardenId',
    toKey: 'wardenId',
    dir: 'OUT',
    desc: 'Hostel managed by Warden'
  },
  {
    type: 'LOCATED_IN',
    from: 'Room',
    to: 'Hostel',
    fromKey: 'hostelId',
    toKey: 'hostelId',
    dir: 'OUT',
    desc: 'Room located in Hostel'
  },
  {
    type: 'OF_TYPE',
    from: 'Room',
    to: 'RoomType',
    fromKey: 'type',
    toKey: 'typeName',
    dir: 'OUT',
    desc: 'Room categorized by RoomType'
  },
  {
    type: 'SERVED_IN',
    from: 'Meal',
    to: 'Mess',
    fromKey: 'messId',
    toKey: 'messId',
    dir: 'OUT',
    desc: 'Meal served in Mess'
  },
  {
    type: 'ASSIGNED_TO',
    from: 'Staff',
    to: 'Mess',
    fromKey: 'messId',
    toKey: 'messId',
    dir: 'OUT',
    desc: 'Staff assigned to Mess'
  },
  {
    type: 'PLACED_ORDER',
    from: 'Mess',
    to: 'Procurement',
    fromKey: 'messId',
    toKey: 'messId',
    dir: 'OUT',
    desc: 'Mess placed procurement order'
  },
  {
    type: 'SUPPLIED_BY',
    from: 'Procurement',
    to: 'Supplier',
    fromKey: 'supplierId',
    toKey: 'supplierId',
    dir: 'OUT',
    desc: 'Procurement supplied by Supplier'
  },
  {
    type: 'INCLUDES_ITEM',
    from: 'Procurement',
    to: 'InventoryItem',
    fromKey: 'itemId',
    toKey: 'itemId',
    dir: 'OUT',
    desc: 'Procurement includes InventoryItem'
  },
  {
    type: 'PAID_BY',
    from: 'Payment',
    to: 'Student',
    fromKey: 'studentId',
    toKey: 'studentId',
    dir: 'OUT',
    desc: 'Payment made by Student'
  },
  {
    type: 'HAS_DETAIL',
    from: 'Payment',
    to: 'PaymentDetail',
    fromKey: 'paymentId',
    toKey: 'paymentId',
    dir: 'OUT',
    desc: 'Payment has billing detail breakdown'
  }
];

function resolveEntityName(rawName) {
  if (!rawName || typeof rawName !== 'string') return null;
  const clean = rawName.trim().replace(/^[`"']|[`"']$/g, '');
  const lower = clean.toLowerCase();

  if (TABLE_ALIASES[lower]) {
    return TABLE_ALIASES[lower];
  }
  for (const key of Object.keys(ENTITIES)) {
    if (key.toLowerCase() === lower) return key;
  }
  return null;
}

function resolveAuxTable(rawName) {
  if (!rawName || typeof rawName !== 'string') return null;
  const lower = rawName.trim().replace(/^[`"']|[`"']$/g, '').toLowerCase();
  return AUX_PHONE_TABLES[lower] || null;
}

function resolvePropertyName(entityName, rawCol) {
  if (!rawCol || typeof rawCol !== 'string') return rawCol;
  const cleanCol = rawCol.trim().replace(/^[`"']|[`"']$/g, '');
  const entity = ENTITIES[entityName];
  if (!entity) return cleanCol;

  const propMap = entity.properties;
  if (propMap[cleanCol]) return propMap[cleanCol];

  const lower = cleanCol.toLowerCase();
  for (const [k, v] of Object.entries(propMap)) {
    if (k.toLowerCase() === lower) return v;
  }
  return cleanCol;
}

function findRelationship(fromEntity, toEntity, fromKey = null, toKey = null) {
  // Check direct from -> to
  const direct = GRAPH_RELATIONSHIPS.find(r => 
    r.from === fromEntity && r.to === toEntity &&
    (!fromKey || r.fromKey.toLowerCase() === fromKey.toLowerCase()) &&
    (!toKey || r.toKey.toLowerCase() === toKey.toLowerCase())
  );
  if (direct) return { ...direct, reversed: false };

  // Check reversed to -> from
  const reversed = GRAPH_RELATIONSHIPS.find(r => 
    r.from === toEntity && r.to === fromEntity &&
    (!fromKey || r.toKey.toLowerCase() === fromKey.toLowerCase()) &&
    (!toKey || r.fromKey.toLowerCase() === toKey.toLowerCase())
  );
  if (reversed) return { ...reversed, reversed: true };

  // Check by entity pair alone if keys not specified
  const pairDirect = GRAPH_RELATIONSHIPS.find(r => r.from === fromEntity && r.to === toEntity);
  if (pairDirect) return { ...pairDirect, reversed: false };

  const pairReversed = GRAPH_RELATIONSHIPS.find(r => r.from === toEntity && r.to === fromEntity);
  if (pairReversed) return { ...pairReversed, reversed: true };

  return null;
}

module.exports = {
  ENTITIES,
  TABLE_ALIASES,
  AUX_PHONE_TABLES,
  GRAPH_RELATIONSHIPS,
  resolveEntityName,
  resolveAuxTable,
  resolvePropertyName,
  findRelationship
};
