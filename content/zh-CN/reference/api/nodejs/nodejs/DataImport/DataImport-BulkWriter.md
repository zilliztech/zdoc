---
title: "BulkWriter | Node.js"
slug: /node/node/DataImport-BulkWriter
sidebar_label: "BulkWriter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "此类为离线批量导入工作流生成与 Milvus 兼容的 JSON 或 Parquet 文件。当数据集过大，不适合使用常规的逐行插入操作时，可先将其准备为文件，再调用 `bulkInsert()`。 | Node.js"
type: docx
token: RSrRdD4fLoy50Bx5s2xcQ6lMnVd
sidebar_position: 10
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - BulkWriter
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# BulkWriter

此类为离线批量导入工作流生成与 Milvus 兼容的 JSON 或 Parquet 文件。当数据集过大，不适合使用常规的逐行插入操作时，可先将其准备为文件，再调用 `bulkInsert()`。

```typescript
const writer = new BulkWriter(options: BulkWriterOptions)
```

## Constructor\{#constructor}

```typescript
new BulkWriter({
    schema: BulkWriterSchema,
    storage?: Storage,
    format?: 'json' | 'parquet',
    chunkSize?: number,
    localPath?: string,
})
```

**PARAMETERS:**

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    **[REQUIRED]**

    定义集合字段和动态字段设置，用于验证行数据并序列化文件。

- **[storage](./DataImport-Storage)** (*[Storage](./DataImport-Storage)*) -

    指定自定义存储适配器。若省略，文件将保留在本地磁盘上。

- **format** (*'json' | 'parquet'*) -

    指定输出文件格式。默认为 `json`。从 v3.0.3 起，Parquet 输出使用 `@shanghaikid/parquetjs`。

- **chunkSize** (*number*) -

    指定触发自动刷新的近似缓冲字节大小。默认为 128 MB。

- **localPath** (*string*) -

    指定生成分块文件的本地基础目录。默认为当前工作目录。

**METHODS:**

- `append(row: Record<string, any>): Promise<void>`

    追加一行数据，并在缓冲数据达到 `chunkSize` 时自动提交。

- `commit(): Promise<void>`

    将当前缓冲区刷新到文件，并通过已配置的存储适配器进行存储。

- `close(): Promise<string[][]>`

    刷新剩余行数据，并按分块分组返回生成的文件路径。

- `writeFrom(source: AsyncIterable<Record<string, any>>): Promise<string[][]>`

    使用异步可迭代对象作为输入，追加其中的每一行，关闭 writer，并返回生成的文件路径。

**RETURNS:**

*BulkWriter*

## Example\{#example}

```javascript
import { BulkWriter, DataType } from '@zilliz/milvus2-sdk-node';

const writer = new BulkWriter({
    schema: {
        fields: [
            { name: 'id', data_type: DataType.Int64, is_primary_key: true },
            { name: 'vector', data_type: DataType.FloatVector, dim: 3 },
            { name: 'text', data_type: DataType.VarChar, max_length: 256 },
        ],
    },
    format: 'parquet',
});

await writer.append({ id: 1, vector: [0.1, 0.2, 0.3], text: 'alpha' });
const files = await writer.close();
console.log(files);
```
