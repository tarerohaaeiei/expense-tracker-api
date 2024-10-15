const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    
    next();
  } catch (err) {
    res.status(401).json({ msg: err.message + ': Token is not valid' });
  }
};
