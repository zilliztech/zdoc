---
title: "loadCollection() | Node.js"
slug: /node/node/Management-loadCollection
sidebar_label: "loadCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection のデータをメモリに読み込みます。 | Node.js"
type: docx
token: LoNvdRK80oWllFxV0H6co0HrnBe
sidebar_position: 17
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadCollection()

この操作は、特定の collection のデータをメモリに読み込みます。

```javascript
await milvusClient.loadCollection(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.loadCollection({ 
    db_name: string,
    collection_name: string,
    refresh?: boolean,
    replica_number?: number,
    resource_groups?: string[],
    timeout?: number
})
```

**パラメータ:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    collection の名前。

- **refresh** (*boolean*) -

    すでに読み込まれている collection のロード状態を更新するかどうか。

- **replica_number** (*number*) -

    読み込む collection のレプリカ数。

- **resource_groups** (*string[]*) -

    読み込む collection 内の resource group の数。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、いずれかのレスポンスが返るか、エラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.loadCollection({ collection_name: 'my_collection' });
```

