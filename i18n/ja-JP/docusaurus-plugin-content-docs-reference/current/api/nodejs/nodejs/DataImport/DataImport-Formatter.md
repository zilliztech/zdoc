---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "このインターフェースは、バッファリングされた `BulkWriter` の columns を1つ以上のファイルにシリアライズします。SDK は JSON および Parquet の formatter 実装を提供します。 | Node.js"
type: docx
token: CkuWdW6EXo8o9nxZsIrcBiSGn4d
sidebar_position: 14
keywords: 
  - 字句検索
  - 最近傍探索
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

このインターフェースは、バッファリングされた `BulkWriter` の columns を1つ以上のファイルにシリアライズします。SDK は JSON および Parquet の formatter 実装を提供します。

```typescript
interface Formatter
```

**FIELDS:**

- **extension** (*string*) -

    **[REQUIRED]**

    formatter が生成するファイル拡張子を指定します。

**METHODS:**

- `persist(columns: Map<string, any[]>, dynamicCol: Record<string, any>[], rowCount: number, dir: string, schema: BulkWriterSchema): Promise<string[]>`

    バッファリングされた columns を `dir` 配下のファイルにシリアライズし、生成されたローカルファイルパスを返します。

## Example\{#example}

```javascript
class CustomFormatter {
    extension = '.json';
    async persist(columns, dynamicRows, rowCount, dir, schema) {
        return [];
    }
}
```
