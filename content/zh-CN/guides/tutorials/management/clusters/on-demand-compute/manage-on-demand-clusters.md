---
title: "管理 On-Demand 集群 | Cloud"
slug: /manage-on-demand-clusters
sidebar_label: "Manage On-Demand Cluster"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍如何管理 On-demand 集群。 | Cloud"
type: origin
token: ETznwYhvpitgrtk4Y7dcLSv0nLc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 管理 On-Demand 集群

本指南介绍如何管理 On-demand 集群。

## 查看全部 On-demand 集群\{#view-all-on-demand-clusters}

- **通过 RESTful API**

    您可以按如下方式列出所有 On-demand 集群：

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com.cn"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
         --url "{BASE_URL}/v2/clusters/onDemandClusters?projectId={PROJECT_ID}&regionId=aws-us-west-2" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

     以下是输出示例。

    ```bash
    {
      "code": 0,
      "data": {
        "count": 2,
        "onDemandClusters": [
          {
            "clusterId": "in07-7d6ac8697204a6a",
            "clusterName": "xxx",
            "regionId": "ali-cn-beijing",
            "cuSize": 8,
            "status": "SUSPENDED",
            "endpoint": "https://proj-09ee1f4b1151d5dd1edbc5.aws-us-west-2.vectordb-uat3.zillizcloud.com",
            "privateLink": "",
            "createdBy": "admin@zilliz.com",
            "createTime": 1745396115000
          }
        ]
      }
    }
    ```

- **通过 Web 控制台**

    ![Gl8vwjRkGhOprhbU2DMcbovNnZd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Gl8vwjRkGhOprhbU2DMcbovNnZd.png)

    <Procedures>

    1. 前往目标项目，点击**按需计算 > 集群**。

    1. 您可以查看全部现有 On-demand 集群。

    </Procedures>

## 查看 On-demand 集群详情\{#check-the-details-of-an-on-demand-cluster}

- **通过 RESTful API**

    您可以按如下方式查看 On-demand 集群 详情：

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com.cn"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
         --url "${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    以下是输出示例。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in07-7d6ac8697204a6a",
        "clusterName": "xxx",
        "regionId": "ali-cn-beijing",
        "cuSize": 8,
        "status": "RUNNING",
        "endpoint": "https://proj-09ee1f4b1151d5dd1edbc5.aws-us-west-2.vectordb-uat3.zillizcloud.com",
        "privateLink": "",
        "createdBy": "admin@zilliz.com",
        "createTime": 1745396115000
      }
    }
    ```

- **通过 Web 控制台**

    ![QNVIwejWwhrrdzb2S3Hcuw9Hnrs](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/QNVIwejWwhrrdzb2S3Hcuw9Hnrs.png)

    <Procedures>

    1. 前往目标项目，点击**按需计算 > 集群**。

    1. 点击目标 On-demand 集群

    1. 查看详情。

    </Procedures>

## 修改 On-demand 集群设置\{#modify-an-on-demand-cluster}

您可以修改已创建的 On-demand 集群的设置。

- **通过 RESTful API**

    您可以按照如下方式修改 On-demand 集群的自动挂起时间。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
    
    curl --request PATCH \
         --url "https://${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "autoSuspend": "5m",
            "clusterName": "my-on-demand-updated",
            "description": "Updated on-demand cluster description",
            "cuSize": 32
          }'
    ```

    以下是输出示例。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted."
      }
    }
    ```

- **通过 Web 控制台**

    您可以通过 Web 控制台修改按需集群的名称、描述、Query CU 数量和自动挂起时间。

    ![SedPwGq1Zh6eQsbqLeucm0kvnBd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SedPwGq1Zh6eQsbqLeucm0kvnBd.png)

## 删除 On-demand 集群\{#drop-an-on-demand-cluster}

<Admonition type="warning" icon="🚧" title="警告">

删除集群后，系统会立即将其移除，且无法恢复。此操作不可撤销。

</Admonition>

- **通过 RESTful API**

     您可以按如下方式删除 On-demand 集群：

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com.cn"
    export TOKEN="YOUR_API_KEY"
    
    curl --request DELETE \
         --url "${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    以下是输出示例。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in07-7d6ac8697204a6a",
        "status": "DELETING"
      }
    }
    ```

- **通过 Web 控制台**

    ![KNZGw2yMEhi0nTbNsRBcincIn9b](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/KNZGw2yMEhi0nTbNsRBcincIn9b.png)

    <Procedures>

    1. 前往目标项目，点击**按需计算 > 集群**。

    1. 点击目标 On-demand 集群。

    1. 点击**操作 > 删除**。

    1. 输入集群名称。

    1. 点击**删除**。

    </Procedures>

