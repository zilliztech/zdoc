---
title: "describeCollection() | Node.js"
slug: /node/node/Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に関する詳細情報を一覧表示します。 | Node.js"
type: docx
token: IuTYdjSHHoznXNx5f7jcKqvYnhr
sidebar_position: 8
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダル RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - describeCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeCollection()

この操作は、特定の collection に関する詳細情報を一覧表示します。

```javascript
await milvusClient.describeCollection(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.describeCollection({ 
    db_name: string,
    collection_name: string 
})
```

**パラメーター:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;DescribeCollectionResponse&gt;*

このメソッドは、**DescribeCollectionResponse** オブジェクトに解決される promise を返します。

```typescript
{
    schema: CollectionSchema,
    collectionID: string,
    collection_name: string,
    consistency_level: string,
    aliases: string[],
    properties: KeyValuePair[],
    created_timestamp: string,
    created_utc_timestamp: string,
    shards_num: number,
    num_partitions: string,
    db_name: string,
    functions: FunctionObject[],
    external_source?: string,
    external_spec?: string,
    do_physical_backfill?: boolean,
    file_resource_ids?: string[],
    update_timestamp_str: string,
    update_timestamp: number,
    anns_fields: Record<string, FieldSchema>,
    scalar_fields: Record<string, FieldSchema>,
    function_fields: Record<string, FieldSchema>,
    status:  ResStatus
}
```

**パラメーター:**

- **schema** (*CollectionSchema*) -
collection の schema。

    - **name** (*string*) -

        collection 名。

    - **description** (*string*) -

        collection の任意の説明。

    - **enable_dynamic_field** (*boolean*) -

        dynamic field が有効かどうか。**true** の場合、schema で宣言されていない field は非表示の `$meta` JSON field に保存されます。

    - **autoID** (*boolean*) -

        primary key が Milvus によって自動生成されるかどうか。

    - **fields** (*FieldSchema[]*) -

        collection で宣言されているすべての scalar field と vector field。完全な **FieldSchema** の field リファレンスについては、`FieldSchema` クラスのドキュメントを参照してください。

    - **functions** (*FunctionObject[]*) -

        collection にアタッチされた doc-in / doc-out 関数（例: BM25 sparse-vector 関数）。

- **collectionID** (*string*) -
Milvus によって割り当てられた内部 collection ID。

- **collection_name** (*string*) -
collection 名。

- **consistency_level** (*string*) -
この collection に対するクエリのデフォルトの整合性レベル。指定可能な値は **Strong**、**Session**、**Bounded**、**Eventually**、**Customized** です。

- **aliases** (*string[]*) -
この collection を指す alias のリスト。

- **properties** (*KeyValuePair[]*) -
作成時に宣言された、または `alterCollectionProperties()` を介して設定された collection レベルのプロパティ（例: **mmap.enabled**、**collection.ttl.seconds**）。

- **created_timestamp** (*string*) -
collection が作成された時点の hybrid timestamp。

- **created_utc_timestamp** (*string*) -
collection が作成された時点の UTC timestamp（ミリ秒単位）。

- **shards_num** (*number*) -
collection に設定されている shard の数。

- **num_partitions** (*string*) -
collection に設定されている partition の数。この値に意味があるのは、partition key field が宣言されている場合のみです。

- **db_name** (*string*) -
この collection を所有するデータベース。

- **functions** (*FunctionObject[]*) -
collection にアタッチされた doc-in / doc-out 関数のフラット化されたリスト。

- **external_source** (*string*) -

    外部ソースのパス。任意。

- **external_spec** (*string*) -

    外部仕様の構成。任意。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうか。任意。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID。任意。

- **update_timestamp_str** (*string*) -
collection が最後に更新された時点の hybrid timestamp を文字列形式にしたもの。

- **update_timestamp** (*number*) -
最終更新 timestamp の数値形式。

- **anns_fields** (*Record&lt;string, FieldSchema&gt;*) -
vector field 名からその **FieldSchema** へのマッピングで、collection で宣言されたすべての vector field を含みます。

- **scalar_fields** (*Record&lt;string, FieldSchema&gt;*) -
scalar field 名からその **FieldSchema** へのマッピングで、collection で宣言されたすべての scalar field を含みます。

- **function_fields** (*Record&lt;string, FieldSchema&gt;*) -
関数出力 field 名からその **FieldSchema** へのマッピング。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```

