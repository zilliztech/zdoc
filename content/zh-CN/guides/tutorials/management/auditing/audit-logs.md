---
title: "VectorDB 审计日志 | Cloud"
slug: /audit-logs
sidebar_label: "VectorDB 审计日志"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "审计日志允许管理员跟踪和监控 Zilliz Cloud 集群上的用户驱动的操作和 API 调用。此功能提供了数据平面活动的详细记录，包括向量搜索、查询执行、索引管理和其他数据操作。 | Cloud"
type: origin
token: OcSgw7LJwiyuC2kdymbcWDV6nNg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# VectorDB 审计日志

审计日志允许管理员跟踪和监控 Zilliz Cloud 集群上的用户驱动的操作和 API 调用。此功能提供了数据平面活动的详细记录，包括向量搜索、查询执行、索引管理和其他数据操作。

<Admonition type="info" title="说明">

- 审计日志功能仅对 **Dedicated** 集群可见。如有需求，请考虑[升级集群](./manage-cluster)。

- 仅 Milvus 2.5.x 版本及以上的集群支持审计日志功能。

- 审计日志支持与[阿里云对象存储](./integrate-with-alibaba-cloud-oss)或 [Amazon S3](./integrate-with-amazon-s3-cn) 集成。

</Admonition>

## 概述\{#overview}

审计日志记录跟踪数据平面上的各种操作，包括：

- **搜索和查询操作**：向量搜索、混合搜索和查询操作。

- **数据管理**：索引创建、集合创建、分区管理以及插入、删除和更新等实体操作。

- **系统事件**：用户访问尝试、授权检查和其他预定义操作。

<Admonition type="info" title="说明">

迁移、备份等数据任务和恢复等集群操作不会产生集群审计日志。您可前往组织事件页面查看相关操作记录。具体可参考[查看事件](./view-activities)。

</Admonition>

审计日志会定期转发到用户指定的对象存储桶。日志以结构化文件路径和命名格式存储，便于访问和管理：

- **文件路径**： `/<Cluster ID>/<Log type>/<Date>`

- **文件命名规则**：具体格式为 `<File name><File name suffix>`。`<File name>`的格式为 *HH:MM:SS-&#36;UUID*：*HH:MM:SS* 代表日志产生时的 UTC 时间戳；*&#36;UUID* 代表一个随机字符串，如 `09:16:53-jz5l7D8Q`。

以下是转发到存储桶的审计日志条目示例：

- **创建 Collection**

    ```json
    {
      "action": "CreateCollection",
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit",
        "consistency_level": 2
      },
      "status": "Receive",
      "timestamp": 1742983070463,
      "trace_id": "216a8129c06fd3d93a47bd69fa0a65ad",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

- **创建 Index**

    ```json
    {
      "action": "CreateIndex",
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit"
      },
      "status": "Receive",
      "timestamp": 1742983070645,
      "trace_id": "4402e7bfc498dd06be1408c7e6a7954d",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

- **删除 Index**

    ```json
    {
      "action": "DropIndex",
      "cluster_id": "inxx-xxxxxxxxxxxxxxx",
      "connection_uid": 456912553983082500,
      "database": "default",
      "interface": "Grpc",
      "log_type": "AUDIT",
      "params": {
        "collection": "test_audit"
      },
      "status": "Receive",
      "timestamp": 1742983073378,
      "trace_id": "066ec33c3f55d3edbf7d01c6270024e2",
      "user": "key-hwjsxhwppegkatwjaivsgf"
    }
    ```

有关审计日志支持的操作和对应的字段，请参阅[审计日志参考](./audit-logs-ref)。

## 开始前\{#before-you-start}

- 使用支持审计日志的 Dedicated 集群，并确认集群处于运行中。集群须使用 Milvus 2.5.x 或更高版本。

- 使用组织管理员或项目管理员账号。

- 如果集群已启用访问日志，请先确定需要保留哪种日志。审计日志和访问日志不能在同一集群同时启用，慢日志可独立配置。

- 在集群所属项目中准备[阿里云 OSS 存储集成](./integrate-with-alibaba-cloud-oss)，并确认集成可以写入目标存储桶。

## 启用审计日志转发\{#enable-audit-log-forwarding}

启用审计日志可能影响集群查询和写入性能，并产生审计日志 CU 费用。开启前请参阅[审计日志费用](./audit-log-cost)。

![I1hiwIU8lh04ADbBQdGceiHTnFM](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/I1hiwIU8lh04ADbBQdGceiHTnFM.png)

1. 登录 Zilliz Cloud 控制台，选择目标项目和集群。

1. 进入**日志**页签，在**审计日志**区域点击**配置**。

1. 在**审计日志设置**中，从**存储集成**下拉列表选择准备好的<strong>阿里云对象存储服务（OSS）</strong>集成。

1. 在**转发路径**中填写存储桶内的目录，例如 `audit-logs/`，然后点击**保存**。

## 验证日志是否送达\{#verify-that-logs-arrive}

1. 待审计日志启用后，对集群执行一次受支持的操作，例如查询已有 Collection，并记下操作时间。

1. 打开集成对应的 OSS 存储桶，进入**转发路径**指定的目录，查找该集群新生成的日志文件。打开文件并按操作时间核对对应记录。

有关支持的操作和日志字段，请参阅[VectorDB 审计日志参考](./audit-logs-ref)。

## 管理审计日志\{#manage-audit-log}

启用审计日志后，您可以根据需要编辑其配置或将其禁用。

![HFfowWebphLNCMbB7yacq1C1nzc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/HFfowWebphLNCMbB7yacq1C1nzc.png)

<Procedures>  

1. 进入目标集群的详情页面，点击 **日志** 页签。

1. 在 **审计日志** 区域，查看当前状态、存储集成和目录。

1. 如需修改配置，点击 **编辑**；如需禁用审计日志，点击 **编辑** 右侧的下拉箭头，选择禁用操作。

</Procedures>

## 常见问题\{#faq}

以下常见问题解答旨在帮助您解决在 Zilliz Cloud 上使用审计日志时可能遇到的问题。如需进一步帮助，请联系 [Zilliz Cloud 支持](https://zilliz.com.cn/contact-sales)。

- **如果审计日志的状态为异常，该怎么办？**

    **审计日志**状态为异常表示日志转发出现问题。可通过以下步骤进行排查：

    - **验证存储桶**：确认已正确配置存储桶，并且您拥有相应的访问权限。

    - **联系支持**：如果问题仍然存在，请联系 [Zilliz Cloud 支持](https://zilliz.com.cn/contact-sales)以获取进一步协助。

- **异常集群状态会影响审计日志服务吗？**

    集群状态异常意味着集群可能存在网络连接或 Zilliz Cloud 服务中断等问题。然而，这些问题并不会影响审计日志服务，该服务会继续正常运行并将日志转发到您的存储桶。如果您遇到持续性问题，请联系 [Zilliz Cloud 支持](https://zilliz.com.cn/contact-sales)。

