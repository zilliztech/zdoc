---
title: "恢复备份 | BYOC"
slug: /restore-from-backup-files
sidebar_label: "恢复备份"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供的恢复功能可用于在发生意外删除、数据损坏或系统故障时，从备份文件中恢复数据，保障业务连续性。这是一种可靠的手段，可用于灾难恢复、撤销错误更改，或创建用于测试的集群副本，将业务中断最小化。 | BYOC"
type: origin
token: NtkswF6UEi3kB0k8XSEcOKkhnld
sidebar_position: 4
displayed_sidebar: default

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

恢复过程中，您可以配置以下设置：

- 选择是否一并恢复 RBAC 权限设置。

- 设置恢复后新集群的 Milvus 版本：

    - 对于最近 30 天内创建的备份文件，如果原集群的 Milvus GA 版本早于当前可用的最新 GA 版本，您可以选择恢复后的新集群 Milvus 版本。默认情况下，Zilliz Cloud 会将集群恢复到最新 GA Milvus 版本。

    - 对于 30 天前创建的备份文件，或已经使用最新 Milvus GA 版本的备份文件，目标 Milvus 版本不可更改。

    例如，假设当前可用的最新 Milvus GA 版本为 2.6.x：

    - 如果您使用最近 30 天内创建的 2.5.x 集群备份文件进行恢复，Zilliz Cloud 默认会将新集群恢复到 2.6.x，但您也可以选择恢复到 2.5.x。

    - 如果您使用 30 天前创建的 2.5.x 备份文件进行恢复，Zilliz Cloud 默认会将新集群恢复到 2.6.x，且不能更改目标 Milvus 版本。

    - 如果您使用 2.6.x 备份文件进行恢复，Zilliz Cloud 会将新集群恢复到 2.6.x，且不能更改目标 Milvus 版本。

恢复完成后，系统会为默认用户 `db_admin` 生成一个**新密码**，您需使用新密码连接至新集群。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何在 Zilliz Cloud 控制台中恢复整个集群：

<Supademo id="cmcswsqmt0lro9st8cllvfbnn" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何通过集群备份文件将集群恢复至名为 `Dedicated-01-backup` 的新集群。更多 API 参数细节，请参见[恢复集群备份](https://docs.zilliz.com.cn/reference/restful/restore-cluster-backup-v2)。

```bash
export API_KEY="YOUR_API_KEY"
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="your-cluster-id"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP",
        "restoreVersionPolicy": "ORIGINAL"
      }'
```

下表为参数说明。

<table>
   <tr>
     <th><p><strong>参数</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>targetProjectId</code></p></td>
     <td><p>恢复后集群所属的项目的 ID。</p></td>
   </tr>
   <tr>
     <td><p><code>clusterName</code></p></td>
     <td><p>恢复后集群的名称。</p></td>
   </tr>
   <tr>
     <td><p><code>cuSize</code></p></td>
     <td><p>恢复后集群的 Query CU 数量。</p></td>
   </tr>
   <tr>
     <td><p><code>collectionStatus</code></p></td>
     <td><p>是否在恢复后保留原始的 Collection 加载状态。可选值包括：</p><ul><li><p><code>KEEP</code>: 保留原始 Collection 状态。</p></li><li><p><code>RELEASE</code>: 释放所有 collection。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>restoreVersionPolicy</code></p></td>
     <td><p>恢复后集群兼容的 Milvus 版本。可选值包括：</p><ul><li><p><code>ORIGINAL</code>: 将集群恢复到原始的 Milvus 版本。</p></li><li><p><code>LATEST</code>: 将集群恢复到当前最新的 GA Milvus 版本。</p></li></ul></td>
   </tr>
</table>

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

以下示例展示如何将某个备份文件中的 Collection 恢复至已有集群 `in01-3e5ad8adc38xxxx`。更多 API 参数细节，请参见[恢复 Collection 备份](https://docs.zilliz.com.cn/reference/restful/restore-collection-backup-v2)。

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

- 对于最近 30 天内创建的备份文件，如果原集群的 Milvus GA 版本早于当前可用的最新 GA 版本，您可以选择恢复后的新集群 Milvus 版本。默认情况下，Zilliz Cloud 会将集群恢复到最新 GA Milvus 版本。

- 对于 30 天前创建的备份文件，或已经使用最新 Milvus GA 版本的备份文件，目标 Milvus 版本不可更改。

例如，假设当前可用的最新 Milvus GA 版本为 2.6.x：

- 如果您使用最近 30 天内创建的 2.5.x 集群备份文件进行恢复，Zilliz Cloud 默认会将新集群恢复到 2.6.x，但您也可以选择恢复到 2.5.x。

- 如果您使用 30 天前创建的 2.5.x 备份文件进行恢复，Zilliz Cloud 默认会将新集群恢复到 2.6.x，且不能更改目标 Milvus 版本。

- 如果您使用 2.6.x 备份文件进行恢复，Zilliz Cloud 会将新集群恢复到 2.6.x，且不能更改目标 Milvus 版本。

