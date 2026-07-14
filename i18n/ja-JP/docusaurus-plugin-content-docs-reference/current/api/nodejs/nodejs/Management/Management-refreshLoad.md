---
title: "refreshLoad() | Node.js"
slug: /node/node/Management-refreshLoad
sidebar_label: "refreshLoad()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection のロード状態を更新します。 | Node.js"
type: docx
token: Jc43d397doxCRkxal2XcQ1Wyn2g
sidebar_position: 19
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - refreshLoad()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# refreshLoad()

この操作は、特定の collection のロード状態を更新します。

```javascript
await milvusClient.refreshLoad(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.refreshLoad({
   db_name?: string,
   collection_name: string,
   timeout?: number
 })
```

**パラメーター:**

- **db_name** (*string*) -

    対象の collection を保持するデータベース名。

- **collection_name** (*string*) -

    **[REQUIRED]**

    collection の名前。

- **timeout** (*number*) -

    この操作のタイムアウト時間。これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.refreshLoad({ collection_name: 'my_collection' });
```

