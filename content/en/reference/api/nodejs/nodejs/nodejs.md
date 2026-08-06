---
title: "Node.js SDK Reference | Cloud"
slug: /nodejs
sidebar_label: "Overview"
sidebar_position: 4
displayed_sidebar: nodeSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Node.js SDK Reference

[`@zilliz/milvus2-sdk-node`](https://github.com/milvus-io/milvus-sdk-node) is the Node.js SDK for Zilliz Cloud. It provides JavaScript and TypeScript clients for collection management, data operations, vector search, and cluster administration, with both gRPC and HTTP client implementations.

## Features

- **JavaScript and TypeScript support** — Use exported client classes, request types, response types, and enums from the same package.
- **gRPC and HTTP clients** — Use `MilvusClient` for the main gRPC API or `HttpClient` when an HTTP transport is required.
- **Data and vector operations** — Insert, upsert, delete, query, search, and run hybrid searches with scalar filtering and reranking options.
- **Collection and index management** — Create schemas, collections, and indexes, then load or release collections.
- **Cloud administration** — Work with databases, partitions, users, roles, and resource groups available to your cluster.
- **Bulk and observability utilities** — Use BulkWriter APIs for import preparation and enable tracing through the client configuration when needed.

## Installation

The current SDK requires Node.js 18 or later.

```bash
npm install @zilliz/milvus2-sdk-node
```

You can also install it with Yarn:

```bash
yarn add @zilliz/milvus2-sdk-node
```

## Connect to Zilliz Cloud

Copy the public endpoint from the cluster **Connect** card and use an API key or cluster credential as the token.

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const CLUSTER_ENDPOINT = 'YOUR_CLUSTER_ENDPOINT';
const TOKEN = 'YOUR_CLUSTER_TOKEN';

const client = new MilvusClient({
  address: CLUSTER_ENDPOINT,
  token: TOKEN,
});

await client.connectPromise;

try {
  const response = await client.listCollections();
  console.log(response);
} finally {
  await client.closeConnection();
}
```

## Resources

- [Node.js SDK source repository](https://github.com/milvus-io/milvus-sdk-node)
- [npm package](https://www.npmjs.com/package/@zilliz/milvus2-sdk-node)
- [Node.js SDK releases](https://github.com/milvus-io/milvus-sdk-node/releases)

import DocCardList from '@theme/DocCardList';

<DocCardList />
