---
title: "getIndexBuildProgress() | Node.js"
slug: /node/node/Management-getIndexBuildProgress
sidebar_label: "getIndexBuildProgress()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した index のビルド進捗を取得します。 | Node.js"
type: docx
token: G6CGdbM4QoNgr5xS1ZAc94lhnFd
sidebar_position: 11
keywords: 
  - Pinecone vector database
  - Audio search
  - semantic search とは
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - getIndexBuildProgress()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getIndexBuildProgress()

この操作は、指定した index のビルド進捗を取得します。

```javascript
await milvusClient.getIndexBuildProgress(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getIndexBuildProgress({
      db_name?: string,
      collection_name: string,
      field_name: string,
      index_name: string,
      timeout?: number
});
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **index_name** (*string*) -

    **[REQUIRED]**

    対象の index の名前。このパラメータと `field_name` は相互排他的です。 

- **field_name** (*string*) -

    **[REQUIRED]**

    対象の field の名前。このパラメータと `index_name` は相互排他的です。このパラメータを使用する場合は、指定した field に対して index がすでに構築されていることを確認してください。

- **timeout** (number) -

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;GetIndexBuildProgressResponse&gt;*

このメソッドは、**GetIndexBuildProgressResponse** オブジェクトに解決される promise を返します。

```typescript
{
    indexed_rows: number,
    total_rows: number,
    status:  ResStatus
}
```

**PARAMETERS:**

- **indexed_rows** (*number*) -
これまでに index 化された行数。

- **total_rows** (*number*) -
index がカバーする行の総数。**indexed_rows** が **total_rows** と等しくなると、ビルドは完了です。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const getIndexBuildProgressReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.getIndexBuildProgress(getIndexBuildProgressReq);
console.log(res);
```

