---
title: "Connect to Clusters | Cloud"
slug: /connect-to-clusters
sidebar_label: "Connect to Clusters"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use a Dedicated cluster endpoint when your application needs the full Collection API, including schema management, insert, upsert, delete, search, query, and hybrid search. | Cloud"
type: origin
token: ZWwJwKjeDi7SJGkzUQ0c7XfBnqh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to Clusters

Use a Dedicated cluster endpoint when your application needs the full Collection API, including schema management, insert, upsert, delete, search, query, and hybrid search.

<Admonition type="info" icon="📘" title="Note">

This page demonstrates how to connect to a Dedicated serving cluster. To connect to a Free or Serverless cluster, see [Free & Serverless Clusters](./free-and-serverless-clusters). For on-demand compute over a project endpoint, see [Connect for On-Demand Search](./connect-for-on-demand-search).

</Admonition>

## Endpoint formats\{#endpoint-formats}

| Cluster type | Endpoint pattern | Notes |
| --- | --- | --- |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated clusters use the real-time serving endpoint with port `19530`. |

## Before you begin\{#before-you-begin}

Before connecting to a Dedicated cluster, ensure that:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You have created a Dedicated cluster.

- You have installed a Milvus SDK for your use case. For details, refer to [Install SDKs](./install-sdks).

- You have the cluster public endpoint.

- You have an authentication token. This can be an API key with access to the target cluster or a cluster credential in `username:password` format.

You can obtain the cluster public endpoint from the Zilliz Cloud console. Navigate to the **Cluster Details** page of the target cluster. On the **Connect** card, copy the cluster public endpoint.

<Admonition type="info" icon="📘" title="Note">

If you use RESTful APIs instead of SDKs, a continuous connection is not established because HTTP follows a request-response communication model.

</Admonition>

## Install SDKs\{#install-sdks}

Install the SDK for your application language.

```plaintext
pip install pymilvus
```

For Java, Node.js, and Go projects, install the corresponding Milvus SDK in your project before using the examples below.

## Connect to a Dedicated cluster\{#connect-to-a-dedicated-cluster}

Use the cluster endpoint and token consistently across SDKs. `YOUR_CLUSTER_ENDPOINT` is the public endpoint copied from the cluster **Connect** card, and `YOUR_CLUSTER_TOKEN` is either an API key with access to the target cluster or a cluster credential in `username:password` format.

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

## Verify the connection\{#verify-the-connection}

After connecting with an SDK, run a lightweight operation such as listing collections.

```python
collections = client.list_collections()
print(collections)
```

## Next steps\{#next-steps}

Once connected, use the same client instance to create collections, load data, and run real-time search or query operations against the Dedicated cluster.

For Free or Serverless serving clusters, see [Free & Serverless Clusters](./free-and-serverless-clusters). For on-demand compute through a project endpoint, see [Connect for On-Demand Search](./connect-for-on-demand-search).