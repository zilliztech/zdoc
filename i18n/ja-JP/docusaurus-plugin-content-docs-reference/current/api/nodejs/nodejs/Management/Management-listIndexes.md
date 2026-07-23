---
title: "listIndexes() | Node.js"
slug: /node/node/Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は特定の collection の index を一覧表示します | Node.js"
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

この操作は特定の collection の index を一覧表示します

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

    対象の collection を保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **field_name** (*string*) -

    collection 内の既存の field の名前です。 

- **index_name** (*string*) -

    説明する index の名前です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;ListIndexResponse&gt;*

このメソッドは、**ListIndexResponse** オブジェクトに解決される promise を返します。

```typescript
{
    indexes: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **indexes** (*string[]*) -<br/>
  要求された collection に定義されている index 名の一覧です。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。
