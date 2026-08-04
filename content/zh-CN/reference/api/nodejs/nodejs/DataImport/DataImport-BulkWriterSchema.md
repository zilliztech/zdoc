---
title: "BulkWriterSchema | Node.js"
slug: /node/node/DataImport-BulkWriterSchema
sidebar_label: "BulkWriterSchema"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "此接口描述了 `BulkWriter` 用于验证行并生成 Milvus 可导入的 JSON 或 Parquet 文件的集合 schema。 | Node.js"
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

此接口描述了 `BulkWriter` 使用的集合 schema，用于验证行并生成 Milvus 可导入的 JSON 或 Parquet 文件。

```typescript
interface BulkWriterSchema
```

**字段：**

- **fields** (*FieldType[]*) -

    **[必填]**

    指定集合字段。标记为 `autoID` 或 `is_function_output` 的字段将不会包含在生成的导入文件中。

- **enable_dynamic_field** (*boolean*) -

    指定是否将动态字段收集到 `$meta` 列中。

## 示例\{#example}

```javascript
const schema = {
    enable_dynamic_field: true,
    fields: [
        { name: 'id', data_type: DataType.Int64, is_primary_key: true },
        { name: 'vector', data_type: DataType.FloatVector, dim: 3 },
    ],
};
```
