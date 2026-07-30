---
title: "全球集群概览 | Cloud"
slug: /global-cluster-explained
sidebar_label: "全球集群概览"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 全球集群允许您在同一云服务商上跨多个地域部署一个主集群和多个只读从集群。 | Cloud"
type: origin
token: LdpTwpzkFinz6lkW3Jpce7QQnJd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 全球集群概览

Zilliz Cloud 全球集群允许您在同一云服务商上跨多个地域部署**一个主集群**和**多个只读从集群**。

该功能专为全球分布式的关键业务应用设计，帮助您实现区域级故障容灾，并为全球用户提供低延迟的本地读取能力。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 概览\{#overview}

1 个 Zilliz Cloud 全球集群由 **1 个主集群**和**最多 5 个只读从集群**组成，且它们部署在同一云服务商的不同地域中。

- **主集群（Primary cluster）**：系统的核心。负责处理所有写入操作；其处理读请求的能力与所有从集群相同。

- **从集群（Secondary clusters）**：分布在不同地域的从集群。主要承担两项关键作用：作为灾难恢复的备用集群和为所在地域用户提供本地只读访问。

所有数据被写入到主集群。Zilliz Cloud 会自动将主集群的数据变更复制到所有从集群。

下图展示了 Zilliz Cloud 中全球集群的运作方式。

![LkNJwgG0ihWGODbDLhyctH6Znud](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/LkNJwgG0ihWGODbDLhyctH6Znud.png)

这种多区域架构提供以下优势：

- **区域级故障容灾**：当主集群发生故障或中断时，您可以将从集群提升为主集群。

- **低延迟读取**：由于数据的完整副本分布在多个地理位置，应用程序可以从最近的区域读取数据，从而最大程度地降低延迟。

## 典型使用场景\{#typical-use-cases}

全球集群功能有两个典型的使用场景：

- **灾难恢复与高可用**：在多个区域部署集群以实现故障切换。在此场景下，通过全球 Endpoint（一个固定不变的统一 URL）进行连接。Zilliz Cloud 会自动将写入请求路由到主集群，将读取请求路由到延迟最低的最近从集群。在切换或故障转移期间，端点会自动重新路由，无需修改任何代码。

- **跨环境数据复制**：在相同或不同区域中运行多个集群（例如生产环境和测试环境），并在它们之间复制数据。在此场景下，使用各集群的公网端点直接连接。

详情请参阅[连接全球集群](./connect-to-global-cluster)。

## 切换与故障转移\{#switchover-and-failover}

Zilliz Cloud 全球集群支持优雅切换（switchover）和强切（failover）。两种操作都会更改主集群所在的区域，全球 Endpoint 会自动重新路由。

详情请参阅[优雅切换和强切](./switchover-and-failover)。

## 计费\{#billing}

在全球集群中，主集群与从集群都会按常规 Zilliz Cloud [Dedicated 集群](./dedicated-cluster-cost)进行计费（计算与存储），并额外收取集群间数据复制产生的[数据传输费用](./data-transfer-cost)。

假设您的全球集群配置为：

- 区域 A 的主集群 `cluster_01`

- 2 个从集群：

    - 区域 B 的 `cluster_02`

    - 区域 C 的 `cluster_03`

将收取以下费用：

- `cluster_01`、`cluster_02`、`cluster_03` 的向量数据库（计算）费用

- `cluster_01`、`cluster_02`、`cluster_03` 的存储费用

- 从 `cluster_01` 到 `cluster_02`、`cluster_03` 的数据传输费用

如需详细价目表，请参见 [Zilliz Cloud 列表价](https://zilliz.com.cn/pricing/pricing-guide?provider=ali&region=ali-cn-hangzhou)。

<Admonition type="info" icon="📘" title="说明">

[强切](./switchover-and-failover)后后进入回收站的废弃集群仅按存储计费。

</Admonition>

## 注意事项\{#considerations}

- **项目版本限制**: 如需开通功能，请[提交工单](http://support.zilliz.com.cn)。开通后，您需要创建多地域项目，才能使用此功能。此外，全球集群中可部署的从集群地域受限于您的项目所支持的地域。

- **访问控制**:  需要具备项目管理员权限

- **集群配置**：

    - 最多可添加 5 个从集群。

    - 从集群必须与主集群使用相同的云服务商和集群类型。

    - Query CU 数量由主集群控制，从集群自动跟随调整。

    - 副本数量由各集群独立控制。动态扩缩容和定时扩缩容也各自独立配置。

- **集群操作**：

    并非所有集群操作在主集群和从集群上都可用。下表汇总了各操作的支持情况。

    | **操作** | **主集群** | **从集群** | **说明** |
    | --- | --- | --- | --- |
    | 读取（search、query） | 是 | 是 | -- |
    | 写入（insert、upsert、delete） | 是 | 否 | 仅主集群接受写入操作。向从集群写入将会失败。 |
    | Query CU 扩缩容 | 是 | 否 | Query CU 变更应用于主集群，从集群自动跟随调整。 |
    | 副本扩缩容 | 是 | 是 | 各集群独立控制副本数量。动态扩缩容和定时扩缩容配置也各自独立。 |
    | 数据导入（Import） | 否 | 否 | 即将支持。 |
    | 数据迁移（Migration） | 是 | 否 | 仅主集群支持迁移。迁移到主集群的所有数据将自动复制到从集群。 |
    | 备份（Backup） | 是 | 否 | 仅可为主集群创建备份。自动备份策略也仅在主集群上运行。 |
    | 恢复（Restore） | 否 | 否 | 即将支持。 |
    | 挂起/恢复运行（Suspend / Resume） | 否 | 否 | 所有主集群和从集群均不可挂起。 |
    | 优雅切换（Switchover） | 是 | — | 仅在所有主集群和从集群均处于 RUNNING 状态时才能触发。 |
    | 强切（Failover） | 是 | — | 可随时触发。这是一项高风险的紧急操作。 |

- **不支持的功能**

    - 全球 Endpoint 不支持通过 Private Link 访问和设置私有 Endpoint。

    