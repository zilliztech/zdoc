---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "此接口将已缓冲的 `BulkWriter` 列序列化到一个或多个文件中。SDK 提供 JSON 和 Parquet Formatter 实现。 | Node.js"
type: docx
token: CkuWdW6EXo8o9nxZsIrcBiSGn4d
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

---

# Formatter

此接口将已缓冲的 `BulkWriter` 列序列化到一个或多个文件中。SDK 提供 JSON 和 Parquet Formatter 实现。

```typescript
interface Formatter
```

**字段：**

- **extension** (*string*) -

    **[必需]**

    指定 Formatter 生成的文件扩展名。

**方法：**

- `persist(columns: Map<string, any[]>, dynamicCol: Record<string, any>[], rowCount: number, dir: string, schema: BulkWriterSchema): Promise<string[]>`

    将已缓冲的列序列化到 `dir` 下的文件中，并返回生成的本地文件路径。

## 示例\{#example}

```javascript
class CustomFormatter {
    extension = '.json';
    async persist(columns, dynamicRows, rowCount, dir, schema) {
        return [];
    }
}
```
