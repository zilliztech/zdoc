---
title: "get() | Node.js"
slug: /node/node/Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID によって特定の entity を取得します。 | Node.js"
type: docx
token: IbxXdvdZlonJk9xnlk2cZlIinCh
sidebar_position: 3
keywords: 
  - vector データベースの比較
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - zilliz
  - zilliz cloud
  - cloud
  - get()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# get()

この操作は、ID によって特定の entity を取得します。

```javascript
await milvusClient.get(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.get({
   db_name: string,
   collection_name: string,
   consistency_level?: ConsistencyLevelEnum,
   ids: string[] | number[],
   limit?: number,
   offset?: number,
   output_fields?: string[],
   partition_names?: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **ids** (*string[]* | *number[]*) -

    **[REQUIRED]**

    特定の entity ID、または entity ID のリスト。

- **consistency_level** (*string*) -

    対象 collection の整合性レベル。

- **limit** (*number*) -

    返される entity の総数。

    ページネーションを有効にするために、このパラメータを **param** 内の **offset** と組み合わせて使用できます。

    この値と **param** 内の **offset** の合計は 16,384 未満である必要があります。 

- **offset** (*number*) -

    検索結果でスキップするレコード数。 

    ページネーションを有効にするために、このパラメータを `limit` と組み合わせて使用できます。

    この値と `limit` の合計は 16,384 未満である必要があります。 

- **partition_names** (*string[]*) -

    対象 collection 内の partition 名のリスト。

- **output_fields** (*string[]*) -

    返される各 entity に含める field 名のリスト。

    デフォルト値は **None** です。指定しない場合、すべての field が出力 field として選択されます。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**RETURNS** *Promise&lt;QueryResults&gt;*

このメソッドは、**QueryResults** オブジェクトに解決される promise を返します。

```typescript
{
    data: Record<string, any>[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*Record&lt;string, any&gt;[]*) -<br/>
  主キーが指定された **ids** と一致する行。各エントリは field 名をキーとし、要求された各 **output_fields** エントリの値に加えて主キーを保持します。

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
 const getResults = await milvusClient.get({
   collection_name: 'my_collection',
   ids: ['1','2','3','4','5','6','7','8'],
   output_fields: ["age"],
 });
```

