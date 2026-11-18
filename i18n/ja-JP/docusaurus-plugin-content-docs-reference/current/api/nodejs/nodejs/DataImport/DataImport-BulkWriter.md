---
title: "BulkWriter | Node.js"
slug: /node/node/DataImport-BulkWriter
sidebar_label: "BulkWriter"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "このクラスは、オフラインの一括インポートワークフロー向けに、Milvus 互換の JSON または Parquet ファイルを生成します。データセットが通常の行単位の挿入操作には大きすぎ、`bulkInsert()` を呼び出す前にファイルとしてステージングする必要がある場合に使用します。 | Node.js"
type: docx
token: RSrRdD4fLoy50Bx5s2xcQ6lMnVd
sidebar_position: 10
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - ベクトルDB
  - マルチモーダルベクトルデータベース検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - BulkWriter
  - nodejs30
displayed_sidebar: nodeSidebar

---

# BulkWriter

このクラスは、オフラインの一括インポートワークフロー向けに、Milvus 互換の JSON または Parquet ファイルを生成します。データセットが通常の行単位の挿入操作には大きすぎ、`bulkInsert()` を呼び出す前にファイルとしてステージングする必要がある場合に使用します。

```javascript
const writer = new BulkWriter(options: BulkWriterOptions)
```

## コンストラクター\{#constructor}

```javascript
const writer = new BulkWriter(options: BulkWriterOptions)
```

スキーマ検証、ストレージの動作、ファイル形式、チャンクサイズ、ローカル出力パスを設定する **BulkWriterOptions** オブジェクトから、**BulkWriter** インスタンスを構築します。詳細は、下記の [BulkWriterOptions](#bulkwriteroptions) を参照してください。

## メソッド\{#methods}

**メソッド:**

- `get totalRowCount(): number`

    このライターに追加された行の合計数です。

- `get bufferRowCount(): number`

    現在バッファリングされており、まだフラッシュされていない行数です。

- `get batchFiles(): string[][]`

    これまでに生成されたすべてのチャンクのファイルパスを、チャンクごとにグループ化したものです。

- `append(row: Record<string, any>): Promise<void>`

    1 行を追加し、バッファリングされたデータが `chunkSize` に達すると自動的にコミットします。

- `commit(): Promise<void>`

    現在のバッファをファイルにフラッシュし、設定されたストレージアダプターを介して保存します。

- `close(): Promise<string[][]>`

    残りの行をフラッシュし、生成されたファイルパスをチャンク別にグループ化して返します。

- `writeFrom(source: AsyncIterable<Record<string, any>>): Promise<string[][]>`

    非同期イテラブルを消費し、各行を追加してライターを閉じ、生成されたファイルパスを返します。

- `flush` event (*FlushEvent*)

    チャンクが書き込まれ、保存されるたびに発行されます。このイベントは、そのチャンクで生成されたファイル、そのチャンクの行数、およびチャンクインデックスを保持します。

    - **files** (*string[]*) -

        フラッシュされたチャンクに対して生成されたファイルです。

    - **rowCount** (*number*) -

        フラッシュされた行数です。

    - **chunkIndex** (*number*) -

        フラッシュされたチャンクの 0 始まりのインデックスです。

**戻り値:**

*BulkWriter*

## BulkWriterOptions\{#bulkwriteroptions}

`BulkWriter` コンストラクターで受け入れられるオプションオブジェクトです。

```javascript
interface BulkWriterOptions {
    schema: BulkWriterSchema;
    storage?: Storage;
    format?: 'json' | 'parquet';
    chunkSize?: number;
    localPath?: string;
}
```

**フィールド:**

- **スキーマ** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    **[必須]**

    行の検証とファイルのシリアル化に使用されるコレクションのフィールドおよび動的フィールド設定を定義します。

- **[storage](./DataImport-Storage)** (*[Storage](./DataImport-Storage)*) -

    カスタムストレージアダプターを指定します。省略した場合、`LocalStorage` は生成されたファイルをディスク上に保持します。

- **format** (*'json' | 'parquet'*) -

    出力ファイル形式を指定します。デフォルトは `json` です。Parquet 出力では、v3.0.3 以降で `@shanghaikid/parquetjs` を使用します。

- **chunkSize** (*number*) -

    自動フラッシュをトリガーする、おおよそのバッファ済みバイトサイズを指定します。デフォルトは 128 MB です。

- **localPath** (*string*) -

    生成されるチャンクのローカルベースディレクトリを指定します。デフォルトは現在の作業ディレクトリです。

## フォーマッター\{#formatter}

バッファリングされたカラムセットを 1 つ以上のインポートファイルにシリアル化するインターフェースです。`BulkWriter` は、`format` が `json` の場合は `JsonFormatter` を、`format` が `parquet` の場合は `ParquetFormatter` を選択します。

```javascript
interface Formatter {
    readonly extension: string;
    persist(columns, dynamicCol, rowCount, dir, schema): Promise<string[]>;
}
```

**フィールド:**

- **extension** (*string*) -

    生成されるファイルの拡張子です（例：`.json` または `.parquet`）。

**メソッド:**

- `persist(columns: Map<string, any[]>, dynamicCol: Record<string, any>[], rowCount: number, dir: string, schema: BulkWriterSchema): Promise<string[]>`

    バッファリングされた列をシリアル化し、生成されたローカルファイルパスを返します。

    - **columns** (*Map&lt;string, any[]&gt;*) -

        バッファリングされた列データです。

    - **dynamicCol** (*Record&lt;string, any&gt;[]*) -

        動的フィールドの行です。

    - **rowCount** (*number*) -

        シリアル化される行数です。

    - **dir** (*string*) -

        出力ディレクトリです。

    - **スキーマ** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

        列の解釈に使用されるスキーマです。

**実装:**

- `class JsonFormatter`

    バッファリングされた行を JSON ファイルに書き込みます。この JSON ファイルのトップレベル `rows` プロパティには、動的フィールドが有効な場合の動的フィールドを含め、シリアル化されたエンティティが格納されます。

- `class ParquetFormatter`

    `@shanghaikid/parquetjs` を使用して、バッファリングされた行を Parquet ファイルに書き込みます。Milvus のスカラー、ベクトル、配列、および動的フィールドの値を Parquet 互換の表現に変換します。SDK の依存関係 `@shanghaikid/parquetjs` が必要です。

## 例\{#example}

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
