---
title: "dropCollectionField() | Node.js"
slug: /node/node/Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、名前または ID で既存のコレクションからフィールドを削除します。 | Node.js"
type: docx
token: ANWZdmEMkocWK3xo2ZxcnqtLnUh
sidebar_position: 31
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionField()

この操作は、名前または ID で既存のコレクションからフィールドを削除します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.dropCollectionField({ collection_name, field_name | field_id, timeout? })
```

**パラメーター：**

- **collection_name** (*string*) -

    既存のコレクションの名前。

- **field_name** (*string*) -

    削除するフィールドの名前。field_name または field_id のいずれかを指定し、両方は指定しないでください。

- **field_id** (*number | string*) -

    削除するフィールドの識別子。field_name または field_id のいずれかを指定し、両方は指定しないでください。

- **timeout** (*number*) -

    RPC に許容される時間をミリ秒単位で指定します（任意）。デフォルトは undefined です。

**戻り値の型：**

*ResStatus*

**戻り値：**

スキーマ変更のステータスです。

**パラメーター：**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーが発生した場合の原因です。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。失敗の正確な理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.dropCollectionField({
  collection_name: 'my_collection',
  field_name: 'sparse_vector',
});
```
