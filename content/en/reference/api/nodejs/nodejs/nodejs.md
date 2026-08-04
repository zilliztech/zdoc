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

The [@zilliz/milvus2-sdk-node](https://github.com/milvus-io/milvus-sdk-node) is the official Node.js SDK for Milvus and Zilliz Cloud. It provides both gRPC and HTTP clients for vector similarity search, metadata filtering, and full collection, index, and user management.

## Features

- **Dual protocol support** — gRPC and HTTP clients for environments without gRPC support (e.g., Cloudflare Workers, Vercel Edge)
- **Vector operations** — Similarity search, hybrid search with reranking, sparse vector/BM25 search
- **Data management** — Insert, upsert, delete, and query with scalar filters
- **Schema flexibility** — Dynamic fields and partition keys for multi-tenancy
- **Bulk operations** — `BulkWriter` for large-scale imports and server-side bulk import
- **Enterprise features** — RBAC, resource groups, and database management
- **Observability** — OpenTelemetry tracing support

## Installation

```bash
npm install @zilliz/milvus2-sdk-node
# or
yarn add @zilliz/milvus2-sdk-node
```

**Requirements:** Node.js v18+

## Quick Start

```javascript
import { MilvusClient, DataType, MetricType } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({ address: 'localhost:19530' });

// Create collection with schema and index
await client.createCollection({
  collection_name: 'my_collection',
  fields: [
    { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
    { name: 'text', data_type: DataType.VarChar, max_length: 512 },
    { name: 'vector', data_type: DataType.FloatVector, dim: 128 },
  ],
  index_params: [{
    field_name: 'vector',
    index_type: 'HNSW',
    metric_type: MetricType.COSINE,
    params: { M: 16, efConstruction: 256 },
  }],
});

// Load, insert, and search
await client.loadCollection({ collection_name: 'my_collection' });
await client.insert({
  collection_name: 'my_collection',
  data: [{ vector: Array(128).fill(0.1), text: 'doc1' }],
});
const results = await client.search({
  collection_name: 'my_collection',
  data: [Array(128).fill(0.1)],
  limit: 10,
  output_fields: ['text'],
});
```

import DocCardList from '@theme/DocCardList';

<DocCardList />
