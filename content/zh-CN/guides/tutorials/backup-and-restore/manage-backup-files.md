---
title: "管理备份文件 | Cloud"
slug: /manage-backup-files
sidebar_key: manage-backup-files
sidebar_label: "管理备份文件"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文将介绍如何查看、重命名和删除已有的备份文件。 | Cloud"
type: origin
token: BQjRwYOyZiDjwfkRav6cpFOTnoe
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 备份
  - 快照
  - 管理

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 管理备份文件

本文将介绍如何查看、重命名和删除已有的备份文件。

## 限制说明\{#limits}

- **访问控制**：仅项目管理员、组织管理员或拥有备份权限的自定义角色可执行备份操作。

## 查看备份文件\{#view-backup-files}

您可以查看所有创建完成或创建中的备份文件，并查看其详细信息。

### 通过 Web 控制台\{#via-web-console}

如需在 Zilliz Cloud 控制台中查看备份文件及其详情，请点击左侧导航栏中的“备份”。

![AoJxbOCy2ofs3KxvDrAcTymMneR](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/AoJxbOCy2ofs3KxvDrAcTymMneR.png "AoJxbOCy2ofs3KxvDrAcTymMneR")

### 通过 RESTful API\{#via-restful-api}

- **查看所有备份文件**

    以下示例展示如何查看备份文件。由于示例中未指定项目 ID 或集群 ID，因此将查看当前**组织**下的所有备份文件。如需查看某个项目或集群下的备份文件，请在请求中指定相应 ID。更多 API 参数细节，请参见[查看备份列表](/reference/restful/list-backups-v2)。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/backups" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    示例返回结果如下：

    ```bash
    {
      "code": 0,
      "data": {
        "count": 10,
        "currentPage": 1,
        "pageSize": 10,
        "backups": [
          {
            "backupId": "backup1_0b9d15a0ddexxxx",
            "projectId": "proj-20e13e974c7d659a83xxxx",
            "backupName": "Dedicated-01_backup3",
            "backupType": "CLUSTER",
            "creationMethod": "AUTO",
            "status": "CREATING",
            "size": 0,
            "expireTime": "2024-09-02T02:27:51Z",
            "clusterId": "in01-3e5ad8adc38xxxx",
            "clusterName": "Dedicated-01",
            "createTime": "2024-08-26T02:27:51Z"
          },
          ...
        ]
      }
    }
    ```

- **查看备份详情**

    以下示例展示如何查看某个备份文件的详细信息。更多 API 参数细节，请参见[查看备份详情](/reference/restful/describe-backup-v2)。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    示例返回结果如下：

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in01-3e5ad8adc38xxxx",
        "clusterName": "Dedicated-01",
        "regionId": "ali-cn-hangzhou",
        "projectId": "proj-20e13e974c7d659a83xxxx",
        "backupId": "backup1_0b9d15a0ddexxxx",
        "backupName": "Dedicated-01_backup3",
        "backupType": "CLUSTER",
        "creationMethod": "AUTO",
        "status": "AVAILABLE",
        "size": 0,
        "collections": [],
        "createTime": "2024-08-26T02:27:51Z",
        "expireTime": "2024-09-02T02:27:51Z"
      }
    }
    ```

## 重命名备份文件\{#rename-backup-files}

当前仅支持通过 Web 控制台重命名备份文件。

以下 Demo 展示如何在 Zilliz Cloud 控制台中重命名备份文件：

<Supademo id="cmcsvwnph0kqn9st866jrkz4c" title=""  />

## 删除备份文件\{#delete-backup-files}

Zilliz Cloud 根据备份的创建方式采用不同的删除策略：

- **手动备份**：即使删除了对应集群，备份文件也会被保留。为节省存储费用，建议在不再需要时手动删除。

- **自动备份**：在保留期结束或关联集群被删除时，系统会自动清除。您也可以手动删除。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何在控制台中删除备份文件：

<Supademo id="cmcsw3q5m03y3xk0iiyxl31dg" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何删除指定集群中的某个备份文件。更多 API 参数细节，请参见[删除备份](/reference/restful/delete-backup-v2)。

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

示例返回结果如下：

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup11_dbf5a40a6e5xxxx",
    "backupName": "medium_articles_backup4"
  }
}
```

