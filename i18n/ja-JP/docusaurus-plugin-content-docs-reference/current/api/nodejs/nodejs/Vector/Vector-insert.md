---
title: "insert() | Node.js"
slug: /node/node/Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation inserts data into a specific コレクション. | Node.js"
type: docx
token: SZNQds74zoKniRxtJwdcfdz1nCh
sidebar_position: 5
keywords: 
  - 音声類似検索
  - Elastic ベクトル データベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# insert()

This operation inserts data into a specific コレクション.

```javascript
await milvusClient.insert(data: InsertReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.insert({
    collection_name: string,
    data: RowData[],
    partition_name?: string,
    db_name?: string,
    hash_keys?: number[],
    transformers?: InsertTransformers,
    skip_check_schema?: boolean,
    fields_data?: RowData[],
    timeout?: number,
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **data** (*[RowData](./Vector-RowData)[]*) -

    現在のコレクションに挿入するデータです。

    挿入するデータは、現在のコレクションのスキーマに一致する辞書、またはそのような辞書のリストである必要があります。 

    以下のコードは、現在のコレクションのスキーマに **id** と **ベクトル** という 2 つのフィールドがあることを前提としています。前者は主フィールドで、後者は 5 次元のベクトル埋め込みを保持するフィールドです。

    ```javascript
    // A dictionary, or
    data={
        'id': 0,
        'vector': [
            0.6186516144460161,
            0.5927442462488592,
            0.848608119657156,
            0.9287046808231654,
            -0.42215796530168403
        ]
    }
    
    // A list of dictionaries
    data = [
        {
            'id': 1,
            'vector': [
                0.37417449965222693,
                -0.9401784221711342,
                0.9197526367693833,
                0.49519396415367245,
                -0.558567588166478
            ]
        },
        {
            'id': 2,
            'vector': [
                0.46949086179692356,
                -0.533609076732849,
                -0.8344432775467099,
                0.9797361846081416,
                0.6294256393761057
            ]
        }
    ]
    ```

- **hash_keys** (*number[]*) -

    主キーから計算されたハッシュ値のリストです。各行を受け取るシャードを決定するために使用します。任意です。

- **transformers** (*InsertTransformers*) -

    `BFloat16Vector` および `Float16Vector` データ用のカスタムデータトランスフォーマーです。任意です。

- **skip_check_schema** (*boolean*) -

    挿入前にスキーマチェックをスキップするかどうかです。任意です。

- **fields_data** (*RowData[]*) -

    **data** のエイリアスです。いずれかのキーで行を渡すことができますが、両方を設定しないでください。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **partition_name** (*string* | *None*) -

    The name of a partition in the current コレクション. 

    指定した場合、データは指定された partition に挿入されます。

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
入力データ内で正常に挿入された行の 0 始まりの位置です。

- **err_index** (*number[]*) -
拒否された行の 0 始まりの位置です。すべての行が成功した場合、このリストは空です。

- **acknowledged** (*boolean*) -
書き込みが Milvus によって確認されたかどうかを示します。

- **insert_cnt** (*string*) -
挿入された行数です。文字列としてフォーマットされます。

- **delete_cnt** (*string*) -
この操作によって削除された行数です。`insert()` の場合、これは **"0"** のままです。

- **upsert_cnt** (*string*) -
この操作によってアップサートされた行数です。`insert()` の場合、これは **"0"** のままです。

- **timestamp** (*string*) -
書き込みが可視になったハイブリッドタイムスタンプです。タイムトラベルクエリにはこの値を使用します。

- **IDs** (*[StringArrayId](./Vector-StringArrayId)* | *[NumberArrayId](./Vector-NumberArrayId)*) -

挿入された行に割り当てられた主キーです。autoID コレクションの場合、Milvus がこれらの値を生成します。それ以外の場合、入力キーがそのまま返されます。

    - **int_id** (*\{ data: number[] }*) -

        主キーが整数フィールドの場合に設定されます。

    - **str_id** (*\{ data: string[] }*) -

        主キーが VARCHAR フィールドの場合に設定されます。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合、空文字列のままです。


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

const res = await milvusClient.insert({
    collection_name: 'my_collection',
    data: [
        { id: 1, vector: [0.1, 0.2, 0.3, 0.4, 0.5], text: 'Hello' },
        { id: 2, vector: [0.6, 0.7, 0.8, 0.9, 1.0], text: 'World' },
    ],
});

console.log(res.insert_cnt); // '2'
```
