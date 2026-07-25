---
title: "审计日志费用 | Cloud"
slug: /audit-log-cost
sidebar_key: audit-log-cost
sidebar_label: "审计日志"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，当您启用审计日志功能时，系统会部署日志服务。日志的采集、处理与转发过程会消耗额外的系统资源，因此会产生相应的费用。 | Cloud"
type: origin
token: HrONwUQ4riQnbgkZGY0ceLp9nUg
sidebar_position: 7
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 支付方式
  - 账单
  - 审计日志
  - 费用

---

import Admonition from '@theme/Admonition';


# 审计日志费用

在 Zilliz Cloud 中，当您启用[审计日志](./audit-logs)功能时，系统会部署日志服务。日志的采集、处理与转发过程会消耗额外的系统资源，因此会产生相应的费用。

审计日志的总费用为以下几部分的总和：

- [审计日志 CU 费用](./audit-log-cost#audit-log-cu-cost)：日志采集与处理过程中消耗的计算资源费用。

- [数据传输费用](./audit-log-cost#)：将审计日志转发到对象存储所产生的数据传输费用。

## 审计日志 CU 费用\{#audit-log-cu-cost}

```plaintext
审计日志 CU 费用 = 审计日志 CU 单价 × Query CU 总数 × 审计日志运行时长
```

- **审计日志 CU 单价**：由集群地域和项目版本决定。详见 [Zilliz Cloud 定价指南](https://zilliz.com.cn/pricing/pricing-guide)。

-  **Query CU 总数**：集群中 Query CU 的总数量，需要乘以 Replica 数量。

    ```plaintext
    Query CU 总数 = Query CU 数量 × Replica 数量
    ```

    示例： 假设集群 Query CU 数量为 2，副本数量为 2，该集群的 Query CU 总数为 2 x 2 = 4 CU。

- **审计日志运行时长**：审计日志功能启用的总时长。计算方式为：`运行时长 = 停用时间点 − 启用时间点`。
 如果集群处于 “已挂起” 状态，则这段时间不计入运行时长，因为此时审计日志功能不消耗计算资源。点击[此处](./audit-log-cost#example)查看运行时长计算示例。

## 数据传输费用\{#}

您可以将审计日志转发到指定的云服务对象存储桶。目前，Zilliz Cloud 仅支持将日志转发到与集群位于同一云地域的对象存储桶。

同区域数据传输当前不收取费用。

具体的数据传输费用计算规则，详见[数据传输费用](./data-transfer-cost)。

## 计算示例\{#example}

假设您的集群配置如下：

- **项目版本**：企业版

- **集群部署方式**：Dedicated

- **云服务提供商和地域**：阿里云华东1（杭州）

- **集群类型**：性能型

- **Query CU**：8 CU

- **Replica 数量**：2

- **审计日志运行时长：**

![CJ12wu8gZhhQfdbUC8ecHOWxnwd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CJ12wu8gZhhQfdbUC8ecHOWxnwd.png)

如上图所示，

- 2025 年 8 月 1 日 12:00 启用审计日志

- 2025 年 8 月 1 日 24:00 挂起集群

- 2025 年 8 月 2 日 12:00 恢复运行集群直至 2025 年 8 月 3 日 12:00 删除集群

因此，`运行时长 = (24 − 12) + 24 = 36 小时`。

根据项目版本、云服务提供商和地域、CU 类型这三个信息，您可以在官网的[定价](https://zilliz.com.cn/pricing/pricing-guide)页面查看 CU 单价为 ￥0.15625/小时。

根据 Query CU 和 Replica 数量两个信息，得出 `Query CU 总数 = 8 CU x 2 Replica = 16 CU`。

审计日志 CU 费用为 `￥0.15625 x 16 x 36 = ¥90`。

由于是同地域转发审计日志，所以数据传输费用 = ¥0。

总审计日志费用为 `¥90 + ¥0 = ¥90`。

## 常见问题\{#faqs}

1. **如果挂起集群，审计日志还会产生费用吗？**
 不会。审计日志 CU 费用只在功能启用且集群处于运行状态时收取费用，集群挂起状态下暂停计费。

1. **转发审计日志时会收取数据传输费用吗？**
 同地域转发免费。跨区域转发（当前暂不支持）可能会产生额外费用。

1. **如果启用了审计日志但没有生成任何日志，还会收费吗？**
 会。审计日志 CU 费用基于 Query CU 总数和功能运行时长计算，与实际日志数量无关。如果无日志生成，数据传输费用可能为 ¥0。

1. **费用是否会因日志量不同而变化？**
 不会。审计日志 CU 费用仅与 Query CU 总数和运行时长相关，与日志量无关。

