---
title: "Node.js SDK リファレンス | Cloud"
slug: /nodejs
sidebar_label: "概要"
sidebar_position: 4
displayed_sidebar: nodeSidebar
beta: FALSE
notebook: FALSE
---

import Admonition from '@theme/Admonition';

# Node.js SDK リファレンス

[@zilliz/milvus2-sdk-node](https://github.com/milvus-io/milvus-sdk-node) は、Milvus および Zilliz Cloud の公式 Node.js SDK です。vector 類似度検索、メタデータフィルタリング、ならびに collection、index、ユーザー管理全般のための gRPC および HTTP クライアントを提供します。

## 機能

- **デュアルプロトコル対応** — gRPC と、gRPC をサポートしない環境（例: Cloudflare Workers、Vercel Edge）向けの HTTP クライアントに対応
- **vector 操作** — 類似度検索、再ランキング付きハイブリッド検索、sparse vector/BM25 検索
- **データ管理** — 挿入、upsert、削除、およびスカラーフィルターを使用したクエリ
- **柔軟なスキーマ** — マルチテナンシー向けの動的フィールドおよび partition key
- **一括操作** — 大規模インポート向けの `BulkWriter` とサーバーサイド一括インポート
- **エンタープライズ機能** — RBAC、resource group、データベース管理
- **可観測性** — OpenTelemetry トレーシング対応

## インストール

```bash
npm install @zilliz/milvus2-sdk-node
# or
yarn add @zilliz/milvus2-sdk-node
```

**要件:** Node.js v18+

## クイックスタート

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
