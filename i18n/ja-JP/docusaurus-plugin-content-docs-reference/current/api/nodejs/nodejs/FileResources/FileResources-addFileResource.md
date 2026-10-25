---
title: "addFileResource() | Node.js"
slug: /node/node/FileResources-addFileResource
sidebar_label: "addFileResource()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、名前付きファイルリソースを Milvus メタデータに追加します。 | Node.js"
type: docx
token: RnyUdtGbFoIC7AxyhmNcbudYnhb
sidebar_position: 1
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - zilliz
  - zilliz cloud
  - クラウド
  - addFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# addFileResource()

この操作は、名前付きファイルリソースを Milvus メタデータに追加します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.addFileResource({ name, path, timeout? })
```

**パラメーター：**

- **name** (*string*) -

    ファイルリソースを参照するための名前です。

- **path** (*string*) -

    リモートファイルのパスです。

- **timeout** (*number*) -

    RPC に許容する時間をミリ秒単位で指定する任意の値です。デフォルトは undefined です。

**戻り値の型：**

*ResStatus*

**戻り値：**

操作のステータスに解決される promise です。

**パラメーター：**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーの原因です（存在する場合）。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.addFileResource({
  name: 'training_data',
  path: 's3://bucket/training.csv',
});
```
