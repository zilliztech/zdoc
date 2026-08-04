---
title: "listAliases() | Node.js"
slug: /node/node/Collections-listAliases
sidebar_label: "listAliases()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "これはメソッドテンプレートです。 | Node.js"
type: docx
token: KeoKdlitaog6n1xpX8McIIIrnWb
sidebar_position: 14
keywords: 
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - listAliases()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listAliases()

これはメソッドテンプレートです。

```javascript
await milvusClient.listAliases(data)
```

## Request Syntax\{#request-syntax}

このメソッドには以下の代替構文があります。

```javascript
listAliases({
    db_name: string
    collection_name: string
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;ListAliasesResponse&gt;*

このメソッドは、**ListAliasesResponse** オブジェクトに解決される promise を返します。

```typescript
{
    db_name: string,
    aliases: string[],
    collection_name: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **db_name** (*string*) -<br/>
  一覧表示された alias を所有するデータベース。

- **aliases** (*string[]*) -<br/>
  要求された collection を指すすべての alias のリスト。

- **collection_name** (*string*) -<br/>
  一覧表示された alias が指す collection 名。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.listAliases({ collection_name: 'my_collection' });
```

