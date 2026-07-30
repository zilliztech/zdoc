---
title: "全球集群扩缩容 | Cloud"
slug: /scale-global-cluster
sidebar_label: "全球集群扩缩容"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "全球集群的扩缩容方式与普通 Dedicated 集群不同。部分资源设置由主集群统一控制，其余则由各集群独立配置。 | Cloud"
type: origin
token: ER5PwvwjIiBcG4kughjcE1GLnjh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 全球集群扩缩容

全球集群的扩缩容方式与普通 Dedicated 集群不同。部分资源设置由主集群统一控制，其余则由各集群独立配置。

本文介绍全球集群的扩缩容行为以及各资源类型的扩缩容方式。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 前提条件\{#before-you-start}

- 请确保具备项目管理员（Project Admin）权限。

## 扩缩容行为概述\{#scaling-behavior-overview}

下表概述了全球集群支持的扩缩容行为。

| **资源** | **主集群** | **从集群** |
| --- | --- | --- |
| Query CU | 支持。<br/>可使用所有扩缩容方式（手动、动态、定时）。 | 自动跟随主集群。不可独立扩缩容。 |
| Replica | 支持。<br/>可使用所有扩缩容方式（手动、动态、定时）。 | 支持。<br/>可使用所有扩缩容方式（手动、动态、定时）。<br/>各集群独立配置。 |

## Query CU 扩缩容\{#scale-query-cus}

Query CU 扩缩容由主集群统一控制。当您更改主集群的 Query CU 数量时，Zilliz Cloud 会自动将新的 Query CU 数量应用到所有从集群。从集群的 Query CU 不可独立扩缩容，始终与主集群保持一致。

主集群的 Query CU 扩缩容操作步骤与普通 Dedicated 集群相同。详情请参见

- [Query CU 扩缩容](./scale-query-cu)（通过 Web 控制台）

- [修改全球集群 CU](https://docs.zilliz.com.cn/reference/restful/modify-global-cluster-cu-v2)（通过 RESTful API）

### 注意事项\{#considerations}

- [资源限制](./limits#cus)与普通 Dedicated 集群相同（例如 CU × Replica ≤ 2048）。

- CU 扩缩容期间，集群状态变为修改中（Modifying）。扩缩容进行中将无法进行[优雅切换](./switchover-and-failover)（Switchover）。

- CU 扩缩容期间仍可触发[强切](./switchover-and-failover)（Failover）作为紧急操作，但扩缩容任务将失败，并在强切完成后自动重试。

## Replica 扩缩容\{#scale-replicas}

Replica 扩缩容由各集群独立控制。全球集群中的每个集群（包括主集群和从集群）可以拥有不同的Replica 数量，以适应其所在区域的工作负载。这样您可以在高流量区域分配更多资源，而不必在其他区域过度配置。

以下是为各集群配置Replica的示例。

| 集群 | 区域 | Replica 数量 | 原因 |
| --- | --- | --- | --- |
| 主集群 | us-west-2 | 2 | 中等读取流量 + 全部写入流量 |
| 从集群_01 | eu-west-1 | 4 | 欧洲区域读取流量较高 |
| 从集群_02 | ap-southeast-1 | 1 | 低流量，仅用于灾难恢复备用 |

主集群或从集群的Replica扩缩容操作步骤与普通 Dedicated 集群相同。详情请参见

- [Replica 扩缩容](./manage-replica)（通过 Web 控制台）

- [修改集群副本数量](https://docs.zilliz.com.cn/reference/restful/modify-cluster-replica-v2)（通过 RESTful API）

### 注意事项\{#considerations}

- [Replica 限制](./limits#replicas)与普通 Dedicated 集群相同：

    - 启用多Replica至少需要 8 个 CU

    - 最多 10 个Replica

    - CU × Replica ≤ 2048

- Replica 扩缩容期间，全球集群的[优雅切换](./switchover-and-failover)（Switchover）将被阻止。

- Replica 扩缩容期间仍可触发[强切](./switchover-and-failover)（Failover），但扩缩容任务将失败，并在强切完成后自动重试。

## 常见问题\{#faqs}

1. **主集群和从集群可以设置不同的 Query CU 数量吗？**

    不可以。CU 扩缩容始终在主集群上发起，所有从集群自动跟随。这确保了全球集群中各集群的容量一致。

1. **不同集群可以设置不同的Replica数量吗？**

    可以。Replica扩缩容完全由各集群独立控制。当不同区域的流量模式不同时（例如高流量区域需要更多Replica，仅作备用的区域则可减少Replica），这一特性非常实用。

1. **优雅切换后，扩缩容设置会怎样？**

    优雅切换后，Query CU 扩缩容将以新的主集群为目标。各集群的Replica配置保持不变。