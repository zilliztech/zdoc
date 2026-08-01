---
title: "管理备份文件 | Cloud"
slug: /manage-backup-files
sidebar_label: "管理备份文件"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文将介绍如何查看、重命名和删除已有的备份文件。 | Cloud"
type: origin
token: BQjRwYOyZiDjwfkRav6cpFOTnoe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 管理备份文件

本文将介绍如何查看、重命名和删除已有的备份文件。

<Admonition type="info" icon="📘" title="说明">

此功能仅限 **Dedicated** 集群使用。

</Admonition>

## 限制说明\{#limits}

- **访问控制**：仅项目管理员、组织管理员或拥有备份权限的自定义角色可执行备份操作。

## 查看备份文件\{#view-backup-files}

您可以查看所有创建完成或创建中的备份文件，并查看其详细信息。

### 通过 Web 控制台\{#via-web-console}

如需在 Zilliz Cloud 控制台中查看备份文件及其详情，请点击左侧导航栏中的“备份”。

![AoJxbOCy2ofs3KxvDrAcTymMneR](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/aojxbocy2ofs3kxvdractymmner.png "AoJxbOCy2ofs3KxvDrAcTymMneR")

### 通过 RESTful API\{#via-restful-api}

- **查看所有备份文件**

    以下示例展示如何查看备份文件。由于示例中未指定项目 ID 或集群 ID，因此将查看当前**组织**下的所有备份文件。如需查看某个项目或集群下的备份文件，请在请求中指定相应 ID。更多 API 参数细节，请参见[查看备份列表](https://docs.zilliz.com.cn/reference/restful/list-backups-v2)。

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
        "count": 1,
        "currentPage": 1,
        "pageSize": 10, 
        "backups": [
           {
            "projectId": "proj-a0195d6acacaf2bb985173",
            "backupId": "backup0_1e3c0988ecb7f0d",
            "backupName": "Dedicated-01_backup1",
            "backupType": "CLUSTER", // CLUSTER or COLLECTION
            "creationMethod": "AUTO", // AUTO or MANUAL
            "size": 112, // unit: B
            "expireTime": "2024-08-30T16:49:50Z",
            "clusterId": "in01-31a6b840e50b72d",
            "clusterName": "Dedicated-01",
            "createTime": "2024-07-30T16:49:50Z",
            "status": "AVAILABLE", // AVAILABLE or CREATING
            "restoreNewInstancePolicies": [
                "LATEST",
                "ORIGINAL"
             ]
           }
        ]
      }
    }
    ```

- **查看备份详情**

    以下示例展示如何查看某个备份文件的详细信息。更多 API 参数细节，请参见[查看备份详情](https://docs.zilliz.com.cn/reference/restful/describe-backup-v2)。

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
        "clusterId": "in01-31a6b840e50b72d",
        "clusterName": "Dediacted-01",
        "projectId": "proj-b44a39b0c51cf21791a841",
        "backupId": "backup0_1e3c0988ecb7f0d",
        "backupName": "Dedicated-01_backup1",
        "backupType": "CLUSTER", // cluster/collection
        "creationMethod": "MANUAL", // auto/manual
        "status": "AVAILABLE",
        "size": 112, // unit: B
        "regionId": "aws-us-west-2",
        "expireTime": "2024-08-30T16:49:50Z",
        "collections": [
           {
               "collectionName": "medium_articles",
               "description": "Sample collection",
               "status": "LOADED" // LOADED/UNLOADED
           }
         ],     
         "dbCollections": [
            {
              "dbName": "",
              "collections": [
               {
                   "collectionName": "medium_articles",
                   "description": "Sample collection",
                   "status": "LOADED" // LOADED/UNLOADED
               }
               ]
            }
         ],
        "createTime": "2024-07-30T16:49:50Z",
        "restoreNewInstancePolicies": [
                "LATEST",
                "ORIGINAL"
             ]
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

以下示例展示如何删除指定集群中的某个备份文件。更多 API 参数细节，请参见[删除备份](https://docs.zilliz.com.cn/reference/restful/delete-backup-v2)。

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

