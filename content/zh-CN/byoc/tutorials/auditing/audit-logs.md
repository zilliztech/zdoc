---
title: "VectorDB 审计日志 | BYOC"
slug: /audit-logs
sidebar_label: "VectorDB 审计日志"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "审计日志允许管理员跟踪和监控 Zilliz Cloud 集群上的用户驱动的操作和 API 调用。此功能提供了数据平面活动的详细记录，包括向量搜索、查询执行、索引管理和其他数据操作。 | BYOC"
type: origin
token: OcSgw7LJwiyuC2kdymbcWDV6nNg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB 审计日志

审计日志允许管理员跟踪和监控 Zilliz Cloud 集群上的用户驱动的操作和 API 调用。此功能提供了数据平面活动的详细记录，包括向量搜索、查询执行、索引管理和其他数据操作。

<Admonition type="info" icon="📘" title="说明">

- 审计日志功能仅对 **Dedicated** 集群可见。如有需求，请考虑[升级集群](./manage-cluster)。

- 仅 Milvus 2.5.x 版本及以上的集群支持审计日志功能。

在 BYOC 项目中，VDB 审计日志直接写入您的数据面本地对象存储中指定路径下，确保您的数据不离开您的基础设施。如需启用或配置审计日志，请[联系我们](https://support.zilliz.com.cn/hc/zh-cn)。

</Admonition>

## 概述\{#overview}

审计日志记录跟踪数据平面上的各种操作，包括：

- **搜索和查询操作**：向量搜索、混合搜索和查询操作。

- **数据管理**：索引创建、集合创建、分区管理以及插入、删除和更新等实体操作。

- **系统事件**：用户访问尝试、授权检查和其他预定义操作。

<Admonition type="info" icon="📘" title="说明">

迁移、备份等数据任务和恢复等集群操作不会产生集群审计日志。您可前往组织事件页面查看相关操作记录。具体可参考[查看事件](./view-activities)。

</Admonition>

审计日志会定期转发到用户指定的对象存储桶。日志以结构化文件路径和命名格式存储，便于访问和管理：

- **文件路径**： `/<Cluster ID>/<Log type>/<Date>`

- **文件命名规则**：具体格式为 `<File name><File name suffix>`。`<File name>`的格式为 *HH:MM:SS-&#36;UUID*：*HH:MM:SS* 代表日志产生时的 UTC 时间戳；*&#36;UUID* 代表一个随机字符串，如 `09:16:53-jz5l7D8Q`。

以下是转发到存储桶的审计日志条目示例：

```json
{
    "date": "2025-01-21T08:45:56.556286Z",
    "action": "CreateAlias",
    "cluster_id": "in01-b5a7e190615ef9f",
    "database": "database2",
    "interface": "Restful",
    "log_type": "AUDIT",
    "params": {
        "collection": "collection1"
    },
    "status": "Receive",
    "time": 1737449156556,
    "trace_id": "b599063b9d0cfcf9d756ddbbef56ab5b",
    "user": "zcloud_apikey_admin"
}
```

有关审计日志支持的操作和对应的字段，请参阅[审计日志参考](./audit-logs-ref)。

<Admonition type="info" icon="📘" title="说明">

所有的审计日志将会直接推送到您在部署数据面时指定的对象存储桶内。

如需导出审计日志到您的日志系统做深入分析，请[联系我们](https://support.zilliz.com.cn/hc/zh-cn/requests/new)。

</Admonition>

