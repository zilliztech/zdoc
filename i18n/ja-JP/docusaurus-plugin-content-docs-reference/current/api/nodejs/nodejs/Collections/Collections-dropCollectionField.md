---
title: "dropCollectionField() | Node.js"
slug: /node/node/Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションスキーマからフィールドを削除します。 | Node.js"
type: docx
token: ANWZdmEMkocWK3xo2ZxcnqtLnUh
sidebar_position: 31
keywords: 
  - フィールドの削除
  - スキーマ
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - dropCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropCollectionField()

この操作は、既存のコレクションから、名前または ID を指定してフィールドを削除します。

```javascript
await milvusClient.dropCollectionField(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.dropCollectionField({
    collection_name: string,
    field_name?: string,
    field_id?: number | string,
    db_name?: string,
    timeout?: number
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    フィールドを保持するコレクションの名前です。

- **field_name** (*string*) -

    削除するフィールドの名前です。`field_name` または `field_id` のいずれか一方を指定してください。両方は指定できません。

- **field_id** (*number* | *string*) -

    削除するフィールドの ID です。`field_name` または `field_id` のいずれか一方を指定してください。両方は指定できません。

- **db_name** (*string*) -

    コレクションが存在するデータベースの名前です。

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値:**

*Promise&lt;ResStatus&gt;*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.dropCollectionField({
    collection_name: 'my_collection',
    field_name: 'sparse_vector',
});
```
