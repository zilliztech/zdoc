---
title: "创建备份 | BYOC"
slug: /create-snapshot
sidebar_label: "创建备份"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，备份指的是数据副本，用于在发生数据丢失或系统故障时恢复整个集群或集群中的部分 Collection。 | BYOC"
type: origin
token: GFFswc3z1iQtjQkpmyScL00dnSx
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 备份
  - 快照

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 创建备份

在 Zilliz Cloud 中，备份指的是数据副本，用于在发生数据丢失或系统故障时恢复整个集群或集群中的部分 Collection。

本文将介绍如何**手动创建备份**。如需自动创建备份，请参见[创建自动备份](./schedule-automatic-backups)。

## 限制说明\{#limits}

- **访问控制**：仅项目管理员、组织管理员或拥有备份权限的自定义角色可执行备份操作。

- **不包含在备份中的内容**：

    - Collection 的 TTL 设置

    - Collection 和字段级别的 `mmap` 配置

    - 默认用户 `db_admin` 的密码（恢复时将重新生成新密码）

- **集群 Shard 设置**：集群的 Shard 信息会被备份，但如果在恢复集群过程中，您选择了减少集群 CU 规格，Shard 数量可能会根据 CU 规格有所调整，详见[使用限制](./limits#shards)。

- **备份任务限制**：

    - 在所有手动备份任务中，只有一个任务可以处于激活或挂起状态。

    - 如果开启了自动备份：

        - 若当前有自动备份正在运行，无法启动手动备份任务。

        - 若当前有手动备份正在进行，自动备份仍将按计划执行。

## 创建集群备份\{#create-cluster-backup}

您可以备份整个集群，并在需要时恢复整个集群或集群中的部分 Collection。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何通过 Zilliz Cloud 控制台创建集群备份。

<Supademo id="cmcsuck620is09st88znq9ysd?utm_source=link" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何为集群 `in01-xxxxxxxxxxxxxx` 创建集群备份。更多 API 参数细节，请参见[创建备份](/reference/restful/create-backup-v2)。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Content-Type: application/json" \
     --data-raw '{
            "backupType": "CLUSTER"
      }'
```

示例返回结果如下。系统会生成一个备份任务，您可在项目下的[任务中心](./job-center)查看进度：

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup0_c7b18539b97xxxx",
    "backupName": "Dedicated-01_backup2",
    "jobId": "job-031a8e3587ba7zqkadxxxx"
  }
}
```

## 创建 Collection 备份\{#create-collection-backup}

如需备份某个特定 Collection 或集群中的部分 Collection，请创建 Collection 级别的备份。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何通过控制台创建 Collection 备份。

<Supademo id="cmcsuwoo20jn49st8cbnydkj0?utm_source=link" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何为集群 `in01-xxxxxxxxxxxxxx` 中的 `medium_articles` Collection 创建备份。更多 API 参数细节，请参见[创建备份](/reference/restful/create-backup-v2)。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "backupType": "COLLECTION",
    "dbCollections": [
        {
            "collectionNames": [
                "medium_articles"
            ]
        }
    ]
}'
```

示例返回结果如下。系统会生成一个备份任务，您可在项目下的[任务中心](./job-center)查看进度：

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "backupType": "COLLECTION",
    "dbCollections": [
        {
            "collectionNames": [
                "medium_articles"
            ]
        }
    ]
}'
```

## 常见问题\{#faqs}

**备份任务一般需要多久？**
备份所需时间取决于数据大小。备份 700 MB 数据大约需要 1 秒。如果集中包含超过 1,000 个 Collection，备份所需时间可能略有延长。

**备份过程中可以执行 DDL 操作吗？**
建议在备份任务进行时避免频繁执行 DDL 操作（如创建或删除 Collection），否则可能导致备份数据不一致。

**删除集群后，手动创建的集群备份文件会被删除吗？**
不会。手动创建的集群备份会被永久保留，即使原集群被删除也不会影响手动创建的备份。您可以按序进行手动删除。