const express = require('express');

const ctrl = require('../../controllers/contacts');

const { validateBody, validation, validationId } = require('../../middlewares');

const { schemas } = require('../../models/contact');

const router = express.Router();

router.get('/', ctrl.getAll);

router.get('/:contactId', validationId, ctrl.getContactById);

router.post('/', validation(schemas.addSchema), ctrl.addContact);

router.delete('/:contactId', validationId, ctrl.deleteContactByID);

router.put(
  '/:contactId',
  validationId,
  validation(schemas.addSchema),
  ctrl.updateContact
);

router.patch(
  '/:contactId/favorite',
  validationId,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateStatusContact
);

module.exports = router;
