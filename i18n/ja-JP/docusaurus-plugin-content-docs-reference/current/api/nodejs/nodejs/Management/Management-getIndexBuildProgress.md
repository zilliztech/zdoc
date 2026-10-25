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

import Admonition from '@theme/Admonition';


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
      field_name: string,
      index_name: string,
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

    **[REQUIRED]**

    The name of the target インデックス. This parameter and `field_name` are mutually exclusive. 

- **field_name** (*string*) -

    **[REQUIRED]**

    The name of the target field. This parameter and `index_name` are mutually exclusive. When you use this parameter, ensure that an インデックス has been built upon the specified field.

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返るか何らかのエラーが発生した時点で、この操作はタイムアウトします。

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

- **indexed_rows** (*number*) -<br/>
  これまでに インデックス 化された行数。

- **total_rows** (*number*) -<br/>
  The total number of rows the index covers. The build is complete when **indexed_rows** equals **total_rows**.

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

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

