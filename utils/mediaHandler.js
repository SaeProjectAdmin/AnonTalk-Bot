// Media handling utilities for AnonTalk Bot

/**
 * Check if a message contains any supported media
 * @param {Object} message - Telegram message object
 * @returns {boolean} - True if message contains media
 */
const isMediaMessage = (message) => {
    return !!(message.photo || message.video || message.animation || message.document || 
              message.audio || message.voice || message.video_note || message.sticker ||
              message.contact || message.location || message.venue);
};

/**
 * Get the media type from a message
 * @param {Object} message - Telegram message object
 * @returns {string} - Media type description
 */
const getMediaType = (message) => {
    if (message.photo) return 'Photo';
    if (message.video) return 'Video';
    if (message.animation) return 'Animation';
    if (message.document) return 'Document';
    if (message.audio) return 'Audio';
    if (message.voice) return 'Voice';
    if (message.video_note) return 'Video Note';
    if (message.sticker) return 'Sticker';
    if (message.contact) return 'Contact';
    if (message.location) return 'Location';
    if (message.venue) return 'Venue';
    return 'Unknown';
};

/**
 * Validate media file size (Telegram has limits)
 * @param {Object} message - Telegram message object
 * @param {number} customLimit - Custom size limit in bytes (optional)
 * @returns {boolean} - True if size is valid
 */
const validateMediaSize = (message, customLimit = null) => {
    const defaultLimits = {
        photo: 10 * 1024 * 1024,      // 10MB
        video: 50 * 1024 * 1024,      // 50MB (regular), 200MB (VIP)
        animation: 50 * 1024 * 1024,  // 50MB
        document: 2000 * 1024 * 1024, // 2GB
        audio: 50 * 1024 * 1024,      // 50MB
        voice: 50 * 1024 * 1024,      // 50MB
        video_note: 50 * 1024 * 1024  // 50MB
    };

    let fileSize = 0;
    let mediaType = '';

    if (message.photo) {
        fileSize = message.photo[message.photo.length - 1].file_size || 0;
        mediaType = 'photo';
    } else if (message.video) {
        fileSize = message.video.file_size || 0;
        mediaType = 'video';
    } else if (message.animation) {
        fileSize = message.animation.file_size || 0;
        mediaType = 'animation';
    } else if (message.document) {
        fileSize = message.document.file_size || 0;
        mediaType = 'document';
    } else if (message.audio) {
        fileSize = message.audio.file_size || 0;
        mediaType = 'audio';
    } else if (message.voice) {
        fileSize = message.voice.file_size || 0;
        mediaType = 'voice';
    } else if (message.video_note) {
        fileSize = message.video_note.file_size || 0;
        mediaType = 'video_note';
    }

    if (fileSize === 0) return true; // No size info, assume valid

    const limit = customLimit || defaultLimits[mediaType] || 50 * 1024 * 1024;
    return fileSize <= limit;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get media caption with avatar prefix
 * @param {Object} message - Telegram message object
 * @param {string} userAvatar - User's avatar
 * @returns {string} - Formatted caption
 */
const getMediaCaption = (message, userAvatar) => {
    const originalCaption = message.caption || '';
    return originalCaption ? `${userAvatar}: ${originalCaption}` : `${userAvatar}`;
};

module.exports = {
    isMediaMessage,
    getMediaType,
    validateMediaSize,
    formatFileSize,
    getMediaCaption
}; 