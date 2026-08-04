---
title: "Formatter | Node.js"
slug: /node/node/DataImport-Formatter
sidebar_label: "Formatter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "JSON または Parquet の formatter 実装を通じて、バッファされた BulkWriter の列を 1 つ以上のインポートファイルにシリアライズします。 | Node.js"
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

JSON または Parquet の formatter 実装を通じて、バッファされた BulkWriter の列を 1 つ以上のインポートファイルにシリアライズします。

```typescript
interface Formatter
```

**実装:**

- `class JsonFormatter implements Formatter`

    バッファされた行を JSON ファイルに書き込みます。トップレベルの `rows` プロパティには、動的フィールドが有効な場合はそれを含む、シリアライズされた entity が格納されます。

    - `extension` -

        **[必須]**

        生成されるファイルに対して `.json` を返します。

    - `persist` -

        **[必須]**

        バッファされた列をシリアライズし、生成された JSON ファイルパスを返します。

- `class ParquetFormatter implements Formatter`

    `@shanghaikid/parquetjs` を使用してバッファされた行を Parquet ファイルに書き込み、Milvus の scalar、vector、array、および動的フィールドの値を Parquet 互換の表現に変換します。

    - `extension` -

        **[必須]**

        生成されるファイルに対して `.parquet` を返します。

    - `persist` -

        **[必須]**

        バッファされた列をシリアライズし、生成された Parquet ファイルパスを返します。

## Example\{#example}

### formatter 実装を選択する\{#choose-a-formatter-implementation}

SDK によって公開されている JSON および Parquet 実装を作成します。

```javascript
import { JsonFormatter, ParquetFormatter } from '@zilliz/milvus2-sdk-node';

const jsonFormatter = new JsonFormatter();
const parquetFormatter = new ParquetFormatter();

console.log(jsonFormatter.extension); // .json
console.log(parquetFormatter.extension); // .parquet
```

## Notes\{#notes}

- Formatter インターフェースは、読み取り専用の `extension` フィールドと `persist(columns, dynamicRows, rowCount, dir, schema)` メソッドを公開しており、このメソッドは生成されたローカルファイルパスを返します。

- BulkWriter は、`format` が `json` の場合に JsonFormatter を選択し、`format` が `parquet` の場合に ParquetFormatter を選択します。

- Parquet 出力には SDK 依存関係 `@shanghaikid/parquetjs` が必要です。

