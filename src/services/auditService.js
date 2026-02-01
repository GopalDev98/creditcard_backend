import AuditLog from '../models/AuditLog.js';

export const createAuditLog = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Failed to create audit log:', error.message);
  }
};

export const getAuditLogs = async (filters = {}) => {
  const query = {};
  
  if (filters.applicationId) {
    query.applicationId = filters.applicationId;
  }
  
  if (filters.userId) {
    query.userId = filters.userId;
  }
  
  if (filters.action) {
    query.action = filters.action;
  }
  
  const logs = await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .limit(filters.limit || 100)
    .populate('userId', 'email role')
    .populate('applicationId', 'applicationNumber');
  
  return logs;
};
