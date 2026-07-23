---
title: "getLoadState() | Node.js"
slug: /node/node/Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定した collection または partition がロードされているかどうかを表示します。 | Node.js"
type: docx
token: J17ZdPNwqo4nt3x5b8pc0H5Nnph
sidebar_position: 14
keywords: 
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getLoadState()

この操作は、指定した collection または partition がロードされているかどうかを表示します。

```javascript
await milvusClient.getLoadState(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getLoadState({
   db_name: string,
   collection_name: string,
   partition_names?: string[],
   timeout?: number
 })
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[必須]**

    collection の名前。

- **partition_names** (*string[]*) -

    1 つ以上の partition の名前。

- **timeout** (*number*) -

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;GetLoadStateResponse&gt;*

このメソッドは、**GetLoadStateResponse** オブジェクトに解決される promise を返します。

```typescript
{
    state: LoadState,
    status:  ResStatus
}
```

**パラメータ:**

- **state** (*LoadState*) -<br/>
  現在のロード状態。指定可能な値は **LoadStateNotExist**、**LoadStateNotLoad**、**LoadStateLoading**、**LoadStateLoaded** です。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

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
 const resStatus = await milvusClient.getLoadState({
   collection_name: 'my_collection',
 });
```

