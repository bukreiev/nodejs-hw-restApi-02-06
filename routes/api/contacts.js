const express = require('express');

const ctrl = require('../../controllers/contacts');

const {
  validateBody,
  validateStatusBody,
  validationId,
  authenticate,
} = require('../../middlewares');

const { schemas } = require('../../models/contact');

const router = express.Router();

router.get('/', authenticate, ctrl.getAll);

router.get('/:contactId', authenticate, validationId, ctrl.getContactById);

router.post(
  '/',
  authenticate,
  validateBody(schemas.addSchema),
  ctrl.addContact
);

router.delete(
  '/:contactId',
  authenticate,
  validationId,
  ctrl.deleteContactByID
);

router.put(
  '/:contactId',
  authenticate,
  validationId,
  validateBody(schemas.addSchema),
  ctrl.updateContact
);

router.patch(
  '/:contactId/favorite',
  authenticate,
  validationId,
  validateStatusBody(schemas.updateFavoriteSchema),
  ctrl.updateStatusContact
);

module.exports = router;
