---
title: "创建全球集群 | Cloud"
slug: /create-global-cluster
sidebar_label: "创建全球集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南介绍如何创建全球集群。 | Cloud"
type: origin
token: SgDzwGKoHiV6flk3OJ9cGFaZnuf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 创建全球集群

本指南介绍如何创建全球集群。

如需为已有的普通集群开启全球集群功能，请参考[管理集群](./manage-cluster#convert-to-a-global-cluster)。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 前提条件\{#before-you-start}

- 请确保具备项目管理员权限。

- 全球集群当前仅兼容 Milvus 2.6.x 版本。

## 创建全球集群\{#create-a-global-cluster}

- **通过 Web 控制台**

    <Procedures>

    1. 在**集群设置**中，打开**全球集群**旁边的开关。

    1. 输入全球集群的名称。

        ![DMexwxKvxh5R57bLuKHcFpoBnog](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/DMexwxKvxh5R57bLuKHcFpoBnog.png)

    1. 配置主集群。

        ![AgV7wUSaFhjxf1b8okPcRmeKnIh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/AgV7wUSaFhjxf1b8okPcRmeKnIh.png)

        以下为参数说明。

        | **参数** | **说明** |
        | --- | --- |
        | 集群名称 | 主集群的名称。 |
        | 地域 | 主集群部署所在的地域。 |
        | 集群类型 | 主集群的集群类型。所有从集群都使用与主集群相同的集群类型。 |
        | Query CU | 默认启用自动扩缩容。您可以在输入框中输入数值，或拖动滑块，配置自动扩缩容的最小和最大 Query CU 数量。有关自动扩缩容的详细信息，请参阅[手动扩缩容](./manual-scaling)。<br/>您也可以禁用自动扩缩容。从集群的 Query CU 数量跟随主集群。 |
        | Replica | 主集群的 Replica 数量。主集群和每个从集群的 Replica 数量可以不同。 |

    1. 配置从集群。您最多可添加 5 个从集群。

        ![TkmiwqCfzhMpVAb3htVc9EWRnkc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/TkmiwqCfzhMpVAb3htVc9EWRnkc.png)

        以下为参数说明。

        | **参数** | **说明** |
        | --- | --- |
        | 集群名称 | 从集群的名称。 |
        | 地域 | 从集群部署所在的地域。 |
        | Replica | 从集群的 Replica 数量。主集群和每个从集群的 Replica 数量可以不同。 |

    1. 点击**创建**。

        ![XXonw62Jth77ZjbaBxJcLC5Bn8e](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/XXonw62Jth77ZjbaBxJcLC5Bn8e.png)

    </Procedures>

    创建全球集群后，Zilliz Cloud 将执行以下操作：

    1. 创建全球集群及其主集群和从集群。所有主从集群均显示为创建中（CREATING）状态。

    1. 主从集群创建完成后，均进入运行中（Running）状态，开始支持数据同步。

    您可以在全球集群页的**全球拓扑图**（Global Topology）标签页中监控数据同步状态与复制延时。

    ![Q34vwaUl5h1qFHbKA9scPPIInxb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Q34vwaUl5h1qFHbKA9scPPIInxb.png)

- **通过 RESTful API**

    以下示例展示了如何创建全球集群。详情请参考[创建全球集群](https://docs.zilliz.com.cn/reference/restful/create-global-cluster-v2)。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/create" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "globalClusterName": "my-global-cluster",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "cuType": "Performance-optimized",
        "cuSize": 4,
        "primaryCluster": {
          "clusterName": "primary-cluster",
          "regionId": "aws-us-west-2"
        },
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-eu",
            "regionId": "aws-eu-west-1"
          }
        ]
      }'
    ```

    以下为输出结果。

    ```json
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "username": "db_admin",
        "password": "********",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

    创建全球集群时，您还可以配置 Query CU 自动扩缩容，并分别设置主集群和从集群的 Replica 数量。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/create" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "globalClusterName": "my-global-cluster",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "cuType": "Performance-optimized",
        "autoscaling": {
          "cu": {
            "min": 4,
            "max": 16
          }
        },
        "primaryCluster": {
          "clusterName": "primary-cluster",
          "regionId": "aws-us-west-2",
          "replica": 2
        },
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-eu",
            "regionId": "aws-eu-west-1",
            "replica": 1
          }
        ]
      }
    ```
