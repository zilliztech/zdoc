---
title: "loadPartitions() | Node.js"
slug: /node/node/Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection 内の特定の partition セットをメモリにロードします。 | Node.js"
type: docx
token: Pyh3dttWKoBqcBx8FGhcArhAnqg
sidebar_position: 6
keywords: 
  - ベクターデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - クラウド
  - loadPartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitions()

この操作は、指定された collection 内の特定の partition セットをメモリにロードします。

```javascript
await milvusClient.loadPartitions(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.loadPartitions({
    db_name: string,
    collection_name: string,
    partition_names: string[],
    replica_number?: number,
    resource_groups[]?: string[],
    timeout?: number
 });
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **partition_names** (string[]) -

    **[REQUIRED]**

    ロードする partition の名前のリストです。

- **replica_number** (*number*) -

    partition のレプリカ数です。

- **resource_groups** (*string[]*) -

    partition 内の resource group のリストです。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、応答が到着するか、エラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).loadPartitions({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

