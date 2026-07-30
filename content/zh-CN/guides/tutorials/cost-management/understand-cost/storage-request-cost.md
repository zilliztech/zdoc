---
title: "存储请求费用 | Cloud"
slug: /storage-request-cost
sidebar_label: "存储请求费用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "存储请求费用属于存储费用，包含由 On-demand Search、索引构建任务以及 Volume 文件读写等操作产生的费用。 | Cloud"
type: origin
token: LuNmwpQRKiOz4ZkEkl4cTkNtnpk
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 存储请求费用

存储请求费用属于存储费用，包含由 On-demand Search、索引构建任务以及 Volume 文件读写等操作产生的费用。

## 存储请求费用来源\{#sources-of-storage-request-cost}

请求分为以下两类：

- **Class 1**: `PUT`, `COPY`, `POST`, `LIST`

- **Class 2**: `GET`, `SELECT`

Zilliz Cloud 中以下操作会产生存储请求费用：

- 在 On-demand 场景的 Database 中，为 Managed Collection 构建索引。这会同时产生 Class 1 和 Class 2 请求费用。

- 在 On-demand 场景的 Database 中，当仅加载索引时，对 Managed Collection 执行 Search。这会产生 Class 2 请求费用。

- 在分层存储的 Serving 集群上执行 Search，且需要从对象存储读取冷数据时。这会产生 Class 2 请求费用。

- Volume 文件操作，包括读取和写入。这会同时产生 Class 1 和 Class 2 请求费用。

以下操作不会产生存储请求费用：

- External Collection 上的所有操作。

- 将对象存储中的数据导入到按需场景的 Database 中。

- 在性能型或容量型 Serving 集群上创建索引或执行 Search。

### 计算公式\{#cost-calculation}

```plaintext
存储请求费用 = (Class 1 请求数量 x Class 1 单价)
           + (Class 2 请求数量 x Class 2 单价)
```

- **单价**: 由您的云地域和请求 Class 决定。详见 [Zilliz Cloud 列表价](https://zilliz.com.cn/pricing/pricing-guide)。

## 计算示例\{#example}

 假设您在一个计费周期内的使用情况如下：

- **地域**: 阿里云华东2（北京）

- **Class 1 请求数量**: 200,000

- **Class 2 请求数量**: 1,200,000

单价分别如下：

- **Class 1 单价** = ¥10 / 百万次请求

- **Class 2 单价** = ¥10 / 百万次请求

则，

`存储请求费用总和 = (0.2 × ¥10) + (1.2 × ¥10) = ¥14.00`。

