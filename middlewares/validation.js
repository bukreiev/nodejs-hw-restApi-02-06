const { httpError } = require('../helpers');

const validation = schema => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      if (!Object.keys(req.body).length) {
        next(httpError(400, `missing fields`));
      }
    }
    next();
  };
  return func;
};

module.exports = validation;
