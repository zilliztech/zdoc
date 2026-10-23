---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Formatter 实例将缓冲的列数据序列化为写入器所选的输出格式。 | Node.js"
type: docx
token: BTfudvz2jojKXKx8KZ4c9LwpnUd
sidebar_position: 14
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - Zilliz
  - Zilliz Cloud
  - 云
  - Formatter
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# Formatter

Formatter 实例将缓冲的列数据序列化为写入器所选的输出格式。

```typescript
interface Formatter
```

Formatter 基础接口由两个类实现：用于 JSON 行文件的 JsonFormatter，以及用于 Parquet 输出的 ParquetFormatter。

## JsonFormatter\{#jsonformatter}

Formatter 接口的 JSON 实现：将每个数据块序列化为单个 `data.json` 行文件，并将向量载荷规范化为传输格式。这是默认的 Formatter，除非将 `format` 设置为 `parquet`，否则 BulkWriter 会使用它。

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

**参数：**

- **columns** (*Map&lt;string, any[]&gt;*) -

    写入器缓冲的列式批次：每个 Milvus 字段名对应一个数组，并按行位置建立索引。

- **dynamicRows** (*Record&lt;string, any&gt;[]*) -

    该数据块的动态字段行；当 Schema 启用动态字段时，这些行会序列化为 `$meta` 列。

- **rowCount** (*number*) -

    批次中的行数；persist 会从索引 0 遍历列数组，直到 rowCount 减 1。

- **dir** (*string*) -

    输出目录；如果该目录不存在，persist 会创建它，并在其中写入 `data.json`。

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    写入器用于验证各行的 Collection Schema；标记为 autoID 或函数输出的字段会被跳过。

## ParquetFormatter\{#parquetformatter}

Formatter 接口的 Parquet 实现：使用 `persist(columns, dynamicRows, rowCount, dir, schema)` 将每个数据块序列化为单个 `data.parquet` 文件；Milvus 字段类型到 Parquet 类型的映射方式与 Python SDK 批量写入器相同，动态字段则写入 `$meta` 列。

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

**参数：**

- **columns** (*Map&lt;string, any[]&gt;*) -

    写入器缓冲的列式批次：每个 Milvus 字段名对应一个数组，并按行位置建立索引。

- **dynamicRows** (*Record&lt;string, any&gt;[]*) -

    该数据块的动态字段行；当 Schema 启用动态字段时，这些行会序列化为 `$meta` 列。

- **rowCount** (*number*) -

    批次中的行数；persist 会从索引 0 遍历列数组，直到 rowCount 减 1。

- **dir** (*string*) -

    输出目录；如果该目录不存在，persist 会创建它，并在其中写入 `data.parquet`。

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    写入器用于验证各行的 Collection Schema；标记为 autoID 或函数输出的字段会被跳过。

## 示例\{#example}

```javascript
const formatter = new ParquetFormatter();
console.log(formatter.extension); // '.parquet'
```
