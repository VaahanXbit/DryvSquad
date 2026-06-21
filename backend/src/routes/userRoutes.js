/*
================================================================================
File Name : userRoutes.js
Author : Tahseen Raza
Created Date : 2026-06-18
Description : User routes
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import express from 'express'
import { 
  getProfile, 
  updateProfile, 
  updateProfileImage,
  changePassword
} from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'
import { validate, updateProfileValidation } from '../utils/validation.js'

const router = express.Router()

// All routes are protected
router.use(protect)

router.get('/profile', getProfile)
router.put('/profile', updateProfileValidation, validate, updateProfile)
router.put('/profile/image', updateProfileImage)
router.put('/change-password', changePassword)

export default router