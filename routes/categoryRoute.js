const express = require('express')
const  AuthMiddleware  = require('../middlewares/authMiddleware')
const { createCategory, getAllCategory, getSingleCategory, updateCategory, deleteCategory } = require('../controllers/categoryController')
const router = express.Router()


router.route('/').post(AuthMiddleware,createCategory)
router.route('/').get(getAllCategory)
router.route('/:id').get(getSingleCategory)
router.route('/:id').put(AuthMiddleware,updateCategory)
router.route('/:id').delete(AuthMiddleware,deleteCategory)

module.exports = router