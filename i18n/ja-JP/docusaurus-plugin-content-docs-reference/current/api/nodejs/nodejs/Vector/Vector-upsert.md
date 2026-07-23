---
title: "upsert() | Node.js"
slug: /node/node/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection 内のデータを挿入または更新します。 | Node.js"
type: docx
token: LEptdqqfcoqdtCx0LO1c3yxvnBo
sidebar_position: 8
keywords: 
  - Vector embeddings
  - Vector store
  - オープンソース vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

この操作は、特定の collection 内のデータを挿入または更新します。

```typescript
await milvusClient.upsert(data)
```

## リクエスト構文\{#request-syntax}

```typescript
await milvusClient.upsert({
    db_name?: string,
    collection_name: string,
    data: RowData[],
    hash_keys?: number[],
    partial_update?: boolean,
    partition_name?: string,
    timeout?: number,
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    既存の collection の名前。

- **data** (*RowData[]*) -

    **[必須]**

    upsert するデータ。各要素は、キーが collection スキーマのフィールド名に一致するプレーンな JavaScript オブジェクトです。主キーが既存レコードと一致する entity は更新され、それ以外は新しい entity が挿入されます。

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **hash_keys** (*number[]*) -

    内部利用のために予約されています。明示的に必要とされない限り、このパラメーターは設定しないでください。

- **partial_update** (*boolean*) -

    部分更新を有効にするかどうか。`true` に設定すると、`data` には更新が必要なフィールドのみを含めることができ、含まれていないフィールドは既存の値を保持します。

- **partition_name** (*string*) -

    現在の collection 内の partition の名前。指定した場合、データはその partition に対して upsert されます。

- **timeout** (*number*) -

    この操作のタイムアウト時間。これを `None` に設定すると、レスポンスが到着するかエラーが発生した時点でこの操作はタイムアウトします。

- **field_ops** (*FieldPartialUpdateOp[]*) -

    配列フィールドに対する部分更新操作。任意。

**戻り値** *Promise&lt;MutationResult&gt;*

このメソッドは、**MutationResult** オブジェクトに解決される promise を返します。

```typescript
{
    succ_index: number[],
    err_index: number[],
    acknowledged: boolean,
    insert_cnt: string,
    delete_cnt: string,
    upsert_cnt: string,
    timestamp: string,
    IDs: { int_id?: { data: number[] }, str_id?: { data: string[] }, id_field: 'int_id' | 'str_id' },
    status:  ResStatus
}
```

**パラメーター:**

- **succ_index** (*number[]*) -<br/>
  upsert に成功した行の、入力データ内での 0 始まりの位置。

- **err_index** (*number[]*) -<br/>
  拒否された行の 0 始まりの位置。すべての行が成功した場合、このリストは空です。

- **acknowledged** (*boolean*) -<br/>
  書き込みが Milvus によって確認されたかどうか。

- **insert_cnt** (*string*) -<br/>
  この操作で新たに挿入された行数。文字列としてフォーマットされます。

- **delete_cnt** (*string*) -<br/>
  置き換えのための空きを作るために論理削除された行数。

- **upsert_cnt** (*string*) -<br/>
  この操作で upsert された行の総数。

- **timestamp** (*string*) -<br/>
  書き込みが可視になった時点のハイブリッドタイムスタンプ。

- **IDs** (*StringArrayId* | *NumberArrayId*) -<br/>
  upsert された行に含まれる主キー。完全なフィールドリファレンスについては、`insert()` ドキュメントを参照してください。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

// Upsert a single entity
const result = await milvusClient.upsert({
    collection_name: 'my_collection',
    data: {
        id: 0,
        vector: [0.62, 0.59, 0.85, 0.93, -0.42],
        color: 'grass-green',
    },
});

// Upsert multiple entities
const result2 = await milvusClient.upsert({
    collection_name: 'my_collection',
    data: [
        { id: 1, vector: [0.37, -0.94, 0.92, 0.50, -0.56], color: 'mud-brown' },
        { id: 2, vector: [0.47, -0.53, -0.83, 0.98, 0.63], color: 'violet-purple' },
    ],
});

console.log(result2.upsert_cnt);
```
