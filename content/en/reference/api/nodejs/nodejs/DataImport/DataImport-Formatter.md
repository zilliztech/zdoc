---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "Serializes buffered BulkWriter columns into one or more import files through the JSON or Parquet formatter implementation. | Node.js"
type: docx
token: CkuWdW6EXo8o9nxZsIrcBiSGn4d
sidebar_position: 14
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - Formatter
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# Formatter

Serializes buffered BulkWriter columns into one or more import files through the JSON or Parquet formatter implementation.

```typescript
interface Formatter
```

**IMPLEMENTATIONS:**

- `class JsonFormatter implements Formatter`

    Writes buffered rows to a JSON file whose top-level rows property contains the serialized entities, including dynamic fields when enabled.

    - `extension` -

        **[REQUIRED]**

        Returns .json for generated files.

    - `persist` -

        **[REQUIRED]**

        Serializes the buffered columns and returns the generated JSON file paths.

- `class ParquetFormatter implements Formatter`

    Writes buffered rows to Parquet files using @shanghaikid/parquetjs and converts Milvus scalar, vector, array, and dynamic-field values to Parquet-compatible representations.

    - `extension` -

        **[REQUIRED]**

        Returns .parquet for generated files.

    - `persist` -

        **[REQUIRED]**

        Serializes the buffered columns and returns the generated Parquet file paths.

## Example\{#example}

### Choose a formatter implementation\{#choose-a-formatter-implementation}

Creates the JSON and Parquet implementations exposed by the SDK.

```javascript
import { JsonFormatter, ParquetFormatter } from '@zilliz/milvus2-sdk-node';

const jsonFormatter = new JsonFormatter();
const parquetFormatter = new ParquetFormatter();

console.log(jsonFormatter.extension); // .json
console.log(parquetFormatter.extension); // .parquet
```

## Notes\{#notes}

- The Formatter interface exposes the readonly `extension` field and the `persist(columns, dynamicRows, rowCount, dir, schema)` method, which returns the generated local file paths.

- BulkWriter selects JsonFormatter when `format` is `json` and ParquetFormatter when `format` is `parquet`.

- Parquet output requires the SDK dependency `@shanghaikid/parquetjs`.

