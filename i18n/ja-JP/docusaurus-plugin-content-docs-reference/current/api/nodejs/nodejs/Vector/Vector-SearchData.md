---
title: "SearchData | Node.js"
slug: /node/node/Vector-SearchData
sidebar_label: "SearchData"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "サポートされている検索入力形式のいずれかにおける検索対象エントリです。 | Node.js"
type: origin
token: shared-Vector-SearchData
keywords: 
  - 検索データ
  - 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# SearchData

検索対象のエントリです。サポートされている検索入力形式のいずれかです。

```typescript
export type SearchData = SearchVector | SearchText | SearchEmbList;

```

**FIELDS:**

- **SearchVector**

    ベクトル入力です。

- **SearchText**

    全文検索および埋め込み検索用のテキスト入力です。

- **SearchEmbList**

    埋め込みリスト入力です。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.search({
    collection_name: 'my_collection',
    vector: [0.1, 0.2, 0.3, 0.4], // SearchData (SearchVector)
    limit: 5,
});
```
