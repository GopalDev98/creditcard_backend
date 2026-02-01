import {
  processApplication,
  getApplicationById,
  getUserApplications,
  getAllApplications,
  trackApplication,
  updateApplicationStatus,
} from '../services/applicationService.js';

// Submit new application
export const submitApplication = async (req, res, next) => {
  try {
    const applicationData = req.body;
    const userId = req.user?.id || null; // User might not be authenticated
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const application = await processApplication(
      applicationData,
      userId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationNumber: application.applicationNumber,
        status: application.status,
        creditInfo: application.creditInfo,
        submittedAt: application.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get application by ID
export const getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await getApplicationById(
      id,
      req.user.id,
      req.user.role
    );

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's applications
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await getUserApplications(req.user.id);

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications (admin)
export const getApplications = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    
    const applications = await getAllApplications({
      status,
      limit: limit ? parseInt(limit) : undefined,
    });

    res.json({
      success: true,
      data: {
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Track application by number (public)
export const trackApplicationByNumber = async (req, res, next) => {
  try {
    const { applicationNumber } = req.params;
    const application = await trackApplication(applicationNumber);

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (admin)
export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, creditLimit, remarks } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const application = await updateApplicationStatus(
      id,
      status,
      req.user.id,
      remarks,
      creditLimit,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: {
        applicationNumber: application.applicationNumber,
        status: application.status,
        creditLimit: application.creditInfo?.creditLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};
