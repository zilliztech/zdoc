---
title: "BulkWriterSchema | Node.js"
slug: /node/node/DataImport-BulkWriterSchema
sidebar_label: "BulkWriterSchema"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "This interface describes the collection schema used by `BulkWriter` to validate rows and generate JSON or Parquet files that Milvus can import. | Node.js"
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

This interface describes the collection schema used by `BulkWriter` to validate rows and generate JSON or Parquet files that Milvus can import.

```typescript
interface BulkWriterSchema
```

**FIELDS:**

- **fields** (*FieldType[]*) -

    **[REQUIRED]**

    Specifies collection fields. Fields marked as `autoID` or `is_function_output` are excluded from generated import files.

- **enable_dynamic_field** (*boolean*) -

    Specifies whether dynamic fields are collected into the `$meta` column.

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
