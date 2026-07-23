---
title: "listPartitions() | Node.js"
slug: /node/node/Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した collection 内の partition を一覧表示します。 | Node.js"
type: docx
token: IvnLd6nXooRR6NxM9jdcDxCHnhh
sidebar_position: 5
keywords: 
  - Serverless ベクターデータベース
  - milvus オープンソース
  - milvus はどのように動作するか
  - Zilliz ベクターデータベース
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

この操作は、指定した collection 内の partition を一覧表示します。

```javascript
await milvusClient.listPartitions(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listPartitions({
    db_name: string,
    collection_name: string,
    timeout?: number,
    type?: ShowPartitionsType
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

- **type** (*ShowPartitionsType*) - 

    すべての partition を一覧表示するか、ロード済みのものだけを一覧表示するかを決定します。**ShowPartitionsType** には以下の値があります。

    - **All** = 0

        すべての partition を一覧表示することを示します。

    - **Loaded** = 1

        ロード済みの partition のみを一覧表示することを示します。

**RETURNS** *Promise&lt;ShowPartitionsResponse&gt;*

このメソッドは、**ShowPartitionsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    partition_names: string[],
    partitionIDs: number[],
    data: PartitionData[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **partition_names** (*string[]*) -<br/>
  collection に定義されている partition 名のリスト。

- **partitionIDs** (*number[]*) -<br/>
  **partition_names** と同じ順序で並んだ、partition の内部識別子。

- **data** (*PartitionData[]*) -<br/>
  名前、識別子、作成タイムスタンプ、ロード率をまとめた、partition ごとのフラット化されたビュー。

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

## Example\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).listPartitions({
    collection_name: 'my_collection',
 });
```

