---
title: "恢复备份 | Cloud"
slug: /restore-from-snapshot
sidebar_key: restore-from-snapshot
sidebar_label: "恢复备份"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供的恢复功能可用于在发生意外删除、数据损坏或系统故障时，从备份文件中恢复数据，保障业务连续性。这是一种可靠的手段，可用于灾难恢复、撤销错误更改，或创建用于测试的集群副本，将业务中断最小化。 | Cloud"
type: origin
token: NtkswF6UEi3kB0k8XSEcOKkhnld
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 备份
  - 恢复

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 恢复备份

Zilliz Cloud 提供的恢复功能可用于在发生意外删除、数据损坏或系统故障时，从备份文件中恢复数据，保障业务连续性。这是一种可靠的手段，可用于灾难恢复、撤销错误更改，或创建用于测试的集群副本，将业务中断最小化。

本文将介绍如何通过备份文件恢复**整个集群**或**部分集群数据**。

## 限制说明\{#limits}

- **访问控制**：仅项目管理员、组织管理员或拥有备份权限的自定义角色可执行备份操作。

- 包年包月集群暂不支持恢复备份，如有需求，请[联系我们](http://support.zilliz.com.cn)。

## 恢复整个集群\{#restore-a-full-cluster}

您可以将整个集群（包括集群下所有 Database 和 Collection）恢复到一个新集群中，适用于测试环境数据克隆或生产环境数据恢复。如需恢复整个集群，所用备份文件必须为**集群级别备份**。

恢复过程中，您可以选择是否一并恢复 RBAC 权限设置。

<Admonition type="info" icon="📘" title="说明">

 目前仅支持通过 Web 控制台选择恢复 RBAC 权限设置，RESTful API 暂不支持。

</Admonition>

恢复完成后，系统会为默认用户 `db_admin` 生成一个新密码，您需使用新密码连接至新集群。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何在 Zilliz Cloud 控制台中恢复整个集群：

<Supademo id="cmcswsqmt0lro9st8cllvfbnn" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何通过集群备份文件将集群恢复至名为 `Dedicated-01-backup` 的新集群。更多 API 参数细节，请参见[恢复集群备份](/reference/restful/restore-cluster-backup-v2)。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP"
      }'
```

示例返回结果如下。系统将生成一个恢复任务，您可在项目下的[任务中心](./job-center)查看进度：

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "username": "db_admin",
    "password": "xxxxxxxxx",
    "jobId": "job-xxxxxxxxxxxxxx"
  }
}
```

## 恢复部分集群数据\{#restore-a-partial-cluster}

您也可以选择将特定的 Database 和 Collection 恢复到已有集群中。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何在控制台中恢复指定 Database 和 Collection：

<Supademo id="cmcsx430q0mhe9st81af8q8du" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何将某个备份文件中的 Collection 恢复至已有集群 `in01-3e5ad8adc38xxxx`。更多 API 参数细节，请参见[恢复 Collection 备份](/reference/restful/restore-collection-backup-v2)。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "destClusterId": "in01-xxxxxxxxxxxxxx",
    "dbCollections": [
        {
            "collections": [
                {
                    "collectionName": "medium_articles",
                    "destCollectionName": "restore_medium_articles",
                    "destCollectionStatus": "LOADED"
                }
            ]
        }
    ]
}'
```

示例返回结果如下。系统将生成一个恢复任务，您可在项目下的[任务中心](./job-center)查看进度：

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

## 常见问题\{#faq}

**恢复备份后的集群是哪个 Milvus 版本？**

恢复后的集群将使用 Zilliz Cloud 支持的最新 Milvus 版本，与创建备份时的 Milvus 版本无关。例如，您为一个 Milvus 2.5.x 集群创建备份，在平台升级至 2.6.x 后恢复该备份，恢复出来的集群为容 Milvus  2.6.x 版本。备份文件仅包含数据，集群 Milvus 版本由平台决定。