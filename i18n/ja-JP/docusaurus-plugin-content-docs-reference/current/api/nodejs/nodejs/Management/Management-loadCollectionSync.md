---
title: "loadCollectionSync() | Node.js"
slug: /node/node/Management-loadCollectionSync
sidebar_label: "loadCollectionSync()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation loads the data of a specific コレクション into memory. This is the synchronous function that helps to ensure that the specified コレクション has been loaded. | Node.js"
type: docx
token: XXUAdI8T2oOmw2x7iITc8vJgnjm
sidebar_position: 18
keywords: 
  - DiskANN
  - Sparse ベクトル
  - ベクトル Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - loadCollectionSync()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# loadCollectionSync()

This operation loads the data of a specific コレクション into memory. This is the synchronous function that helps to ensure that the specified コレクション has been loaded.

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

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of a コレクション.

- **refresh** (*boolean*) -

    Whether to refresh the load status of an already loaded コレクション.

- **replica_number** (*number*) -

    The number of replicas of the コレクション to load.

- **resource_groups** (*string[]*) -

    The number of resource groups in the コレクション to load.

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

