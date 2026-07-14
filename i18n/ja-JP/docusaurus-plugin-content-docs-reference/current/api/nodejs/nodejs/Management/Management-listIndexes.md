---
title: "listIndexes() | Node.js"
slug: /node/node/Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は特定の collection の indexes を一覧表示します | Node.js"
type: docx
token: N1fldMqhtoWBJPxh8VccivqxnZd
sidebar_position: 16
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - cloud
  - listIndexes()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

この操作は特定の collection の indexes を一覧表示します

```javascript
await milvusClient.listIndexes(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listIndexes({
   db_name: string,
   collection_name: string,
   field_name?: string,
   index_name?: string
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持する database の名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **field_name** (*string*) -

    collection 内の既存 field の名前。 

- **index_name** (*string*) -

    説明する index の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;ListIndexResponse&gt;*

このメソッドは、**ListIndexResponse** オブジェクトに解決される promise を返します。

```typescript
{
    indexes: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **indexes** (*string[]*) -
要求された collection に定義されている index 名の一覧。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。 この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。 この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。 この操作が成功した場合は空文字列のままです。
