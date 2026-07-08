// src/utils/avatar.js
/*
================================================================================
File Name : avatar.js
Description : Deterministic "random" avatars — same seed (user id / username)
              always produces the same image, so every member gets a unique,
              consistent-looking avatar without us needing an upload flow or
              any storage. Backed by DiceBear's free public API.
================================================================================
*/

const AVATAR_STYLE = 'avataaars'

// seed can be a user id, username, or email — anything stable per user.
// Falls back to 'guest' so the URL is never malformed if seed is missing.
export const getAvatarUrl = (seed) => {
  const safeSeed = encodeURIComponent(seed || 'guest')
  return `https://api.dicebear.com/7.x/${AVATAR_STYLE}/svg?seed=${safeSeed}&backgroundType=gradientLinear`
}