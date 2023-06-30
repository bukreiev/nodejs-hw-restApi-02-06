const { Schema, model } = require('mongoose');
const { MongooseError } = require('../helpers');
const Joi = require('joi');

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
// eslint-disable-next-line no-useless-escape
// const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
      // match: emailRegexp,
      // unique: true,
      required: true,
    },
    phone: {
      type: String,
      // unique: true,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const schemas = {
  addSchema,
  updateFavoriteSchema,
};

contactSchema.post('save', MongooseError);

const Contact = model('contact', contactSchema);

module.exports = { Contact, schemas };
