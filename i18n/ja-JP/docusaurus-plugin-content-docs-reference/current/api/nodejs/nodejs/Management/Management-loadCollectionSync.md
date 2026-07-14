---
title: "loadCollectionSync() | Node.js"
slug: /node/node/Management-loadCollectionSync
sidebar_label: "loadCollectionSync()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection のデータをメモリに読み込みます。これは、指定した collection が読み込まれたことを確実にするのに役立つ同期関数です。 | Node.js"
type: docx
token: XXUAdI8T2oOmw2x7iITc8vJgnjm
sidebar_position: 18
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollectionSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadCollectionSync()

この操作は、特定の collection のデータをメモリに読み込みます。これは、指定した collection が読み込まれたことを確実にするのに役立つ同期関数です。

```javascript
loadCollectionSync: ((data) => Promise<ResStatus>) = ...
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.loadCollectionSync({ 
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

    これを **None** に設定すると、何らかのレスポンスが返されるかエラーが発生した時点で、この操作はタイムアウトします。

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
const resStatus = await milvusClient.loadCollectionSync({ collection_name: 'my_collection' });
```

