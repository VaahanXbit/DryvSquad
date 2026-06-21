/*
================================================================================
File Name : userController.js
Author : Tahseen Raza
Created Date : 2026-06-18
Description : User controllers
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import User from '../models/User.js'

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, preferences } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Update fields
    if (name) user.name = name
    if (email) {
      // Check if email is taken
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        })
      }
      user.email = email
    }
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences }
    }

    await user.save()

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    })
  }
}

// @desc    Update profile image
// @route   PUT /api/users/profile/image
// @access  Private
export const updateProfileImage = async (req, res) => {
  try {
    const { imageUrl } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.profileImage = imageUrl
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        profileImage: user.profileImage
      }
    })
  } catch (error) {
    console.error('Update profile image error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating profile image'
    })
  }
}

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    })
  }
}