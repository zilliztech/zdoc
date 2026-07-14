---
title: "createIndex() | Node.js"
slug: /node/node/Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に対して index を作成します。 | Node.js"
type: docx
token: Nu0Id3wzGoJIFyxkC7IcmjAznNf
sidebar_position: 3
keywords: 
  - knn
  - 画像検索
  - LLMs
  - 機械学習
  - zilliz
  - zilliz cloud
  - クラウド
  - createIndex()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createIndex()

この操作は、特定の collection に対して index を作成します。

```javascript
await milvusClient.createIndex(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.createIndex([
    {
       db_name?: string,
       collection_name: string,
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type: string,
       params?: KeyValueObj,
       timeout?: number
     }
 ] | {
       db_name?: string,
       collection_name: string,
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type: string,
       params?: KeyValueObj,
       timeout?: number    
 });
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection が属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **field_name** (*string*) -

    **[REQUIRED]**

    index を作成するフィールドの名前です。

- **index_name** (*string*) -

    作成する index の名前です。

- **index_type** (*string*) -

    作成する index のタイプです。

- **metric_type** (*string*) -

    vector 距離の測定に使用される metric タイプです。指定可能な値: `IP`, `L2`, `COSINE`, `HAMMING`, `JACCARD`, `BM25`（フルテキスト検索でのみ使用）。詳細については、[Metric Types](https://milvus.io/docs/metric.md) を参照してください。

    これは、指定されたフィールドが vector フィールドである場合にのみ使用できます。

- **params** (*string*) -

    index 固有のその他のパラメータです。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
await milvusClient._createIndex({
   collection_name: "my_collection",
   field_name: "vector_field",
   index_name: "vector_index"
 });
```

