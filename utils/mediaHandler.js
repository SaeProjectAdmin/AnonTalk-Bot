const { isUserVIPActive } = require('../db');

const checkMediaAccess = async (userId, mediaType) => {
    const isVIP = await isUserVIPActive(userId);
    
    const mediaLimits = {
        video: {
            maxSize: isVIP ? 50 * 1024 * 1024 : 0, // 50MB for VIP, 0 for non-VIP
            allowed: isVIP
        },
        photo: {
            maxSize: isVIP ? 10 * 1024 * 1024 : 5 * 1024 * 1024, // 10MB for VIP, 5MB for non-VIP
            allowed: true
        },
        document: {
            maxSize: isVIP ? 100 * 1024 * 1024 : 20 * 1024 * 1024, // 100MB for VIP, 20MB for non-VIP
            allowed: true
        }
    };
    
    return mediaLimits[mediaType] || { maxSize: 0, allowed: false };
};

const validateMediaSize = (fileSize, maxSize) => {
    return fileSize <= maxSize;
};

const getMediaErrorMessage = (mediaType, isVIP) => {
    const messages = {
        video: isVIP ? 
            '❌ Video size too large. Maximum 50MB allowed for VIP users.' :
            '❌ Videos are only available for VIP users. Use /donate to upgrade.',
        photo: '❌ Photo size too large. Maximum 5MB for regular users, 10MB for VIP.',
        document: '❌ Document size too large. Maximum 20MB for regular users, 100MB for VIP.'
    };
    
    return messages[mediaType] || '❌ This media type is not supported.';
};

module.exports = {
    checkMediaAccess,
    validateMediaSize,
    getMediaErrorMessage
}; 