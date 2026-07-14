---
title: "BulkWriterSchema | Node.js"
slug: /node/node/DataImport-BulkWriterSchema
sidebar_label: "BulkWriterSchema"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "`BulkWriter` が行を検証し、Milvus がインポートできる JSON または Parquet ファイルを生成するために使用するコレクションスキーマを説明するインターフェースです。 | Node.js"
type: docx
token: U7w6d4gUioGzw2xmYqvcFz1Jnub
sidebar_position: 12
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - BulkWriterSchema
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# BulkWriterSchema

このインターフェースは、`BulkWriter` が行を検証し、Milvus がインポートできる JSON または Parquet ファイルを生成するために使用するコレクションスキーマを説明します。

```typescript
interface BulkWriterSchema
```

**FIELDS:**

- **fields** (*FieldType[]*) -

    **[REQUIRED]**

    コレクションフィールドを指定します。`autoID` または `is_function_output` としてマークされたフィールドは、生成されるインポートファイルから除外されます。

- **enable_dynamic_field** (*boolean*) -

    動的フィールドを `$meta` 列に収集するかどうかを指定します。

## Example\{#example}

```javascript
const schema = {
    enable_dynamic_field: true,
    fields: [
        { name: 'id', data_type: DataType.Int64, is_primary_key: true },
        { name: 'vector', data_type: DataType.FloatVector, dim: 3 },
    ],
};
```
