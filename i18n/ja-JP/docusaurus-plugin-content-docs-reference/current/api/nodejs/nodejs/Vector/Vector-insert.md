---
title: "insert() | Node.js"
slug: /node/node/Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection にデータを挿入します。 | Node.js"
type: docx
token: SZNQds74zoKniRxtJwdcfdz1nCh
sidebar_position: 5
keywords: 
  - 音声類似検索
  - Elastic vector database
  - Pinecone と Milvus の比較
  - Chroma と Milvus の比較
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# insert()

この操作は、特定の collection にデータを挿入します。

```javascript
await milvusClient.insert(data: InsertReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.insert({
    collection_name: string,
    data: RowData | RowData[],
    partition_name?: string,
    db_name?: string,
    timeout?: number,
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **data** (*RowData[]*) -

    現在の collection に挿入するデータ。

    挿入するデータは、現在の collection の schema に一致する辞書、またはそのような辞書のリストである必要があります。 

    以下のコードは、現在の collection の schema に **id** と **vector** という 2 つのフィールドがあることを前提としています。前者は主フィールドで、後者は 5 次元 vector 埋め込みを保持するためのフィールドです。

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

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

- **partition_name** (*string* | *None*) -

    現在の collection 内の partition の名前。 

    指定した場合、データは指定した partition に挿入されます。

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

- **succ_index** (*number[]*) -
入力データ内で正常に挿入された行の 0 ベース位置。

- **err_index** (*number[]*) -
拒否された行の 0 ベース位置。すべての行が成功した場合、このリストは空です。

- **acknowledged** (*boolean*) -
書き込みが Milvus によって確認されたかどうか。

- **insert_cnt** (*string*) -
挿入された行数。文字列としてフォーマットされます。

- **delete_cnt** (*string*) -
この操作によって削除された行数。`insert()` の場合、これは **"0"** のままです。

- **upsert_cnt** (*string*) -
この操作によって upsert された行数。`insert()` の場合、これは **"0"** のままです。

- **timestamp** (*string*) -
書き込みが可視になったハイブリッドタイムスタンプ。time-travel クエリにはこの値を使用します。

- **IDs** (*StringArrayId* | *NumberArrayId*) -
挿入された行に割り当てられた主キー。autoID collection の場合、Milvus がこれらの値を生成します。それ以外の場合は、入力キーがそのまま返されます。

    - **int_id** (*\{ data: number[] }*) -

        主キーが整数フィールドの場合に設定されます。

    - **str_id** (*\{ data: string[] }*) -

        主キーが VARCHAR フィールドの場合に設定されます。

    - **id_field** (*'int_id' | 'str_id'*) -

        2 つの ID 配列のうち、どちらが値を保持しているかを示します。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。

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

