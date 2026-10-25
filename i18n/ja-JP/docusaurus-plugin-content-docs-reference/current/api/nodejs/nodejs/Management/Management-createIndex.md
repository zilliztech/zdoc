---
title: "createIndex() | Node.js"
slug: /node/node/Management-createIndex
sidebar_label: "createIndex()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation creates an インデックス for a specific コレクション. | Node.js"
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

---

import Admonition from '@theme/Admonition';


# createIndex()

This operation creates an インデックス for a specific コレクション.

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

    The name of the データベース to which the target コレクション belongs.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **field_name** (*string*) -

    **[REQUIRED]**

    The name of the field in which to create an インデックス.

- **index_name** (*string*) -

    The name of the インデックス to create.

- **index_type** (*string*) -

    The type of the インデックス to create.

- **metric_type** (*string*) -

    The metric type used to measure ベクトル distance. Possible values: `IP`, `L2`, `COSINE`, `HAMMING`, `JACCARD`, `BM25` (used only for full text search). For more information, refer to [Metric Types](https://milvus.io/docs/metric.md).

    This is available only when the specified field is a ベクトル field.

- **params** (*string*) -

    Other インデックス-specific parameters.

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

