/**
 * employeeOrAdmin middleware
 * Grants access to users with role 'employee' OR 'admin'.
 * Must be used after the `auth` middleware (req.user must be populated).
 */
const employeeOrAdmin = (req, res, next) => {
  if (!req.user || !['employee', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Employee or Admin privileges required.' });
  }
  next();
};

module.exports = employeeOrAdmin;
