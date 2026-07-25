---
title: "数据弹性 | BYOC"
slug: /data-resilience
sidebar_label: "数据弹性"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 作为全托管的向量数据库服务，提供企业级的高可用性（High Availability, HA）和灾难恢复（Disaster Recovery, DR）能力，确保您的关键业务数据和服务在各种故障场景下的持续可用性。 | BYOC"
type: origin
token: MJ6QwAPKRiHs6pkkNELc2WfinOs
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据弹性
  - 负载均衡
  - 容灾
  - RTO
  - RPO
  - 成本优化

---

import Admonition from '@theme/Admonition';


# 数据弹性

Zilliz Cloud 作为全托管的向量数据库服务，提供企业级的**高可用性（High Availability, HA）和灾难恢复（Disaster Recovery, DR）**能力，确保您的关键业务数据和服务在各种故障场景下的持续可用性。

### 核心能力\{#core-capabilities}

- **高可用性（HA）**：通过自动故障检测和快速切换机制，确保服务在节点、可用区或地域级故障时的持续运行

- **灾难恢复（DR）**：提供完善的备份和恢复策略，在重大故障事件后快速恢复业务运营

- **灵活的弹性层级**​：从标准版到企业级跨地域部署，满足不同业务场景的 RPO/RTO 需求

- **成本优化**​：根据业务价值和风险容忍度，选择最具成本效益的弹性方案

## 关键概念\{#key-concepts}

### 核心指标\{#core-metrics}

- **恢复点目标（RPO）**

    可容忍的最大数据丢失量，以时间为衡量单位。例如，RPO 为 5 分钟意味着在故障发生时，最多可能丢失最近 5 分钟的数据更新。

- **恢复时间目标（RTO）**

    从故障发生到服务完全恢复正常运行所需的最长时间。这包括故障检测、切换决策和实际恢复过程。

- **服务等级协议（Uptime SLA）**

    Zilliz Cloud 对服务可用性的承诺，通常以百分比表示（如 99.95% 表示每月停机时间不超过 21.6 分钟）。

### 容错范围\{#fault-tolerance-scope}

- **节点级容错**​：单个计算或存储节点故障

- **可用区级容错**​：整个可用区不可用（如数据中心故障）

- **地域级容错**​：整个地域服务中断（如自然灾害）

- **云平台级容错**​：跨云部署，防范单一云服务商风险

## 弹性架构层级\{#resilience-architecture-tiers}

### 高可用（HA）层级\{#high-availability-ha-tiers}

<table>
   <tr>
     <th><p><strong>层级</strong></p></th>
     <th><p><strong>描述</strong></p></th>
     <th><p><strong>RPO</strong></p></th>
     <th><p><strong>RTO</strong></p></th>
     <th><p><strong>写入延迟/复制方案</strong></p></th>
     <th><p><strong>容错能力</strong></p></th>
     <th><p><strong>SLA</strong></p></th>
     <th><p><strong>相对成本</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>标准版</strong></p></td>
     <td><p>单地域、单可用区内部署配备多副本机制</p></td>
     <td><p>0 秒</p></td>
     <td><p>≤ 1 分钟</p></td>
     <td><p>写入单个 AZ ， WAL多副本Quorum</p></td>
     <td><p>节点级故障可用区数：1地域数：1</p></td>
     <td><p>无SLA承诺</p></td>
     <td><p>低</p></td>
   </tr>
   <tr>
     <td><p><strong>企业版</strong></p></td>
     <td><p>单地域内跨 3 个可用区部署自动故障切换</p></td>
     <td><p>0 秒</p></td>
     <td><p>≤ 1 分钟</p></td>
     <td><p>写入跨 AZ，WAL多副本Quorum</p></td>
     <td><p>可用区级故障可用区数：3地域数：1</p></td>
     <td><p>99.95%</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p><strong>企业版多副本</strong></p></td>
     <td><p>同地域多活副本架构读写分离，快速切换</p></td>
     <td><p>0 秒</p></td>
     <td><p>≤ 10 秒</p></td>
     <td><p>写入跨 AZ，内粗多副本间基于WAL同步</p></td>
     <td><p>可用区级故障可用区数：3地域数：1</p></td>
     <td><p>99.99%</p></td>
     <td><p>中-高</p></td>
   </tr>
   <tr>
     <td><p><strong>跨地域高可用</strong></p></td>
     <td><p>多地域/多云部署全球负载均衡</p></td>
     <td><p>≤ 10 秒</p></td>
     <td><p>手动切换或自动改自动：≤ 3 分钟</p></td>
     <td><p>同步写入跨 AZ 多副本异步复制到其他地域/云</p></td>
     <td><p>地域级故障可用区数：≥3地域数：≥2</p></td>
     <td><p>99.99%</p></td>
     <td><p>高</p></td>
   </tr>
</table>

### 灾难恢复（DR）层级\{#disaster-recovery-dr-tiers}

<table>
   <tr>
     <th><p><strong>层级</strong></p></th>
     <th><p><strong>描述</strong></p></th>
     <th><p><strong>RPO</strong></p></th>
     <th><p><strong>Restore速度</strong></p></th>
     <th><p><strong>备份策略</strong></p></th>
     <th><p><strong>适用场景</strong></p></th>
     <th><p><strong>额外成本</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>本地备份</strong></p></td>
     <td><p>同地域对象存储备份定时全量备份</p></td>
     <td><p>小时级</p></td>
     <td><p>数分钟至数小时</p></td>
     <td><p>全量备份</p></td>
     <td><p>数据误删除逻辑错误恢复</p></td>
     <td><p>低</p></td>
   </tr>
   <tr>
     <td><p><strong>跨地域备份</strong></p></td>
     <td><p>备份数据异地存储防范地域级灾难</p></td>
     <td><p>小时级</p></td>
     <td><p>数分钟至数小时</p></td>
     <td><p>全量备份多区域/多云复制</p></td>
     <td><p>地域级灾难合规性要求</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p><strong>增量备份</strong></p></td>
     <td><p>实时增量备份细粒度恢复点</p></td>
     <td><p>≤ 1 分钟</p></td>
     <td><p>数分钟至数小时</p></td>
     <td><p>持续增量捕获事务日志备份</p></td>
     <td><p>关键业务精确时间点恢复</p></td>
     <td><p>中-高</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

<p>跨地域高可用功能将在 2025 年 11 月上线，增量备份功能将在 2025 年 12 月上线。</p>

</Admonition>

## 快速选择指南\{#quick-selection-guide}

### 业务分级与弹性选择\{#business-tiering-resilience-recommendations}

#### Tier 1 - 关键核心业务\{#tier-1-mission-critical-workloads}

- **特征**​：24/7 运行，分钟级停机即造成重大损失，业务价值极高

- **建议方案**​：跨地域高可用 + 企业版多副本 + 连续数据保护

- **目标**​：RPO = 0 秒，RTO < 30 秒，跨云/地域容灾能力

- **预期成本**​：高

#### Tier 2 - 重要业务系统\{#tier-2-important-business-systems}

- **特征**​：24/7 运行，稳定性要求较高

- **建议方案**​：企业版多副本 + 跨地域备份

- **目标**​：RPO = 0 秒，RTO < 30 秒

- **预期成本**​：中-高

#### Tier 3 - 一般业务应用\{#tier-3-general-applications}

- **特征**​：业务时间运行，成本敏感，接受故障时有一定的恢复时间

- **建议方案**​：企业版 + 本地备份

- **目标**​：RPO = 0 秒，RTO < 3 分钟

- **预期成本**​：低-中

#### Tier 4 - 非核心业务\{#tier-4-non-critical-workloads}

- **特征**​：非关键系统，成本敏感，可接受计划维护窗口

- **建议方案**​：标准版 + 本地备份

- **目标**​：RPO = 0 秒，RTO < 3 分钟

- **预期成本**​：低-中

### 成本优化决策矩阵\{#cost-optimization-decision-matrix}

<table>
   <tr>
     <th><p><strong>业务影响等级</strong></p></th>
     <th><p><strong>数据价值</strong></p></th>
     <th><p><strong>合规要求</strong></p></th>
     <th><p><strong>推荐方案</strong></p></th>
     <th><p><strong>成本级别</strong></p></th>
   </tr>
   <tr>
     <td><p>极高</p></td>
     <td><p>极高</p></td>
     <td><p>严格</p></td>
     <td><p>跨地域高可用 + 全套 DR</p></td>
     <td><p>高</p></td>
   </tr>
   <tr>
     <td><p>高</p></td>
     <td><p>高</p></td>
     <td><p>中等</p></td>
     <td><p>企业版多副本 + 跨地域备份</p></td>
     <td><p>中-高</p></td>
   </tr>
   <tr>
     <td><p>中</p></td>
     <td><p>中等</p></td>
     <td><p>一般</p></td>
     <td><p>企业版 + 本地备份</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p>低</p></td>
     <td><p>低</p></td>
     <td><p>无</p></td>
     <td><p>标准版 + 基础备份</p></td>
     <td><p>低</p></td>
   </tr>
</table>

## 常见问题解答\{#freqently-asked-questions}

**Q1: 标准版与企业版如何实现高可用？**

**架构设计**

Zilliz Cloud 采用存算分离架构，数据分为三类：

- **元数据**​：存储于 etcd（3 副本，RAFT 协议）

- **日志数据**​：存储于自研 Woodpecker（Quorum 协议）

- **原始与索引数据**​：存储于对象存储，继承云存储的高可用

**计算节点高可用**

- 基于 Kubernetes 自动调度

- 单机 / 单 AZ 故障时自动拉起 Pod

- Coordinator 自动将 segment 重分配至其他 QueryNode

- 从存储中加载索引与数据，恢复时间 < **1 分钟**

**成本优化**

采用「多持久化副本 + 内存动态加载」：

- 避免多内存副本带来的成本翻倍

- 简化容灾架构复杂度

- 充分利用日志和对象存储带宽，加速恢复

**Q2: 多副本机制如何工作？**

**核心机制**

- **Shard 层面**​：多个 StreamNode 共同加载，存在主备关系

- **Segment 层面**​：多个 QueryNode 共同加载，数据仍单份持久化

**读写分离**

- **写入**​：主 StreamNode 负责

- **读取**​：任意备用 StreamNode 可读，任意Segment可读

**主要优势**

1. **快速故障恢复**​：Proxy 自动转发流量至备用节点，恢复速度更快

1. **性能提升**​：多内存副本带来更高 QPS

1. **平滑升级**​：滚动升级时降低服务抖动，服务更稳定

**Q3: Global Database 如何实现跨区域高可用？**

**CDC 同步机制**

- 通过 CDC 同步 DDL / DML / Bulk Import 操作

- 同步延迟通常 < **10 秒**

- 实现跨 Region / 跨云容灾，RPO 极低

**数据写入策略**

- 数据写入同一 Region 多个 AZ

- 延迟为跨 AZ 级别

- 极端切换下数据丢失 < **10 秒**

- **2026 计划**​：推出跨 Region Woodpecker，实现 **0 RPO**

**主备切换**

- **手动切换**​：通过 OpenAPI 或 WebConsole

- **自动切换**​：Zilliz 探活服务检测，1–3 分钟完成

**访问模式**

<table>
   <tr>
     <th><p><strong>模式</strong></p></th>
     <th><p><strong>特点</strong></p></th>
     <th><p><strong>适用场景</strong></p></th>
   </tr>
   <tr>
     <td><p>主备容灾</p></td>
     <td><p>主写主读，备仅切换时启用</p></td>
     <td><p>标准容灾</p></td>
   </tr>
   <tr>
     <td><p>多活模式</p></td>
     <td><p>主写多读，就近读取</p></td>
     <td><p>全球读多写少</p></td>
   </tr>
   <tr>
     <td><p>多主模式<em>(2026 年上线)</em></p></td>
     <td><p>主备均可写，需用户保证数据不冲突</p></td>
     <td><p>单元化部署</p></td>
   </tr>
</table>

*如需了解最新功能特性或获取技术支持，请联系 [Zilliz Cloud 技术支持](https://support.zilliz.com.cn/hc/zh-cn)。*