exports.protect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    message: 'Not authenticated. Please login.'
  });
};

exports.adminOnly = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({
    success: false,
    message: 'Access denied. Admin only.'
  });
};

exports.checkActiveUser = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact admin.'
    });
  }
  next();
};