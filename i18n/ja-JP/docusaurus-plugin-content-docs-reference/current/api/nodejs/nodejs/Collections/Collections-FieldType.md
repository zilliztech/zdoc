---
title: "FieldType | Node.js"
slug: /node/node/Collections-FieldType
sidebar_label: "FieldType"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションスキーマでサポートされているフィールドタイプについて説明します。 | Node.js"
type: origin
token: shared-Collections-FieldType
keywords: 
  - フィールドタイプ
  - スキーマ
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FieldType

コレクションスキーマの 1 つのフィールドについて説明します。

```typescript
export type FieldType = {
  name: string;
  description?: string;
  data_type: DataType | keyof typeof DataTypeMap;
  element_type?: DataType | keyof typeof DataTypeMap;
  is_primary_key?: boolean;
  is_partition_key?: boolean;
  is_function_output?: boolean;
  is_clustering_key?: boolean;
  type_params?: Partial<Record<TypeParamKey, TypeParam>>;
  autoID?: boolean;
  default_value?: number | string;
  nullable?: boolean;
  external_field?: string;
  fields?: FieldType[];
} & Partial<Record<TypeParamKey, TypeParam>>;
```

**フィールド:**

- **name** (*string*) -

    フィールド名です。

- **description** (*string*) -

    フィールドの説明です。省略可能です。

- **data_type** (*DataType | keyof typeof DataTypeMap*) -

    フィールドのデータ型です。

- **element_type** (*DataType | keyof typeof DataTypeMap*) -

    配列フィールドの要素型です。

- **is_primary_key** (*boolean*) -

    フィールドがプライマリキーであるかどうかを示します。

- **is_partition_key** (*boolean*) -

    フィールドがパーティションキーであるかどうかを示します。

- **is_function_output** (*boolean*) -

    フィールドが関数（例: テキスト埋め込みの出力）によって値が設定されるかどうかを示します。

- **is_clustering_key** (*boolean*) -

    フィールドがクラスタリングキーであるかどうかを示します。

- **type_params** (*Partial&lt;Record&lt;TypeParamKey, TypeParam&gt;&gt;*) -

    次元や最大長などの型パラメーターです。

- **autoID** (*boolean*) -

    プライマリキーの値が自動生成されるかどうかを示します。

- **default_value** (*number | string*) -

    フィールドのデフォルト値です。

- **nullable** (*boolean*) -

    フィールドが null 値を受け入れるかどうかを示します。

- **external_field** (*string*) -

    外部フィールドのマッピング名です。

- **fields** (*FieldType[]*) -

    構造体フィールドのネストされたフィールドです。

## 例\{#example}

```javascript
import { MilvusClient, DataType, FieldType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const fields = [
    { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
    { name: 'text', data_type: DataType.VarChar, type_params: { max_length: 512 } },
    { name: 'vector', data_type: DataType.FloatVector, type_params: { dim: 8 } },
];

await milvusClient.createCollection({
    collection_name: 'my_collection',
    fields,
});
```

