// src/pages/Profile.jsx
/*
================================================================================
File Name : Profile.jsx
Author : Tahseen Raza
Created Date : 2026-06-22
Description : User Profile page with phone verification
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import { getAvatarUrl } from '../utils/avatar'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [phoneVerificationStep, setPhoneVerificationStep] = useState('input') // 'input' | 'otp'
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [phoneSuccess, setPhoneSuccess] = useState('')
  const { isDark } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/')
        return
      }

      try {
        const result = await api.getCurrentUser(token)
        if (result.success) {
          setUser(result.user)
        } else {
          localStorage.removeItem('token')
          navigate('/')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
    window.location.reload()
  }

  const handlePhoneVerification = async () => {
    if (!phoneInput) {
      setPhoneError('Please enter your phone number')
      return
    }

    setPhoneLoading(true)
    setPhoneError('')
    setPhoneSuccess('')

    try {
      const token = localStorage.getItem('token')
      const result = await api.verifyPhone(token, { phoneNumber: phoneInput })
      
      if (result.success) {
        setPhoneVerificationStep('otp')
        setPhoneSuccess('OTP sent to your phone number')
        setPhoneError('')
      } else {
        setPhoneError(result.message || 'Failed to send OTP')
      }
    } catch (error) {
      setPhoneError('Network error. Please try again.',error)
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleConfirmPhone = async () => {
    if (!otpInput || otpInput.length < 6) {
      setPhoneError('Please enter the 6-digit OTP')
      return
    }

    setPhoneLoading(true)
    setPhoneError('')
    setPhoneSuccess('')

    try {
      const token = localStorage.getItem('token')
      const result = await api.confirmPhone(token, {
        phoneNumber: phoneInput,
        otp: otpInput
      })
      
      if (result.success) {
        setUser(result.user)
        setPhoneSuccess('Phone number verified successfully!')
        setPhoneVerificationStep('input')
        setShowPhoneVerification(false)
        setPhoneInput('')
        setOtpInput('')
      } else {
        setPhoneError(result.message || 'Invalid OTP. Please try again.')
      }
    } catch (error) {
      setPhoneError('Network error. Please try again.',error)
    } finally {
      setPhoneLoading(false)
    }
  }

  const getUserInitials = () => {
    if (!user) return '?'
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return '?'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-red-500">{error || 'User not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const isFullyVerified = user.isEmailVerified && user.isPhoneVerified

  return (
    <div className={`min-h-screen pt-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My Profile
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your account details and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-lg overflow-hidden ${
              isDark ? 'bg-dark-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-8 text-center border-b ${
                isDark ? 'border-dark-700' : 'border-gray-200'
              }`}>
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto overflow-hidden ${
                  isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-500 text-white'
                }`}>
                  <span>{getUserInitials()}</span>
                  {/* Sits on top of the initials; if it fails to load, the
                      initials underneath stay visible as a safe fallback. */}
                  <img
                    src={getAvatarUrl(user._id || user.username || user.email)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <h2 className={`mt-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user.firstName} {user.lastName}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  @{user.username}
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user.email}
                </p>
              </div>

              <div className="px-6 py-4 space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
                <button
                  onClick={() => navigate('/')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-all duration-300 ${
                    isDark 
                      ? 'bg-dark-700 hover:bg-dark-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Account Details */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-lg overflow-hidden ${
              isDark ? 'bg-dark-800' : 'bg-white'
            }`}>
              <div className={`px-6 py-4 border-b ${
                isDark ? 'border-dark-700' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Account Details
                </h3>
              </div>

              <div className="px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      First Name
                    </label>
                    <p className={`mt-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.firstName || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Last Name
                    </label>
                    <p className={`mt-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.lastName || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Username
                    </label>
                    <p className={`mt-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      @{user.username || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email
                    </label>
                    <p className={`mt-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Phone Number
                    </label>
                    <p className={`mt-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.phoneNumber || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Member Since
                    </label>
                    <p className={`mt-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Account Status - Updated with Unverified */}
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                  <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Account Status
                  </h4>
                  <div className="space-y-3">
                    {/* Email Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📧 Email</span>
                      </div>
                      <div>
                        {user.isEmailVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            ✅ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            ⚠️ Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📱 Mobile</span>
                      </div>
                      <div>
                        {user.isPhoneVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            ✅ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            ❌ Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Overall Status */}
                    <div className={`flex items-center justify-between pt-2 border-t border-dashed ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                      <span className="text-sm font-medium">Overall Status</span>
                      <div>
                        {isFullyVerified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            ✅ Fully Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            ⚠️ Partially Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phone Verification Button */}
                  {!user.isPhoneVerified && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowPhoneVerification(!showPhoneVerification)}
                        className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isDark 
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        }`}
                      >
                        {showPhoneVerification ? 'Cancel' : '📱 Verify using Mobile Number'}
                      </button>

                      {/* Phone Verification Form */}
                      {showPhoneVerification && (
                        <div className={`mt-4 p-4 rounded-lg ${
                          isDark ? 'bg-dark-700' : 'bg-gray-50'
                        }`}>
                          {phoneSuccess && (
                            <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <p className="text-green-600 dark:text-green-400 text-sm text-center">{phoneSuccess}</p>
                            </div>
                          )}
                          {phoneError && (
                            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-red-600 dark:text-red-400 text-sm text-center">{phoneError}</p>
                            </div>
                          )}

                          {phoneVerificationStep === 'input' ? (
                            <>
                              <input
                                type="text"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value)}
                                placeholder="Enter mobile number (e.g., +919876543210)"
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-300 ${
                                  isDark 
                                    ? 'bg-dark-600 border-dark-500 text-white placeholder-gray-400 focus:border-yellow-500' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-500'
                                }`}
                                disabled={phoneLoading}
                              />
                              <button
                                onClick={handlePhoneVerification}
                                disabled={phoneLoading}
                                className={`w-full mt-3 py-2.5 font-medium rounded-lg transition-all duration-300 ${
                                  phoneLoading
                                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                }`}
                              >
                                {phoneLoading ? 'Sending...' : 'Send OTP'}
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="text"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-300 ${
                                  isDark 
                                    ? 'bg-dark-600 border-dark-500 text-white placeholder-gray-400 focus:border-yellow-500' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-500'
                                }`}
                                disabled={phoneLoading}
                              />
                              <div className="flex gap-3 mt-3">
                                <button
                                  onClick={handleConfirmPhone}
                                  disabled={phoneLoading}
                                  className={`flex-1 py-2.5 font-medium rounded-lg transition-all duration-300 ${
                                    phoneLoading
                                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                      : 'bg-green-600 hover:bg-green-700 text-white'
                                  }`}
                                >
                                  {phoneLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                  onClick={() => {
                                    setPhoneVerificationStep('input')
                                    setPhoneError('')
                                    setPhoneSuccess('')
                                  }}
                                  className="flex-1 py-2.5 font-medium rounded-lg transition-all duration-300 bg-gray-200 hover:bg-gray-300 dark:bg-dark-600 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-300"
                                >
                                  Back
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile