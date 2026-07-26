-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "className" TEXT,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "parentIds" TEXT[],
    "transportRouteId" TEXT,
    "feedingPlan" TEXT NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "childIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "classIds" TEXT[],
    "subjectIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "classTeacher" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "dueDate" TEXT,

    CONSTRAINT "fee_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeItemIds" TEXT[],
    "totalAmount" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "balance" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "studentId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_routes" (
    "id" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "busName" TEXT NOT NULL,
    "vehicleRegistration" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "stops" TEXT[],

    CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_trips" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastUpdated" TEXT NOT NULL,
    "nextStop" TEXT,

    CONSTRAINT "transport_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "pickupPoint" TEXT NOT NULL,
    "dropOffPoint" TEXT NOT NULL,
    "estimatedPickupTime" TEXT NOT NULL,
    "estimatedDropOffTime" TEXT NOT NULL,
    "feeStatus" TEXT NOT NULL,

    CONSTRAINT "transport_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'all',
    "studentId" TEXT,
    "fileName" TEXT,
    "url" TEXT,
    "downloadable" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'all',
    "userId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_studentId_key" ON "students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_staffId_key" ON "staff"("staffId");

-- CreateIndex
CREATE INDEX "invoices_studentId_idx" ON "invoices"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_studentId_idx" ON "payments"("studentId");

-- CreateIndex
CREATE INDEX "transport_trips_routeId_idx" ON "transport_trips"("routeId");

-- CreateIndex
CREATE INDEX "transport_assignments_studentId_idx" ON "transport_assignments"("studentId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
