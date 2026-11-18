---
title: "getIndexBuildProgress() | Node.js"
slug: /node/node/Management-getIndexBuildProgress
sidebar_label: "getIndexBuildProgress()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets the build progress of the specified インデックス. | Node.js"
type: docx
token: G6CGdbM4QoNgr5xS1ZAc94lhnFd
sidebar_position: 11
keywords: 
  - Pinecone ベクトル データベース
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - getIndexBuildProgress()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getIndexBuildProgress()

This operation gets the build progress of the specified インデックス.

```javascript
await milvusClient.getIndexBuildProgress(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getIndexBuildProgress({
      db_name?: string,
      collection_name: string,
      field_name?: string,
      index_name?: string,
      timeout?: number
});
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **index_name** (*string*) -

    対象インデックスの名前です。このパラメーターと `field_name` は同時に指定できません。どちらか一方のみを指定してください。

- **field_name** (*string*) -

    対象フィールドの名前です。このパラメーターと `index_name` は同時に指定できません。どちらか一方のみを指定してください。このパラメーターを使用する場合は、指定したフィールドにインデックスが構築済みであることを確認してください。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返るか何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値:**

*Promise&lt;GetIndexBuildProgressResponse&gt;*

このメソッドは、**GetIndexBuildProgressResponse** オブジェクトに解決される promise を返します。

```javascript
{
    indexed_rows: number,
    total_rows: number,
    status:  ResStatus
}
```

**PARAMETERS:**

- **indexed_rows** (*number*) -
これまでにインデックス化された行数です。

- **total_rows** (*number*) -
インデックスの対象となる行の総数です。**indexed_rows** が **total_rows** と等しくなると、構築が完了します。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const getIndexBuildProgressReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.getIndexBuildProgress(getIndexBuildProgressReq);
console.log(res);
```
