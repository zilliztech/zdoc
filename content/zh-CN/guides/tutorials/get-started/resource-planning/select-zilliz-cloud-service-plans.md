---
title: "Zilliz Cloud 版本对比 | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_key: select-zilliz-cloud-service-plans
sidebar_label: "Zilliz Cloud 版本对比"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供多样的项目版本类型以满足不同的用户需求。不论是向量数据库领域的新手，还是追求可靠的企业级解决方案的开发者，需要根据性能、可扩展性及成本，选择合适的版本类型。本文将提供不同版本间的对比，帮助您做出合适的选择。 | Cloud"
type: origin
token: XNCIwt9i6iFgEDkEQE9cTMf8nSe
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud 版本对比

Zilliz Cloud 提供多样的项目版本类型以满足不同的用户需求。不论是向量数据库领域的新手，还是追求可靠的企业级解决方案的开发者，需要根据性能、可扩展性及成本，选择合适的版本类型。本文将提供不同版本间的对比，帮助您做出合适的选择。

## 版本简介\{#plan-overview}

- **Dedicated**：提供企业级稳定性与安全合规，适用于生产环境应用开发。详情请查看 [Zilliz 定价页面](https://zilliz.com.cn/pricing)。

- **BYOC (Bring Your Own Cloud)**：适用于需要在自有云环境中部署，且高度注重数据隐私和合规的场景。如需选择 BYOC 版本，请[联系销售](http://zilliz.com.cn/contact-sales)。

## 选择版本类型\{#select-a-cluster-plan}

以下小节对比了不同版本和不部署方式的特性和功能。

### 部署\{#deployment}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>环境</p></td>
     <td><p>Shared</p></td>
     <td><p>Shared</p></td>
     <td><p>Dedicated</p></td>
     <td><p>Dedicated</p></td>
   </tr>
   <tr>
     <td><p><a href="./cu-types-explained">集群类型</a></p></td>
     <td></td>
     <td></td>
     <td><p>3 种类型可供选择：</p><ul><li><p>性能型</p></li><li><p>容量型</p></li><li><p>分层存储型</p></li></ul></td>
     <td><p>2 种类型可供选择：</p><ul><li><p>性能型</p></li><li><p>容量型</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./cloud-providers-and-regions">云服务提供商和地域</a></p></td>
     <td><p>阿里云</p></td>
     <td><p>阿里云</p></td>
     <td><p>阿里云、腾讯云、亚马逊云科技</p></td>
     <td><p>阿里云、腾讯云、亚马逊云科技</p></td>
   </tr>
   <tr>
     <td><p>Query CU 数量</p></td>
     <td><p>单个 Query CU</p></td>
     <td><p>弹性伸缩，无需配置</p></td>
     <td><p>最多 256 Query CU (支持 Query CU 数量包括: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32,…,64, 72, 80, 88,…, 256</p><p>当 Query CU 大于 8 时，增加梯度为 4 CU。</p><p>当 Query CU 大于 64 时， 增加梯度为 8 CU。)</p></td>
     <td><p>可根据用户需求定制</p></td>
   </tr>
   <tr>
     <td><p>弹性伸缩</p></td>
     <td></td>
     <td><p>系统自动伸缩</p><p>（无需配置）</p></td>
     <td><p>可配置弹性伸缩</p><p>自助式一键扩缩至 256 CU 或以上</p></td>
     <td><p>可配置弹性伸缩</p><p>自助式一键扩缩至 256 CU 或以上</p></td>
   </tr>
   <tr>
     <td><p>服务可用性 SLA</p></td>
     <td></td>
     <td></td>
     <td><p>99.95%</p></td>
     <td><p>99.95%</p></td>
   </tr>
</table>

### 高可用\{#high-availability}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>可用区</p></td>
     <td></td>
     <td><p>单个</p></td>
     <td><p>多个</p></td>
     <td><p>多个</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-replica">多副本（Replica）</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>快照 Snapshot</p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Global Cluster</p></td>
     <td></td>
     <td></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
   </tr>
</table>

### 数据管理\{#data-management}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./offline-migration">跨集群迁移</a></p></td>
     <td></td>
     <td><p>从 Free 集群迁移</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./zero-downtime-migration">在线迁移</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrate-from-external-sources">从外部数据源迁移</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Stage</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./import-data">高速数据传输</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./use-recycle-bin">回收站</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 数据安全与合规\{#data-security-and-compliance}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>CMEK</p></td>
     <td></td>
     <td></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
   </tr>
   <tr>
     <td><p><a href="./multi-factor-auth">MFA</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./auditing">审计系统</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-api-keys">API 密钥管理</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./data-security#data-encryption">数据传输加密和静态加密</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-and-restore">备份与恢复</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">跨地域备份</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>持续数据保护</p></td>
     <td></td>
     <td></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
   </tr>
   <tr>
     <td><p>PITR</p></td>
     <td></td>
     <td></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
   </tr>
   <tr>
     <td><p>数据脱敏（Tokenization）</p></td>
     <td></td>
     <td></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
     <td><p><a href="http://zilliz.com.cn/contact-sales">联系我们</a></p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-whitelist">IP 地址访问控制</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-a-private-link">VPC 私网连接（Private Link）</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>ISO/ICE 27001、GDPR 合规与安全认证</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>HIPPA 合规</p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 可观测性\{#observability}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./view-cluster-metric-charts">细粒度的指标与实时监控面板</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-project-alerts">告警</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./prometheus-monitoring">集成第三方监控告警系统和 API</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./job-center">任务中心</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 基于角色的访问控制（RBAC）\{#role-based-access-control}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./access-control-overview">组织和项目层级 RBAC</a></p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-control-overview">数据层 RBAC</a></p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 集成与工具\{#integrations-and-tools}

<table>
   <tr>
     <th></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td><p>管控面和数据面 <a href="/reference/restful">RESTful API</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>多语言 <a href="/reference/python">SDK</a>（Python、Java、Go、Node.js SDK）</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com/vector-transport-service">VTS（向量传输服务）</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p><a href="https://zilliz.com.cn/vdbbench-leaderboard">VectorDBBench</a></p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

### 技术支持\{#technical-support}

<table>
   <tr>
     <th colspan="2"></th>
     <th><p><strong>Free</strong></p></th>
     <th><p><strong>Serverless</strong></p></th>
     <th><p><strong>Dedicated 企业版</strong></p></th>
     <th><p><strong>Bring Your Own Cloud (BYOC)</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>值守支持</p></td>
     <td></td>
     <td><p>工作时间</p></td>
     <td><p>全天候</p></td>
     <td><p>全天候</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>首次响应 SLA</p></td>
     <td><p>紧急问题</p></td>
     <td></td>
     <td><p>4 小时</p></td>
     <td><p>1 小时</p></td>
     <td><p>1 小时</p></td>
   </tr>
   <tr>
     <td><p>高优先级问题</p></td>
     <td></td>
     <td><p>1 个工作日</p></td>
     <td><p>4 小时</p></td>
     <td><p>4 小时</p></td>
   </tr>
   <tr>
     <td><p>中等/一般问题</p></td>
     <td></td>
     <td><p>2 个工作日</p></td>
     <td><p>1 个工作日</p></td>
     <td><p>1 个工作日</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>支持渠道</p></td>
     <td><p>社区支持</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>技术支持 Bot</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>邮件或工单</p></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>微信</p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>飞书/腾讯/钉钉会议</p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>架构指导</p></td>
     <td><p>通用</p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>特殊案例</p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>在线咨询</p></td>
     <td></td>
     <td></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

