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
       params?: keyValueObj,
       timeout?: number
     }
 ] | {
       db_name?: string,
       collection_name: string,
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type: string,
       params?: keyValueObj,
       extra_params?: CreateIndexParam,
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

    作成するインデックスの種類です。[IndexType](./Management-IndexType) を参照してください。

- **metric_type** (*string*) -

    ベクトル間の距離を測定するために使用するメトリクスタイプです。指定可能な値は、`IP`、`L2`、`COSINE`、`HAMMING`、`JACCARD`、`BM25`（全文検索でのみ使用）です。[MetricType](./Management-MetricType) を参照してください。

    This is available only when the specified field is a ベクトル field.

- **params** (*keyValueObj*) -

    インデックス固有のその他のパラメータです。

- **extra_params** (*CreateIndexParam*) -

    代替のインデックスパラメータです。`index_type` と `metric_type` を省略するリクエスト形式で使用します。このオブジェクトには、`index_type`、`metric_type`、および `params` が含まれます。[IndexType](./Management-IndexType) および [MetricType](./Management-MetricType) を参照してください。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise\<ResStatus\>*

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


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
await milvusClient.createIndex({
   collection_name: "my_collection",
   field_name: "vector_field",
   index_name: "vector_index",
   index_type: IndexType.AUTOINDEX,
   metric_type: MetricType.COSINE,
 });
```
