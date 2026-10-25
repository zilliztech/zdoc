---
title: "listIndexes() | Node.js"
slug: /node/node/Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the インデックス of a specific コレクション | Node.js"
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

---

import Admonition from '@theme/Admonition';


# listIndexes()

This operation lists the インデックス of a specific コレクション

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

    The name of the データベース that holds the target コレクション.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing コレクション.

- **field_name** (*string*) -

    The name of an existing field in the コレクション. 

- **index_name** (*string*) -

    The name of the インデックス to describe.

- **timeout** (*number*)  

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;ListIndexResponse&gt;*

このメソッドは、**ListIndexResponse** オブジェクトに解決される promise を返します。

```typescript
{
    indexes: string[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **インデックス** (*string[]*) -<br/>
  A list of インデックス names defined on the requested コレクション.

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す内容。この操作が成功した場合は空文字列のままです。
