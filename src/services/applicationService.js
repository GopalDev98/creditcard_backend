import Application from '../models/Application.js';
import { BusinessRuleError, NotFoundError } from '../utils/errors.js';
import { getCreditScore, calculateCreditLimit, shouldAutoApprove } from './creditScoreService.js';
import { createAuditLog } from './auditService.js';

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Check if applicant meets age requirement
export const validateAge = (dateOfBirth) => {
  const age = calculateAge(dateOfBirth);
  
  if (age < 18) {
    throw new BusinessRuleError(
      'Applicant must be at least 18 years old',
      'AGE_REQUIREMENT_NOT_MET'
    );
  }
  
  return true;
};

// Check for duplicate applications in last 6 months
export const checkDuplicateApplication = async (panCard) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const existingApplication = await Application.findOne({
    'personalInfo.panCard': panCard.toUpperCase(),
    status: { $in: ['approved', 'rejected'] },
    submittedAt: { $gte: sixMonthsAgo },
  });
  
  if (existingApplication) {
    throw new BusinessRuleError(
      `You already have a ${existingApplication.status} application from the last 6 months. Please wait before applying again.`,
      'DUPLICATE_APPLICATION'
    );
  }
  
  return true;
};

// Process application and determine approval
export const processApplication = async (applicationData, userId, ipAddress, userAgent) => {
  const { personalInfo, employmentInfo } = applicationData;
  
  // 1. Validate age
  validateAge(personalInfo.dateOfBirth);
  
  // 2. Check for duplicate applications
  await checkDuplicateApplication(personalInfo.panCard);
  
  // 3. Generate application number
  const applicationNumber = await Application.generateApplicationNumber();
  
  // 4. Get credit score
  const creditScoreData = await getCreditScore(personalInfo.panCard);
  
  // 5. Calculate credit limit
  const creditLimit = calculateCreditLimit(employmentInfo.annualIncome);
  
  // 6. Determine status
  let status = 'pending';
  if (creditLimit !== null) {
    // Only auto-process if credit limit is not subjective
    status = shouldAutoApprove(creditScoreData.creditScore, creditLimit)
      ? 'approved'
      : 'rejected';
  }
  
  // 7. Create application
  const application = await Application.create({
    applicationNumber,
    userId,
    personalInfo: {
      ...personalInfo,
      panCard: personalInfo.panCard.toUpperCase(),
    },
    employmentInfo,
    creditInfo: {
      creditScore: creditScoreData.creditScore,
      creditLimit: creditLimit || 0, // Use 0 for subjective cases
      retrievedAt: creditScoreData.retrievedAt,
    },
    status,
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(),
      },
      ...(status !== 'pending'
        ? [
            {
              status,
              timestamp: new Date(),
              remarks: `Auto-${status} based on credit score ${creditScoreData.creditScore}`,
            },
          ]
        : []),
    ],
    submittedAt: new Date(),
    ...(status === 'approved' && { processedAt: new Date() }),
  });
  
  // 8. Create audit log
  await createAuditLog({
    applicationId: application._id,
    userId,
    action: 'create',
    details: {
      applicationNumber,
      status,
      creditScore: creditScoreData.creditScore,
      creditLimit,
    },
    ipAddress,
    userAgent,
  });
  
  return application;
};

// Get application by ID
export const getApplicationById = async (id, userId, userRole) => {
  const application = await Application.findById(id);
  
  if (!application) {
    throw new NotFoundError('Application not found');
  }
  
  // Check authorization (users can only view their own applications)
  if (userRole !== 'admin' && application.userId?.toString() !== userId) {
    throw new NotFoundError('Application not found');
  }
  
  return application;
};

// Get applications for a user
export const getUserApplications = async (userId) => {
  const applications = await Application.find({ userId }).sort({ submittedAt: -1 });
  return applications;
};

// Get all applications (admin only)
export const getAllApplications = async (filters = {}) => {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  const applications = await Application.find(query)
    .sort({ submittedAt: -1 })
    .limit(filters.limit || 100);
  
  return applications;
};

// Track application by application number (public)
export const trackApplication = async (applicationNumber) => {
  const application = await Application.findOne({ applicationNumber });
  
  if (!application) {
    throw new NotFoundError('Application not found');
  }
  
  // Return limited information for privacy
  return {
    applicationNumber: application.applicationNumber,
    status: application.status,
    submittedAt: application.submittedAt,
    processedAt: application.processedAt,
    creditInfo: application.creditInfo,
    statusHistory: application.statusHistory,
  };
};

// Update application status (admin only)
export const updateApplicationStatus = async (
  id,
  status,
  adminId,
  remarks,
  creditLimit,
  ipAddress,
  userAgent
) => {
  const application = await Application.findById(id);
  
  if (!application) {
    throw new NotFoundError('Application not found');
  }
  
  // Update status
  application.status = status;
  application.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: adminId,
    remarks,
  });
  
  // Update credit limit if provided
  if (creditLimit !== undefined && creditLimit !== null && application.creditInfo) {
    application.creditInfo.creditLimit = creditLimit;
  }
  
  if (status !== 'pending') {
    application.processedAt = new Date();
  }
  
  await application.save();
  
  // Create audit log
  await createAuditLog({
    applicationId: application._id,
    userId: adminId,
    action: status === 'approved' ? 'approve' : 'reject',
    details: {
      newStatus: status,
      remarks,
      creditLimit,
    },
    ipAddress,
    userAgent,
  });
  
  return application;
};
