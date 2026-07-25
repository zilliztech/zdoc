---
title: "创建集群 | BYOC"
slug: /create-cluster-byoc
sidebar_label: "创建集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本节介绍如何创建集群。 | BYOC"
type: origin
token: DqZywVVCqi9Q5ekAPEFcmODbncb
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 创建

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# 创建集群

本节介绍如何创建集群。

## 前提条件\{#prerequisites}

在创建集群前，请确认

- 您已经拥有一个正常运行的 BYOC 项目。关于如何部署 BYOC 项目的有关信息，可[联系我们](https://support.zilliz.com.cn/hc/zh-cn)。

## 创建集群\{#create-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"控制台","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn)。

1. 进入您的 BYOC 组织和项目。

1. 单击**创建集群**。

1. 在创建新集群页面，输入相关参数。

    - **集群名称**: 需要保证全局唯一，您可根据需要修改该名称。

    - **集群设置**:

        - **集群类型**: 根据您的性能需求，选择合适的集群类型。界面上有关于集群类型的简要介绍，并提供[计算器](https://zilliz.com/pricing#calculator)供您自助估算成本。更多信息，可以参考[选择合适的集群类型](./cu-types-explained)。

        - **Query CU**: 设置您的集群需要的 Query CU 数量。

    - **网络拓扑**: 以线框图的形式展示当前集群的内部结构，包括为各节点分配的角色和计算资源信息：

        - **Proxy**: 无状态节点，用于管理用户连接并通过负载均衡器简化服务地址。

        - **Query Node**: 负责混合向量和标量搜索以及增量数据更新。

        - **Coordinator**: 在工作节点间分配任务。

        - **Data Node**: 处理数据变更以及日志到快照的转换，以实现持久化。

    - **备份策略**: 确定要创建的集群的备份频率。Zilliz Cloud 将在集群创建后立即创建备份。后续备份将按照指定的计划进行。

1. 单击**创建集群**。 

    此时，您将看到自动弹出的**检查项目资源配额**窗口。如果当前项目的资源充足，该窗口在检查完成后会自动消失。如果资源不足，您可以：

    - 单击**前往项目资源设置**按钮，以便编辑当前项目的资源设置，或者

    - 单击**返回上一步**按钮，以便编辑当前集群的相关设置。

    <Admonition type="info" icon="📘" title="说明">

    <p>操作期间会消耗少量额外资源，并在操作完成后释放。</p>

    </Admonition>

    接下来，您会看到另一个弹出的窗口，展示当前集群的公共访问端点及访问凭证。请将其保存在安全的位置 。

</Procedures>

</TabItem>

<TabItem value="Bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。

以下 `POST` 通过请求体在项目 `proj-xxxxxxxxxxxxxxxxxxxxx` 中创建了 1 个名称为 `Cluster-02`、Query CU 数量为 1、 集群类型为性能型的 Dedicated 集群。

```bash
curl --request POST \
     --url https://api.cloud.zilliz.com.cn/v2/clusters/createDedicated \
     --header 'Authorization: Bearer ${API_KEY}' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data-raw '{
        "clusterName": "Cluster-02",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "${REGION_ID}",
        "plan": "Enterprise",
        "clusterType": "Performance-optimized",
        "cuSize": 1
      }'
     
#  {
#    code: 0,
#    data: {
#      "clusterId": "inxx-xxxxxxxxxxxxxxx",
#      "username":"db_admin",
#      "password":"****************",
#      "prompt": "Successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
#  }
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。

- `clusterName`：需要创建的集群名称。

- `projectId`：需要创建的集群所属的项目的 ID。如需查看项目 ID，请使用[查看项目列表](/reference/restful/list-projects-v2)。

- `regionId`：需要创建的集群所部署的云服务地域 ID。如需查看所有 Zilliz Cloud 支持的云服务地域 ID，请使用[查看云服务区域](/reference/restful/list-cloud-regions-v2)。

- `plan`: Dedicated 集群的版本类型。仅支持 **Enterprise**（企业版）。

- `clusterType`：集群的类型。仅支持 **Performance-optimized**（性能型）。

- `cuSize`：集群的 Query CU 数量。参数值为 1-256 之间的整数。

</TabItem>

</Tabs>

## 结果验证\{#verification}

创建集群后，您可以在集群列表页面上检查集群状态。如果集群的状态为**运行中**，则表示集群创建成功。

