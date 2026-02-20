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
    try {
      let content = "";
      try {
        const response = await $axios.get(subUrl, { timeout: 10000 });
        content = response.data;
      } catch (e) {
        console.log("Direct fetch failed, trying backend proxy...");
      }

      if (!content || (!content.includes('proxies:') && !content.includes('- name:'))) {
        const baseUrl = import.meta.env.DEV ? '/api' : CONSTANTS.DEFAULT_BACKEND.replace(/\/sub\?$/, '');
        // REMOVED &list=true to ensure groups are included
        const backendUrl = `${baseUrl}/sub?target=clash&url=${encodeURIComponent(subUrl)}&insert=false`;

        console.log(`Fallback to proxy: ${backendUrl}`);
        const response = await $axios.get(backendUrl, { timeout: 20000 });
        content = response.data;
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
        // Be less aggressive with group names, as the user wants to rename them
        if (name && !blacklist.some(item => name === item) && !groupNames.includes(name)) {
          groupNames.push(name);
        }
      }

      return {
        nodes: proxyNames,
        groups: groupNames
      };
    } catch (error) {
      console.error("Failed to scan nodes:", error);
      throw new Error("Could not fetch or parse subscription. Please check if the link is valid.");
    }
  }
}
