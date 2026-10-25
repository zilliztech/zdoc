---
title: "query() | Node.js"
slug: /node/node/Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたブール式を使用してスカラーフィルタリングを実行します。 | Node.js"
type: docx
token: Nle5dNFMuoy3MgxGIFGcJDWtnpg
sidebar_position: 6
keywords: 
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - zilliz
  - zilliz cloud
  - クラウド
  - query()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# query()

この操作は、指定されたブール式を使用してスカラーフィルタリングを実行します。

```javascript
await milvusClient.query(data)
```

## リクエスト構文\{#request-syntax}

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

    対象のコレクションを保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前です。

- **partition_names** (*string[]*) -

    クエリ対象のパーティションの名前です。

- **output_fields** (*string[]*) -

    戻り値の各エンティティに含めるフィールド名のリストです。

    デフォルト値は **None** です。指定しない場合、すべてのフィールドが出力フィールドとして選択されます。

- **ids** (*string[]* | *number[]*) - 

    クエリ対象のエンティティの ID です。

- **filter** (*string*) -

    一致するエンティティを絞り込むためのスカラーフィルタリング条件です。 

    スカラーフィルタリングをスキップするには、このパラメータを空文字列に設定できます。スカラーフィルタリング条件を構築するには、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。 

- **offset** (*number*) -

    クエリ結果でスキップするレコード数です。 

    このパラメータは `limit` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と `limit` の合計は 16,384 未満である必要があります。 

- **limit** (*number*) -

    クエリ結果で返すレコード数です。

    このパラメータは `offset` と組み合わせて使用することで、ページネーションを有効にできます。

    この値と `offset` の合計は 16,384 未満である必要があります。 

- **consistency_level** (*ConsistencyLevelEnum*) -

    対象のコレクションの整合性レベルです。

    デフォルト値は、現在のコレクションを作成したときに指定した値です。指定できる値は **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**)、**Eventually** (**3**) です。

    <Admonition type="info" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータを書き込んだり読み取ったりする際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        ベクトル類似検索やクエリを実行する際に整合性レベルを簡単に調整して、アプリケーションに最適な設定にできます。

    </Admonition>

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **order_by_fields** (*OrderByFields*) -

    クエリ結果を並べ替える基準となるフィールドです。任意です。

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
  一致した行です。各エントリはフィールド名をキーとし、要求された **output_fields** の各エントリの値と主キーを保持します。コレクションで **enable_dynamic_field** が **true** の場合、動的フィールドの値は宣言済みのフィールドと並んでインラインで表示されます。

- **ResStatus**<br/>
  **ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

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

