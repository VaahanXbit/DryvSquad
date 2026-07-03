/*
================================================================================
File Name : auth.js
Author : Tahseen Raza
Created Date : 2026-06-18
Description : Authentication middleware
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login.',
      });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'vaahan_jwt_secret_fallback_key';
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      
      if (decoded.role === 'admin') {
        req.user = { _id: 'admin_user', role: 'admin', firstName: 'Admin', lastName: 'User' };
      } else {
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          req.user = user;
        }
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid token.',
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin access only.',
    });
  }
};

module.exports = { protect, admin };