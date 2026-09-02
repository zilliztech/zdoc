---
title: "创建按量计费集群 | BYOC"
slug: /create-pay-as-you-go-cluster
sidebar_label: "创建按量计费集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "集群对应一组用于运行向量数据库工作负载的计算资源。Zilliz Cloud 提供两种集群：Serving Clusters（持续运行，适用于需要持续在线、低延迟访问的生产负载）和 On-demand 集群（仅在请求到达时自动拉起，空闲时自动缩容至 0）。 | BYOC"
type: origin
token: MAFcwBTqqiR5YZkdkd4cADg0nub
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# 创建按量计费集群

集群对应一组用于运行向量数据库工作负载的计算资源。Zilliz Cloud 提供两种集群：Serving Clusters（持续运行，适用于需要持续在线、低延迟访问的生产负载）和 On-demand 集群（仅在请求到达时自动拉起，空闲时自动缩容至 0）。

## 注意事项\{#considerations}

请确保已完成以下步骤：

- 已注册 Zilliz Cloud 账户。有关更多信息，请参见[注册账号](./register-with-zilliz-cloud)。

- 在目标组织或项目中，您具有集群创建权限。有关角色和权限的信息，请参见[管理组织用户](./organization-users) 和 [管理项目用户](./project-users)。

- 每个项目中最多可创建 100 个 Serverless 集群、100 个 Dedicated 集群。

## 创建 Dedicated 集群\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

<Supademo id="cmhiydksy083hy90ibirrjb9x" title=""  />

您需要配置以下集群信息：

| **参数** | **描述** |
| --- | --- |
| **集群名称** | 请输入集群的名称。当前存在随机默认值，您可根据需要修改该名称 |
| **集群描述（可选）** | 请输入集群的描述。最多 255 字符。 |
| **集群类型** | 想了解更多关于集群类型的相关内容，可参见[选择合适的 CU 类型](https://docs.zilliz.com.cn/docs/cu-types-explained)。如需选择分层存储型 CU，集群规格需至少为 8 Query CU。 |
| **Query CU** | 您可以使用[计算器](https://zilliz.com.cn/pricing#calculator)估算所需 Query CU 数量。对于使用个人邮箱创建的组织，即使已配置支付方式，Dedicated 集群的 Query CU 最大也只能设置为 32。<br/>默认启用自动扩缩容。您可以在输入框中输入数值，或拖动滑块，配置自动扩缩容的最小和最大 Query CU 数量。有关自动扩缩容的详细信息，请参阅[手动扩缩容](./manual-scaling)。 |
| **备份策略（可选）** | 设置定时创建备份的频率。更多详细信息，请参考 [设置定时自动备份](./schedule-automatic-backups)。 |

集群创建过程中，请保存集群访问凭证（用户名和密码）。该信息将仅展示一次。

当集群状态转为**运行中**，则表示集群创建成功。您可以复制集群 Endpoint 和 Token 以[连接集群](./connect-to-clusters)。

</TabItem>

<TabItem value="bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。更多详情，请参考[创建 Dedicated 集群](https://docs.zilliz.com.cn/reference/restful/create-dedicated-cluster-v2)。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/createDedicated" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "clusterName": "Cluster-05",
    "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "plan": "Standard",
    "cuType": "Performance-optimized",
    "cuSize": 1,
    "description": "A cluster for vector search workloads."
}'
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。

- `clusterName`：需要创建的集群名称。

- `projectId`：需要创建的集群所属的项目的 ID。如需查看项目 ID，请使用[查看项目列表](https://docs.zilliz.com.cn/reference/restful/list-projects-v2)。

- `regionId`：需要创建的集群所部署的云服务地域 ID。如需查看所有 Zilliz Cloud 支持的云服务地域 ID，请使用[查看云服务区域](https://docs.zilliz.com.cn/reference/restful/list-cloud-regions-v2)。

- `clusterType`：集群的类型。可选的参数值包含：**Performance-optimized**（性能型）。

- `cuSize`：集群的 Query CU 数量。参数值为 1-2,048 之间的整数。对于使用个人邮箱创建的组织，即使已配置支付方式，Dedicated 集群的 Query CU 最大也只能设置为 32。

- `description` (可选): 集群的描述。

</TabItem>

</Tabs>

## 常见问题\{#faq}

**能否在创建集群时指定 Milvus 版本？**   

不支持。Zilliz Cloud 会自动使用最新的 Milvus 版本创建集群，并通过滚动升级保持版本更新。如需使用特定版本，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn/requests/new)并说明您的使用场景。                                                         