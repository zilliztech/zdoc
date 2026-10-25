---
title: "dropIndexProperties() | Node.js"
slug: /node/node/Management-dropIndexProperties
sidebar_label: "dropIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation resets the インデックス properties to their default values. | Node.js"
type: docx
token: Acvxd7t9poXj6nxb0vMco0wsngh
sidebar_position: 6
keywords: 
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - dropIndexProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropIndexProperties()

This operation resets the インデックス properties to their default values.

```javascript
await milvusClient.dropIndexProperties(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropIndexProperties({
     db_name?: string,
     collection_name: string,
     index_name: string,
     properties: string[],
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

    **[REQUIRED]**

    The name of the target インデックス.

- **properties** (*string[]*) -

    **[REQUIRED]**

    The names of the インデックス properties to reset. Possible properties are as follows:

    - **mmap.enabled** -

        Whether to enable mmap for the specified インデックス. Setting this to `True` offloads the specified インデックス onto the disk. For details, refer to [Use mmap](/docs/use-mmap)

- **timeout** (number) -

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

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

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const dropIndexPropertiesReq = {
    collection_name: 'my_collection',
    index_name: 'my_index',
    properties: ['mmap.enabled'],
};
const res = await milvusClient.dropIndexProperties(dropIndexPropertiesReq);
console.log(res);
```

