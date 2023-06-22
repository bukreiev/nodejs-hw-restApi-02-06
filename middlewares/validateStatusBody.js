const { httpError } = require('../helpers');

const validateStatusBody = schema => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      if (
        Object.keys(req.body).length === 0 ||
        !Object.hasOwn(req.body, 'favorite')
      ) {
        next(httpError(400, `missing field favorite`));
      } else if (typeof req.body.favorite !== 'boolean') {
        next(httpError(400, `field favorite has mistakes`));
      }
    }
    next();
  };
  return func;
};

module.exports = validateStatusBody;
