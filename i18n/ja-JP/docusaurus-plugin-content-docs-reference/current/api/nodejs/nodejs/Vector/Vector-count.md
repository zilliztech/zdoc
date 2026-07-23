---
title: "count() | Node.js"
slug: /node/node/Vector-count
sidebar_label: "count()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたフィルタリング式に一致するエンティティの数をカウントします。 | Node.js"
type: docx
token: NaOadUNSpo1EsIxPMSfc0R4Hnfb
sidebar_position: 1
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - cloud
  - count()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# count()

この操作は、指定されたフィルタリング式に一致するエンティティの数をカウントします。

```javascript
await milvusClient.count(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.count({
    db_name?: string,
    collection_name: string,
    expr?: string,
    timeout?: boolean
})
```

**PARAMETERS:**

- **db_name** (*str*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*str*) -

    **[REQUIRED]**

    エイリアスを作成する collection の名前。

- **expr** (*string*) -

    一致するエンティティを絞り込むための scalar フィルタリング条件。 

    scalar フィルタリングをスキップするには、このパラメーターを空文字列に設定できます。scalar フィルタリング条件の構築方法については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。 

- **timeout** (*number*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;CountResult&gt;*

このメソッドは、**CountResult** オブジェクトに解決される promise を返します。

```typescript
{
    data: number,
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*number*) -<br/>
  指定されたフィルタ式に一致する collection 内の行数。式が指定されていない場合、これは総行数です。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Examples\{#examples}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const num_entities = await milvusClient.count({
   collection_name: 'my_collection',
   expr: "age in [1,2,3,4,5,6,7,8]",
});

// 1000
```
