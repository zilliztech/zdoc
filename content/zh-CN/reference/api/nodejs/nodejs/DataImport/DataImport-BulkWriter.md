---
title: "BulkWriter | Node.js"
slug: /node/node/DataImport-BulkWriter
sidebar_label: "BulkWriter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "此类生成兼容 Milvus 的 JSON 或 Parquet 文件，用于离线批量导入工作流。当数据集对于常规逐行插入操作而言过大，且应先暂存为文件再调用 `bulkInsert()` 时，请使用此类。 | Node.js"
type: docx
token: RSrRdD4fLoy50Bx5s2xcQ6lMnVd
sidebar_position: 10
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - 向量 Database
  - 多模态向量 Database 检索
  - zilliz
  - Zilliz Cloud
  - 云
  - BulkWriter
  - nodejs30
displayed_sidebar: nodeSidebar

---

# BulkWriter

此类生成兼容 Milvus 的 JSON 或 Parquet 文件，用于离线批量导入工作流。当数据集对于常规逐行插入操作而言过大，且应先暂存为文件再调用 `bulkInsert()` 时，请使用此类。

```javascript
const writer = new BulkWriter(options: BulkWriterOptions)
```

## 构造函数\{#constructor}

```javascript
const writer = new BulkWriter(options: BulkWriterOptions)
```

基于 **BulkWriterOptions** 对象构造 **BulkWriter** 实例，该对象用于配置 Schema 验证、存储行为、文件格式、分块大小和本地输出路径。请参见下方的 [BulkWriterOptions](#bulkwriteroptions)。

## 方法\{#methods}

**方法：**

- `get totalRowCount(): number`

    追加到此写入器的行总数。

- `get bufferRowCount(): number`

    当前已缓冲但尚未刷新的行数。

- `get batchFiles(): string[][]`

    截至目前生成的所有分块的文件路径，按分块分组。

- `append(row: Record<string, any>): Promise<void>`

    追加一行，并在缓冲数据达到 `chunkSize` 时自动提交。

- `commit(): Promise<void>`

    将当前缓冲区刷新到文件，并通过配置的存储适配器进行存储。

- `close(): Promise<string[][]>`

    刷新剩余行，并返回按分块分组的生成文件路径。

- `writeFrom(source: AsyncIterable<Record<string, any>>): Promise<string[][]>`

    消费异步可迭代对象，追加每一行，关闭写入器并返回生成的文件路径。

- `flush` 事件（*FlushEvent*）

    每次写入并存储一个分块时发出。该事件包含为该分块生成的文件、该分块中的行数以及分块索引。

    - **files**（*string[]*）-

        为已刷新的分块生成的文件。

    - **rowCount**（*number*）-

        已刷新的行数。

    - **chunkIndex**（*number*）-

        已刷新分块的从 0 开始的索引。

**返回：**

*BulkWriter*

## BulkWriterOptions\{#bulkwriteroptions}

`BulkWriter` 构造函数接受的选项对象。

```javascript
interface BulkWriterOptions {
    schema: BulkWriterSchema;
    storage?: Storage;
    format?: 'json' | 'parquet';
    chunkSize?: number;
    localPath?: string;
}
```

**字段：**

- **schema**（*[BulkWriterSchema](./DataImport-BulkWriterSchema)*）-

    **[必需]**

    定义用于验证行并序列化文件的 Collection 字段和动态字段设置。

- **[storage](./DataImport-Storage)**（*[Storage](./DataImport-Storage)*）-

    指定自定义存储适配器。如果省略此参数，`LocalStorage` 会将生成的文件保留在磁盘上。

- **format**（*'json' | 'parquet'*）-

    指定输出文件格式。该值默认为 `json`。从 v3.0.3 起，Parquet 输出使用 `@shanghaikid/parquetjs`。

- **chunkSize**（*number*）-

    指定触发自动刷新的近似缓冲字节大小。该值默认为 128 MB。

- **localPath**（*string*）-

    指定生成分块的本地基础目录。该值默认为当前工作目录。

## Formatter\{#formatter}

此接口将缓冲的列集合序列化到一个或多个导入文件中。当 `format` 为 `json` 时，`BulkWriter` 选择 `JsonFormatter`；当 `format` 为 `parquet` 时，选择 `ParquetFormatter`。

```javascript
interface Formatter {
    readonly extension: string;
    persist(columns, dynamicCol, rowCount, dir, schema): Promise<string[]>;
}
```

**字段：**

- **extension**（*string*）-

    生成文件的文件扩展名（例如，`.json` 或 `.parquet`）。

**方法：**

- `persist(columns: Map<string, any[]>, dynamicCol: Record<string, any>[], rowCount: number, dir: string, schema: BulkWriterSchema): Promise<string[]>`

    序列化已缓冲的列，并返回生成的本地文件路径。

    - **columns**（*Map&lt;string, any[]&gt;*）-

        已缓冲的列数据。

    - **dynamicCol**（*Record&lt;string, any&gt;[]*）-

        动态字段对应的行。

    - **rowCount**（*number*）-

        正在序列化的行数。

    - **dir**（*string*）-

        输出目录。

    - **schema**（*[BulkWriterSchema](./DataImport-BulkWriterSchema)*）-

        用于解释这些列的 Schema。

**实现：**

- `class JsonFormatter`

    将已缓冲的行写入 JSON 文件，该文件的顶层 `rows` 属性包含序列化后的 Entity，并在启用动态字段时包含这些动态字段。

- `class ParquetFormatter`

    使用 `@shanghaikid/parquetjs` 将已缓冲的行写入 Parquet 文件，并将 Milvus 标量、向量、数组和动态字段值转换为 Parquet 兼容的表示形式。需要 SDK 依赖 `@shanghaikid/parquetjs`。

## 示例\{#example}

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
