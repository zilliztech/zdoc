---
title: "版本说明书（2023/12/20） | Cloud"
slug: /release-notes-240
sidebar_key: release-notes-240
sidebar_label: "2023/12/20"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "我们很高兴地宣布 Zilliz Cloud 2.4.0 的发布。此版本引入了一系列增强和功能更新。主要包括 Partition SDK、集群管理接口以及其它方面的功能性增强。 | Cloud"
type: origin
token: GKNPwvWhZi7D6mkag72cIDWqnbf
sidebar_position: 22
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2023/12/20）

我们很高兴地宣布 Zilliz Cloud 2.4.0 的发布。此版本引入了一系列增强和功能更新。主要包括 Partition SDK、集群管理接口以及其它方面的功能性增强。

## Milvus 兼容性\{#milvus}

此次发布兼容 **Milvus 2.2.x** 以及 **Milvus 2.3.x (Beta)**。

## Partition SDK\{#partition-sdk}

您可以使用 SDK 在 Zilliz Cloud 集群中的 Collection 里创建和管理 Partition。具体内容，可参阅 [管理 Partition](./manage-partitions)。

值得注意的是，当您[在您的 Collection 中指定某字段为 Partition Key](./use-partition-key) 后，Zilliz Cloud 将接管该 Collection 中的所有 Partition。此时，你无法在该 Collection 中使用 Partition 相关接口。

## 集群管理接口\{#cluster-management-apis}

此次发布，我们为集群管理推出了一系列新的 RESTful 接口，包括[创建](/reference/restful/create-cluster)、[修改](/reference/restful/modify-cluster)和[删除](/reference/restful/drop-cluster)集群的接口以及用于[查看您的组织中所有项目详情](/reference/restful/list-projects)的接口。

## 其它增强\{#other-enhancements}

- 对所有项目的项目 ID 进行了重新配置，以便您通过接口获取项目相关情况。

- 增强错误消息内容，并提高业务稳定性，以便为您提供更加可靠的服务。

