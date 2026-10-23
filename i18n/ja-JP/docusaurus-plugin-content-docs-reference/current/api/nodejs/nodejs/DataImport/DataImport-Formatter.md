---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Formatter インスタンスは、バッファされた列データを、ライターが選択した出力形式にシリアライズします。 | Node.js"
type: docx
token: BTfudvz2jojKXKx8KZ4c9LwpnUd
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

Formatter インスタンスは、バッファされた列データを、ライターが選択した出力形式にシリアライズします。

```typescript
interface Formatter
```

Formatter 基底クラスは、JSON 行ファイル用の JsonFormatter と Parquet 出力用の ParquetFormatter の 2 つのクラスによって実装されています。

## JsonFormatter\{#jsonformatter}

Formatter インターフェースの JSON 実装です。各チャンクを単一の `data.json` 行ファイルにシリアライズし、ベクトルペイロードをワイヤ形式に正規化します。これはデフォルトの formatter です。`format` が `parquet` に設定されていない限り、BulkWriter はこれを使用します。

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

    ライターがバッファした列指向バッチです。Milvus のフィールド名ごとに 1 つの配列があり、行位置によってインデックスが付けられます。

- **dynamicRows** (*Record&lt;string, any&gt;[]*) -

    チャンクの動的フィールド行です。スキーマで動的フィールドが有効になっている場合は、`$meta` 列としてシリアライズされます。

- **rowCount** (*number*) -

    バッチ内の行数です。persist は、インデックス 0 から rowCount から 1 を引いた値まで、列配列を走査します。

- **dir** (*string*) -

    出力ディレクトリです。persist は、存在しない場合にこれを作成し、その下に `data.json` を書き込みます。

- **スキーマ** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    ライターが行の検証に使用したコレクションスキーマです。autoID または関数出力としてフラグが設定されたフィールドはスキップされます。

## ParquetFormatter\{#parquetformatter}

Formatter インターフェースの Parquet 実装です。`persist(columns, dynamicRows, rowCount, dir, schema)` を使用して各チャンクを単一の `data.parquet` ファイルにシリアライズします。Milvus のフィールド型は、Python SDK の bulk writer がマッピングするのと同じ方法で Parquet 型にマッピングされ、動的フィールドは `$meta` 列に格納されます。

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

    ライターがバッファした列指向バッチです。Milvus のフィールド名ごとに 1 つの配列があり、行位置によってインデックスが付けられます。

- **dynamicRows** (*Record&lt;string, any&gt;[]*) -

    チャンクの動的フィールド行です。スキーマで動的フィールドが有効になっている場合は、`$meta` 列としてシリアライズされます。

- **rowCount** (*number*) -

    バッチ内の行数です。persist は、インデックス 0 から rowCount から 1 を引いた値まで、列配列を走査します。

- **dir** (*string*) -

    出力ディレクトリです。persist は、存在しない場合にこれを作成し、その下に `data.parquet` を書き込みます。

- **スキーマ** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    ライターが行の検証に使用したコレクションスキーマです。autoID または関数出力としてフラグが設定されたフィールドはスキップされます。

## Example\{#example}

```javascript
const formatter = new ParquetFormatter();
console.log(formatter.extension); // '.parquet'
```
