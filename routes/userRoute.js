const express = require('express')
const router = express.Router()
const { registerUser, loginUser, allUsers, deleteUser, getSingleUser, getUserProfile, updateProfile, updatePassword, followingUser, unfollowUser, blockUser, unBlockUser, generateVarificationToken, profilePhtoUpload, generateVerificationTokenCtrl } = require('../controllers/UserController')
const  AuthMiddleware  = require('../middlewares/authMiddleware')
const { photoUpload, profilePhotoResize } = require('../middlewares/photoUpload')



// router.post('/api/users',registerUser)
router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/').get(AuthMiddleware,allUsers)
router.route('/:id').delete(deleteUser)
router.route('/:id').get(getSingleUser)
router.route('/').put(AuthMiddleware,updateProfile) //this create error
router.route('/password').put(AuthMiddleware,updatePassword)

router.route('/profile/:id').get(AuthMiddleware,getUserProfile)



router.route('/user/follow').put(AuthMiddleware,followingUser)
router.route('/user/unfollow').put(AuthMiddleware,unfollowUser)

router.route('/block-user/:id').put(AuthMiddleware,blockUser)
router.route('/un-block-user/:id').put(AuthMiddleware,unBlockUser)


router.route('/send-mail').post(generateVerificationTokenCtrl)

router.route('/user/profilephoto-upload').put(AuthMiddleware,photoUpload.single('image'), profilePhotoResize, profilePhtoUpload)
module.exports = router