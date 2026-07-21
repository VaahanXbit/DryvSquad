// src/components/admin/HeroBannerManager.jsx
/*
================================================================================
File Name : HeroBannerManager.jsx
Description : Hero Banner Management — lets Admin/Marketing change the
              homepage Hero slider banners without any code changes or
              redeploys.

              Everything here is staged locally in component state. NOTHING
              is written to the database until "Publish" succeeds — that
              request is handled transactionally on the backend, so a
              failed publish leaves the live homepage completely untouched.

              The live preview renders the actual <HeroSlider /> component
              used on the homepage — not a thumbnail or mockup — so what
              you see here is exactly what visitors will see.
Company : Vaahan International
Copyright : (c) 2026 Vaahan International. All rights reserved.
================================================================================
*/

import { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import HeroSlider from '../HeroSlider'

// ========================================
// Constants
// ========================================
const DESKTOP_TARGET = { width: 1920, height: 1080 } // ~16:9
const MOBILE_TARGET = { width: 1080, height: 1350 } // ~4:5
// Hero images render with object-contain (letterboxed, never cropped), so
// they don't need to be pixel-exact — just close enough in shape and
// resolution to look sharp. Accept anywhere from 60% to 300% of the target
// size, as long as the aspect ratio is within ~12% of the target shape.
const MIN_SCALE = 0.6
const MAX_SCALE = 3
const ASPECT_RATIO_TOLERANCE = 0.12
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_FILE_SIZE = 6 * 1024 * 1024 // 6MB — images are stored as base64, same convention the rest of the app already uses for article images (just a higher ceiling since Hero assets are required to be much larger, and PNG exports from AI image tools tend to run large).

const emptyBanner = (displayOrder) => ({
  _id: null,
  _isNew: true,
  _delete: false,
  title: '',
  desktopImage: '',
  mobileImage: '',
  buttonText: '',
  buttonLink: '',
  displayOrder,
  isActive: true,
})

// Read a file as a base64 data URL, validating type/size along the way.
const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      reject(new Error('Invalid image format. Only PNG, JPEG, JPG, and WEBP are allowed.'))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please upload a smaller image.`))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file. Please try again.'))
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })

// Confirm the image's actual pixel dimensions are close enough to the
// target — within MIN_SCALE–MAX_SCALE of the target size, and within
// ASPECT_RATIO_TOLERANCE of the target shape. Since Hero images render
// with object-contain (never cropped), what matters is "close enough to
// look sharp and not badly letterboxed," not an exact pixel match.
const validateDimensions = (dataUrl, target, label) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight

      const minW = Math.round(target.width * MIN_SCALE)
      const maxW = Math.round(target.width * MAX_SCALE)
      const minH = Math.round(target.height * MIN_SCALE)
      const maxH = Math.round(target.height * MAX_SCALE)

      if (w < minW || w > maxW || h < minH || h > maxH) {
        const tooSmall = w < minW || h < minH
        reject(
          new Error(
            `Image is too ${tooSmall ? 'small' : 'large'} for ${label}. Accepted range: ${minW}–${maxW}×${minH}–${maxH}px (recommended ~${target.width}×${target.height}). Received ${w}×${h}.`
          )
        )
        return
      }

      const targetAspect = target.width / target.height
      const actualAspect = w / h
      const aspectDiff = Math.abs(actualAspect - targetAspect) / targetAspect

      if (aspectDiff > ASPECT_RATIO_TOLERANCE) {
        reject(
          new Error(
            `Image shape doesn't match ${label}. It needs to be roughly a ${target.width}:${target.height} shape. Received ${w}×${h}, which is too ${actualAspect > targetAspect ? 'wide' : 'tall'}.`
          )
        )
        return
      }

      resolve()
    }
    img.onerror = () => reject(new Error('Could not read that image. Please try a different file.'))
    img.src = dataUrl
  })

const HeroBannerManager = ({ token }) => {
  const [savedBanners, setSavedBanners] = useState([]) // last-published state from the DB, for the diff view
  const [draftBanners, setDraftBanners] = useState([]) // what admin is currently editing (nothing saved yet)
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [uploadErrors, setUploadErrors] = useState({}) // { [draftIndex-slot]: errorMessage }
  const [previewViewport, setPreviewViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'

  const loadBanners = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.getAllHeroBannersAdmin(token)
      if (result.success) {
        setSavedBanners(result.banners)
        setDraftBanners(result.banners.map((b) => ({ ...b, _isNew: false, _delete: false })))
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to load hero banners.' })
      }
    } catch (error) {
      console.error('Error loading hero banners:', error)
      setMessage({ type: 'error', text: 'Failed to load hero banners.' })
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  // ========================================
  // Draft editing helpers — everything below only touches local state
  // ========================================
  const updateDraft = (index, patch) => {
    setDraftBanners((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)))
  }

  const handleAddBanner = () => {
    const nextOrder = draftBanners.filter((b) => !b._delete).length
    setDraftBanners((prev) => [...prev, emptyBanner(nextOrder)])
  }

  const handleRemoveBanner = (index) => {
    const banner = draftBanners[index]
    if (banner._isNew) {
      // Never published — just drop it, nothing to stage.
      setDraftBanners((prev) => prev.filter((_, i) => i !== index))
    } else {
      // Existing banner: mark for removal, but keep it around (and keep the
      // homepage showing it) until Publish actually goes through.
      updateDraft(index, { _delete: true })
    }
  }

  const handleRestoreBanner = (index) => {
    updateDraft(index, { _delete: false })
  }

  const handleMoveBanner = (index, direction) => {
    setDraftBanners((prev) => {
      const visible = prev.map((b, i) => ({ b, i })).filter(({ b }) => !b._delete)
      const pos = visible.findIndex(({ i }) => i === index)
      const swapPos = pos + direction
      if (swapPos < 0 || swapPos >= visible.length) return prev

      const next = [...prev]
      const a = visible[pos].i
      const c = visible[swapPos].i
      const orderA = next[a].displayOrder
      next[a] = { ...next[a], displayOrder: next[c].displayOrder }
      next[c] = { ...next[c], displayOrder: orderA }
      return next
    })
  }

  const handleImageReplace = async (index, slot, file) => {
    const key = `${index}-${slot}`
    setUploadErrors((prev) => ({ ...prev, [key]: '' }))
    if (!file) return

    try {
      const dataUrl = await readFileAsDataUrl(file)
      const required = slot === 'desktopImage' ? DESKTOP_TARGET : MOBILE_TARGET
      const label = slot === 'desktopImage' ? 'Desktop' : 'Mobile'
      await validateDimensions(dataUrl, required, label)
      // Staged only — nothing is uploaded or saved until Publish.
      updateDraft(index, { [slot]: dataUrl })
    } catch (error) {
      setUploadErrors((prev) => ({ ...prev, [key]: error.message }))
    }
  }

  // ========================================
  // Pending changes — anything different from the last-published state
  // ========================================
  const getSavedFor = (id) => savedBanners.find((b) => b._id === id)

  const pendingChanges = draftBanners
    .map((draft, index) => {
      const saved = draft._id ? getSavedFor(draft._id) : null
      if (draft._isNew) return { index, draft, saved: null, type: 'new' }
      if (draft._delete) return { index, draft, saved, type: 'remove' }
      if (!saved) return null
      const changed =
        draft.desktopImage !== saved.desktopImage ||
        draft.mobileImage !== saved.mobileImage ||
        draft.buttonText !== saved.buttonText ||
        draft.buttonLink !== saved.buttonLink ||
        draft.title !== saved.title ||
        draft.displayOrder !== saved.displayOrder ||
        draft.isActive !== saved.isActive
      return changed ? { index, draft, saved, type: 'update' } : null
    })
    .filter(Boolean)

  const hasPendingChanges = pendingChanges.length > 0

  // Banners actually shown in the live preview: visible order, excludes
  // anything marked for removal, only includes ones with both images set.
  const previewBanners = draftBanners
    .filter((b) => !b._delete && b.desktopImage && b.mobileImage)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  // ========================================
  // Publish
  // ========================================
  const handlePublish = async () => {
    setMessage({ type: '', text: '' })

    // Client-side validation mirrors the backend's, so the admin gets
    // immediate, specific feedback instead of waiting on a round trip.
    const visibleBanners = draftBanners.filter((b) => !b._delete)
    for (let i = 0; i < visibleBanners.length; i += 1) {
      const b = visibleBanners[i]
      if (!b.desktopImage || !b.mobileImage) {
        setMessage({ type: 'error', text: `Banner ${i + 1} requires both Desktop and Mobile images before publishing.` })
        return
      }
      if (!b.buttonText?.trim() || !b.buttonLink?.trim()) {
        setMessage({ type: 'error', text: `Banner ${i + 1} requires button text and a link before publishing.` })
        return
      }
    }

    setIsPublishing(true)
    try {
      const payload = draftBanners.map((b) => ({
        _id: b._id || undefined,
        _delete: b._delete || undefined,
        title: b.title,
        desktopImage: b.desktopImage,
        mobileImage: b.mobileImage,
        buttonText: b.buttonText,
        buttonLink: b.buttonLink,
        displayOrder: b.displayOrder,
        isActive: b.isActive,
      }))

      const result = await api.publishHeroBanners(token, payload)
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Hero banners published successfully!' })
        setSavedBanners(result.banners)
        setDraftBanners(result.banners.map((b) => ({ ...b, _isNew: false, _delete: false })))
        setUploadErrors({})
      } else {
        // Nothing was saved — the transaction rolled back on the backend.
        setMessage({ type: 'error', text: result.message || 'Failed to publish. No changes were saved.' })
      }
    } catch (error) {
      console.error('Error publishing hero banners:', error)
      setMessage({ type: 'error', text: 'Network error while publishing. No changes were saved.' })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDiscardChanges = () => {
    setDraftBanners(savedBanners.map((b) => ({ ...b, _isNew: false, _delete: false })))
    setUploadErrors({})
    setMessage({ type: '', text: '' })
  }

  // ========================================
  // Render
  // ========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-3 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const visibleDrafts = draftBanners
    .map((b, index) => ({ b, index }))
    .sort((a, c) => a.b.displayOrder - c.b.displayOrder)

  const previewWidths = { desktop: 1040, tablet: 480, mobile: 320 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Hero Banner Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Changes here don't go live until you publish. Nothing on the homepage changes until then.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddBanner}
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
        >
          + Add Banner
        </button>
      </div>

      {message.text && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-900/40 text-green-300 border border-green-700'
              : 'bg-red-900/40 text-red-300 border border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ==================== Banner Cards ==================== */}
      <div className="space-y-4">
        {visibleDrafts.length === 0 && (
          <p className="text-slate-400 text-sm py-8 text-center">No hero banners yet — click "+ Add Banner" to create one.</p>
        )}

        {visibleDrafts.map(({ b: banner, index }) => (
          <div
            key={banner._id || `new-${index}`}
            className={`rounded-xl border p-4 sm:p-5 transition-colors ${
              banner._delete ? 'bg-red-950/20 border-red-800' : 'bg-slate-800 border-slate-700'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-200 text-xs font-bold">
                  Banner {index + 1}
                </span>
                <span className="text-xs text-slate-400">Order: {banner.displayOrder}</span>
                {banner._isNew && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 text-[10px] font-semibold uppercase tracking-wide">
                    New
                  </span>
                )}
                {banner._delete && (
                  <span className="px-2 py-0.5 rounded-full bg-red-900/50 text-red-300 text-[10px] font-semibold uppercase tracking-wide">
                    Pending Removal
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {!banner._delete && (
                  <>
                    <button type="button" onClick={() => handleMoveBanner(index, -1)} className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white text-xs" aria-label="Move up" title="Move up">↑</button>
                    <button type="button" onClick={() => handleMoveBanner(index, 1)} className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white text-xs" aria-label="Move down" title="Move down">↓</button>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 ml-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={banner.isActive !== false}
                        onChange={(e) => updateDraft(index, { isActive: e.target.checked })}
                        className="accent-yellow-500"
                      />
                      Active
                    </label>
                  </>
                )}
                {banner._delete ? (
                  <button type="button" onClick={() => handleRestoreBanner(index)} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold">
                    Undo Remove
                  </button>
                ) : (
                  <button type="button" onClick={() => handleRemoveBanner(index)} className="px-3 py-1 rounded bg-red-900/60 hover:bg-red-900 text-red-200 text-xs font-semibold">
                    Remove
                  </button>
                )}
              </div>
            </div>

            {!banner._delete && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Desktop image */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                    Desktop Image (~1920×1080, 16:9)
                  </p>
                  {banner.desktopImage ? (
                    <img src={banner.desktopImage} alt="Desktop preview" className="w-full h-28 object-cover rounded-lg border border-slate-600 mb-2" />
                  ) : (
                    <div className="w-full h-28 rounded-lg border border-dashed border-slate-600 mb-2 flex items-center justify-center text-slate-500 text-xs">
                      No image yet
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleImageReplace(index, 'desktopImage', e.target.files[0])}
                    className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-700 file:text-white file:text-xs file:font-semibold hover:file:bg-slate-600 file:cursor-pointer w-full"
                  />
                  {uploadErrors[`${index}-desktopImage`] && (
                    <p className="text-red-400 text-xs mt-1">{uploadErrors[`${index}-desktopImage`]}</p>
                  )}
                </div>

                {/* Mobile image */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                    Mobile Image (~1080×1350, 4:5)
                  </p>
                  {banner.mobileImage ? (
                    <img src={banner.mobileImage} alt="Mobile preview" className="w-full h-28 object-cover rounded-lg border border-slate-600 mb-2" />
                  ) : (
                    <div className="w-full h-28 rounded-lg border border-dashed border-slate-600 mb-2 flex items-center justify-center text-slate-500 text-xs">
                      No image yet
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleImageReplace(index, 'mobileImage', e.target.files[0])}
                    className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-700 file:text-white file:text-xs file:font-semibold hover:file:bg-slate-600 file:cursor-pointer w-full"
                  />
                  {uploadErrors[`${index}-mobileImage`] && (
                    <p className="text-red-400 text-xs mt-1">{uploadErrors[`${index}-mobileImage`]}</p>
                  )}
                </div>

                {/* Title / button text / link */}
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold block">Title (alt text, internal)</label>
                  <input
                    type="text"
                    value={banner.title || ''}
                    onChange={(e) => updateDraft(index, { title: e.target.value })}
                    placeholder="e.g. Summer Sale Hero"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold block">Button Text</label>
                  <input
                    type="text"
                    value={banner.buttonText || ''}
                    onChange={(e) => updateDraft(index, { buttonText: e.target.value })}
                    placeholder="Explore Articles →"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold block">Button Link</label>
                  <input
                    type="text"
                    value={banner.buttonLink || ''}
                    onChange={(e) => updateDraft(index, { buttonLink: e.target.value })}
                    placeholder="/articles"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ==================== Pending Changes Summary ==================== */}
      {hasPendingChanges && (
        <div className="rounded-xl border border-yellow-700/50 bg-yellow-900/10 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-yellow-400 mb-3">Pending Changes ({pendingChanges.length})</h3>
          <div className="space-y-4">
            {pendingChanges.map(({ index, draft, saved, type }) => (
              <div key={index} className="border-t border-yellow-800/30 pt-3 first:border-0 first:pt-0">
                <p className="text-xs font-semibold text-slate-200 mb-2">
                  Banner {index + 1}
                  {type === 'new' && <span className="ml-2 text-blue-300">— will be added</span>}
                  {type === 'remove' && <span className="ml-2 text-red-300">— will be removed</span>}
                  {type === 'update' && <span className="ml-2 text-slate-400">— will be updated</span>}
                </p>
                {type !== 'remove' && (
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Desktop:</span>
                      {saved?.desktopImage && <img src={saved.desktopImage} alt="old" className="w-16 h-9 object-cover rounded border border-slate-600" />}
                      <span>→</span>
                      {draft.desktopImage ? (
                        <img src={draft.desktopImage} alt="new" className="w-16 h-9 object-cover rounded border border-yellow-500" />
                      ) : (
                        <span className="text-red-400">missing</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Mobile:</span>
                      {saved?.mobileImage && <img src={saved.mobileImage} alt="old" className="w-9 h-11 object-cover rounded border border-slate-600" />}
                      <span>→</span>
                      {draft.mobileImage ? (
                        <img src={draft.mobileImage} alt="new" className="w-9 h-11 object-cover rounded border border-yellow-500" />
                      ) : (
                        <span className="text-red-400">missing</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== Live Preview ==================== */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-white">Live Preview</h3>
          <div className="flex gap-1.5">
            {['desktop', 'tablet', 'mobile'].map((viewport) => (
              <button
                key={viewport}
                type="button"
                onClick={() => setPreviewViewport(viewport)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  previewViewport === viewport ? 'bg-yellow-500 text-gray-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {viewport}
              </button>
            ))}
          </div>
        </div>

        {previewBanners.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">
            No banners are ready to preview yet — every banner needs both a Desktop and Mobile image.
          </p>
        ) : (
          <div className="w-full overflow-x-auto flex justify-center py-2">
            <div
              className="relative bg-black rounded-lg overflow-hidden shrink-0"
              style={{ width: previewWidths[previewViewport] }}
            >
              {/* This renders the ACTUAL homepage HeroSlider component —
                  not a mockup — so this is exactly how it will look live. */}
              <HeroSlider
                banners={previewBanners}
                forceViewport={previewViewport === 'desktop' ? undefined : 'mobile'}
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================== Publish Bar ==================== */}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {hasPendingChanges && (
          <button
            type="button"
            onClick={handleDiscardChanges}
            disabled={isPublishing}
            className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Discard Changes
          </button>
        )}
        <button
          type="button"
          onClick={handlePublish}
          disabled={!hasPendingChanges || isPublishing}
          className="px-6 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publishing…' : `Publish${hasPendingChanges ? ` (${pendingChanges.length})` : ''}`}
        </button>
      </div>
    </div>
  )
}

export default HeroBannerManager