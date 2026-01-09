import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

async function createTables() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const tables = [
    // Customer Segments
    `CREATE TABLE IF NOT EXISTS customerSegments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      criteria TEXT NOT NULL,
      customerCount INT DEFAULT 0 NOT NULL,
      lastCalculated TIMESTAMP NULL,
      isActive BOOLEAN DEFAULT true NOT NULL,
      createdBy INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Marketing Automations
    `CREATE TABLE IF NOT EXISTS marketingAutomations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      triggerType ENUM('time_based', 'event_based', 'segment_based') NOT NULL,
      triggerConfig TEXT NOT NULL,
      actionType ENUM('email', 'sms', 'push', 'discount') NOT NULL,
      actionConfig TEXT NOT NULL,
      segmentId INT,
      status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft' NOT NULL,
      sentCount INT DEFAULT 0 NOT NULL,
      openedCount INT DEFAULT 0 NOT NULL,
      clickedCount INT DEFAULT 0 NOT NULL,
      convertedCount INT DEFAULT 0 NOT NULL,
      startDate TIMESTAMP NULL,
      endDate TIMESTAMP NULL,
      lastRunAt TIMESTAMP NULL,
      nextRunAt TIMESTAMP NULL,
      createdBy INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Risk Assessments
    `CREATE TABLE IF NOT EXISTS riskAssessments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category ENUM('financial', 'operational', 'compliance', 'security', 'reputational') NOT NULL,
      severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
      likelihood ENUM('rare', 'unlikely', 'possible', 'likely', 'certain') NOT NULL,
      impactScore INT NOT NULL,
      riskScore INT NOT NULL,
      mitigationPlan TEXT,
      mitigationStatus ENUM('not_started', 'in_progress', 'completed', 'ongoing') DEFAULT 'not_started' NOT NULL,
      mitigationOwner INT,
      mitigationDeadline TIMESTAMP NULL,
      status ENUM('identified', 'assessed', 'mitigating', 'resolved', 'accepted') DEFAULT 'identified' NOT NULL,
      createdBy INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Compliance Checks
    `CREATE TABLE IF NOT EXISTS complianceChecks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      area ENUM('data_privacy', 'financial', 'tax', 'labor', 'consumer_protection', 'licensing') NOT NULL,
      regulation VARCHAR(255),
      checkType ENUM('automated', 'manual', 'audit') NOT NULL,
      frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annually') NOT NULL,
      status ENUM('compliant', 'non_compliant', 'pending_review', 'remediation') DEFAULT 'pending_review' NOT NULL,
      lastCheckDate TIMESTAMP NULL,
      nextCheckDate TIMESTAMP NULL,
      evidence TEXT,
      notes TEXT,
      responsiblePerson INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Compliance Violations
    `CREATE TABLE IF NOT EXISTS complianceViolations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      checkId INT NOT NULL,
      description TEXT NOT NULL,
      severity ENUM('minor', 'moderate', 'major', 'critical') NOT NULL,
      remediationPlan TEXT,
      remediationDeadline TIMESTAMP NULL,
      remediationStatus ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending' NOT NULL,
      resolvedAt TIMESTAMP NULL,
      resolvedBy INT,
      resolutionNotes TEXT,
      reportedBy INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Webhook Endpoints
    `CREATE TABLE IF NOT EXISTS webhookEndpoints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      secret VARCHAR(255) NOT NULL,
      authType ENUM('none', 'basic', 'bearer', 'hmac') DEFAULT 'hmac' NOT NULL,
      authCredentials TEXT,
      events TEXT NOT NULL,
      isActive BOOLEAN DEFAULT true NOT NULL,
      lastDeliveryStatus ENUM('success', 'failed', 'pending'),
      lastDeliveryAt TIMESTAMP NULL,
      failureCount INT DEFAULT 0 NOT NULL,
      maxRetries INT DEFAULT 3 NOT NULL,
      retryDelay INT DEFAULT 60 NOT NULL,
      createdBy INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Webhook Logs
    `CREATE TABLE IF NOT EXISTS webhookLogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      endpointId INT NOT NULL,
      eventType VARCHAR(100) NOT NULL,
      payload TEXT NOT NULL,
      status ENUM('pending', 'success', 'failed') DEFAULT 'pending' NOT NULL,
      statusCode INT,
      response TEXT,
      errorMessage TEXT,
      attemptCount INT DEFAULT 1 NOT NULL,
      deliveredAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Vendors
    `CREATE TABLE IF NOT EXISTS vendors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contactPerson VARCHAR(255),
      email VARCHAR(320),
      phone VARCHAR(20),
      address TEXT,
      businessType VARCHAR(100),
      taxId VARCHAR(100),
      status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending' NOT NULL,
      rating INT DEFAULT 0,
      paymentTerms VARCHAR(100),
      totalPurchases INT DEFAULT 0 NOT NULL,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Vendor Contracts
    `CREATE TABLE IF NOT EXISTS vendorContracts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendorId INT NOT NULL,
      contractNumber VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      startDate TIMESTAMP NOT NULL,
      endDate TIMESTAMP NOT NULL,
      value INT NOT NULL,
      status ENUM('draft', 'active', 'expired', 'terminated', 'renewed') DEFAULT 'draft' NOT NULL,
      documentUrl VARCHAR(500),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Vehicles
    `CREATE TABLE IF NOT EXISTS vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plateNumber VARCHAR(20) NOT NULL UNIQUE,
      type ENUM('motorcycle', 'bicycle', 'car', 'van', 'truck') NOT NULL,
      make VARCHAR(100),
      model VARCHAR(100),
      year INT,
      color VARCHAR(50),
      assignedRiderId INT,
      status ENUM('available', 'in_use', 'maintenance', 'retired') DEFAULT 'available' NOT NULL,
      currentLat VARCHAR(50),
      currentLng VARCHAR(50),
      lastLocationUpdate TIMESTAMP NULL,
      lastMaintenanceDate TIMESTAMP NULL,
      nextMaintenanceDate TIMESTAMP NULL,
      totalMileage INT DEFAULT 0 NOT NULL,
      insuranceExpiry TIMESTAMP NULL,
      insuranceProvider VARCHAR(100),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Vehicle Maintenance
    `CREATE TABLE IF NOT EXISTS vehicleMaintenance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vehicleId INT NOT NULL,
      type ENUM('routine', 'repair', 'inspection', 'emergency') NOT NULL,
      description TEXT NOT NULL,
      cost INT NOT NULL,
      vendorId INT,
      status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled' NOT NULL,
      scheduledDate TIMESTAMP NOT NULL,
      completedDate TIMESTAMP NULL,
      mileageAtMaintenance INT,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Delivery Routes
    `CREATE TABLE IF NOT EXISTS deliveryRoutes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      riderId INT,
      vehicleId INT,
      date TIMESTAMP NOT NULL,
      status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned' NOT NULL,
      totalDistance INT DEFAULT 0 NOT NULL,
      estimatedDuration INT DEFAULT 0 NOT NULL,
      actualDuration INT,
      totalStops INT DEFAULT 0 NOT NULL,
      completedStops INT DEFAULT 0 NOT NULL,
      optimizationScore INT,
      fuelEstimate INT,
      startedAt TIMESTAMP NULL,
      completedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )`,
    
    // Route Waypoints
    `CREATE TABLE IF NOT EXISTS routeWaypoints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      routeId INT NOT NULL,
      orderId INT,
      sequenceNumber INT NOT NULL,
      address TEXT NOT NULL,
      lat VARCHAR(50) NOT NULL,
      lng VARCHAR(50) NOT NULL,
      type ENUM('pickup', 'delivery', 'return') NOT NULL,
      status ENUM('pending', 'arrived', 'completed', 'skipped') DEFAULT 'pending' NOT NULL,
      estimatedArrival TIMESTAMP NULL,
      actualArrival TIMESTAMP NULL,
      completedAt TIMESTAMP NULL,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`
  ];
  
  console.log('Creating Sprint 24 tables...');
  
  for (const createSql of tables) {
    const tableName = createSql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
    try {
      await db.execute(sql.raw(createSql));
      console.log(`✅ ${tableName}: created`);
    } catch (e: any) {
      console.log(`❌ ${tableName}: ${e.message?.substring(0, 80)}`);
    }
  }
  
  console.log('\nDone!');
  process.exit(0);
}

createTables();
