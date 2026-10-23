---
title: "removeFileResource() | Node.js"
slug: /node/node/FileResources-removeFileResource
sidebar_label: "removeFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus メタデータから名前付きファイルリソースを削除します。 | Node.js"
type: docx
token: TfFQdwR7borsLfxiwdCcXoKvnth
sidebar_position: 3
keywords: 
  - オープンソースのベクトルデータベース
  - オープンソースのベクトルデータベース
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - removeFileResource()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# removeFileResource()

この操作は、Milvus メタデータから名前付きファイルリソースを削除します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.removeFileResource({ name, timeout? })
```

**パラメーター：**

- **name**（*string*） -

    削除するファイルリソースの名前です。

- **timeout**（*number*） -

    RPC に許容する時間をミリ秒単位で指定する任意の値です。デフォルトは undefined です。

**戻り値の型：**

*ResStatus*

**戻り値：**

操作のステータスに解決される promise です。

**パラメーター：**

- **error_code**（*number*） -

    エラーコード番号です。0 は成功を意味します。

- **reason**（*string*） -

    エラーの原因です（存在する場合）。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.removeFileResource({
  name: 'training_data',
});
```
