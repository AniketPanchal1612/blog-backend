const express = require('express');
const { createPost, getAllPosts, getSinglePost, updatePost, deletePost, toggleAndLikeToPost, toggleAndDislikesToPost } = require('../controllers/postController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { photoUpload, postImgResize } = require('../middlewares/photoUpload');
const router = express.Router()


router.route('/').post(AuthMiddleware,photoUpload.single('image'),postImgResize,createPost)
router.route('/').get(getAllPosts)
router.route('/:id').get(getSinglePost)
router.route('/:id').put(AuthMiddleware,updatePost)
router.route('/:id').delete(deletePost)

router.route('/likes/like-post').put(AuthMiddleware,toggleAndLikeToPost) //changed bcs of update
router.route('/dislikes/dislike-post').put(AuthMiddleware,toggleAndDislikesToPost) //changed bcs of update

module.exports = router