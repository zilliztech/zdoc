---
title: "Connect to Serving Clusters | BYOC"
slug: /connect-to-serving-cluster
sidebar_label: "Connect to Serving Clusters"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides various serving cluster deployment options to accommodate the distinct business needs. | BYOC"
type: origin
token: SFPlwOh8cigh8wkm9xLcXHlfnVh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Connect to Serving Clusters

Zilliz Cloud provides various serving cluster deployment options to accommodate the distinct business needs. 

- **Free**: provides a starting point for learning and personal projects with limitations on storage, vCU consumption, and the number of collections.

- **Serverless**: provides a shared environment that automatically scales to match your workload - no need to provision resources. This option delivers excellent cost efficiency and elasticity for unpredictable or spiky traffic.

- **Dedicated**: provides isolated, reserved environments for production workloads that demand consistent and predictable performance. This option is ideal for sustained high-throughput and latency-sensitive applications.

## Endpoint formats\{#endpoint-formats}

| Cluster type | Endpoint pattern | Notes |
| --- | --- | --- |
| Free/Serverless | `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com` | Free/Serverless clusters use the real-time serving endpoint without a dedicated port. |
| Dedicated | `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530` | Dedicated clusters use the real-time serving endpoint with port `19530`. |

## Connect to Free/Serverless clusters\{#connect-to-freeserverless-clusters}

Copy the cluster public endpoint from the **Connect** card on the cluster details page. Use either an API key with access to the cluster or a cluster credential in `username:password` format as the token.

````plaintext
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)
```

```plaintext
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

```plaintext
import "github.com/milvus-io/milvus/client/v2/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

```plaintext
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

```plaintext
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

To verify the connection, run a lightweight operation such as listing collections.

```plaintext
collections = client.list_collections()
print(collections)
```

## Connect to Dedicated clusters{#connect-to-dedicated-clusters}

Use the cluster endpoint and token consistently across SDKs. `YOUR_CLUSTER_ENDPOINT` is the public endpoint copied from the cluster **Connect** card, and `YOUR_CLUSTER_TOKEN` is either an API key with access to the target cluster or a cluster credential in `username:password` format.

```plaintext
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN,
)
```

```plaintext
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

```plaintext
import "github.com/milvus-io/milvus/client/v2/milvusclient"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
```

```plaintext
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({ address, token });
```

```plaintext
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

## Verify the connection{#verify-the-connection}

After connecting with an SDK, run a lightweight operation such as listing collections.

```plaintext
collections = client.list_collections()
print(collections)
````
