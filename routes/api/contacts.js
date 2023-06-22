const express = require('express');

const ctrl = require('../../controllers/contacts');

const {
  validateBody,
  validateStatusBody,
  validationId,
} = require('../../middlewares');

const { schemas } = require('../../models/contact');

const router = express.Router();

router.get('/', ctrl.getAll);

router.get('/:contactId', validationId, ctrl.getContactById);

router.post('/', validateBody(schemas.addSchema), ctrl.addContact);

router.delete('/:contactId', validationId, ctrl.deleteContactByID);

router.put(
  '/:contactId',
  validationId,
  validateBody(schemas.addSchema),
  ctrl.updateContact
);

router.patch(
  '/:contactId/favorite',
  validationId,
  validateStatusBody(schemas.updateFavoriteSchema),
  ctrl.updateStatusContact
);

module.exports = router;
