// src/pages/ArticleDetail.jsx
/*
================================================================================
File Name : ArticleDetail.jsx
Author : Tahseen Raza
Created Date : 2025-01-15
Description : Individual article detail page with full content display
Company : Vaahan International
Copyright : (c) 2025 Vaahan International. All rights reserved.
================================================================================
*/

import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { allArticles } from '../data/articlesData'

const ArticleDetail = () => {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Looking for article with slug:", slug)
    console.log("All articles:", allArticles.map(a => ({ title: a.title, slug: a.slug })))
    
    const found = allArticles.find(a => a.slug === slug)
    console.log("Found:", found)
    
    setArticle(found || null)
    setLoading(false)
  }, [slug])

  if (loading) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading article...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <Link to="/articles" className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors inline-block">
            Browse All Articles
          </Link>
          <div className="mt-8 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Available Articles:</h3>
            <div className="space-y-2">
              {allArticles.map(a => (
                <Link key={a.id} to={`/article/${a.slug}`} className="block text-yellow-600 hover:text-yellow-700">
                  • {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="relative pt-32 pb-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-semibold rounded-full">
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{article.title}</h1>
            <div className="flex items-center gap-4 text-gray-300 flex-wrap">
              <span>By {article.author || 'Vaahan Team'}</span>
              <span>•</span>
              <span>{article.date || 'Coming Soon'}</span>
              {article.readTime && <span>• {article.readTime}</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <img src={article.image} alt={article.title} className="w-full rounded-xl mb-8" />
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
            
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default ArticleDetail