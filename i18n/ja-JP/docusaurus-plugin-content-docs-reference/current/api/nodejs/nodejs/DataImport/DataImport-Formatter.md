---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "このインターフェースは、バッファリングされた `BulkWriter` のカラムを1つ以上のファイルにシリアル化します。SDK は JSON 形式と Parquet 形式のフォーマッター実装を提供します。 | Node.js"
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

---

# Formatter

このインターフェースは、バッファリングされた `BulkWriter` のカラムを1つ以上のファイルにシリアル化します。SDK は JSON 形式と Parquet 形式のフォーマッター実装を提供します。

```typescript
interface Formatter
```

**フィールド：**

- **extension** (*string*) -

    **[必須]**

    フォーマッターが生成するファイル拡張子を指定します。

**メソッド：**

- `persist(columns: Map<string, any[]>, dynamicCol: Record<string, any>[], rowCount: number, dir: string, schema: BulkWriterSchema): Promise<string[]>`

    バッファリングされたカラムを `dir` 配下のファイルにシリアル化し、生成されたローカルファイルパスを返します。

## Example\{#example}

```javascript
class CustomFormatter {
    extension = '.json';
    async persist(columns, dynamicRows, rowCount, dir, schema) {
        return [];
    }
}
```
