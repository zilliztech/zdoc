---
title: "upsert() | Node.js"
slug: /node/node/Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation inserts or updates data in a specific コレクション. | Node.js"
type: docx
token: LEptdqqfcoqdtCx0LO1c3yxvnBo
sidebar_position: 8
keywords: 
  - ベクトル embeddings
  - ベクトル store
  - open source ベクトル データベース
  - ベクトル インデックス
  - zilliz
  - zilliz cloud
  - クラウド
  - upsert()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# upsert()

This operation inserts or updates data in a specific コレクション.

```typescript
await milvusClient.upsert(data)
```

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **data** (*RowData[]*) -

    **[REQUIRED]**

    The data to upsert. Each element is a plain JavaScript object whose keys match the field names of the コレクション スキーマ. Entities whose primary key matches an existing record are updated; otherwise a new entity is inserted.

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **hash_keys** (*number[]*) -

    内部使用のために予約されています。明示的に必要とされない限り、このパラメータを設定しないでください。

- **partial_update** (*boolean*) -

    部分更新を有効にするかどうかです。`true` に設定すると、`data` には更新が必要なフィールドのみを含めることができ、含まれないフィールドは既存の値を保持します。

- **partition_name** (*string*) -

    The name of a partition in the current コレクション. If specified, the data is upserted into that partition.

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを `None` に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **field_ops** (*FieldPartialUpdateOp[]*) -

    配列フィールドに対する部分更新操作です。省略可能です。

**RETURNS** *Promise&lt;MutationResult&gt;*

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

**PARAMETERS:**

- **succ_index** (*number[]*) -<br/>
  正常に upsert された行の、入力データ内での 0 始まりの位置です。

- **err_index** (*number[]*) -<br/>
  拒否された行の 0 始まりの位置です。すべての行が成功した場合、このリストは空になります。

- **acknowledged** (*boolean*) -<br/>
  書き込みが Milvus によって確認されたかどうかです。

- **insert_cnt** (*string*) -<br/>
  この操作によって新しく挿入された行数で、文字列としてフォーマットされます。

- **delete_cnt** (*string*) -<br/>
  置き換えのための領域を確保するために論理削除された行数です。

- **upsert_cnt** (*string*) -<br/>
  この操作によって upsert された行の総数です。

- **timestamp** (*string*) -<br/>
  書き込みが可視になったハイブリッドタイムスタンプです。

- **IDs** (*StringArrayId* | *NumberArrayId*) -<br/>
  upsert された行に含まれる主キーです。完全なフィールド参照については、`insert()` ドキュメントを参照してください。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合、空文字列のままです。

## Example\{#example}

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
