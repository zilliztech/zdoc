---
title: "Connect to Cluster | BYOC"
slug: /connect-to-cluster
sidebar_label: "Connect to Cluster"
beta: FALSE
notebook: FALSE
description: "This article offers a systematic guide on connecting to a cluster. | BYOC"
type: origin
token: IVFfws0lJi8gIVkRvrvc9aXvnNe
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - connect
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to Cluster

This article offers a systematic guide on connecting to a cluster.

## Before you start{#before-you-start}

Ensure the following prerequisites are met before proceeding:

- You have deployed a BYOC project. For details, see [Deploy BYOC on AWS](./deploy-byoc-aws).

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have installed a Milvus SDK applicable to your use case. For details, see [Install SDKs](./install-sdks).

<Admonition type="info" icon="📘" title="Note">

<p>For those leaning towards the utilization of RESTful APIs over SDKs, it's important to understand that a continuous connection cannot be established. This is attributed to the HTTP protocol's unidirectional communication mode.</p>

</Admonition>

## Connect to a cluster{#connect-to-a-cluster}

Once your cluster is operational, connect to it utilizing its public endpoint and an authentication token. This token can be a [cluster credential](./cluster-credentials) that consists of a username and password pair.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
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
    token=TOKEN # a colon-separated cluster username and password
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
</Tabs>

