const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;

const { User } = require('../models/user');
const { httpError } = require('../helpers');

const authenticate = async (req, _, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    next(httpError(401));
  }
  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      next(httpError(401));
    }
    req.user = user;
    next();
  } catch (error) {
    next(httpError(401));
  }
};

module.exports = authenticate;
