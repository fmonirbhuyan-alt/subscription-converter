<template>
  <div>
    <el-row style="margin-top: 10px">
      <el-col>
        <el-card>
          <div slot="header">
            Digital Freedom Subscription Converter
            <svg-icon icon-class="github" style="margin-left: 20px" @click="goToProject" />

            <div style="display: inline-block; position:absolute; right: 20px">{{ backendVersion }}</div>
          </div>
          <el-container>
            <el-form :model="form" label-width="140px" label-position="left" style="width: 100%">
              <el-form-item label="Mode Setting:">
                <el-radio v-model="advanced" label="1">Basic Mode</el-radio>
                <el-radio v-model="advanced" label="2">Advanced Mode</el-radio>
              </el-form-item>
              <el-form-item label="Sub Link:">
                <el-input v-model="form.sourceSubUrl" type="textarea" rows="3"
                  placeholder="Supports subscriptions or ss/ssr/vmess links. Multiple links per line or separated by |" @blur="saveSubUrl" />
              </el-form-item>

              <el-form-item label="Node Scan:">
                <el-button type="primary" icon="el-icon-search" @click="scanNodes" :loading="scanLoading">Scan Now</el-button>
              </el-form-item>

              <div v-if="form.scannedNodes.length > 0 || form.scannedGroups.length > 0" style="margin-bottom: 20px;">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-card class="box-card" shadow="never" style="height: 400px; overflow-y: auto;">
                      <div slot="header" class="clearfix">
                        <span>Scan Results</span>
                      </div>
                      
                      <div v-if="form.scannedGroups.length > 0">
                        <div style="font-size: 14px; font-weight: bold; padding: 5px; color: #67C23A; border-bottom: 1px solid #eee;">Detected Groups</div>
                        <div v-for="(group, index) in form.scannedGroups" :key="'g'+index" class="text item" style="margin-bottom: 5px; display: flex; align-items: center;">
                          <el-button type="text" icon="el-icon-plus" @click="addToGlobalFind(group)" style="padding: 0; color: #67C23A;" title="Add to Global Find"></el-button>
                          <span style="font-size: 12px; margin-left: 5px;">{{ group }}</span>
                        </div>
                      </div>

                      <div v-if="form.scannedNodes.length > 0" style="margin-top: 15px;">
                        <div style="font-size: 14px; font-weight: bold; padding: 5px; color: #409EFF; border-bottom: 1px solid #eee;">Server Nodes ({{ form.scannedNodes.length }})</div>
                        <div v-for="(node, index) in form.scannedNodes" :key="'n'+index" class="text item" style="margin-bottom: 5px;">
                          <el-button type="text" icon="el-icon-plus" @click="addToFind(node)" style="padding: 0; margin-right: 5px;" title="Add to Proxy Rename"></el-button>
                          <el-button type="text" icon="el-icon-minus" @click="addToExclude(node)" style="padding: 0; margin-right: 5px; color: #F56C6C;" title="Exclude Node"></el-button>
                          <span style="font-size: 12px;">{{ node }}</span>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 13px; color: #606266;">Node Rename (Proxies)</div>
                    <el-input type="textarea" :rows="8" v-model="form.findValue" placeholder="Names (e.g. 美国1)"></el-input>
                    <el-input v-model="form.replaceValue" placeholder="Replace with..." style="margin-top: 5px;"></el-input>
                  </el-col>
                  <el-col :span="8">
                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 13px; color: #67C23A;">Global Rename (Groups/Text)</div>
                    <el-input type="textarea" :rows="8" v-model="form.globalFindValue" placeholder="Groups (e.g. 自动选择)"></el-input>
                    <el-input v-model="form.globalReplaceValue" placeholder="Replace with..." style="margin-top: 5px;"></el-input>
                  </el-col>
                </el-row>
              </div>
              <el-form-item label="Client:">
                <el-select v-model="form.clientType" style="width: 100%">
                  <el-option v-for="(v, k) in options.clientTypes" :key="k" :label="k" :value="v"></el-option>
                </el-select>
              </el-form-item>

              <div v-if="advanced === '2'">
                <el-form-item label="Backend:">
                  <el-autocomplete style="width: 100%" v-model="form.customBackend" :fetch-suggestions="backendSearch"
                    placeholder="Deploy your own backend service. Example: http://127.0.0.1:25500/sub?">
                    <el-button slot="append" @click="gotoGayhub" icon="el-icon-link">Repository</el-button>
                  </el-autocomplete>
                </el-form-item>
                <el-form-item label="Remote Config:">
                  <el-select v-model="form.remoteConfig" allow-create filterable placeholder="Select config" style="width: 100%">
                    <el-option-group v-for="group in options.remoteConfig" :key="group.label" :label="group.label">
                      <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                    </el-option-group>
                    <el-button slot="append" @click="gotoRemoteConfig" icon="el-icon-link">Example</el-button>
                  </el-select>
                </el-form-item>
                <el-form-item label="Include:">
                  <el-input v-model="form.includeRemarks" placeholder="Keywords in node name, supports regex" />
                </el-form-item>
                <el-form-item label="Exclude:">
                  <el-input v-model="form.excludeRemarks" placeholder="Keywords NOT in node name, supports regex" />
                </el-form-item>
                <el-form-item label="FileName:">
                  <el-input v-model="form.filename" placeholder="Subscription filename" />
                </el-form-item>

                 <el-form-item v-for="(param, i) in customParams" :key="i">
                  <el-input slot="label" v-model="param.name" placeholder="Param Name">
                    <div slot="suffix" style="width: 10px;">:</div>
                  </el-input>
                  <el-input v-model="param.value" placeholder="Param Value">
                      <el-button slot="suffix" type="text" icon="el-icon-delete" style="margin-right: 5px" @click="customParams.splice(i, 1)"/>
                  </el-input>
                </el-form-item>

                <el-form-item label-width="0px">
                  <el-row type="flex">
                    <el-col>
                      <el-checkbox v-model="form.nodeList" label="Output As Node List" border></el-checkbox>
                    </el-col>
                    <el-popover placement="bottom" v-model="form.extraset">
                      <el-row>
                        <el-checkbox v-model="form.emoji" label="Emoji"></el-checkbox>
                      </el-row>
                       <el-row>
                        <el-checkbox v-model="form.scv" label="Skip Cert Verify"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.udp" @change="needUdp = true" label="Enable UDP"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.appendType" label="Node Type"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.sort" label="Sort Nodes"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.fdn" label="Filter Nodes"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.fpg" label="Filter Groups"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.expand" label="Rule Expand"></el-checkbox>
                      </el-row>
                      <el-button slot="reference">More Options</el-button>
                    </el-popover>
                    <el-popover placement="bottom" style="margin-left: 10px">
                      <el-row>
                        <el-checkbox v-model="form.tpl.surge.doh" label="Surge.DoH"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.tpl.clash.doh" label="Clash.DoH"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.insert" label="NetEase Music"></el-checkbox>
                      </el-row>
                      <el-button slot="reference">Custom Features</el-button>
                    </el-popover>
                    <el-popover placement="top-end" title="Add Custom Backend Parameter" trigger="hover">
                      <el-link type="primary" :href="subDocAdvanced" target="_blank" icon="el-icon-info">Docs</el-link>
                      <el-button slot="reference" @click="addCustomParam" style="margin-left: 10px">
                        <i class="el-icon-plus"></i>
                      </el-button>
                    </el-popover>
                  </el-row>
                </el-form-item>
              </div>

              <div style="margin-top: 50px"></div>

              <el-divider content-position="center">
                <i class="el-icon-magic-stick"></i>
              </el-divider>

               <el-form-item label="Custom Sub:">
                <el-input class="copy-content" disabled v-model="customSubUrl">
                  <el-button slot="append" v-clipboard:copy="customSubUrl" v-clipboard:success="onCopy" ref="copy-btn"
                    icon="el-icon-document-copy">Copy</el-button>
                </el-input>
              </el-form-item>
              <el-form-item label="Short Link:">
                <el-input class="copy-content" disabled v-model="curtomShortSubUrl">
                  <el-button slot="append" @click="showQrCode" icon="el-icon-full-screen">QR Code</el-button>
                  <el-button slot="append" v-clipboard:copy="curtomShortSubUrl" v-clipboard:success="onCopy"
                    ref="copy-btn" icon="el-icon-document-copy">Copy</el-button>
                </el-input>
              </el-form-item>

              <!-- 操作按钮组 -->
              <el-form-item label-width="0px" style="margin-top: 40px; text-align: center">
                <el-button
                  :style="buttonStyle"
                  type="danger"
                  @click="makeUrlClick"
                  :disabled="!canGenerateUrl">
                  Generate Link
                </el-button>
                <el-button
                  :style="buttonStyle"
                  type="danger"
                  @click="makeShortUrlClick"
                  :loading="loading"
                  :disabled="!canGenerateShortUrl">
                  Generate Short Link
                </el-button>
              </el-form-item>

              <el-form-item label-width="0px" style="text-align: center">
                <el-button
                  :style="buttonStyle"
                  type="primary"
                  @click="dialogUploadConfigVisible = true"
                  icon="el-icon-upload"
                  :loading="loading">
                  Upload Config
                </el-button>
                <el-button
                  :style="buttonStyle"
                  type="primary"
                  @click="clashInstall"
                  icon="el-icon-connection"
                  :disabled="!canImportClash">
                  Import to Clash
                </el-button>
              </el-form-item>

              <el-form-item label-width="0px" style="text-align: center">
                <el-button
                  :style="{ width: '290px' }"
                  type="primary"
                  @click="dialogLoadConfigVisible = true"
                  icon="el-icon-copy-document"
                  :loading="loading">
                  Parse from URL
                </el-button>
              </el-form-item>
            </el-form>
          </el-container>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置上传对话框 -->
    <ConfigUploadDialog
      :visible="dialogUploadConfigVisible"
      :upload-config="uploadConfig"
      :loading="loading"
      @cancel="handleUploadCancel"
      @confirm="handleConfigUpload"
    />

    <!-- URL解析对话框 -->
    <UrlParseDialog
      :visible="dialogLoadConfigVisible"
      :load-config="loadConfig"
      :loading="loading"
      @cancel="handleLoadCancel"
      @confirm="handleUrlParse"
    />

    <!-- QR Code 对话框 -->
    <el-dialog :visible.sync="dialogQrCodeVisible" width="350px" center>
      <div slot="title" style="text-align: center;">
        <span style="font-size: 18px; font-weight: bold;">Scan QR Code</span>
        <div style="font-size: 14px; color: #409EFF; margin-top: 5px;">Digital Freedom</div>
      </div>
      <div style="text-align: center">
        <img :src="qrCodeUrl" alt="QR Code" style="max-width: 100%; height: auto; border: 1px solid #eee; padding: 10px; border-radius: 8px;" />
        <p style="margin-top: 15px; font-size: 13px; color: #666;">Scan with Shadowrocket or other VPN apps</p>
        
        <div style="margin-top: 15px; color: #F56C6C; font-weight: bold; font-size: 14px;">
           <i class="el-icon-warning"></i> Don't Break The Rules
        </div>
        
        <div style="margin-top: 5px; font-size: 10px; color: #999;">
          * Non-refundable policy applies
        </div>

        <el-button 
          type="primary" 
          size="small" 
          icon="el-icon-download" 
          style="margin-top: 20px; width: 80%;"
          @click="downloadQrCode">
          Download QR Code
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入配置
import { CONSTANTS } from '@/config/constants';
import { CLIENT_TYPES } from '@/config/client-types';
import { REMOTE_CONFIGS } from '@/config/remote-configs';

// 导入Composables
import { useSubscriptionForm, addCustomParam, saveSubUrl as saveSubscriptionUrl } from '@/composables/useSubscriptionForm';
import { useSubscription } from '@/composables/useSubscription';
import { useUrlParser } from '@/composables/useUrlParser';

// 导入工具函数
import { getLocalStorageItem } from '@/utils/storage';

// 导入服务
import { BackendService } from '@/services/backendService';
import { ShortUrlService } from '@/services/shortUrlService';
import { ConfigUploadService } from '@/services/configUploadService';

// 导入组件
import ConfigUploadDialog from '@/components/ConfigUploadDialog.vue';
import UrlParseDialog from '@/components/UrlParseDialog.vue';

export default {
  name: 'Subconverter',
  components: {
    ConfigUploadDialog,
    UrlParseDialog
  },
  data() {
    const subscriptionForm = useSubscriptionForm();

    return {
      // 配置选项
      options: {
        clientTypes: CLIENT_TYPES,
        backendOptions: [{ value: "http://127.0.0.1:25500/sub?" }],
        remoteConfig: REMOTE_CONFIGS
      },

      // 状态
      backendVersion: "",
      loading: false,
      scanLoading: false,
      curtomShortSubUrl: "",
      dialogUploadConfigVisible: false,
      loadConfig: "",
      dialogLoadConfigVisible: false,
      uploadConfig: "",
      subDocAdvanced: CONSTANTS.DOC_ADVANCED,
      dialogQrCodeVisible: false,
      qrCodeUrl: "",

      // 是否为 PC 端
      isPC: true,

      // 合并表单状态
      ...subscriptionForm
    };
  },
  computed: {
    // 按钮统一样式
    buttonStyle() {
      return { width: '140px' };
    },

    canGenerateShortUrl() {
      return this.customSubUrl.length > 0 && !this.loading;
    },

    canGenerateUrl() {
      return this.form.sourceSubUrl.length > 0 && this.form.clientType;
    },

    canImportClash() {
      return this.customSubUrl.length > 0;
    },

    processedSubUrl() {
      return this.form.sourceSubUrl.replace(/(\n|\r|\n\r)/g, "|");
    },

    currentBackend() {
      return this.form.customBackend || CONSTANTS.DEFAULT_BACKEND;
    }
  },
  created() {
    document.title = "Subscription Converter";
    this.isPC = this.$getOS().isPc;

    // 获取 url cache
    if (import.meta.env.VITE_USE_STORAGE === 'true') {
      const cachedUrl = getLocalStorageItem('sourceSubUrl');
      if (cachedUrl) {
        this.form.sourceSubUrl = cachedUrl;
      }
    }
  },
  mounted() {
    this.form.clientType = CONSTANTS.DEFAULT_CLIENT_TYPE;
    this.getBackendVersion();
  },
  methods: {
    onCopy() {
      this.$message.success("Copied!");
    },

    goToProject() {
      window.open(CONSTANTS.PROJECT);
    },

    gotoGayhub() {
      window.open(CONSTANTS.BACKEND_RELEASE);
    },

    gotoRemoteConfig() {
      window.open(CONSTANTS.REMOTE_CONFIG_SAMPLE);
    },

    clashInstall() {
      if (this.customSubUrl === "") {
        this.$message.error("Please fill required fields and generate a sub link first");
        return false;
      }

      const url = "clash://install-config?url=";
      window.open(
        url +
        encodeURIComponent(
          this.curtomShortSubUrl !== ""
            ? this.curtomShortSubUrl
            : this.customSubUrl
        )
      );
    },

    makeUrlClick() {
      const url = this.makeUrl(this.form, this.advanced, this.processedSubUrl, this.currentBackend, this.customParams, this.needUdp);
      if (url) {
        this.customSubUrl = url;
        this.$copyText(this.customSubUrl);
        this.$message.success("Custom sub link copied to clipboard");
      } else {
        this.$message.error("Subscription link and client are required");
      }
    },

    makeShortUrlClick() {
      if (this.customSubUrl === "") {
        this.$message.warning("Please generate a sub link first");
        return false;
      }

      this.loading = true;

      ShortUrlService.generateShortUrl(this.$axios, this.customSubUrl)
        .then(shortUrl => {
          this.curtomShortSubUrl = shortUrl;
          this.$copyText(shortUrl);
          this.$message.success("Short link copied to clipboard");
        })
        .catch(error => {
          this.$message.error("Short link generation failed: " + error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    scanNodes() {
      if (!this.processedSubUrl) {
        this.$message.warning("Please enter a valid subscription link");
        return false;
      }

      this.scanLoading = true;
      this.form.scannedNodes = [];
      this.form.scannedGroups = [];

      BackendService.getNodes(this.$axios, this.processedSubUrl)
        .then(res => {
          this.form.scannedNodes = res.nodes;
          this.form.scannedGroups = res.groups;
          
          if (res.nodes.length > 0 || res.groups.length > 0) {
            this.$message.success(`Scanned ${res.nodes.length} nodes and ${res.groups.length} groups.`);
          } else {
            this.$message.info("No nodes or groups found.");
          }
        })
        .catch(err => {
          this.$message.error("Scan failed: " + err.message);
        })
        .finally(() => {
          this.scanLoading = false;
        });
    },

    smartClean() {
      const junkPatterns = [
        "到期", "GB"
      ];
      
      const regex = `(${junkPatterns.join('|')})`;
      
      if (this.form.excludeRemarks) {
        if (!this.form.excludeRemarks.includes(regex)) {
           this.form.excludeRemarks += "|" + regex;
        }
      } else {
        this.form.excludeRemarks = regex;
      }
      
      this.form.fpg = true; // Auto-enable Filter Proxy Groups
      this.$message.success("Smart Clean applied!");
      
      if (this.form.scannedNodes.length === 0) {
        this.scanNodes();
      }
    },

    addToFind(nodeName) {
      if (this.form.findValue) {
        this.form.findValue += "\n" + nodeName;
      } else {
        this.form.findValue = nodeName;
      }
    },

    addToGlobalFind(name) {
      if (this.form.globalFindValue) {
        this.form.globalFindValue += "\n" + name;
      } else {
        this.form.globalFindValue = name;
      }
    },

    addToExclude(nodeName) {
      // Escape special regex characters to ensure literal matching
      const escapedNodeName = nodeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (this.form.excludeRemarks) {
        // Only add if not already present
        const currentExcludes = this.form.excludeRemarks.split('|');
        if (!currentExcludes.includes(escapedNodeName)) {
           this.form.excludeRemarks += "|" + escapedNodeName;
        }
      } else {
        this.form.excludeRemarks = escapedNodeName;
      }
      this.$message.info(`Added "${nodeName}" to Exclude list.`);
    },

    confirmUploadConfig() {
      if (this.uploadConfig === "") {
        this.$message.warning("Remote config cannot be empty");
        return false;
      }

      this.loading = true;

      ConfigUploadService.uploadConfig(this.$axios, this.uploadConfig)
        .then(res => {
          const result = ConfigUploadService.handleUploadSuccess(res, this.$copyText, this.$message);
          if (result.success) {
            // 自动填充至『表单-远程配置』
            this.form.remoteConfig = result.url;
            this.$copyText(this.form.remoteConfig);
            this.dialogUploadConfigVisible = false;
            this.uploadConfig = "";
          }
        })
        .catch(error => {
          this.$message.error("Config upload failed: " + error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleUploadCancel() {
      this.uploadConfig = "";
      this.dialogUploadConfigVisible = false;
    },

    handleConfigUpload(configContent) {
      this.uploadConfig = configContent;
      this.confirmUploadConfig();
    },

    handleLoadCancel() {
      this.loadConfig = "";
      this.dialogLoadConfigVisible = false;
    },

    handleUrlParse(url) {
      this.loadConfig = url;
      this.confirmLoadConfig();
    },

    confirmLoadConfig() {
      this.loading = true;

      this.parseUrl(
        this.loadConfig,
        this.form,
        this.customParams,
        () => {
          this.dialogLoadConfigVisible = false;
          this.loadConfig = "";
          this.$message.success("URL parsed successfully");
        },
        (error) => {
          this.$message.error(error);
        }
      ).then(() => {
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    backendSearch(queryString, cb) {
      const results = this.backendSearchSuggestions(queryString, this.options.backendOptions);
      cb(results);
    },

    backendSearchSuggestions(queryString, backends) {
      if (queryString) {
        return backends.filter(backend => {
          return backend.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
        });
      }
      return backends;
    },

    async getBackendVersion() {
      this.backendVersion = await BackendService.getBackendVersion(this.$axios);
    },

    notify() {
      const h = this.$createElement;

      this.$notify({
        title: "Privacy Tip",
        type: "warning",
        message: h(
          "i",
          { style: "color: teal" },
          "Subscription link generation is purely client-side (excluding shortlinks), ensuring no privacy issues. We provide a default backend for conversion, but privacy-conscious users are encouraged to deploy their own."
        )
      });
    },

    showQrCode() {
      if (this.curtomShortSubUrl === "") {
        this.$message.warning("Please generate a short link first");
        return;
      }
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.curtomShortSubUrl)}`;
      this.dialogQrCodeVisible = true;
    },

    async downloadQrCode() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const padding = 20;
        const qrSize = 250;
        const width = qrSize + (padding * 2);
        const height = width + 140; // Extra space for text

        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Header: Digital Freedom (Stylish & Large)
        ctx.shadowColor = 'rgba(64, 158, 255, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#409EFF';
        ctx.font = 'bold 26px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Digital Freedom', width / 2, 40);
        
        // Reset Shadow for other text
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.fillStyle = '#555';
        ctx.font = 'italic 14px sans-serif';
        ctx.fillText('Premium Subscription Gateway', width / 2, 65);

        // Load QR Image
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = this.qrCodeUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Draw QR
        ctx.drawImage(img, padding, 80, qrSize, qrSize);

        // Footer 1: Instruction
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.fillText('Scan with Shadowrocket / VPN apps', width / 2, height - 75);

        // Footer 2: Warning
        ctx.fillStyle = '#F56C6C';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Don\'t Break The Rules', width / 2, height - 45);

        // Footer 3: Policy
        ctx.fillStyle = '#999';
        ctx.font = 'italic 10px sans-serif';
        ctx.fillText('* Non-refundable policy applies', width / 2, height - 20);

        // Trigger Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'DigitalFreedom_QR_Secure.png';
        link.click();
        
        this.$message.success("Branded QR Code downloaded!");
      } catch (error) {
        this.$message.error("Download failed: " + error.message);
      }
    },

    // 表单相关方法
    saveSubUrl() {
      saveSubscriptionUrl(this.form);
    },

    addCustomParam() {
      addCustomParam(this.customParams);
    },

    // 使用 composables
    ...useSubscription(),
    ...useUrlParser()
  }
};
</script>
