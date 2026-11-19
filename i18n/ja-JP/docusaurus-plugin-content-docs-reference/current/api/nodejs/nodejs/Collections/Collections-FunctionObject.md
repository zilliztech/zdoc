---
title: "FunctionObject | Node.js"
slug: /node/node/Collections-FunctionObject
sidebar_label: "FunctionObject"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションスキーマで使用される関数オブジェクトについて説明します。 | Node.js"
type: origin
token: shared-Collections-FunctionObject
keywords: 
  - 関数オブジェクト
  - bm25
  - スキーマ
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionObject

コレクションにアタッチされた doc-in/doc-out 関数（テキスト埋め込み関数など）について説明します。この関数は、コレクション作成リクエストの `functions` を介して渡されます。

```typescript
export type FunctionObject = {
  name: string;
  description?: string;
  type: FunctionType | FunctionTypeName;
  input_field_names: string[];
  output_field_names?: string[];
  params: Record<string, any>;
};
```

**フィールド:**

- **name** (*string*) -

    関数の名前です。

- **description** (*string*) -

    関数の説明（省略可能）です。

- **type** (*FunctionType | FunctionTypeName*) -

    関数の型です。

- **input_field_names** (*string[]*) -

    関数の入力フィールド名です。

- **output_field_names** (*string[]*) -

    関数の出力フィールド名です。

- **params** (*Record&lt;string, any&gt;*) -

    関数のパラメーターです。

## 例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createCollection({
    collection_name: 'my_collection',
    functions: [
        {
            name: 'text_embedding',
            type: FunctionType.TEXTEMBEDDING,
            input_field_names: ['text'],
            output_field_names: ['vector'],
            params: { model: 'bge-large-zh-v1.5' },
        },
    ],
});
```
