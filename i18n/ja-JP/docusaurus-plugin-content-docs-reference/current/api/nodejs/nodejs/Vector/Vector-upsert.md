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

# upsert()

This operation inserts or updates data in a specific コレクション.

```javascript
await milvusClient.upsert(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.upsert({
    db_name?: string,
    collection_name: string,
    data: RowData[],
    fields_data?: RowData[],
    hash_keys?: number[],
    transformers?: InsertTransformers,
    skip_check_schema?: boolean,
    partial_update?: boolean,
    field_ops?: FieldPartialUpdateOp[],
    partition_name?: string,
    timeout?: number,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **data** (*RowData[]*) -

    アップサートするデータです。各要素は、キーがコレクションのスキーマのフィールド名と一致するプレーンな JavaScript オブジェクトです。プライマリキーが既存のレコードと一致するエンティティは更新され、それ以外の場合は新しいエンティティが挿入されます。**data** または **fields_data** のいずれかを指定してください。

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **hash_keys** (*number[]*) -

    内部使用のために予約されています。明示的に必要とされない限り、このパラメータを設定しないでください。

- **fields_data** (*RowData[]*) -

    **data** のエイリアスです。いずれかのキーで行を渡すことができますが、両方を設定しないでください。

- **transformers** (*InsertTransformers*) -

    `BFloat16Vector` および `Float16Vector` データ用のカスタムデータトランスフォーマーです。任意です。

- **skip_check_schema** (*boolean*) -

    アップサートする前にスキーマチェックをスキップするかどうかです。任意です。

- **partial_update** (*boolean*) -

    部分更新を有効にするかどうかです。`true` に設定すると、`data` には更新が必要なフィールドのみを含めることができ、含まれないフィールドは既存の値を保持します。

- **partition_name** (*string*) -

    The name of a partition in the current コレクション. If specified, the data is upserted into that partition.

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを `None` に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **field_ops** (*FieldPartialUpdateOp[]*) -

    配列フィールドに対する部分更新操作です。省略可能です。

**戻り値:**

*Promise&lt;MutationResult&gt;*

このメソッドは、**MutationResult** オブジェクトに解決される promise を返します。

```javascript
{
    succ_index: number[],
    err_index: number[],
    acknowledged: boolean,
    insert_cnt: string,
    delete_cnt: string,
    upsert_cnt: string,
    timestamp: string,
    IDs: { int_id?: { data: number[] }, str_id?: { data: string[] } },
    status:  ResStatus
}
```

**PARAMETERS:**

- **succ_index** (*number[]*) -
入力データ内で正常にアップサートされた行の 0 始まりの位置です。

- **err_index** (*number[]*) -
拒否された行の 0 始まりの位置です。すべての行が成功した場合、このリストは空です。

- **acknowledged** (*boolean*) -
書き込みが Milvus によって確認されたかどうかを示します。

- **insert_cnt** (*string*) -
この操作によって新たに挿入された行数です。文字列としてフォーマットされます。

- **delete_cnt** (*string*) -
置き換えるために論理的に削除された行数です。

- **upsert_cnt** (*string*) -
この操作によってアップサートされた行の合計数です。

- **timestamp** (*string*) -
書き込みが可視になったハイブリッドタイムスタンプです。

- **IDs** (*StringArrayId* | *NumberArrayId*) -

アップサートされた行に含まれるプライマリキーです。フィールドの完全なリファレンスについては、`insert()` のドキュメントを参照してください。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合、空文字列のままです。


**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

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
    data: [
        { id: 0, vector: [0.62, 0.59, 0.85, 0.93, -0.42], color: 'grass-green' },
    ],
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
