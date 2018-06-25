const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../passport')
const multer = require('multer');

const { validateBody, schemas } = require('../helpers/routerHelpers')
const UsersController = require('../controllers/users');
const passportSignin = passport.authenticate('local', { session: false});
const passportJWT = passport.authenticate('jwt',{ session: false});
const passportGoogle = passport.authenticate('googleToken', {session: false});

// Multer for upload picture
const storage = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, './uploads')
  },
  filename: function(req, file, cb){
      cb(null, new Date().toISOString() + file.originalname)
  } 
})
// filter file with question 
const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png')
  // reject file
  cb(null,false)
  // accept file
  cb(null,true)
}
// masih multer
const upload = multer({
  storage: storage, 
  limit:{fileSize: 1024 * 1024 * 5},
  fileFilter: fileFilter
});

router.route('/signup')
  .post(validateBody(schemas.authSchema), UsersController.signUp);

router.route('/signin')
  .post(validateBody(schemas.authSchema), passportSignin, UsersController.signIn);

router.route('/oauth/google')
  .post(passportGoogle, UsersController.googleOAuth);

router.route('/secret')
  .get(passportJWT, UsersController.secret);

router.route('/allUser')
  .get(passportJWT, UsersController.allUser);

router.route('/deleteUser')
  .delete(passportJWT, UsersController.deleteUser);

// router.route('/userById')
//   .get(passportJWT, UsersController.userById);

module.exports = router;