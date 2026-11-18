---
title: "getIndexState() | Node.js"
slug: /node/node/Management-getIndexState
sidebar_label: "getIndexState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets the status of the specified インデックス. | Node.js"
type: docx
token: HqE5d2jOroEuObxIjkZcHkX4nWX
sidebar_position: 12
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getIndexState()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# getIndexState()

<Admonition type="warning" icon="🚧" title="Warning">

**非推奨。**

このメソッドは将来のリリースで削除される可能性があります。

</Admonition>


This operation gets the status of the specified インデックス.

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

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **index_name** (*string*) -

    The name of the target インデックス. This parameter and `field_name` are mutually exclusive. 

- **field_name** (*string*) -

    The name of the target field. This parameter and `index_name` are mutually exclusive. When you use this parameter, ensure that an インデックス has been built upon the specified field.

- **timeout** (number) -

    この操作のタイムアウト期間。これを **None** に設定すると、レスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値:**

*Promise&lt;GetIndexStateResponse&gt;*

このメソッドは、**GetIndexStateResponse** オブジェクトに解決される promise を返します。

```javascript
{
    state: IndexState,
    status:  ResStatus
}
```

**PARAMETERS:**

- **state** (*IndexState*) -
インデックスの現在の構築状態です。指定可能な値は **IndexStateNone**、**Unissued**、**InProgress**、**Finished**、および **Failed** です。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const getIndexStateReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.getIndexState(getIndexStateReq);
console.log(res);
```
