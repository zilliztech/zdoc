---
title: "getLoadingProgress() | Node.js"
slug: /node/node/Management-getLoadingProgress
sidebar_label: "getLoadingProgress()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection の読み込み進捗を取得します。 | Node.js"
type: docx
token: DkImdRkJwoUmdqxzqn1cpQr9nhy
sidebar_position: 13
keywords: 
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadingProgress()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getLoadingProgress()

この操作は、特定の collection の読み込み進捗を取得します。

```javascript
await milvusClient.getLoadingProgress(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getLoadingProgress({
      db_name?: string,
      collection_name: string,
      partition_names?: string[]
      timeout?: number
});
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[必須]**

    対象の collection の名前。

- **partition_names** (*string[]*) -

    対象の partition の名前。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;GetLoadingProgressResponse&gt;*

このメソッドは、**GetLoadingProgressResponse** オブジェクトに解決される promise を返します。

```typescript
{
    progress: string,
    status:  ResStatus
}
```

**パラメータ:**

- **progress** (*string*) -
読み込み操作の完了率です。**"0"** から **"100"** までの整数で表されます。この値が **"100"** に達すると、collection は完全に読み込まれます。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.getLoadingProgress({
    collection_name: 'my_collection',
});
```

