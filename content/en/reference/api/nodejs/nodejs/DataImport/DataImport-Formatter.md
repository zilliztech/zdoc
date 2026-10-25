---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Formatter instance serializes buffered column data into the output format the writer chose. | Node.js"
type: docx
token: BTfudvz2jojKXKx8KZ4c9LwpnUd
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

---

import Admonition from '@theme/Admonition';


# Formatter

A Formatter instance serializes buffered column data into the output format the writer chose.

```typescript
interface Formatter
```

The Formatter base is implemented by two classes: JsonFormatter for JSON row files, and ParquetFormatter for Parquet output.

## JsonFormatter\{#jsonformatter}

The JSON implementation of the Formatter interface: serializes each chunk into a single `data.json` row file, normalizing vector payloads into the wire format. This is the default formatter — BulkWriter uses it unless `format` is set to `parquet`.

```typescript
class JsonFormatter implements Formatter {
  readonly extension = '.json';

  async persist(
    columns: Map<string, any[]>,
    dynamicRows: Record<string, any>[],
    rowCount: number,
    dir: string,
    schema: BulkWriterSchema
  ): Promise<string[]>
}
```

**PARAMETERS:**

- **columns** (*Map&lt;string, any[]&gt;*) -

    The columnar batch the writer buffered: one array per Milvus field name, indexed by row position.

- **dynamicRows** (*Record&lt;string, any&gt;[]*) -

    The dynamic-field rows for the chunk, serialized as the `$meta` column when the schema enables dynamic fields.

- **rowCount** (*number*) -

    The number of rows in the batch; persist walks the column arrays from index 0 to rowCount minus one.

- **dir** (*string*) -

    The output directory; persist creates it when missing and writes `data.json` under it.

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    The collection schema the writer validated rows against; fields flagged autoID or function outputs are skipped.

## ParquetFormatter\{#parquetformatter}

The Parquet implementation of the Formatter interface: serializes each chunk into a single `data.parquet` file with `persist(columns, dynamicRows, rowCount, dir, schema)`; Milvus field types map to Parquet types the same way the Python SDK bulk writer maps them, and dynamic fields land in a `$meta` column.

```typescript
class ParquetFormatter implements Formatter {
  readonly extension = '.parquet';

  async persist(
    columns: Map<string, any[]>,
    dynamicRows: Record<string, any>[],
    rowCount: number,
    dir: string,
    schema: BulkWriterSchema
  ): Promise<string[]>
}
```

**PARAMETERS:**

- **columns** (*Map&lt;string, any[]&gt;*) -

    The columnar batch the writer buffered: one array per Milvus field name, indexed by row position.

- **dynamicRows** (*Record&lt;string, any&gt;[]*) -

    The dynamic-field rows for the chunk, serialized as the `$meta` column when the schema enables dynamic fields.

- **rowCount** (*number*) -

    The number of rows in the batch; persist walks the column arrays from index 0 to rowCount minus one.

- **dir** (*string*) -

    The output directory; persist creates it when missing and writes `data.parquet` under it.

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    The collection schema the writer validated rows against; fields flagged autoID or function outputs are skipped.

## Example\{#example}

```javascript
const formatter = new ParquetFormatter();
console.log(formatter.extension); // '.parquet'
```
