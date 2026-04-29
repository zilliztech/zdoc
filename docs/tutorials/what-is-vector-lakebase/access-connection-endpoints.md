---
title: "Access: Connection Endpoints | Cloud"
slug: /access-connection-endpoints
sidebar_key: access-connection-endpoints
sidebar_label: "Access: Connection Endpoints"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud exposes three endpoints, each with distinct responsibilities. | Cloud"
type: origin
token: QSuYwaKvOiPmD7knUZ9cH0jLnAe
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - access
  - connection endpoints

---

import Admonition from '@theme/Admonition';


# Access: Connection Endpoints

Zilliz Cloud exposes three endpoints, each with distinct responsibilities.

<table>
   <tr>
     <th></th>
     <th><p><strong>Control Plane API Endpoint</strong></p></th>
     <th><p><strong>On-demand Compute Endpoint</strong></p></th>
     <th><p><strong>Real-time Serving Endpoint</strong></p></th>
   </tr>
   <tr>
     <td><p>URL Pattern</p></td>
     <td><p><code>https:&ast;//&ast;api.cloud.zilliz.com</code></p></td>
     <td><p><code>https:&ast;//&ast;\{project-id\}.\{region\}.api.zillizcloud.com</code></p></td>
     <td><p><code>https:&ast;//&ast;\{cluster-id\}.\{region\}.vectordb.zillizcloud.com:19530</code></p></td>
   </tr>
   <tr>
     <td><p>Responsibility</p></td>
     <td><p>Resource lifecycle: clusters, volumes, jobs, and all other control plane activities</p></td>
     <td><p>Data import, batch search</p></td>
     <td><p>Full Collection API (DDL + DML + DQL)</p></td>
   </tr>
   <tr>
     <td><p>Data Operations</p></td>
     <td><p>None (except data import)</p></td>
     <td><p>Bulk-insert and import; search billed by CU</p></td>
     <td><p>Insert, upsert, and delete with low-latency search and query</p></td>
   </tr>
   <tr>
     <td><p>When to use</p></td>
     <td><p>Provisioning infrastructure and automation</p></td>
     <td><p>Batch processing, exploration, validation, experiments</p></td>
     <td><p>Production serving, always-on low-latency queries</p></td>
   </tr>
</table>

## Connect to a real-time serving cluster\{#connect-to-a-real-time-serving-cluster}

Zilliz Cloud offers the following types of serving clusters: Free, Serverless, and Dedicated. You need to follow the examples below to set up connections.

```python
from pymilvus import MilvusClient

# connect to a dedicated cluster
client = MilvusClient(
    uri="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530",
    token="YOUR_API_KEY"
)

# connect to a free / serverless cluster
client = MilvusClient(
    uri="https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)
```

You can use a valid API key with appropriate permissions or a cluster credential in `username:password` format as the authentication token.

## Connect to an on-demand compute cluster\{#connect-to-an-on-demand-compute-cluster}

Zilliz Cloud also provides standalone databases for on-demand compute requirements.

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    cluster="inxx-xxxxxxxxxxxxxxx",
    token="YOUR_API_KEY"
)
```

When connecting to an on-demand compute endpoint, you also need to set the cluster ID of an on-demand cluster so that you can use the compute resources in that cluster to perform searches and queries.

You can use a valid API key with appropriate permissions or a cluster credential in `username:password` format as the authentication token.

## Connect to Zilliz Cloud Control Plane API endpoint\{#connect-to-zilliz-cloud-control-plane-api-endpoint}

When you need to create clusters and volumes, or manage control-plane resources such as backups, restores, and migrations, use the platform endpoint.

For example, you can list available cloud providers as follows:

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/clouds" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

For details, refer to [RESTful API Reference](/reference/restful).