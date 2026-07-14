---
title: "loadPartitionsSync() | Node.js"
slug: /node/node/Partitions-loadPartitionsSync
sidebar_label: "loadPartitionsSync()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のパーティションのデータをメモリに読み込みます。これは、指定したパーティションが読み込まれていることを確認するための同期関数です。| Node.js"
type: docx
token: VGofdSRi0o6EagxNkokc9Iinndf
sidebar_position: 7
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - loadPartitionsSync()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitionsSync()

この操作は、特定のパーティションのデータをメモリに読み込みます。これは、指定したパーティションが読み込まれていることを確認するための同期関数です。

```javascript
await milvusClient.loadPartitionsSync(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.loadPartitionsSync({ 
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

    対象のコレクションを保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前。

- **partition_names** (string[]) -

    **[REQUIRED]**

    読み込むパーティション名のリスト。

- **replica_number** (*number*) -

    パーティションのレプリカ数。

- **resource_groups** (*string[]*) -

    パーティション内のリソースグループのリスト。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、エラーが発生した時点でこの操作はタイムアウトします。

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

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).loadPartitionsSync({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

