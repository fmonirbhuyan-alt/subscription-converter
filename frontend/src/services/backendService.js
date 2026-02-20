import { CONSTANTS } from '@/config/constants';
import { formatVersion } from '@/utils/formatters';

/**
 * 后端版本检查服务
 */
export class BackendService {
  /**
   * 获取后端版本信息
   * @param {Object} $axios - Axios实例
   * @returns {Promise<string>} 版本信息
   */
  static async getBackendVersion($axios) {
    // 提取版本 API 路径
    const versionApiUrl = CONSTANTS.DEFAULT_BACKEND.substring(0, CONSTANTS.DEFAULT_BACKEND.length - 5) + "/version";

    try {
      const response = await $axios.get(versionApiUrl);
      // 清理版本信息格式
      let version = formatVersion(response.data);
      return version;
    } catch (error) {
      // 静默处理，不显示错误信息，避免干扰用户体验
      return "";
    }
  }

  /**
   * Scan nodes from subscription URL
   * @param {Object} $axios - Axios instance
   * @param {string} subUrl - Subscription URL
   * @returns {Promise<Array<string>>} List of node names
   */
  static async getNodes($axios, subUrl) {
    const logs = [];
    const addLog = (msg) => {
      console.log(`[Scan] ${msg}`);
      logs.push(msg);
    };

    try {
      let content = "";

      // 1. Try direct fetch (ONLY in development mode)
      if (import.meta.env.DEV) {
        addLog("Attempting Direct Fetch (DEV ONLY)...");
        try {
          const response = await $axios.get(subUrl, { timeout: 10000 });
          content = response.data;
          if (content) addLog("Direct Fetch success.");
        } catch (e) {
          addLog(`Direct Fetch failed: ${e.message}`);
        }
      }

      // 2. Try primary backend proxy
      if (!this.isValidContent(content)) {
        const baseUrl = import.meta.env.DEV ? '/api' : CONSTANTS.DEFAULT_BACKEND.replace(/\/sub\?$/, '');
        const backendUrl = `${baseUrl}/sub?target=clash&url=${encodeURIComponent(subUrl)}&insert=false&ua=clash`;

        addLog(`Attempting Backend Proxy: ${baseUrl}`);
        try {
          const response = await $axios.get(backendUrl, { timeout: 15000 });
          content = response.data;
          if (content) addLog("Backend Proxy success.");
        } catch (e) {
          addLog(`Backend Proxy failed: ${e.message}`);
        }
      }

      // 3. Fallback to a public CORS Proxy (allorigins)
      if (!this.isValidContent(content)) {
        const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(subUrl)}`;
        addLog("Attempting Public CORS Proxy (allorigins)...");

        try {
          const resp = await fetch(corsProxyUrl);
          if (resp.ok) {
            content = await resp.text();
            addLog("Public CORS Proxy success.");
          } else {
            addLog(`Public CORS Proxy error status: ${resp.status}`);
          }
        } catch (e) {
          addLog(`Public CORS Proxy failed: ${e.message}`);
        }
      }

      // FINAL VALIDATION & DECODING
      if (!content || typeof content !== 'string') {
        throw new Error(`Failed to fetch content. Attempts: ${logs.join(' -> ')}`);
      }

      // Handle Base64 encoded content
      if (!content.includes('proxies:') && !content.includes('- name:')) {
        try {
          const trimmed = content.trim().replace(/\s/g, '');
          if (trimmed.length > 50 && /^[A-Za-z0-9+/=]+$/.test(trimmed)) {
            const decoded = atob(trimmed);
            if (decoded && (decoded.includes('proxies:') || decoded.includes('- name:') || decoded.includes('://'))) {
              addLog("Detected and decoded Base64 content.");
              content = decoded;
            }
          }
        } catch (e) {
          addLog("Content is not Base64 or decoding failed.");
        }
      }

      if (!this.isValidContent(content)) {
        const snippet = content.substring(0, 100).replace(/\n/g, ' ');
        throw new Error(`Invalid subscription format. Content snippet: "${snippet}..."`);
      }

      // Parsing logic to separate proxies and groups
      const proxyNames = [];
      const groupNames = [];

      const blacklist = [
        "DIRECT", "REJECT", "Selector", "URLTest", "Fallback", "LoadBalance",
        "距离下次重置剩余", "重置", "剩余", "到期", "流量", "GB", "MB", "条线路", "过滤掉",
        "www.bing.com", "ipv6免流", "请自行修改host"
      ];

      // Simple block detection
      const proxySection = content.split('proxy-groups:')[0];
      const groupsSection = content.split('proxy-groups:')[1] || "";

      const regex = /name:\s*['"]?([^'"},\n\r]+)['"]?/g;
      let match;

      // Extract proxies
      while ((match = regex.exec(proxySection)) !== null) {
        const name = match[1].trim();
        if (name && !blacklist.some(item => name.includes(item)) && !proxyNames.includes(name)) {
          proxyNames.push(name);
        }
      }

      // Extract groups
      const groupRegex = /name:\s*['"]?([^'"},\n\r]+)['"]?/g;
      while ((match = groupRegex.exec(groupsSection)) !== null) {
        const name = match[1].trim();
        if (name && !blacklist.some(item => name === item) && !groupNames.includes(name)) {
          groupNames.push(name);
        }
      }

      return {
        nodes: proxyNames,
        groups: groupNames
      };
    } catch (error) {
      console.error("[Scan Service Error]", error);
      throw error;
    }
  }

  /**
   * Simple validation for YAML/Clash or SS/SSR/V2Ray list
   */
  static isValidContent(content) {
    if (!content || typeof content !== 'string') return false;
    const c = content.trim();
    return c.includes('proxies:') ||
      c.includes('- name:') ||
      c.includes('ssr://') ||
      c.includes('vmess://') ||
      c.includes('trojan://');
  }
}
