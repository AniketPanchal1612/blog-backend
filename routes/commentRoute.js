const express = require('express')
const { createComment, getAllComments, getSingleComment, updateComment, deleteComment } = require('../controllers/commentController')
const AuthMiddleware = require('../middlewares/authMiddleware');
const router = express.Router()

router.route('/').post(AuthMiddleware,createComment)
router.route('/').get(getAllComments)
router.route('/:id').get(AuthMiddleware,getSingleComment)
router.route('/:id').put(AuthMiddleware,updateComment)
router.route('/:id').delete(AuthMiddleware,deleteComment)

module.exports = router
