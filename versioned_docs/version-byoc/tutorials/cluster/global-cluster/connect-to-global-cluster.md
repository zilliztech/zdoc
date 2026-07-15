---
title: "Connect to Global Cluster | BYOC"
slug: /connect-to-global-cluster
sidebar_key: connect-to-global-cluster
sidebar_label: "Connect to Global Cluster"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Connect to Global Cluster | BYOC"
type: origin
token: DknbwaLS3iAAiUk9ifPc1Vmvnze
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - global cluster
  - connection
  - endpoint
  - routing

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Connect to Global Cluster

After your global cluster is running, connect to it using an endpoint and an authentication token. This page covers the two endpoint types, when to use each, and how routing behaves during switchover and failover.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

This feature is available in all AWS regions and in the following Google Cloud regions: gcp-us-central1 and gcp-us-east4. It is not available on Microsoft Azure.

</Admonition>

## Choose an endpoint type\{#choose-an-endpoint-type}

A global cluster provides two ways to connect:

- Via a **global endpoint**

- Via the **public or private endpoints** of the primary or secondary cluster in a global cluster

The following table compares the two connection endpoints.

<table>
   <tr>
     <th></th>
     <th><p><strong>Global endpoint</strong></p></th>
     <th><p><strong>The endpoint of a primary or secondary cluster</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Write routing</strong></p></td>
     <td><p>Automatically routed to the primary cluster</p></td>
     <td><p>Only the primary's public endpoint accepts writes</p></td>
   </tr>
   <tr>
     <td><p><strong>Read routing</strong></p></td>
     <td><p>Routed to the primary cluster</p><p>(Intelligent routing to the nearest available cluster based on latency will be supported soon.)</p></td>
     <td><p>Reads go to the specific cluster you connect to</p></td>
   </tr>
   <tr>
     <td><p><strong>Switchover / Failover</strong></p></td>
     <td><p>Re-routes automatically — no code changes</p></td>
     <td><p>You must update your connection to point to the new primary</p></td>
   </tr>
   <tr>
     <td><p><strong>Private Link</strong></p></td>
     <td><p>Not supported (requires public internet)</p></td>
     <td><p>Supported.</p></td>
   </tr>
   <tr>
     <td><p><strong>Best for</strong></p></td>
     <td><p>Production applications that need automatic failover and latency-based routing</p></td>
     <td><p>Direct access to a specific cluster (e.g., environment replication, testing, debugging)</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

It is recommended to use the global endpoint for production workloads. It eliminates the need to handle endpoint changes in your application code during switchover or failover.

</Admonition>

## Get your endpoint and token\{#get-your-endpoint-and-token}

<Procedures>

1. Navigate to your global cluster or target cluster:

    - For the **global** **endpoint**: Go to the **Global** **Cluster** page.

    - For a **public** **endpoint**: Go to the **Cluster** **Details** page of the specific primary or secondary cluster.

1. On the Connect card, copy the **Global Endpoint** or **Public Endpoint**.

    ![OPCTbMaYIoUXHKxDf0ycdMNBnze](https://zdoc-images.s3.us-west-2.amazonaws.com/opctbmayiouxhkxdf0ycdmnbnze.png "OPCTbMaYIoUXHKxDf0ycdMNBnze")

1. Prepare your authentication token. This can be either an [API key](./manage-api-keys) or a [cluster credential](./cluster-credentials) (`username:password`).

</Procedures>

## Connect using the global endpoint\{#connect-using-the-global-endpoint}

The global endpoint is a single URL that always routes requests to the current primary cluster in the global cluster. 

If a switchover or failover occurs, Zilliz Cloud automatically updates the global endpoint to point to the new primary cluster. This lets your application continue using the same endpoint without manually changing the cluster URI.

Zilliz Cloud supports connecting to the global endpoint through both SDKs and RESTful APIs. For production applications, we recommend using an SDK client.

<details>

<summary>Why SDK connections are recommended over RESTful API connections?</summary>

SDK clients can retrieve the global cluster topology, including the endpoint list, primary and secondary roles, and cluster health. With this information, SDK clients can react faster when the primary cluster changes. SDK clients will also support read/write splitting in the future, where write requests are routed to the primary cluster and eligible read requests are routed based on the global cluster topology.

However, RESTful API connections do not maintain global cluster topology information. As a result, RESTful API connections may take longer to switch to the new primary cluster after a switchover or failover. For the same reason, RESTful API connections cannot support read/write splitting.

The following table compares SDK connection with RESTful API connection.

<table>
   <tr>
     <th><p><strong>Dimension</strong></p></th>
     <th><p><strong>SDK connection</strong></p></th>
     <th><p><strong>RESTful API connection</strong></p></th>
   </tr>
   <tr>
     <td><p>Best for</p></td>
     <td><p>Production applications that need faster recovery during role changes and future read/write splitting.</p></td>
     <td><p>Lightweight scripts, simple REST integrations, and one-off administrative operations.</p></td>
   </tr>
   <tr>
     <td><p>Topology awareness</p></td>
     <td><p>Retrieves global cluster topology, including the endpoint list, primary and secondary roles, and cluster health.</p></td>
     <td><p>Does not maintain global cluster topology information.</p></td>
   </tr>
   <tr>
     <td><p>Primary change handling</p></td>
     <td><p>Can react faster, usually within seconds, when the primary cluster changes after a switchover or failover.</p></td>
     <td><p>May take longer, usually minutes, to switch to the new primary because the client does not maintain topology information.</p></td>
   </tr>
   <tr>
     <td><p>Read/write splitting</p></td>
     <td><p>✅ Will be supported soon.</p></td>
     <td><p>❌ Not supported</p></td>
   </tr>
</table>

</details>

### Check SDK Version\{#check-sdk-version}

Before you start, ensure you have [installed](./install-sdks) SDKs and also ensure your SDK meets the minimum version requirement.

<table>
   <tr>
     <th><p>SDK</p></th>
     <th><p>Minimum Version</p></th>
   </tr>
   <tr>
     <td><p>Python</p></td>
     <td><p><code>2.6.9</code></p></td>
   </tr>
   <tr>
     <td><p>Java</p></td>
     <td><p><code>2.6.14</code></p></td>
   </tr>
</table>

### Connection guide\{#connection-guide}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Use the global endpoint for automatic routing
client = MilvusClient(
    uri="YOUR_GLOBAL_ENDPOINT",  # Global endpoint from the console
    token="YOUR_CLUSTER_TOKEN"   # API key or username:password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

// Use the global endpoint for automatic routing
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("YOUR_GLOBAL_ENDPOINT")  // Global endpoint from the console
    .token("YOUR_CLUSTER_TOKEN")  // API key or username:password
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_GLOBAL_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
```

</TabItem>
</Tabs>

## Connect using a public endpoint\{#connect-using-a-public-endpoint}

Each cluster in the global cluster has its own public endpoint. Use this when you need to target a specific cluster directly.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Connect directly to a specific cluster
client = MilvusClient(
    uri="YOUR_CLUSTER_PUBLIC_ENDPOINT",  # Public endpoint of a specific cluster
    token="YOUR_CLUSTER_TOKEN" # API key or username:password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

// Connect directly to a specific cluster
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("YOUR_CLUSTER_PUBLIC_ENDPOINT")  // Public endpoint of a specific cluster
    .token("YOUR_CLUSTER_TOKEN")  // API key or username:password
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Connect directly to a specific cluster
const client = new MilvusClient({
    address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    token: "YOUR_CLUSTER_TOKEN"  // API key or username:password
})
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

// Connect directly to a specific cluster
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    APIKey:  "YOUR_CLUSTER_TOKEN",  // API key or username:password
})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_PUBLIC_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

When using public endpoints, only the primary cluster's public endpoint accepts write operations. Writing to a secondary cluster's public endpoint will fail.

</Admonition>

## Routing behavior\{#routing-behavior}

### During normal operation\{#during-normal-operation}

<table>
   <tr>
     <th><p><strong>Request type</strong></p></th>
     <th><p><strong>Global endpoint</strong></p></th>
     <th><p><strong>Public endpoint</strong></p></th>
   </tr>
   <tr>
     <td><p>Write (insert, upsert, delete)</p></td>
     <td><p>Routed to the primary cluster</p></td>
     <td><p>Only accepted on the primary cluster's endpoint</p></td>
   </tr>
   <tr>
     <td><p>Read (search, query)</p></td>
     <td><p>Routed to the primary cluster</p><p>(Intelligent routing to the nearest available cluster based on latency will be supported soon.)</p></td>
     <td><p>Served by the specific cluster you connect to</p></td>
   </tr>
</table>

### During and after switchover / failover\{#during-and-after-switchover-failover}

<table>
   <tr>
     <th><p><strong>Scenario</strong></p></th>
     <th><p><strong>Global endpoint</strong></p></th>
     <th><p><strong>Public endpoint</strong></p></th>
   </tr>
   <tr>
     <td><p>Switchover in progress</p></td>
     <td><p>Writes briefly paused, then resume on the new primary. Reads continue.</p></td>
     <td><p>No change to endpoints. Old primary becomes secondary.</p></td>
   </tr>
   <tr>
     <td><p>Failover in progress</p></td>
     <td><p>Writes unavailable until new primary is promoted. Reads continue on secondaries.</p></td>
     <td><p>Old primary's endpoint becomes unreachable.</p></td>
   </tr>
   <tr>
     <td><p>After completion</p></td>
     <td><p>Automatically routes to the new primary. No code changes.</p></td>
     <td><p>Update your code to use the new primary's public endpoint for writes.</p></td>
   </tr>
</table>

### SDK automatic reconnection\{#sdk-automatic-reconnection}

When using the global endpoint, the Zilliz Cloud SDKs handle endpoint re-routing during switchover and failover. Your application does not need to implement retry logic for the routing change itself. However, writes that are in-flight at the moment of the switch may receive a transient error — standard retry logic in your application will handle these cases.
