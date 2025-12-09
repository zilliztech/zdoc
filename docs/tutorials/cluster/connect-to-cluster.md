---
title: "Connect to Cluster | Cloud"
slug: /connect-to-cluster
sidebar_label: "Connect to Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This article offers a systematic guide on connecting to a cluster. | Cloud"
type: origin
token: IVFfws0lJi8gIVkRvrvc9aXvnNe
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - connect
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to Cluster

This article offers a systematic guide on connecting to a cluster.

## Before you start\{#before-you-start}

Ensure the following prerequisites are met before proceeding:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have installed a Milvus SDK applicable to your use case. For details, see [Install SDKs](./install-sdks).

<Admonition type="info" icon="📘" title="Note">

<p>For those leaning towards the utilization of RESTful APIs over SDKs, it's important to understand that a continuous connection cannot be established. This is attributed to the HTTP protocol's unidirectional communication mode.</p>

</Admonition>

## Connect to a cluster\{#connect-to-a-cluster}

Once your cluster is operational, connect to it utilizing its public endpoint and an authentication token. 

- **Cluster public endpoint:** You can obtain this on the Zilliz Cloud web console. Navigate to the **Cluster Details** page of the target cluster. On the **Connect** card, you can copy the cluster public endpoint.

    ![connection-info](https://zdoc-images.s3.us-west-2.amazonaws.com/connection-info.png "connection-info")

- **Token:** This token can be  an [API key](./manage-api-keys) or a [cluster credential](./cluster-credentials) that consists of a username and password pair.

The following example shows how to connect to a cluster.

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
</Tabs>

