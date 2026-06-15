// src/pages/BasePage.jsx
/*
================================================================================
File Name : BasePage.jsx
Author : Tahseen Raza
Created Date : 2026-06-10
Description : Parent class for all page components providing common page 
              functionality, SEO metadata, and page lifecycle methods
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import React from 'react'
import BaseComponent from '../core/BaseComponent'

class BasePage extends BaseComponent {
  constructor(props = {}) {
    super(props)
    this.pageTitle = props.pageTitle || 'Vaahan International'
    this.pageDescription = props.pageDescription || 'Modern Car Features Explained Simply'
    this.state = props.initialState || {}
  }

  // Set page metadata
  setPageMetadata() {
    if (typeof document !== 'undefined') {
      document.title = this.pageTitle
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', this.pageDescription)
    }
  }

  // Scroll to top on page change
  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  componentDidMount() {
    super.componentDidMount()
    this.setPageMetadata()
    this.scrollToTop()
  }

  // Helper to update state
  setState(updater, callback) {
    if (this.setState) {
      super.setState(updater, callback)
    }
  }

  render() {
    // Only render the content - NO header or footer here
    return this.renderContent()
  }

  // To be overridden by child classes
  renderContent() {
    return null
  }
}

export default BasePage