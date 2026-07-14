---
title: "getIndexState() | Node.js"
slug: /node/node/Management-getIndexState
sidebar_label: "getIndexState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定された index のステータスを取得します。 | Node.js"
type: docx
token: HqE5d2jOroEuObxIjkZcHkX4nWX
sidebar_position: 12
keywords: 
  - k 近傍アルゴリズム
  - ANNS
  - Vector search
  - knn アルゴリズム
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

この操作は、指定された index のステータスを取得します。

```javascript
await milvusClient.getIndexState(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getIndexState({
      db_name?: string,
      collection_name: string,
      field_name?: string,
      index_name?: string,
      timeout?: number
});
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **index_name** (*string*) -

    対象の index の名前。このパラメータと `field_name` は相互排他的です。 

- **field_name** (*string*) -

    対象フィールドの名前。このパラメータと `index_name` は相互排他的です。このパラメータを使用する場合は、指定したフィールド上に index が構築されていることを確認してください。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;GetIndexStateResponse&gt;*

このメソッドは、**GetIndexStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    state: IndexState,
    status:  ResStatus
}
```

**パラメータ:**

- **state** (*IndexState*) -
index の現在のビルド状態。取り得る値は **IndexStateNone**、**Unissued**、**InProgress**、**Finished**、**Failed** です。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const getIndexStateReq = {
  collection_name: 'my_collection',
  index_name: 'my_index',
};
const res = await milvusClient.getIndexState(getIndexStateReq);
console.log(res);
```

