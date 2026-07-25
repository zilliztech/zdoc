---
title: "免费试用 Zilliz Cloud | Cloud"
slug: /free-trials
sidebar_key: free-trials
sidebar_label: "免费试用 Zilliz Cloud"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "为帮助您测试 Zilliz Cloud 向量数据库特性和评估使用成本，Zilliz Cloud 提供 Free 集群和免费试用。您仅需注册账号即可，无需绑定支付方式。 | Cloud"
type: origin
token: WWlIwejMNiAEmmkce5fcZu4UnMd
sidebar_position: 7
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 免费
  - 试用

---

import Admonition from '@theme/Admonition';


# 免费试用 Zilliz Cloud

为帮助您测试 Zilliz Cloud 向量数据库特性和评估使用成本，Zilliz Cloud 提供 **Free 集群**和**免费试用**。您仅需[注册账号](./register-with-zilliz-cloud)即可，无需绑定支付方式。

## 免费集群\{#free-cluster}

Zilliz Cloud 提供 Free 集群，允许您免费使用基础的向量数据库功能。Free 集群提供：

- 5 GB 存储（可容纳 100 万个 768 维向量）

- 每月 250 万免费 vCU 额度

- 5 个 Collection

如需更多资源或使用高级功能，请免费试用 Serverless 或 Dedicated 版本。

## 免费试用\{#use-free-trial}

Zilliz Cloud 提供 Serverless 和按量计费的 Dedicated 集群的免费试用，帮助您探索向量数据库功能。以下内容将介绍优惠券和集群免费试用。如果您想要免费试用 Volume 功能——用于存储结构化表格或非结构化数据文件的对象存储，请参考了解 Volume。

### 免费试用说明\{#use-free-trial}

首次使用企业邮箱注册 Zilliz Cloud 账号时，您的组织将获赠 **¥300** 优惠券，有效期为 **30 天**，可用于试用 Serverless 和按量计费的 Dedicated 集群。优惠券使用完毕或过期时即视为免费试用结束。

免费试用结束后，您的组织将被冻结。在此期间，组织中的 Serverless 和 Dedicated 集群将被移至[回收站](./use-recycle-bin)，您将无法使用 Dedicated 和 Serverless 集群特有的高级功能（如备份恢复、告警等）。

如需解冻组织，请[添加支付方式](./payment-billing)。在此之后，您可以从回收站中恢复数据。如果在组织冻结 30 天后仍未添加支付方式，您的 Serverless 和 Dedicated 集群将被永久删除，但您的组织仍被保留。

### 获取优惠券及延长优惠券有效期\{#earn-credits-and-extend-credit-expiration}

使用企业邮箱注册 Zilliz Cloud 账号后您即可获得 ¥300 优惠券。如果您绑定了云市场支付方式，优惠券有效期可延长至 **1 年**。

如需更多优惠券或延长试用期，请[联系销售](https://zilliz.com.cn/contact-sales)。

### 查看优惠券余额\{#view-credit-balance}

您可以通过左侧导航栏底部的卡片，快速查看优惠券余额及有效期。

或者，您也可以前往**账单概览**页，通过**优惠券**卡片，查看优惠券余额。

![view-credit-balance-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/view-credit-balance-cn.png "view-credit-balance-cn")

<Admonition type="info" icon="📘" title="说明">

为节省优惠券，我们建议您手动挂起未使用的集群。

</Admonition>

### 免费试用相关邮件提醒\{#free-trial-notifications}

在免费试用期间，Zilliz Cloud 会向组织管理员发送以下邮件通知，提醒您免费试用的情况。

- 优惠券发送 3 天内未使用。

- 您已使用 60% 的优惠券。

- 优惠券有效期不足 3 天。

- 免费试用到期后未添加支付方式，导致组织被冻结。

- 即将在免费到期结束后将 Serverless 和 Dedicated 集群移至回收站。

- 免费试用到期，Serverless 和 Dedicated 集群已被移至回收站。

- 所有优惠券已使用完毕。

## 文档推荐\{#related-topics}

- [连接集群](./connect-to-cluster)

- [创建 Collection](./manage-collections-sdks)

- [插入与删除](./insert-update-delete)

- [搜索与重排](./search-query-get)

