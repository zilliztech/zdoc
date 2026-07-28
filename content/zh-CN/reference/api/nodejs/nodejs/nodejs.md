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

[@zilliz/milvus2-sdk-node](https://github.com/milvus-io/milvus-sdk-node) 是适用于 Milvus 和 Zilliz Cloud 的官方 Node.js SDK。它同时提供 gRPC 和 HTTP 客户端，可用于执行向量相似性搜索、元数据过滤，以及集合、索引和用户的完整管理操作。对于希望在 JavaScript 或 TypeScript 运行时中集成向量数据库能力的开发者来说，该 SDK 提供了一套统一且易于使用的接口。

## 功能特性

- **双协议支持** — 同时提供 gRPC 和 HTTP 客户端，适用于不支持 gRPC 的运行环境，例如 Cloudflare Workers、Vercel Edge 等
- **向量操作** — 支持相似性搜索、结合重排的混合搜索，以及稀疏向量/BM25 搜索
- **数据管理** — 支持插入、upsert、删除，以及结合标量过滤条件的查询
- **灵活的 Schema** — 支持动态字段和分区键，便于实现多租户场景
- **批量操作** — 提供用于大规模导入的 `BulkWriter`，以及服务端批量导入能力
- **企业级特性** — 支持 RBAC、resource groups 和数据库管理
- **可观测性** — 支持 OpenTelemetry tracing，便于监控与排障

## 安装

```bash
npm install @zilliz/milvus2-sdk-node
# or
yarn add @zilliz/milvus2-sdk-node
```

**要求：** Node.js v18+

## 快速开始

下面的示例展示了如何使用 `MilvusClient` 创建集合、定义 schema 和索引，然后完成加载、写入和搜索等常见操作。你可以在本地 Milvus 实例中直接运行这些代码，也可以在连接参数配置完成后将其用于 Zilliz Cloud 环境。示例中的向量字段、文本字段和索引参数可根据你的业务数据结构进行调整。

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

在上述流程中，`createCollection` 用于定义集合结构并创建向量索引，`loadCollection` 会将集合加载到可搜索状态，`insert` 负责写入数据，而 `search` 则返回最相似的结果。若你需要进一步了解各个 API 的参数、请求格式和返回值说明，可继续查看下方的详细参考文档列表。

import DocCardList from '@theme/DocCardList';

<DocCardList />
