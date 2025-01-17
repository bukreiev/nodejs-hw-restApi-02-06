const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');

const { User } = require('../models/user');

const { ctrlWrapper, httpError, sendEmail } = require('../helpers');
const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');
// register
const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw httpError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = uuidv4();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });
  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

// verify
const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw httpError(404, 'User not found');
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: '',
  });
  res.json({ message: 'Verification successful' });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(401, 'Email not found');
  }
  if (user.verify) {
    throw httpError(400, 'Verification has already been passed');
  }

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${user.verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);
  res.status(200).json({ message: 'Verification email sent' });
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(401, 'Email or password is wrong');
  }
  if (!user.verify) {
    throw httpError(401, 'Email not verificated');
  }

  const passwordComare = await bcrypt.compare(password, user.password);
  if (!passwordComare) {
    throw httpError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };
  req.user = user;
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email,
      subscription: `${user.subscription}`,
    },
  });
};

// updateAvatar
const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const resizeAvatar = await Jimp.read(tempUpload);
  resizeAvatar.resize(250, 250).write(tempUpload);

  const fileName = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, fileName);
  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join('avatars', fileName);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

// current
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

// logout
const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndDelete(_id, { token: '' });

  res.json({
    message: 'Logout success',
  });
};

module.exports = {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  updateAvatar: ctrlWrapper(updateAvatar),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};
