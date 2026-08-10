---
title: "Node.js SDK 参考 | Cloud"
slug: /nodejs
sidebar_label: "概览"
sidebar_position: 4
displayed_sidebar: nodeSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Node.js SDK 参考

[@zilliz/milvus2-sdk-node](https://github.com/milvus-io/milvus-sdk-node) 是适用于 Milvus 和 Zilliz Cloud 的官方 Node.js SDK。它同时提供 gRPC 和 HTTP 客户端，用于向量相似性搜索、元数据过滤，以及完整的 Collection、索引和用户管理。

## 功能

- **双协议支持** — 为不支持 gRPC 的环境提供 gRPC 和 HTTP 客户端（例如 Cloudflare Workers、Vercel Edge）
- **向量操作** — 相似性搜索、结合重排的混合搜索、稀疏向量/BM25搜索
- **数据管理** — 插入、upsert、删除，以及结合标量过滤器的查询
- **Schema 灵活性** — 用于多租户的动态字段和 Partition 键
- **批量操作** — `BulkWriter`，用于大规模导入和服务器端批量导入
- **企业功能** — RBAC、资源组和 Database 管理
- **可观测性** — 支持 OpenTelemetry 跟踪

## 安装

```bash
npm install @zilliz/milvus2-sdk-node
# or
yarn add @zilliz/milvus2-sdk-node
```

**要求：**Node.js v18+

## 快速开始

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
