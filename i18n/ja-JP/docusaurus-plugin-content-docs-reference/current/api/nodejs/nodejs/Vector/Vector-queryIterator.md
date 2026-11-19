---
title: "queryIterator() | Node.js"
slug: /node/node/Vector-queryIterator
sidebar_label: "queryIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation conducts a ベクトル similarity search iteratively and returns results in batches. Use this instead of a single search() call when you need to process large result sets incrementally or when the total result count exceeds what a single query can return. | Node.js"
type: docx
token: YZ3GdmklAolLnux8LRhcw7hxnvd
sidebar_position: 11
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - queryIterator()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# queryIterator()

この操作は、スカラーフィルタリングクエリを反復的に実行し、結果をバッチで返します。大規模な結果セットを段階的に処理する場合や、合計結果件数が 1 回の query() 呼び出しで返せる件数を超える場合は、1 回の query() 呼び出しの代わりにこれを使用します。

```javascript
await milvusClient.queryIterator(data: QueryIteratorReq)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.queryIterator({
    collection_name: string,
    batchSize: number,
    filter?: string,
    expr?: string,
    exprValues?: keyValueObj,
    params?: keyValueObj,
    group_by_fields?: string[],
    order_by_fields?: OrderByFields,
    order_by?: OrderByFields,
    transformers?: OutputTransformers,
    limit?: number,
    output_fields?: string[],
    partition_names?: string[],
    consistency_level?: ConsistencyLevelEnum,
    db_name?: string,
    timeout?: number,
})
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    既存のコレクションの名前です。

- **batchSize** (*number*) -

    **[必須]**

    反復ごとに返すエンティティ数です。16,384 を超えることはできません。

- **filter** (*string*) -

    一致するエンティティをフィルタリングするスカラー条件です。すべてのエンティティを返すには、空文字列に設定します。スカラー条件の作成方法については、Boolean Expression Rules を参照してください。

- **expr** (*string*) -

    **filter** のエイリアスです。**filter** または **expr** のいずれかを指定し、両方は指定しないでください。

- **exprValues** (*keyValueObj*) -

    フィルター式でプレースホルダーを使用する場合、これらのプレースホルダーの実際の値をキーと値のペアで指定できます。

- **params** (*keyValueObj*) -

    キーと値のペアで指定する追加のクエリパラメーターです。

- **group_by_fields** (*string[]*) -

    集計結果をグループ化するために使用するスカラーフィールドです。

- **order_by_fields** (*OrderByFields*) -

    クエリ結果を並べ替える基準となるフィールドです。

- **order_by** (*OrderByFields*) -

    **order_by_fields** のエイリアスです。

- **transformers** (*OutputTransformers*) -

    特定のデータ型のデータを変換するカスタム関数です。

- **limit** (*number*) -

    すべての反復を通じて返すエンティティの最大合計数です。デフォルトは、一致するエンティティの合計数です（制限なし）。

- **output_fields** (*string[]*) -

    返される各エンティティに含めるフィールド名のリストです。デフォルトではすべてのフィールドが返されます。

- **partition_names** (*string[]*) -

    クエリ対象のパーティションの名前です。

- **consistency_level** (*ConsistencyLevelEnum*) -

    この操作の一貫性レベルです。オプションは、Strong（0）、Session（1）、Bounded（2）、Eventually（3）です。デフォルトは、コレクションの作成時に設定された一貫性レベルです。詳細については、[ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum) を参照してください。

- **db_name** (*string*) -

    The name of the データベース containing the コレクション.

- **timeout** (*number*) -

    この操作のタイムアウト時間（ミリ秒）です。

**戻り値:**

*Promise&lt;AsyncIterable&lt;object[]&gt;&gt;*

非同期イテラブルを返します。各反復では、そのバッチのエンティティ配列が生成されます。合計結果件数が `limit` に達するか、一致するすべてのエンティティを使い切ると、反復が終了します。

**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const iterator = await milvusClient.queryIterator({
    collection_name: 'my_collection',
    filter: 'age > 30',
    batchSize: 100,
    limit: 500,
    output_fields: ['id', 'age', 'text'],
});

for await (const batch of iterator) {
    console.log(`Batch of ${batch.length} entities:`, batch);
}
```
