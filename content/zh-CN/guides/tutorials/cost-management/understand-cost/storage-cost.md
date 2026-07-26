---
title: "存储费用 | Cloud"
slug: /storage-cost
sidebar_label: "存储费用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，无论集群是否运行，只要存储了数据或备份文件，就会产生存储费用。 | Cloud"
type: origin
token: Lv3Awu3uHiZ99AkGKXYc7D0JnCd
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 存储费用

在 Zilliz Cloud 中，无论集群是否运行，只要存储了数据或备份文件，就会产生存储费用。

## 存储费用来源\{#sources-of-storage-costs}

在以下场景中，您会被收取存储费用：

- **Dedicated 集群**：存储在您的 Dedicated cluster 中的数据。

- **Serverless 集群**：存储在您的 Serverless cluster 中的数据。

- **Database**：存储在用于按需搜索的 Database 中的数据。

    - Managed Collection 中的数据和索引。

    - External Collection 中的索引。

- **备份存储**：为数据容灾创建的[备份](./undefined)文件。

- **Managed Volume 存储**：在 [Managed Volume](./managed-volume) 中存储的结构化数据表或非结构化数据文件，用于后续导入或迁移操作。

## 计算公式\{#cost-calculation}

```plaintext
存储费用 = 存储单价 × 数据量 × 存储时长
```

- 存储单价：由集群云地域和类型决定。详见 [Zilliz Cloud 定价](https://zilliz.com.cn/pricing)。

- 数据量：存储的所有数据或备份文件的大小，以 GB 为单位。

- 存储时长：数据或备份文件在 Zilliz Cloud 中存储的时间长度。

### 冷存储访问\{#cold-data-access}

<Admonition type="info" icon="📘" title="📘 说明">

该计费项仅适用于升级至 Milvus 2.6.x 版本的分层存储型集群。

</Admonition>

如果您的集群类型为**分层存储型**，还会产生额外的冷存储访问费用。以下公式展示了如何计算冷存储访问费用。

```bash
冷存储访问费用 =  冷存储访问单价 x 冷数据大小
```

- 冷存储访问单价：由集群云地域决定。详见 [Zilliz Cloud 定价](https://zilliz.com.cn/pricing)。

- 冷数据大小：每个读请求（Search 或 Query）中扫描的对象存储中冷数据大小，以 GB 为单位。

## 计费规则\{#billing-rules}

集群存储与备份存储的计费规则略有不同：

- **Dedicated & Serverless 集群、Volume 和 Database 存储**：按小时计费。存储不满 1 小时，按 1 小时计费。

- **备份存储**：按天计费。存储不满 1 天，按 1 天计费。

## 计算示例\{#examples}

以下几个计算示例旨在帮助您了解如何计算存储费用。

### 示例 1：集群存储费用\{#example-1-cluster-storage-cost}

假设您的集群配置如下：

- **云服务提供商和地域**：阿里云华东1（杭州）

- **集群类型**：性能型

- **数据量**：500 GB

- **存储时长**：29 天 23 小时 30 分钟

根据云服务提供商和地域、集群类型这两个信息，您可以在官网的[定价](https://zilliz.com.cn/pricing)页面查看存储单价为每月 ¥0.50 GB。

根据[计费规则](./storage-cost#billing-rules)，由于数据存储不满 1 小时将仍旧按照 1 小时计费，因此存储时长将被计算为 30 天（1 个月）。

那么，`存储费用 = ¥0.50 × 500 × 1 = ¥250`。

### 示例 2：备份存储费用\{#example-2-backup-storage-cost}

假设您的集群配置如下：

- **云服务提供商和地域**：阿里云华东1（杭州）

- **集群类型**：性能型

- **备份文件大小**：20 GB

- **备份文件保留时长**：44 天 6 小时

根据云服务提供商和地域、集群类型这两个信息，您可以在官网的[定价](https://zilliz.com.cn/pricing)页面查看存储单价为每月 ¥0.50 GB。

根据[计费规则](./storage-cost#billing-rules)，由于备份文件存储不满 1 天将仍旧按照 1 天计费，因此存储时长将被计算为 45 天（1.5个月）。

那么，`存储费用 = ¥0.50 × 20 × 1.5 = ¥15.00`。

### 示例 3：Volume 存储费用\{#example-3-volume-storage-cost}

假设您向 Volume 上传了 **10 GB** 的数据用于导入，并将数据在 Volume 中保留 **1 个月**，按单价**每月 ¥0.5/GB** 计算，费用为 `¥0.5 × 10 × 1 = ¥5.00`。

## 常见问题\{#}

1. **集群挂起后是否仍会收取存储费用？**
 是的。只要您的集群数据、备份文件仍然保留，即使集群已暂停，仍会收取存储费用。

1. **存储费用是否有最低收费？**
 是的。

    - 集群数据存储：最低收取 1 小时费用。即集群数据如果存储不满 1 小时，按 1 小时计费。

    - 备份存储：最低收取 1 天费用。即备份如果存储不满 1 天，按 1 天计费。

