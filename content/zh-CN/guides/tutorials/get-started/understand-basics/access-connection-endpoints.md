---
title: "访问端点 | Cloud"
slug: /access-connection-endpoints
sidebar_key: access-connection-endpoints
sidebar_label: "访问端点"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了三类端点，每类端点都有不同的职责。 | Cloud"
type: origin
token: O22cwe3KuiZA8dkQycMczsLhn9d
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - cloud
  - 访问端点

---

import Admonition from '@theme/Admonition';


# 访问端点

Zilliz Cloud 提供了三类端点，每类端点都有不同的职责。

<table>
   <tr>
     <th></th>
     <th><p><strong>控制平面 API 端点</strong></p></th>
     <th><p><strong>按需计算端点</strong></p></th>
     <th><p><strong>实时服务端点</strong></p></th>
   </tr>
   <tr>
     <td><p>URL 模式</p></td>
     <td><p><code>https://api.cloud.zilliz.com</code></p></td>
     <td><p><code>https://\{project-id\}.\{region\}.api.cloud.zilliz.com</code></p></td>
     <td><p><code>https://\{cluster-id\}.\{region\}.vectordb.zillizcloud.com:19530</code></p></td>
   </tr>
   <tr>
     <td><p>职责</p></td>
     <td><p>资源生命周期：集群、卷、作业以及所有其他控制平面活动</p></td>
     <td><p>数据导入，批量搜索</p></td>
     <td><p>完整的集合 API (DDL + DML + DQL)</p></td>
   </tr>
   <tr>
     <td><p>数据操作</p></td>
     <td><p>无（数据导入除外）</p></td>
     <td><p>批量插入和导入；按 CU 计费的搜索</p></td>
     <td><p>插入、更新和删除，具有低延迟搜索和查询</p></td>
   </tr>
   <tr>
     <td><p>何时使用</p></td>
     <td><p>配置基础设施和自动化</p></td>
     <td><p>批处理、探索、验证、实验</p></td>
     <td><p>生产服务，持续的低延迟查询</p></td>
   </tr>
</table>

## 连接到实时服务集群\{#connect-to-a-real-time-serving-cluster}

Zilliz Cloud 提供以下类型的服务集群：Free、Serverless 版和 Dedicated 版。您需要遵循以下示例来设置连接。

```rpg
from pymilvus import MilvusClient

# 连接到一个 Dedicated 集群
client = MilvusClient(
    uri="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530",
    token="YOUR_API_KEY"
)

# 连接到一个 Free / Serverless 集群
client = MilvusClient(
    uri="https://{cluster-id}.serverless.{region}.cloud.zilliz.com.cn",
    token="YOUR_API_KEY"
)
```

您可以使用具有适当权限的有效 API 密钥或 `username:password` 格式的集群凭据进行身份验证。

## 连接到按需计算集群\{#connect-to-an-on-demand-cluster}

Zilliz Cloud 还提供专门用于按需计算的 Database。

```rpg
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.cloud.zilliz.com.cn",
    cluster="inxx-xxxxxxxxxxxxxxx",
    token="YOUR_API_KEY"
)
```

当连接到按需计算端点时，您还需要设置一个按需集群的集群 ID，以便您可以使用该集群中的计算资源来执行搜索和查询。

您可以使用具有适当权限的有效 API 密钥或 `username:password` 格式的集群凭据进行身份验证。

## 连接到 Zilliz Cloud 控制平面 API 端点\{#connect-to-zilliz-cloud-control-plane-api-endpoint}

当您需要创建集群和 Volume，或管理控制平面资源（如备份、恢复和迁移）时，请使用控制平面端点。

例如，您可以按如下方式查看可用的云提供商：

```plaintext
export BASE_URL="https://api.cloud.zilliz.com.cn"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/clouds" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

有关详细信息，请参阅 [RESTful API 参考](/reference/restful)。

