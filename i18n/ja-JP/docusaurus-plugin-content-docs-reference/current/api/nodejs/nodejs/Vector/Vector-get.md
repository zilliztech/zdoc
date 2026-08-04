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
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
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

    ターゲット collection を保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **ids** (*string[]* | *number[]*) -

    **[REQUIRED]**

    特定の entity ID、または entity ID のリストです。

- **consistency_level** (*string*) -

    ターゲット collection の整合性レベルです。

- **limit** (*number*) -

    返される entity の総数です。

    ページネーションを有効にするために、このパラメータを **param** 内の **offset** と組み合わせて使用できます。

    この値と **param** 内の **offset** の合計は 16,384 未満である必要があります。 

- **offset** (*number*) -

    検索結果内でスキップするレコード数です。 

    ページネーションを有効にするために、このパラメータを `limit` と組み合わせて使用できます。

    この値と `limit` の合計は 16,384 未満である必要があります。 

- **partition_names** (*string[]*) -

    ターゲット collection 内の partition 名のリストです。

- **output_fields** (*string[]*) -

    返される各 entity に含める field 名のリストです。

    デフォルト値は **None** です。指定しない場合、すべての field が出力 field として選択されます。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

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
  主キーが指定された **ids** に一致する行です。各エントリは field 名をキーとし、要求された **output_fields** の各項目に対応する値と主キーを保持します。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

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

