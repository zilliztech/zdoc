---
title: "delete() | Node.js"
slug: /node/node/Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID またはブール式を使用してエンティティを削除します。 | Node.js"
type: docx
token: KOZHdyeQvo4htOxhO8BcbEudnNd
sidebar_position: 2
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# delete()

この操作は、ID またはブール式を使用してエンティティを削除します。

```javascript
await milvusClient.delete(data)
```

## リクエスト構文\{#request-syntax}

このメソッドには以下の選択肢があります。

### DeleteByIdsReq を使用\{#with-deletebyidsreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   ids: string[] | number[],
   consistency_level: ConsistencyLevelEnum,
   exprValues?: keyValueObj,
   timeout?: number
 })
```

**パラメータ:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[必須]**

    The name of an existing コレクション.

- **partition_name** (*string*) -

    The name of an existing partition in the コレクション.

- **ids** (*string[]* | *number[]*) -

    **[必須]**

    特定のエンティティ ID、またはエンティティ ID のリスト。

    The value defaults to **None**, indicating that a スカラー filtering condition applies.

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象コレクションの整合性レベルです。デフォルト値は **Bounded**（**2**）で、オプションは **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）、**Eventually**（**3**）です。ConsistencyLevelEnum を参照してください。

- **exprValues** (*keyValueObj*) -

    フィルター式でプレースホルダーを使用する場合は、これらのプレースホルダーの実際の値をキーと値のペアとして指定できます。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

### DeleteByFilterReq を使用\{#with-deletebyfilterreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   filter: string,
   consistency_level: ConsistencyLevelEnum,
   exprValues?: keyValueObj,
   timeout?: number
 })
```

**パラメータ:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[必須]**

    The name of an existing コレクション.

- **partition_name** (*string*) -

    The name of an existing partition in the コレクション.

- **filter** (*string*) -

    **[必須]**

    削除するエンティティに一致するスカラーフィルタリング条件です。

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象コレクションの整合性レベルです。デフォルト値は **Bounded**（**2**）で、オプションは **Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）、**Eventually**（**3**）です。ConsistencyLevelEnum を参照してください。

- **exprValues** (*keyValueObj*) -

    フィルター式でプレースホルダーを使用する場合は、これらのプレースホルダーの実際の値をキーと値のペアとして指定できます。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

**パラメータ:**

- **succ_index** (*number[]*) -
行に一致して削除済みとしてマークされた入力 ID の 0 始まりの位置です。

- **err_index** (*number[]*) -
どの行にも一致しなかった入力 ID の 0 始まりの位置です。

- **acknowledged** (*boolean*) -
削除が Milvus によって確認されたかどうかです。

- **insert_cnt** (*string*) -
`delete()` では常に **"0"** です。

- **delete_cnt** (*string*) -
この操作によって論理的に削除された行数です。

- **upsert_cnt** (*string*) -
`delete()` では常に **"0"** です。

- **timestamp** (*string*) -
削除が可視になったハイブリッドタイムスタンプです。

- **IDs** (*StringArrayId* | *NumberArrayId*) -

この削除の対象となったプライマリキーです。フィールドの完全なリファレンスについては、`insert()` のドキュメントを参照してください。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#examples}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.delete({
   collection_name: 'my_collection',
   ids: [1,2,3,4]
 });
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

// Delete by IDs
const resStatus1 = await milvusClient.delete({
    collection_name: 'my_collection',
    ids: [1, 2, 3, 4],
});

// Delete by filter
const resStatus2 = await milvusClient.delete({
    collection_name: 'my_collection',
    filter: 'id in [5, 6, 7, 8]',
});
```

</TabItem>
</Tabs>
