---
title: "BulkWriter | Node.js"
slug: /node/node/DataImport-BulkWriter
sidebar_label: "BulkWriter"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "BulkWriter 实例将 Milvus Schema 行转换为列式批次，并将其刷新到本地对象存储。 | Node.js"
type: docx
token: XTa5d642Aotj7GxLmwSc66xOnUc
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

import Admonition from '@theme/Admonition';


# BulkWriter

BulkWriter 实例将 Milvus Schema 行转换为列式批次，并将其刷新到本地对象存储。

## 请求语法\{#request-syntax}

```typescript
new BulkWriter({ schema, storage?, format?, chunkSize?, localPath? })
```

**参数：**

- **schema**（*[BulkWriterSchema](./DataImport-BulkWriterSchema)*）-

    写入器用于校验行的 Milvus Collection Schema。BulkWriter 会在构造时深拷贝该 Schema，因此调用方之后的修改不会影响此写入器。

- **format**（*string*）-

    格式化后分块文件的输出格式：`json` 或 `parquet`。默认为 `json`。

- **storage**（*[Storage](./DataImport-Storage)*）-

    用于持久化格式化文件的存储后端。默认为 LocalStorage。

- **chunkSize**（*number*）-

    缓冲行刷新到新分块时所依据的字节阈值。默认为 128 MB。

- **localPath**（*string*）-

    本地分块输出的基础目录。默认为当前工作目录；每个写入器实例都会写入一个随机子目录。

## 示例\{#example}

```javascript
const writer = new BulkWriter({
  schema,
  format: 'parquet',
});
await writer.append({ id: 1, vector: [0.1, 0.2] });
await writer.commit();
```
