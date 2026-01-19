// URLS
export const linkRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
export const anchorIdRegex = (id) => new RegExp(`id=["']${id}["']`, 'i');
export const externalUrlRegex = /^https?:\/\//;
export const externalUrlRegexStrict = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
export const localUrlRegex =
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i;
export const localPathCheck = /^https?:\/\/(localhost|127\.0\.0\.1)/i;
