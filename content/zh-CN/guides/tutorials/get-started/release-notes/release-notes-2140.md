---
title: "版本说明书（2025/03/27） | Cloud"
slug: /release-notes-2140
sidebar_key: release-notes-2140
sidebar_label: "2025/03/27"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本次发布在 PRIVATE PREVIEW 中引入了数据平面审计日志功能。旨在通过提供在数据平面上执行的操作的详细日志来增强数据安全性。除了该功能外，Zilliz Cloud还修订了其优惠券策略。 | Cloud"
type: origin
token: NYaTwrUG1iT6CCkUSnJcCQPqnsb
sidebar_position: 12
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2025/03/27）

本次发布在 **PRIVATE PREVIEW** 中引入了数据平面审计日志功能。旨在通过提供在数据平面上执行的操作的详细日志来增强数据安全性。除了该功能外，Zilliz Cloud还修订了其优惠券策略。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.4.x**。

如果您希望体验 **Milvus v2.5.x** 的各项新功能，可以考虑在集群详情页面单击**试用公测版新功能**将您的集群升级到**公测版**。

![CQ2Bb4smUoGEehxHoqZcsdVUnHe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/CQ2Bb4smUoGEehxHoqZcsdVUnHe.png "CQ2Bb4smUoGEehxHoqZcsdVUnHe")

## 数据平面审计日志：提供全面的操作审计日志，为数据操作安全保驾护航\{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

数据平面审计日志功能可以让集群管理员监控和跟踪 Zilliz Cloud 集群用户的数据操作和 API 调用，包括向量搜索和查询、索引管理等各类数据操作，并提供全面的数据平面操作记录，为安全审计、合规审查和问题排查提供数据支撑，提升数据平面各类操作的可见性和集群管理员的数据洞察能力。

当在 Zilliz Cloud 集群中启用该功能后，Zilliz Cloud 会以流式数据的方式向用户指定的对象存储桶中存入审计日志。您可以使用第三方数据仓库服务对该对象存储桶中的日志进行审计分析，支撑对集群中数据操作的监控以便更好地进行安全审计和合规审查。

该功能现已作为**内测版**功能上线，如果您对该功能感兴趣，想要进一步了解服务价格或试用该功能，欢迎[联系我们](https://support.zilliz.com/hc/en-us)。关于如何在您的集群中开启该功能，可以参考[审计日志](./audit-logs)。

该功能现已支持记录超过 70 种操作和事件，涉及 Collection、Database、Entities（搜索、混合搜索、插入、更新、删除）、索引、Partition 和 别名等多种资源对象。Zilliz Cloud 还会在未来的版本中增加对更多的操作和事件的支持。关于当前已支持的操作和事件，可以参考[审计日志参考](./audit-logs-ref)。

## 其它增强\{#other-enhancements}

从本次发布开始，Zilliz Cloud 调整了其优惠券策略。关于本次发布后将执行的优惠券策略，可以参考[免费试用 Zilliz Cloud](./free-trials)。