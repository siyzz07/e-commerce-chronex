function ensureAuthenticated(req, res, next) {
    if (req.i()) {
      return next();
    }
    res.redirect('/login');  // Redirect to login if not authenticated
  }
  
  module.exports = { ensureAuthenticated };
  