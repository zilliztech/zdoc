---
title: "监控全球集群 | Cloud"
slug: /monitor-global-cluster
sidebar_key: monitor-global-cluster
sidebar_label: "监控全球集群"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文介绍如何监控全球集群的状态、数据同步状态和性能。 | Cloud"
type: origin
token: SQ3fw6BdJioGuKk5J2XcY7RRnid
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - 全球集群
  - 监控
  - 指标

---

import Admonition from '@theme/Admonition';


# 监控全球集群

本文介绍如何监控全球集群的状态、数据同步状态和性能。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 全球拓扑图\{#global-topology}

全球集群页面上的**全球拓扑图**卡片提供全球集群结构和状态的实时视图。

![ZOfvwNPJchPqXCbNGf8cpNK7n6f](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ZOfvwNPJchPqXCbNGf8cpNK7n6f.png)

全球拓扑图卡片展示以下信息：

- 主集群和所有从集群及其所在区域、副本数量信息

- 各集群的当前状态

- 主集群与各从集群之间的同步状态和延迟

使用此视图可在执行优雅切换（Switchover）等操作前，确认所有从集群已同步且正常运行。

## 集群状态\{#}

全球集群中的每个集群会展示以下状态之一：

<table>
   <tr>
     <th><p><strong>状态</strong></p></th>
     <th><p><strong>说明</strong></p></th>
     <th><p><strong>操作</strong></p></th>
   </tr>
   <tr>
     <td><p>创建中（CREATING）</p></td>
     <td><p>集群正在创建中。也适用于强切后正在重建或自动重建的从集群。</p></td>
     <td><p>等待创建完成。</p></td>
   </tr>
   <tr>
     <td><p>运行中在（RUNNING）</p></td>
     <td><p>集群正常运行。</p></td>
     <td><p>无需操作。</p></td>
   </tr>
   <tr>
     <td><p>异常（ABNORMAL）</p></td>
     <td><p>检测到主集群存在问题。</p></td>
     <td><p>排查问题。如果主集群不可达，请考虑发起<a href="./switchover-and-failover">强切</a>。如需帮助，请<a href="http://support.zilliz.com.cn">提交工单</a>。</p></td>
   </tr>
   <tr>
     <td><p>切换中（SWITCHING）</p></td>
     <td><p>优雅切换或强切正在进行中，主集群角色正在转移。</p></td>
     <td><p>等待操作完成。请勿发起额外的优雅切换。</p></td>
   </tr>
</table>

## 同步延迟\{#synchronization-lag}

同步延迟衡量的是主集群上提交的写入与该写入在从集群上可用之间的时间差。您可以在**全球拓扑图**标签页中监控各从集群的同步延迟。

- 正常情况下，同步延迟通常为几秒。

- 在高频写入或大批量导入期间，延迟可能会暂时升高。

下表说明了各同步延迟级别及建议操作。

<table>
   <tr>
     <th><p><strong>同步延迟</strong></p></th>
     <th><p><strong>含义</strong></p></th>
   </tr>
   <tr>
     <td><p>&lt; 5 秒</p></td>
     <td><p>正常。从集群几乎与主集群保持同步。</p></td>
   </tr>
   <tr>
     <td><p>5–30 秒</p></td>
     <td><p>偏高。仍允许执行<a href="./switchover-and-failover">优雅切换</a>。请关注延迟是否持续升高。</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>30 秒</p></blockquote></td>
     <td><p><a href="./switchover-and-failover">优雅切换</a>被阻止。请排查写入负载或从集群健康状态，解决根本原因后再尝试优雅切换。</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>180 秒</p></blockquote></td>
     <td><p>严重。<a href="./switchover-and-failover">强切</a>的 RPO 风险显著。需要立即排查。</p></td>
   </tr>
</table>

如果在同步延迟较高时执行强切，新主集群可能会缺少最近的写入数据。潜在的数据丢失量（RPO）等于强切时的同步延迟。

## 集群指标与告警\{#}

全球集群中的每个集群（包括主集群和从集群）都暴露与普通 Dedicated 集群相同的指标。您可以在集群详情页查看这些指标、为这些指标创建告警，或将其导出到外部监控系统。详情请参见[指标与告警快速参考](./metrics-alerts-reference)。