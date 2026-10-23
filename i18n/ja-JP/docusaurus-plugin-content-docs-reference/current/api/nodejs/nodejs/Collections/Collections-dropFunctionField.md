---
title: "dropFunctionField() | Node.js"
slug: /node/node/Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションから関数を、その出力フィールドおよびバインドされたインデックスとともに削除します。 | Node.js"
type: docx
token: MmABd2rdooxiLZxYzwEciyTanOg
sidebar_position: 32
keywords: 
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - dropFunctionField()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropFunctionField()

この操作は、コレクションから関数を、その出力フィールドおよびバインドされたインデックスとともに削除します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.dropFunctionField({ collection_name, function_name, timeout? })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    既存のコレクションの名前です。

- **function_name** (*string*) -

    削除する関数の名前です。

- **timeout** (*number*) -

    RPC に許容する時間をミリ秒単位で指定するオプションです。デフォルトは undefined です。

**RETURNS:**

*ResStatus*

スキーマ変更によって返される変更ステータスです。

**PARAMETERS:**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーの原因です（存在する場合）。

**EXCEPTIONS:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.dropFunctionField({
  collection_name: 'my_collection',
  function_name: 'bm25_fn',
});
```
