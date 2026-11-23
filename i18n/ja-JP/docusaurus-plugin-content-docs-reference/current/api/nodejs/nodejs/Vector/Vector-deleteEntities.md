---
title: "deleteEntities() | Node.js"
slug: /node/node/Vector-deleteEntities
sidebar_label: "deleteEntities()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、ブール式またはフィルターを使用してコレクションからエンティティを削除します。 | Node.js"
type: origin
token: shared-Vector-deleteEntities
keywords: 
  - エンティティの削除
  - 削除
  - ブール式
  - zilliz
  - zilliz cloud
  - クラウド
  - deleteEntities()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# deleteEntities()

この操作では、ブール式またはフィルターを使用してコレクションからエンティティを削除します。

```javascript
await milvusClient.deleteEntities(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.deleteEntities({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   expr?: string,
   filter?: string,
   exprValues?: keyValueObj,
   consistency_level: ConsistencyLevelEnum,
   timeout?: number
 })
```

**パラメーター：**

- **db_name** (*string*) -

    対象コレクションを保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[必須]**

    既存のコレクションの名前です。

- **partition_name** (*string*) -

    コレクション内の既存のパーティションの名前です。

- **expr** (*string*) -

    削除対象のエンティティをフィルターするために使用するブール式です。`expr` または `filter` のいずれかを指定し、両方は指定しないでください。

- **filter** (*string*) -

    フィルター式です。これは `expr` のエイリアスであり、それより優先されます。

- **exprValues** (*keyValueObj*) -

    フィルター式のテンプレート値です。例：`{ key: 'value' }`。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象コレクションの整合性レベルです。値の既定値は **Bounded**（**2**）で、オプションは **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）、**Eventually**（**3**）です。詳細は [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum) を参照してください。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。

    **None** に設定すると、いずれかの応答が到着したとき、またはいずれかのエラーが発生したときに、この操作がタイムアウトすることを示します。

**戻り値：**

*Promise&lt;MutationResult&gt;*

このメソッドは、**MutationResult** オブジェクトに解決される Promise を返します。

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

**パラメーター：**

- **succ_index** (*number[]*) -
式に一致し、削除済みとしてマークされた入力エンティティの 0 ベースの位置です。

- **err_index** (*number[]*) -
どの行にも一致しなかった入力エンティティの 0 ベースの位置です。

- **acknowledged** (*boolean*) -
削除が Milvus によって確認されたかどうかです。

- **insert_cnt** (*string*) -
`deleteEntities()` では常に **"0"** です。

- **delete_cnt** (*string*) -
この操作によって論理削除された行数です。

- **upsert_cnt** (*string*) -
`deleteEntities()` では常に **"0"** です。

- **timestamp** (*string*) -
削除が可視になったハイブリッドタイムスタンプです。

- **IDs** (*[StringArrayId](./Vector-StringArrayId)* | *[NumberArrayId](./Vector-NumberArrayId)*) -

この削除の対象となったプライマリキーです。フィールドの完全なリファレンスについては、`insert()` のドキュメントを参照してください。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーについて、その理由を示す値です。この操作が成功した場合、空の文字列のままです。


**例外：**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const resStatus = await milvusClient.deleteEntities({
    collection_name: 'my_collection',
    expr: 'id in [1, 2, 3]',
});
```
