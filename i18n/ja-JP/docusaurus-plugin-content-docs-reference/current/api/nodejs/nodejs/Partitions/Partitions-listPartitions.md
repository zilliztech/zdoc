---
title: "listPartitions() | Node.js"
slug: /node/node/Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the partitions in a specified コレクション. | Node.js"
type: docx
token: IvnLd6nXooRR6NxM9jdcDxCHnhh
sidebar_position: 5
keywords: 
  - Serverless ベクトルデータベース
  - milvus オープンソース
  - milvus の仕組み
  - Zilliz ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - listPartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listPartitions()

This operation lists the partitions in a specified コレクション.

```javascript
await milvusClient.listPartitions(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.listPartitions({
    db_name: string,
    collection_name: string,
    timeout?: number,
    type?: ShowPartitionsType
 })
```

**パラメーター:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[必須]**

    The name of an existing コレクション.

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **type** (*ShowPartitionsType*) - 

    すべての partition を一覧表示するか、ロード済みのものだけを一覧表示するかを決定します。**ShowPartitionsType** には次の値があります。

    - **All** = 0

        すべての partition を一覧表示することを示します。

    - **Loaded** = 1

        ロード済みの partition のみを一覧表示することを示します。

**戻り値:**

*Promise&lt;ShowPartitionsResponse&gt;*

このメソッドは、**ShowPartitionsResponse** オブジェクトに解決される promise を返します。

```javascript
{
    partition_names: string[],
    partitionIDs: number[],
    created_timestamps: string[],
    created_utc_timestamps: string[],
    data: PartitionData[],
    status:  ResStatus
}
```

**パラメーター:**

- **partition_names** (*string[]*) -
コレクションで定義されているパーティション名のリストです。

- **partitionIDs** (*number[]*) -
パーティションの内部識別子です。**partition_names** と同じ順序になります。

- **created_timestamps** (*string[]*) -
各パーティションが作成された時点を示すハイブリッドタイムスタンプのリストです。

- **created_utc_timestamps** (*string[]*) -
各パーティションが作成された時点を示す UTC タイムスタンプのリストです。

- **data** (*PartitionData[]*) -
フラット化されたパーティションごとのビューで、名前、識別子、作成タイムスタンプ、およびロード済みの割合をまとめています。

    - **name** (*string*) -

        partition 名。

    - **id** (*string*) -

        partition 識別子。

    - **timestamp** (*string*) -

        partition の作成タイムスタンプ。

    - **loadedPercentage** (*string*) -

        現在メモリにロードされている partition の割合。

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

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```javascript
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).listPartitions({
    collection_name: 'my_collection',
 });
```
