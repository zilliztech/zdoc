---
title: "Connect for On-Demand Search | Cloud"
slug: /connect-for-on-demand-search
sidebar_label: "Connect for On-Demand Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use a project endpoint when you want to run on-demand search or query workloads with compute from an on-demand cluster. | Cloud"
type: origin
token: BTrNwoEfYii1e9kf0BScWDpcnA2
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Connect for On-Demand Search

{/* Feature Availability banner — hidden for now, kept here as a usage reference.
    Remove the surrounding comment to show it. Write plain Markdown inside; only
    list the parts that apply (plans and/or regions).

<FeatureNote>

- On-demand search is generally available on the [Standard](/docs/pricing#standard) and [Enterprise](/docs/pricing#enterprise) plans.
- Currently supported in [AWS us-west-2](/docs/regions#aws-us-west-2), [AWS us-east-1](/docs/regions#aws-us-east-1), and [GCP us-central1](/docs/regions#gcp-us-central1); additional regions are rolling out.
- Project endpoints require a **Serverless** or **Dedicated** cluster in the same region.

</FeatureNote>

*/}

Use a project endpoint when you want to run on-demand search or query workloads with compute from an on-demand cluster.

<Admonition type="info" icon="📘" title="Note">

This page is for connecting to a project endpoint for on-demand search. If you want to connect to a Free, Serverless, or Dedicated serving cluster, see [Connect to Serving Clusters](./connect-to-clusters).

</Admonition>

## Endpoint format\{#endpoint-format}

| Endpoint type | Endpoint pattern | Use for |
| --- | --- | --- |
| Project endpoint | `<i>http</i>s://{project-id}.{region}.api.zillizcloud.com` | Data import, batch search, query, get, search, and hybrid search through an on-demand cluster. |

## Before you begin\{#before-you-begin}

- Get the project endpoint from the Zilliz Cloud console.

- Get the on-demand cluster ID that should provide compute resources for the search workload.

- Create an API key with sufficient permissions for the project and target data.

- Install a Milvus SDK for your use case. For details, refer to [Install SDKs](./install-sdks).

## Connect to a Project Endpoint\{#connect-to-a-project-endpoint}

Create a `MilvusClient` with the project endpoint and specify the on-demand cluster that should serve the request.

```plaintext
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    cluster="inxx-xxxxxxxxxxxxxxx",
    token="YOUR_API_KEY",
)
```

## Create a Search Session\{#create-a-search-session}

Use a session object to attach your operations to the on-demand cluster.

```plaintext
session = client.session(cluster_id="inxx-xxxxxxxxxxxxxxx")
```

Then use the session to run DQL operations such as `query`, `get`, `search`, and `hybrid_search`.

```plaintext
results = session.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="vector",
    limit=10,
)

print(results)
```

## Authentication\{#authentication}

When connecting to a project endpoint, use a valid API key as the authentication token.

Cluster credentials in `username:password` format are for serving cluster endpoints. For on-demand search through a project endpoint, use an API key with the required project permissions.

## When to Use This Connection\{#when-to-use-this-connection}

Use the project endpoint for batch processing, exploration, validation, experiments, and other workloads where on-demand compute is a better fit than always-on serving.

For production applications that require the full Collection API and always-on low-latency serving, connect to a Free, Serverless, or Dedicated serving cluster instead. See [Connect to Serving Clusters](./connect-to-clusters) for the serving cluster endpoint formats and connection examples.