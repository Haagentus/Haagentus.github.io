/**
 * CDN配置文件
 * 用于配置图片资源的CDN加速
 */
const CDN_CONFIG = {
  // 是否启用CDN
  enabled: true,
  
  // CDN基础地址
  baseUrl: 'https://cdn.jsdelivr.net/gh/Haagentus/Haagentus.github.io@main',
  
  // 是否在CDN失败时回退到本地
  fallbackToLocal: true,
  
  // 版本号（用于缓存控制）
  version: 'v1.0.0'
};

/**
 * 获取图片URL
 * @param {string} path - 图片相对路径（如 'imgs/001.webp'）
 * @returns {string} 完整的图片URL
 */
function getImageUrl(path) {
  if (CDN_CONFIG.enabled && path) {
    // 移除路径开头的斜杠（如果有）
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${CDN_CONFIG.baseUrl}/${cleanPath}`;
  }
  return path;
}

/**
 * 获取带版本号的图片URL（用于缓存刷新）
 * @param {string} path - 图片相对路径
 * @param {string} version - 版本号（可选）
 * @returns {string} 带版本号的完整URL
 */
function getImageUrlWithVersion(path, version) {
  if (CDN_CONFIG.enabled && path) {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const ver = version || CDN_CONFIG.version;
    return `${CDN_CONFIG.baseUrl}@${ver}/${cleanPath}`;
  }
  return path;
}

// 导出配置（如果支持模块系统）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CDN_CONFIG, getImageUrl, getImageUrlWithVersion };
}