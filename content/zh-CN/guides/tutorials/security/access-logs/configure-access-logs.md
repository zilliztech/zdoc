---
title: "配置访问日志 | Cloud"
slug: /configure-access-logs
sidebar_key: configure-access-logs
sidebar_label: "配置访问日志"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "本指南涵盖 Zilliz Cloud 集群上访问日志的完整生命周期：启用、调整设置和停用。 | Cloud"
type: origin
token: Wl2PwW2aAiYakOk4c8scRPLBn9b
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 访问
  - 日志
  - 配置

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 配置访问日志

本指南涵盖 Zilliz Cloud 集群上访问日志的完整生命周期：启用、调整设置和停用。

<Admonition type="info" icon="📘" title="说明">

- 本版本仅支持搜索和查询类操作的日志记录：Search、HybridSearch 和 Query。完整操作列表的支持将在后续版本中提供。

- 本版本中，审计日志和访问日志互斥，同一时间只能开启其中一个。

- 访问日志仅适用于 Enterprise 项目下的 Dedicated 集群。如果你的集群使用的是其他套餐或集群类型，建议升级到 Enterprise Dedicated 集群后再启用访问日志。

</Admonition>

## 开始之前\{#before-you-start}

- 在目标集群所在区域配置了对象存储集成。有关设置说明，请参阅集成[阿里云对象存储](./integrate-with-storage-bucket)或 [Amazon S3](./integrate-with-amazon-s3)。

- 拥有该项目的 Organization Owner, Project Admin 或 Cluster Admin 权限。如果你没有所需权限，请联系你的 Zilliz Cloud 管理员。

## 启用访问日志\{#enable-access-logs}

<Supademo id="cmnpwfeyo8xu6abur593l0ad2" title=""  />

<Procedures>

1. 打开 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，导航到目标集群。

1. 在集群配置页面，选择**访问日志**页签，然后点击**开启**。

1. 在弹出的对话框中，配置以下选项：

    - **存储集成**：选择用于接收日志文件的集成存储桶。

    - **目录**：指定存储桶中用于存放审计日志的目录路径。

    - **采样率**：设置需要记录的查询比例。100% 表示记录每一次操作。对于高负载工作负载，可以选择较低的比例（例如 1%），在保持统计意义的同时降低存储成本。

    - **操作类型**：指定哪些操作类型（例如 Search 或 HybridSearch）会被记录为访问日志条目。

    - **输出字段**：指定写入对象存储的每条访问日志中包含哪些元数据字段。标记为**固定包含**的字段会在每条日志中记录，被选中的字段则会作为补充一并写入。

1. 点击**保存**。日志文件将在几分钟内出现在你的存储桶中，路径遵循 `/<Cluster ID>/Access/<Date>/<HH:MM:SS>-<UUID>.log` 约定。

</Procedures>

## 更改访问日志设置\{#edit-access-log-settings}

你可以随时调整采样率和输出参数，无需停用访问日志。

<Procedures>

1. 打开 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，导航到你的集群。

1. 在集群配置页面，选择**访问日志**页签。

1. 点击**编辑**。

1. 根据需要调整访问日志配置。

1. 点击**保存**以应用更改。更新后的设置立即对新日志记录生效。存储桶中已有的日志文件不受影响。

</Procedures>

## 停用访问日志\{#disable-access-logs}

<Procedures>

1. 打开 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，导航到你的集群。

1. 在集群配置页面，选择**访问日志**页签。

1. 点击 **Disable**。新的日志记录立即停止。存储桶中已有的日志文件将保留。确认后访问日志的计费随即停止。

</Procedures>