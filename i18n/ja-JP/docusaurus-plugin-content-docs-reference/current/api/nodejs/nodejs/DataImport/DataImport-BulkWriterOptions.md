---
title: "BulkWriterOptions | Node.js"
slug: /node/node/DataImport-BulkWriterOptions
sidebar_label: "BulkWriterOptions"
beta: false
added_since: v2.6.12
last_modified: false
deprecate_since: false
notebook: false
description: "`BulkWriter` インスタンスを設定するためのインターフェースです。スキーマ検証、storage の動作、ファイル形式、チャンクサイズ、ローカル出力パスを含みます。 | Node.js"
type: docx
token: Q9UUdw8VWojtDtx2h00chPvRnqh
sidebar_position: 11
keywords: 
  - Deep Learning
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - cloud
  - BulkWriterOptions
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# BulkWriterOptions

このインターフェースは `BulkWriter` インスタンスを設定するためのもので、スキーマ検証、storage の動作、ファイル形式、チャンクサイズ、ローカル出力パスを含みます。

```typescript
interface BulkWriterOptions
```

**FIELDS:**

- **schema** (*[BulkWriterSchema](./DataImport-BulkWriterSchema)*) -

    **[必須]**

    `BulkWriter` が検証およびシリアライズするフィールドを定義します。

- **[storage](./DataImport-Storage)** (*[Storage](./DataImport-Storage)*) -

    カスタム storage アダプターを指定します。省略した場合、`LocalStorage` は生成されたファイルをディスク上に保持します。

- **format** (*'json' | 'parquet'*) -

    生成されるファイル形式を指定します。デフォルトは `json` です。

- **chunkSize** (*number*) -

    自動コミットをトリガーする、おおよそのバッファ済みバイトサイズを指定します。

- **localPath** (*string*) -

    チャンクフォルダーが作成されるローカルのベースディレクトリを指定します。

## Example\{#example}

```javascript
const options = {
    schema,
    format: 'json',
    chunkSize: 64 * 1024 * 1024,
    localPath: '/tmp/milvus-bulk',
};
```
