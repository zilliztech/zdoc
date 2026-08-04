---
title: "listPartitions() | Node.js"
slug: /node/node/Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定された collection 内の partition を一覧表示します。 | Node.js"
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

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

この操作は、指定された collection 内の partition を一覧表示します。

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

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[必須]**

    既存の collection の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **type** (*ShowPartitionsType*) - 

    すべての partition を一覧表示するか、ロード済みのものだけを一覧表示するかを決定します。**ShowPartitionsType** には次の値があります。

    - **All** = 0

        すべての partition を一覧表示することを示します。

    - **Loaded** = 1

        ロード済みの partition のみを一覧表示することを示します。

**戻り値** *Promise&lt;ShowPartitionsResponse&gt;*

このメソッドは、**ShowPartitionsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    partition_names: string[],
    partitionIDs: number[],
    data: PartitionData[],
    status:  ResStatus
}
```

**パラメーター:**

- **partition_names** (*string[]*) -<br/>
  collection に定義されている partition 名の一覧。

- **partitionIDs** (*number[]*) -<br/>
  **partition_names** と同じ順序の、partition の内部識別子。

- **data** (*PartitionData[]*) -<br/>
  名前、識別子、作成タイムスタンプ、ロード率をまとめた、partition ごとのフラットなビュー。

    - **name** (*string*) -

        partition 名。

    - **id** (*string*) -

        partition 識別子。

    - **timestamp** (*string*) -

        partition の作成タイムスタンプ。

    - **loadedPercentage** (*string*) -

        現在メモリにロードされている partition の割合。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).listPartitions({
    collection_name: 'my_collection',
 });
```

