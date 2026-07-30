---
title: "回收站 | BYOC"
slug: /use-recycle-bin
sidebar_label: "回收站"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "如果您手动删除集群或因试用结束等原因而自动删除的所有集群，其对应的数据备份会进入 Zilliz Cloud 回收站，并提供 30 天的宽限期，后续您可以使用这些备份数据恢复到新集群。 | BYOC"
type: origin
token: FgDZw6JJuiICETkqrqHckN4pneb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 回收站

如果您手动删除集群或因试用结束等原因而自动删除的所有集群，其对应的数据备份会进入 Zilliz Cloud 回收站，并提供 30 天的宽限期，后续您可以使用这些备份数据恢复到新集群。

## 恢复回收站中的按量计费集群\{#restore-a-dropped-usage-based-cluster-in-the-recycle-bin}

<Procedures>

1. 进入已删除集群所属的组织。

1. 通过左侧导航栏或顶部导航栏中的垃圾箱图标进入回收站。

1. 在需要恢复的按量计费集群的操作栏中选择**恢复集群**。

1. 配置需要恢复的集群。

    1. 您可以将集群恢复到同一组织下的不同项目中，但是集群恢复不可跨云服务地域。

    1. 您可以修改集群名称和 Query CU 规格。

    1. 恢复页面可能允许您选择不同的目标 Milvus 版本。如果页面显示版本选择器，您可以为恢复后的集群选择 Milvus 版本；如果未显示版本选择器，则恢复后的集群将使用原集群的 Milvus 版本，且目标版本不可更改。

1. 点击**恢复**。Zilliz Cloud 将开始根据您在上一步骤中的配置创建新集群，并将你的数据恢复到集群中。

</Procedures>

<Admonition type="info" icon="📘" title="📘 说明">

集群恢复过程中，其状态将从**创建中**变为**恢复中**，最后变为**运行中**。集群状态变为**运行中**即代表所有被删除的数据已恢复。

</Admonition>

![recycle-bin-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/recycle-bin-cn.png "recycle-bin-cn")

