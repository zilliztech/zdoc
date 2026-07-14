---
title: "BulkWriter | Node.js"
slug: /node/node/DataImport-BulkWriter
sidebar_label: "BulkWriter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、オフライン一括インポートワークフロー向けに Milvus 互換の JSON または Parquet ファイルを生成します。データセットが通常の行ごとの insert 操作には大きすぎる場合に使用し、`bulkInsert()` を呼び出す前にファイルとしてステージングする必要があります。 | Node.js"
type: docx
token: RSrRdD4fLoy50Bx5s2xcQ6lMnVd
sidebar_position: 10
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - クラウド
  - BulkWriter
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# BulkWriter

このクラスは、オフライン一括インポートワークフロー向けに Milvus 互換の JSON または Parquet ファイルを生成します。データセットが通常の行ごとの insert 操作には大きすぎる場合に使用し、`bulkInsert()` を呼び出す前にファイルとしてステージングする必要があります。

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

    **[必須]**

    行を検証してファイルをシリアライズするために使用される、collection のフィールドと動的フィールド設定を定義します。

- **[storage](./DataImport-Storage)** (*[Storage](./DataImport-Storage)*) -

    カスタム storage アダプターを指定します。省略した場合、ファイルはローカルディスク上に残ります。

- **format** (*'json' | 'parquet'*) -

    出力ファイル形式を指定します。デフォルトは `json` です。Parquet 出力は v3.0.3 以降で `@shanghaikid/parquetjs` を使用します。

- **chunkSize** (*number*) -

    自動フラッシュをトリガーする、おおよそのバッファ済みバイトサイズを指定します。デフォルトは 128 MB です。

- **localPath** (*string*) -

    生成されるチャンクのベースとなるローカルディレクトリを指定します。デフォルトは現在の作業ディレクトリです。

**METHODS:**

- `append(row: Record<string, any>): Promise<void>`

    1 行を追加し、バッファされたデータが `chunkSize` に達すると自動的にコミットします。

- `commit(): Promise<void>`

    現在のバッファをファイルにフラッシュし、設定された storage アダプターを通じてそれらを保存します。

- `close(): Promise<string[][]>`

    残りの行をフラッシュし、チャンクごとにグループ化された生成済みファイルパスを返します。

- `writeFrom(source: AsyncIterable<Record<string, any>>): Promise<string[][]>`

    非同期 iterable を消費し、各行を追加して writer を閉じ、生成されたファイルパスを返します。

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
