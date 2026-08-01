---
title: "变更配置费用说明 | Cloud"
slug: /notice-on-config-changes
sidebar_label: "变更配置费用说明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持您根据业务和数据量的变化灵活变更集群配置。您可以为通过修改集群 Query CU 数量进行扩缩容，或者增加集群 Replica 数量从而提高 QPS。 | Cloud"
type: origin
token: GMCvwBlS7io85jkiW0icumJnn6A
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 变更配置费用说明

Zilliz Cloud 支持您根据业务和数据量的变化灵活变更集群配置。您可以为通过修改集群 Query CU 数量进行扩缩容，或者增加集群 Replica 数量从而提高 QPS。

本文介绍按量付费集群和包年包月集群变更配置的费用说明。

## 按量计费集群变更配置\{#}

按量计费集群按小时收费，变更配置后按照新的配置每小时收费。

## 包年包月集群变更配置\{#}

包年包月集群当前仅支持升配，不支持降配，且按天为单位结算。以下为不同变配方式的计费说明。

![scale-methods-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/scale-methods-cn.png "scale-methods-cn")

### 仅升配\{#}

```plaintext
待支付订单金额 = （升配后 Query CU 数量 - 升配前 Query CU 数量）x 单价 x 集群剩余天数 x 折扣
```

- 升配后 Query CU 数量 = 升配后 Query CU 数量 x 升配后 Replica 数量

- 升配前 Query CU 数量 = 升配前 Query CU 数量 x 升配前 Replica 数量

- 单价由云服务地域和集群类型决定，详情请参考 [Zilliz Cloud 定价](https://zilliz.com.cn/pricing)。

- 折扣由集群剩余时长决定。

    | **集群剩余时长** | **折扣** | **说明** |
    | --- | --- | --- |
    | < 1 年 | 无 | 集群剩余时长小于 1 年时无折扣，按官网列表价的原价计算订单金额。 |
    | 1-3 年 | 7 折 | 集群剩余时长大于等于 1 年且小于 3 年时享受 7 折优惠，按官网列表价的 7 折计算订单金额。 |

#### **示例**\{#}

假设您购买的包年包月集群升配前配置如下：

- 购买时长：3 年

- 云服务提供商和地域：阿里云华东1（杭州）

- Query CU 数量：2

- 集群类型：性能型

- Replica 数量：1

根据集群云服务提供商和地域以及 CU 类型，查询 Zilliz 官网列表价可得，单价原价为 ¥1.25/小时 x 24 小时 = ¥30.00/天。

假设您在以下时期将包年包月集群扩容至 4 Query. CU，Replica 数量不变。

- **集群剩余天数为 30 天时，待支付订单金额 =（4 Query CU x 1 Replica - 2 Query CU x 1 Replica） x ¥30.00/天 x 30 天 x 100% = ¥1800.00**

- **集群剩余天数为 2 年时，待支付订单金额 =（4 Query CU x 1 Replica - 2 Query CU x 1 Replica）  x ¥30.00/天 x 730 天 x 70%= ¥30660.00**

### 升配同时延长集群有效期\{#}

```plaintext
待支付订单金额 = 升配后新集群的包年包月订单金额 - 升配前老集群的剩余金额
```

升配后新集群的包年包月订单金额 = 新集群 Query CU 数量 x 新集群 Replica 数量 x  单价 x 新订阅时长 x 新折扣

升配前老集群的剩余金额 = 原集群 Query CU 数量 x 原集群 Replica 数量 x  单价 x 原集群剩余订阅时长 x 原折扣

- 单价由集群类型以及云服务提供商和地域决定。详情请参考 [Zilliz Cloud 定价](https://zilliz.com.cn/pricing)。

- 新折扣由新的订阅时长决定（阿里云、腾讯云：三年 5 折，一年 7 折）。

#### 示例\{#}

假设您购买的包年包月集群升配前配置如下：

- 购买时长：3 年

- 云服务提供商和地域：阿里云华东1（杭州）

- Query CU 数量：2

- Replica 数量：1

- 集群类型：性能型

- 原折扣：5 折

- 剩余订阅时长：6 个月

现在您需要将集群从 2 Query CU 扩容至 4 Query CU 并延长集群有效期 1 年（12 个月）。

根据集群云服务提供商和地域以及集群类型，查询 Zilliz 官网列表价可得，按月单价原价为 ¥1.25/小时 x 24 小时 x 30 天 = ¥900.00/月。续订一年享 7 折优惠。

**升配后新集群的包年包月订单金额 = 4 Query CU x 1 Replica x ¥900.00/月 x 12 个月 x 70% = ¥30240.00**

**升配前老集群的剩余金额 = 2 Query CU x 1 Replica x ¥900.00/月 x 6 个月 x 50% = ¥5400.00**

**待支付订单金额 = ¥30240.00 - ¥5400.00 = ¥24840.00**

