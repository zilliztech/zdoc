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


import Supademo from '@site/src/components/Supademo';

# 创建全球集群

本指南介绍如何创建全球集群。

如需为已有的普通集群开启全球集群功能，请参考[管理集群](./manage-cluster#convert-to-a-global-cluster)。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 前提条件\{#before-you-start}

- 请确保具备项目管理员权限。

## 创建全球集群\{#create-a-global-cluster}

- **通过 Web 控制台**

    在**集群设置**中，打开**全球集群**旁边的开关。一个全球集群必须包含 **1 个主集群**和 **1–5 个从集群**。

    从集群的云服务提供商、集群类型、Query CU 数量必须与主集群保持一致。

    可部署的从集群地域受限于您的项目所支持的地域。

    以下 Demo 展示了如何通过控制台创建全球集群。

    <Supademo id="cmkasmmcr1glake4xm2kdnfbt" title=""  />

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
