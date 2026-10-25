---
title: "BulkWriter | Node.js"
slug: /node/node/DataImport-BulkWriter
sidebar_label: "BulkWriter"
beta: false
added_since: v2.6.12
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "BulkWriter インスタンスは、Milvus スキーマの行を列指向バッチに変換し、ローカルオブジェクトストレージにフラッシュします。 | Node.js"
type: docx
token: XTa5d642Aotj7GxLmwSc66xOnUc
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

import Admonition from '@theme/Admonition';


# BulkWriter

BulkWriter インスタンスは、Milvus スキーマの行を列指向バッチに変換し、ローカルオブジェクトストレージにフラッシュします。

## リクエスト構文\{#request-syntax}

```typescript
new BulkWriter({ schema, storage?, format?, chunkSize?, localPath? })
```

**パラメーター:**

- **スキーマ** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    BulkWriter が行の検証に使用する Milvus コレクションスキーマです。BulkWriter は構築時にスキーマをディープクローンするため、後から呼び出し元が編集してもライターには影響しません。

- **format** (*string*) -

    フォーマット済みチャンクファイルの出力形式は `json` または `parquet` です。デフォルトは `json` です。

- **storage** (*[Storage](./DataImport-Storage)*) -

    フォーマット済みファイルを永続化するストレージバックエンドです。デフォルトは LocalStorage です。

- **chunkSize** (*number*) -

    バッファリングされた行を新しいチャンクへフラッシュするバイトしきい値です。デフォルトは 128 MB です。

- **localPath** (*string*) -

    ローカルチャンク出力のベースディレクトリです。デフォルトは現在の作業ディレクトリです。各ライターインスタンスは、ランダムなサブディレクトリ配下に書き込みます。

## 例\{#example}

```javascript
const writer = new BulkWriter({
  schema,
  format: 'parquet',
});
await writer.append({ id: 1, vector: [0.1, 0.2] });
await writer.commit();
```
