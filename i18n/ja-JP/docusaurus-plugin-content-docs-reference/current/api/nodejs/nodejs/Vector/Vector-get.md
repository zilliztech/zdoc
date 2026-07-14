---
title: "get() | Node.js"
slug: /node/node/Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID によって特定のエンティティを取得します。 | Node.js"
type: docx
token: IbxXdvdZlonJk9xnlk2cZlIinCh
sidebar_position: 3
keywords: 
  - vector データベース比較
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - zilliz
  - zilliz cloud
  - クラウド
  - get()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# get()

この操作は、ID によって特定のエンティティを取得します。

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

    特定のエンティティ ID、またはエンティティ ID のリスト。

- **consistency_level** (*string*) -

    対象 collection の整合性レベル。

- **limit** (*number*) -

    返されるエンティティの総数。

    このパラメータは、**param** 内の **offset** と組み合わせて使用することで、ページネーションを有効にできます。

    この値と **param** 内の **offset** の合計は 16,384 未満である必要があります。 

- **offset** (*number*) -

    検索結果でスキップするレコード数。 

    このパラメータは、`limit` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と `limit` の合計は 16,384 未満である必要があります。 

- **partition_names** (*string[]*) -

    対象 collection 内の partition 名のリスト。

- **output_fields** (*string[]*) -

    返される各エンティティに含めるフィールド名のリスト。

    デフォルト値は **None** です。指定しない場合、すべてのフィールドが出力フィールドとして選択されます。

- **timeout** (*number*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、またはエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise&lt;QueryResults&gt;*

このメソッドは、**QueryResults** オブジェクトに解決される promise を返します。

```typescript
{
    data: Record<string, any>[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **data** (*Record&lt;string, any&gt;[]*) -
指定された **ids** に一致する主キーを持つ行。各エントリはフィールド名をキーとし、要求された各 **output_fields** エントリの値と主キーを保持します。

- **ResStatus**
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

