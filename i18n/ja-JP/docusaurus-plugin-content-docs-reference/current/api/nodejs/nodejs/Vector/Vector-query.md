---
title: "query() | Node.js"
slug: /node/node/Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたブール式を使用して scalar フィルタリングを実行します。 | Node.js"
type: docx
token: Nle5dNFMuoy3MgxGIFGcJDWtnpg
sidebar_position: 6
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - hybrid vector search
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# query()

この操作は、指定されたブール式を使用して scalar フィルタリングを実行します。

```javascript
await milvusClient.query(data)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.query({
    db_name: string,
    collection_name: string,
    partition_names?: string[];
    output_fields?: string[];
    ids?: string[] | number[];
    filter?: string;
    offset?: number;
    limit?: number;
    consistency_level?: ConsistencyLevelEnum;
    exprValues?: keyValueObj;
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **partition_names** (*string[]*) -

    クエリ対象の partition の名前です。

- **output_fields** (*string[]*) -

    返される各 entity に含めるフィールド名のリストです。

    デフォルト値は **None** です。指定しない場合、すべてのフィールドが出力フィールドとして選択されます。

- **ids** (*string[]* | *number[]*) - 

    クエリする entity の ID です。

- **filter** (*string*) -

    一致する entity を絞り込むための scalar フィルタリング条件です。 

    scalar フィルタリングをスキップするには、このパラメータを空文字列に設定できます。scalar フィルタリング条件の作成については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。 

- **offset** (*number*) -

    クエリ結果でスキップするレコード数です。 

    このパラメータは `limit` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と `limit` の合計は 16,384 未満である必要があります。 

- **limit** (*number*) -

    クエリ結果で返すレコード数です。

    このパラメータは `offset` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と `offset` の合計は 16,384 未満である必要があります。 

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象 collection の整合性レベルです。

    デフォルト値は現在の collection 作成時に指定した値で、**Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) から選択できます。

    <Admonition type="info" icon="📘" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        vector 類似検索またはクエリを実行する際に整合性レベルを簡単に調整して、アプリケーションに最適な設定にできます。

    </Admonition>

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **order_by_fields** (*OrderByFields*) -

    クエリ結果の並び順を決定するフィールドです。任意です。

- **order_by** (*OrderByFields*) -

    order_by_fields のエイリアスです。任意です。

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
  一致した行です。各エントリはフィールド名をキーとして持ち、リクエストされた各 **output_fields** エントリの値に加えて主キーを保持します。collection で **enable_dynamic_field** が **true** の場合、動的フィールドの値は宣言済みフィールドと並んでインラインで表示されます。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const queryResults = await milvusClient.query({
   collection_name: 'my_collection',
   filter: "age in [1,2,3,4,5,6,7,8]",
   output_fields: ["age"],
 });
```

