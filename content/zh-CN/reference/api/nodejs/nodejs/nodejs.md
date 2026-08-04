---
title: "Node.js SDK Reference | Cloud"
slug: /nodejs
sidebar_label: "概览"
sidebar_position: 4
displayed_sidebar: nodeSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Node.js SDK 参考

[@zilliz/milvus2-sdk-node](https://github.com/milvus-io/milvus-sdk-node) 是 Milvus 和 Zilliz Cloud 的官方 Node.js SDK。它同时提供 gRPC 和 HTTP 客户端，可用于执行向量相似性搜索、元数据过滤，以及集合、索引和用户的完整管理操作。借助这一 SDK，开发者可以在 Node.js 环境中以统一的方式访问核心向量数据库能力，并根据运行环境选择合适的通信协议。

## 功能特性

- **双协议支持** — 提供 gRPC 和 HTTP 客户端，适用于不支持 gRPC 的运行环境，例如 Cloudflare Workers 和 Vercel Edge
- **向量操作** — 支持相似性搜索、结合重排序的混合搜索，以及稀疏向量/BM25 搜索
- **数据管理** — 支持插入、upsert、删除，以及带标量过滤条件的查询
- **Schema 灵活性** — 支持动态字段和分区键，便于实现多租户场景
- **批量操作** — 提供用于大规模导入的 `BulkWriter`，以及服务端批量导入能力
- **企业级特性** — 支持 RBAC、资源组和数据库管理
- **可观测性** — 支持 OpenTelemetry 链路追踪

## 安装

```bash
npm install @zilliz/milvus2-sdk-node
# or
yarn add @zilliz/milvus2-sdk-node
```

**要求：** Node.js v18+

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

以上示例展示了一个典型流程：先创建包含 schema 和索引的集合，然后加载集合、写入数据，最后执行向量搜索并返回指定字段。你可以在此基础上进一步扩展业务逻辑，例如添加过滤条件、配置不同索引参数、接入混合搜索流程，或在应用中集成更完整的集合与权限管理能力。

import DocCardList from '@theme/DocCardList';

<DocCardList />
