---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "通过 JSON 或 Parquet 格式化器实现，将缓冲的 BulkWriter 列序列化为一个或多个导入文件。 | Node.js"
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

通过 JSON 或 Parquet 格式化器实现，将缓冲的 BulkWriter 列序列化为一个或多个导入文件。

```typescript
interface Formatter
```

**实现：**

- `class JsonFormatter implements Formatter`

    将缓冲的行写入 JSON 文件，其顶层 `rows` 属性包含序列化后的实体；启用动态字段时，也会包含动态字段。

    - `extension` -

        **[必需]**

        为生成的文件返回 `.json`。

    - `persist` -

        **[必需]**

        序列化缓冲的列，并返回生成的 JSON 文件路径。

- `class ParquetFormatter implements Formatter`

    使用 `@shanghaikid/parquetjs` 将缓冲的行写入 Parquet 文件，并将 Milvus 的标量、向量、数组和动态字段值转换为与 Parquet 兼容的表示形式。

    - `extension` -

        **[必需]**

        为生成的文件返回 `.parquet`。

    - `persist` -

        **[必需]**

        序列化缓冲的列，并返回生成的 Parquet 文件路径。

## 示例\{#example}

### 选择一个格式化器实现\{#choose-a-formatter-implementation}

创建 SDK 暴露的 JSON 和 Parquet 实现。

```javascript
import { JsonFormatter, ParquetFormatter } from '@zilliz/milvus2-sdk-node';

const jsonFormatter = new JsonFormatter();
const parquetFormatter = new ParquetFormatter();

console.log(jsonFormatter.extension); // .json
console.log(parquetFormatter.extension); // .parquet
```

## 注意事项\{#notes}

- `Formatter` 接口公开只读的 `extension` 字段以及 `persist(columns, dynamicRows, rowCount, dir, schema)` 方法，该方法返回生成的本地文件路径。

- 当 `format` 为 `json` 时，BulkWriter 会选择 `JsonFormatter`；当 `format` 为 `parquet` 时，BulkWriter 会选择 `ParquetFormatter`。

- Parquet 输出依赖 SDK 依赖项 `@shanghaikid/parquetjs`。

