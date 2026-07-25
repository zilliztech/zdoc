---
title: "使用回收站 | Cloud"
slug: /use-recycle-bin
sidebar_key: use-recycle-bin
sidebar_label: "使用回收站"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 回收站会在您手动删除或因试用结束等原因而自动删除的所有 Serverless 和 Dedicated 集群，并提供 30 天的宽限期，以便您恢复这些集群。 | Cloud"
type: origin
token: FgDZw6JJuiICETkqrqHckN4pneb
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 组织
  - organizations
  - 使用回收站

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 使用回收站

Zilliz Cloud 回收站会在您手动删除或因试用结束等原因而自动删除的所有 Serverless 和 Dedicated 集群，并提供 30 天的宽限期，以便您恢复这些集群。

## 前提条件\{#prerequisites}

如需还原回收站中集群，请先添加[支付方式](/docs/payment-billing)。

## 恢复回收站中的按量计费集群\{#restore-a-dropped-usage-based-cluster-in-the-recycle-bin}

<Procedures>

1. 进入已删除集群所属的组织。

1. 通过左侧导航栏或顶部导航栏中的垃圾箱图标进入回收站。

1. 在需要恢复的按量计费集群的操作栏中选择**恢复集群**。

1. 配置需要恢复的集群。

    1. 您可以将集群恢复到同一组织下的不同项目中，但是集群恢复不可跨云服务地域。

    1. 您可以修改集群名称和 Query CU 规格。

1. 点击**恢复**。Zilliz Cloud 将开始根据您在上一步骤中的配置创建新集群，并将你的数据恢复到集群中。

</Procedures>

<Admonition type="info" icon="📘" title="说明">

集群恢复过程中，其状态将从**创建中**变为**恢复中**，最后变为**运行中**。集群状态变为**运行中**即代表所有被删除的数据已恢复。

</Admonition>

![recycle-bin-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/recycle-bin-cn.png "recycle-bin-cn")

