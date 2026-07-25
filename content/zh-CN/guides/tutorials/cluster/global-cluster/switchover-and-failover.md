---
title: "优雅切换和强切 | Cloud"
slug: /switchover-and-failover
sidebar_key: switchover-and-failover
sidebar_label: "优雅切换和强切"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 全球集群支持两种操作来更改主集群所在的区域： | Cloud"
type: origin
token: GopSwoGT3iIQSOkD15tcWQ7Dn5e
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - 全球集群
  - switchover
  - failover
  - 容灾
  - 高可用

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 优雅切换和强切

Zilliz Cloud 全球集群支持两种操作来更改主集群所在的区域：

- **优雅切换（Switchover）**：一种计划性的零数据丢失操作，将已同步的从集群提升为主集群。

- **强切（Failover）**：一种紧急恢复操作，在主集群所在区域发生故障后，将从集群提升为主集群。

本文介绍各操作的适用场景、执行方式，以及操作期间和操作完成后的预期行为。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 概述\{#overview}

### 优雅切换 vs. 强切\{#switchover-vs-failover}

下表对比了两种操作。

<table>
    <tr>
        <th></th>
        <th><p>优雅切换</p></th>
        <th><p>强切</p></th>
    </tr>
    <tr>
        <td><p>适用场景</p></td>
        <td><p>计划性操作：区域轮换、合规要求、数据驻留变更。</p></td>
        <td><p>主集群所在区域发生非计划性故障或中断。</p></td>
    </tr>
    <tr>
        <td><p>触发方式</p></td>
        <td><p>在所有主集群和从集群均处于运行状态时手动发起。</p></td>
        <td><p>当主集群变为异常状态时，作为恢复操作手动发起。</p></td>
    </tr>
    <tr>
        <td><p>数据丢失（RPO）</p></td>
        <td><p>0 — 无数据丢失。仅在数据完全同步后才执行切换。</p></td>
        <td><p>等于强切时的同步延迟。</p></td>
    </tr>
    <tr>
        <td><p>停机时间（RTO）</p></td>
        <td><p>接近零。全球 Endpoint 自动重新路由。</p></td>
        <td><p>通常约几分钟。</p></td>
    </tr>
    <tr>
        <td><p>前提条件</p></td>
        <td><p>所有集群必须处于 RUNNING 状态。同步延迟必须 ≤ 30 秒，超过此阈值将拒绝优雅切换。</p></td>
        <td><p>可随时触发（高风险操作）。至少一个从集群必须可达。</p></td>
    </tr>
    <tr>
        <td><p>原主集群的处理方式</p></td>
        <td><p>降级为从集群。</p></td>
        <td><p>废弃并移入<a href="https://zilliverse.feishu.cn/wiki/FgDZw6JJuiICETkqrqHckN4pneb">回收站</a>。系统自动创建新的从集群。</p></td>
    </tr>
    <tr>
        <td><p>应用变更</p></td>
        <td><p>使用全球 Endpoint 时无需变更，路由自动更新。详情请参见 。</p></td>
        <td><p>使用全球 Endpoint 时无需变更，路由自动更新。详情请参见  。</p></td>
    </tr>
</table>

### 集群状态转换\{#cluster-status-transitions}

下图展示了优雅切换、强切和自动恢复操作期间集群状态的变化。

![RCNOweYsDhd8aEbhTWMcxYMOn1d](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RCNOweYsDhd8aEbhTWMcxYMOn1d.png)

- **优雅切换**：

    - 优雅切换将集群从运行中（RUNNING）转为切换中（SWITCHING）状态，期间目标从集群与当前主集群进行数据同步。同步完成后，目标从集群被提升为新主集群，原主集群降级为从集群。两个集群以新角色恢复到运行中（RUNNING）状态。

    - 如果同步未在超时时间内完成，优雅切换将回滚。两个集群以原角色恢复到运行中（RUNNING）状态。

- **强切**：

    - 当主集群因故障或中断进入异常（ABNORMAL）状态时，您可以手动触发强切。目标从集群被提升为新主集群，原主集群被废弃并移入回收站。

    - 强切完成后，Zilliz Cloud 会自动创建新的从集群以恢复完整拓扑。新从集群以创建中（CREATING）状态开始，创建和数据同步完成后转为运行中（RUNNING）状态。如果创建失败，集群进入重建失败（REBUILD_FAILED）状态。您可以重试重建或[联系我们](http://support.zilliz.com.cn)获取帮助。

    - 如果强切本身失败，集群将保持异常（ABNORMAL）状态。您可以重试强切或[联系我们](http://support.zilliz.com.cn)获取帮助。

- **自动恢复**：
如果主集群的问题自行解决，集群将从异常（ABNORMAL）自动恢复到运行中（RUNNING）状态，无需人工干预。在这种情况下，无需执行强切。

## 执行优雅切换\{#perform-a-switchover}

对于计划性的区域轮换，您可以执行优雅切换将从集群提升为主集群。

### 前提条件\{#before-you-start}

- 全球集群中的所有集群必须处于运行中（RUNNING）状态。

- 同步延迟必须 ≤ 30 秒。超过此阈值将拒绝优雅切换。请在[全球拓扑图](./monitor-global-cluster#global-topology)标签页中检查延迟。

- 没有正在进行的 Query CU 或副本[扩缩容](./scale-global-cluster)操作。

### 操作步骤\{#procedures}

以下 Demo 展示了如何执行优雅切换。

<Supademo id="cmnpic07n84n2aburnc12drnr" title=""  />

<Procedures>

1. 前往全球集群页面。

1. 点击**优雅切换**或**强切**。

1. 选择要提升的目标从集群。

1. 选择**优雅切换**。

1. 在弹窗中确认操作。

</Procedures>

发起优雅切换后，Zilliz Cloud 会等待目标从集群与当前主集群完全同步，然后将其提升为新主集群。

### 优雅切换后\{#after-the-switchover}

- 原主集群变为从集群，开始接收来自新主集群的复制数据。

- 全球 Endpoint 路由自动更新，将写入请求定向到新主集群。

- 您可以在**全球拓扑图**中验证新的拓扑结构。所有集群应恢复到运行中（RUNNING）状态。

- 请在新主集群上重新配置备份策略。备份策略不会自动转移到新主集群。

## 执行强切\{#perform-a-failover}

当主集群所在区域发生故障且主集群处于异常（ABNORMAL）状态时，请使用强切。

强切是一种紧急操作。与优雅切换不同，它不会等待数据同步完成。已提交到主集群但尚未复制到目标从集群的写入数据将会丢失。数据丢失量等于强切时的同步延迟。

### 前提条件\{#before-you-start}

- 确认主集群不可达且处于异常（ABNORMAL）状态。

- 确定要提升的从集群。如果有多个从集群可用，请选择同步延迟最低的那个（最接近主集群的最新状态）。

### 操作步骤\{#procedures}

以下 Demo 展示了如何执行强切。

<Supademo id="cmnpile4s01nlzz0j6ryixd11" title=""  />

<Procedures>

1. 导航到全球集群页面。

1. 点击**优雅切换或强切**。

1. 选择要提升的目标从集群。

1. 选择**强切**。

1. 在弹窗中确认操作。

</Procedures>

<Admonition type="info" icon="📘" title="说明">

如果强切失败，集群将保持异常（ABNORMAL）状态。您可以重试强切操作或[提交工单](http://support.zilliz.com.cn)。

</Admonition>

### 强切后\{#after-the-failover}

- 原主集群被废弃并移入回收站，不再显示在**全球拓扑图**中。

- 系统会自动创建新的从集群以恢复完整的全球拓扑。新从集群创建期间，在全球拓扑图中不可见。取而代之的是，全球集群页面上会显示横幅提示："*新的从集群将被创建，稍后可用。*"

- 其余从集群会自动重建并进入创建中状态。重建完成后会转为运行中状态。

- 全球 Endpoint 更新为将写入请求定向到新主集群。

- 请在新主集群上重新配置备份策略。备份策略不会自动转移到新主集群。

## 路由行为\{#routing-behavior}

下表总结了优雅切换和强切期间及完成后，全球 Endpoint 和公共 Endpoint 的行为。

<table>
    <tr>
        <th><p>Endpoint 类型</p></th>
        <th><p>优雅切换期间</p></th>
        <th><p>强切期间</p></th>
        <th><p>完成后</p></th>
    </tr>
    <tr>
        <td><p>全球 Endpoint</p></td>
        <td><p>写入短暂暂停，随后路由到新主集群。读取不受影响。</p></td>
        <td><p>写入不可用，直到新主集群提升完成。从集群上的读取可用。</p></td>
        <td><p>写入和读取自动路由到新主集群和从集群。无需修改代码。</p></td>
    </tr>
    <tr>
        <td><p>公共 Endpoint</p></td>
        <td><p>各集群的公共 Endpoint 保持不变。原主集群变为从集群。</p></td>
        <td><p>原主集群被废弃。新主集群的公共 Endpoint 接受写入。</p></td>
        <td><p>需要更新应用，使用新主集群的公共 Endpoint 进行写入。</p></td>
    </tr>
</table>

## 对进行中任务的影响\{#impact-on-in-progress-tasks}

下表总结了优雅切换和强切期间，进行中的任务如何处理。

<table>
   <tr>
     <th><p><strong>任务</strong></p></th>
     <th><p><strong>优雅切换期间</strong></p></th>
     <th><p><strong>强切期间</strong></p></th>
   </tr>
   <tr>
     <td><p>备份</p></td>
     <td><p>任务失败。优雅切换完成后在新主集群上自动重试。</p></td>
     <td><p>任务失败。强切完成后在新主集群上自动重试。</p></td>
   </tr>
   <tr>
     <td><p>Query CU 扩缩容</p></td>
     <td><p>扩缩容进行中将阻止优雅切换。</p></td>
     <td><p>任务失败。强切完成后自动重试。</p></td>
   </tr>
   <tr>
     <td><p>副本扩缩容</p></td>
     <td><p>扩缩容进行中将阻止优雅切换。</p></td>
     <td><p>任务失败。强切完成后自动重试。</p></td>
   </tr>
</table>
