---
title: "alterCollectionProperties() | Node.js"
slug: /node/node/Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection のプロパティを変更します。 | Node.js"
type: docx
token: EHPGdbCP5o7UzCxlDnRc6y5Pn1c
sidebar_position: 3
keywords: 
  - Zilliz Cloud
  - Milvus とは
  - Milvus database
  - Milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionProperties()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionProperties()

この操作は、指定された collection のプロパティを変更します。

```javascript
await milvusClient.alterCollectionProperties(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.alterCollectionProperties({
   db_name?: string
   collection_name: string,
   delete_keys?: string[],
   properties: Properties,
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持する database の名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    エイリアスを再割り当てする対象 collection の名前。

- **delete_keys** (*string[]*) -

    削除するプロパティ。

- **properties** (*Properties*) -

    **[REQUIRED]**

    変更するプロパティとその期待値を、TypeScript の **Record** で指定します。指定可能な値は以下のとおりです。

    - **collection.ttl.seconds** (*number*) -

        collection の有効期間（TTL）を秒単位で指定します。

    - **mmap.enabled** (*bool*) -

        collection 内のすべての field の生データおよび index に対して mmap を有効にするかどうか。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返るか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.alterCollection({
    collection_name: 'my-collection',
    properties: {"collection.ttl.seconds": 18000}
});
```

