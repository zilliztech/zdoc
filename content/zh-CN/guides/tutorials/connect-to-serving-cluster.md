---
title: "连接到 Serving 集群 | Cloud"
slug: /connect-to-serving-cluster
sidebar_label: "连接到 Serving 集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供多种 Serving 集群部署选项，以满足不同的业务需求。 | Cloud"
type: origin
token: BPy2wUkRkiVfDjkdIB7cKiYSnud
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 连接到 Serving 集群

Zilliz Cloud 提供多种 Serving 集群部署选项，以满足不同的业务需求。

- **Free**：适合学习和个人项目入门使用，但在存储容量、vCU 消耗和 Collection 数量上有限制。

- **Serverless**：提供共享环境，并会根据工作负载自动扩缩容，无需预先配置资源。此选项适合流量不可预测或存在突发流量的场景，具备较好的成本效率和弹性。

- **Dedicated**：为生产工作负载提供隔离的专属环境，适合需要稳定、可预测性能的高吞吐和低延迟应用。

## Endpoint 格式\{#endpoint}

| 集群类型 | Endpoint 格式 | 说明 |
| --- | --- | --- |
| Free/Serverless | `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com` | Free/Serverless 集群使用实时服务 endpoint，不需要指定专用端口。 |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated 集群使用实时服务 endpoint，并使用端口 `19530`。 |

## 连接到 Free/Serverless 集群\{#freeserverless}

从集群详情页的 **Connect** 卡片复制集群公网 endpoint。`token` 可以使用有权访问该集群的 API key，也可以使用 `username:password` 格式的集群凭证。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

要验证连接是否成功，可以运行轻量级操作，例如列出 Collection。

```python
collections = client.list_collections()
print(collections)
```

## 连接到 Dedicated 集群\{#dedicated}

在各 SDK 中保持集群 endpoint 和 token 一致。`YOUR_CLUSTER_ENDPOINT` 是从集群 **Connect** 卡片复制的公网 endpoint；`YOUR_CLUSTER_TOKEN` 可以是有权访问目标集群的 API key，也可以是 `username:password` 格式的集群凭证。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

### 验证连接\{#}

使用 SDK 建立连接后，可以运行轻量级操作，例如列出 Collection。

```python
collections = client.list_collections()
print(collections)
```
