---
title: "连接集群 | Cloud"
slug: /connect-to-clusters
sidebar_label: "连接集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍如何连接到 Zilliz Cloud 集群。 | Cloud"
type: origin
token: HU31wDHCCiN9qIknZ2fcLmconNh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 连接集群

本文介绍如何连接到 Zilliz Cloud 集群。

## 开始前\{#before-you-start}

请确保已完成以下步骤：

- 已注册 Zilliz Cloud 账户。详情请参见[注册账号](./register-with-zilliz-cloud)。

- 已创建集群。[创建按量计费集群](./undefined)。

- 已安装合适版本的 Milvus SDK。详情请参见[安装 SDK](./install-sdks)。

<Admonition type="info" icon="📘" title="📘 说明">

如果您更倾向于使用 RESTful API 而不是 SDK，需注意由于 HTTP 协议的单向通信模式，无法建立持续的连接。

</Admonition>

## 连接到集群\{#connect-to-a-cluster}

集群启动后，通过集群公共 Endpoint 和 Token 连接到集群。

- **公共 Endpoint**：您可以通过 Zilliz Cloud web 控制台获取该信息。前往目标集群的**集群详情**页。在**连接信息**卡片上，复制集群的公共 Endpoint。

    ![connection-info-cn](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/connection-info-cn.png "connection-info-cn")

- **Token**：可以是 [API 密钥](./manage-api-keys)或由用户名和密码组成的[集群凭证](./cluster-credentials)。

以下示例展示如何连接至集群。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Connect using a MilvusClient object
from pymilvus import MilvusClient
CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token

# Initialize a MilvusClient instance
# Replace uri and token with your own
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # Cluster endpoint obtained from the console
    token=TOKEN # API key or a colon-separated cluster username and password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

// 1. Connect to the cluster
const client = new MilvusClient({address, token})
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