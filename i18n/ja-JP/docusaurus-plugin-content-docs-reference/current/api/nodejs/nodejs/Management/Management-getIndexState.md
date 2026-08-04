---
title: "getIndexState() | Node.js"
slug: /node/node/Management-getIndexState
sidebar_label: "getIndexState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した index のステータスを取得します。 | Node.js"
type: docx
token: HqE5d2jOroEuObxIjkZcHkX4nWX
sidebar_position: 12
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getIndexState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getIndexState()

この操作は、指定した index のステータスを取得します。

```javascript
await milvusClient.getIndexState(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getIndexState({
      db_name?: string,
      collection_name: string,
      field_name?: string,
      index_name?: string,
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

    対象の index の名前。 このパラメータと `field_name` は相互排他的です。 

- **field_name** (*string*) -

    対象の field の名前。 このパラメータと `index_name` は相互排他的です。このパラメータを使用する場合は、指定した field に index が構築されていることを確認してください。

- **timeout** (number) -

    この操作のタイムアウト期間。これを **None** に設定すると、レスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;GetIndexStateResponse&gt;*

このメソッドは、**GetIndexStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    state: IndexState,
    status:  ResStatus
}
```

**PARAMETERS:**

- **state** (*IndexState*) -<br/>
  index の現在の構築状態。取り得る値は **IndexStateNone**、**Unissued**、**InProgress**、**Finished**、**Failed** です。

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
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const getIndexStateReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.getIndexState(getIndexStateReq);
console.log(res);
```

