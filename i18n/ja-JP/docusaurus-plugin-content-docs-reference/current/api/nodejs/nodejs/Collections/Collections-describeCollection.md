---
title: "describeCollection() | Node.js"
slug: /node/node/Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションの詳細情報を一覧表示します。 | Node.js"
type: docx
token: IuTYdjSHHoznXNx5f7jcKqvYnhr
sidebar_position: 8
keywords: 
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
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

この操作は、特定のコレクションの詳細情報を一覧表示します。

```javascript
await milvusClient.describeCollection(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeCollection({ 
    db_name: string,
    collection_name: string 
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象のコレクションを保持するデータベース名。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**RETURNS** *Promise&lt;DescribeCollectionResponse&gt;*

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

**PARAMETERS:**

- **schema** (*CollectionSchema*) -<br/>
  コレクションのスキーマ。

    - **name** (*string*) -

        コレクション名。

    - **description** (*string*) -

        コレクションの任意の説明。

    - **enable_dynamic_field** (*boolean*) -

        動的フィールドが有効かどうか。**true** の場合、スキーマで宣言されていないフィールドは非表示の `$meta` JSON フィールドに保存されます。

    - **autoID** (*boolean*) -

        主キーが Milvus によって自動生成されるかどうか。

    - **fields** (*FieldSchema[]*) -

        コレクション上で宣言されているすべてのスカラーフィールドとベクトルフィールド。**FieldSchema** の完全なフィールドリファレンスについては、`FieldSchema` クラスのドキュメントを参照してください。

    - **functions** (*FunctionObject[]*) -

        コレクションにアタッチされた doc-in / doc-out 関数（例: BM25 sparse-vector 関数）。

- **collectionID** (*string*) -<br/>
  Milvus によって割り当てられた内部コレクション ID。

- **collection_name** (*string*) -<br/>
  コレクション名。

- **consistency_level** (*string*) -<br/>
  このコレクションに対するクエリのデフォルトの整合性レベル。指定可能な値は **Strong**、**Session**、**Bounded**、**Eventually**、**Customized** です。

- **aliases** (*string[]*) -<br/>
  このコレクションを指すエイリアスの一覧。

- **properties** (*KeyValuePair[]*) -<br/>
  コレクションレベルのプロパティ（例: **mmap.enabled**、**collection.ttl.seconds**）。作成時に宣言するか、`alterCollectionProperties()` を使用して設定します。

- **created_timestamp** (*string*) -<br/>
  コレクションが作成された時点のハイブリッドタイムスタンプ。

- **created_utc_timestamp** (*string*) -<br/>
  コレクションが作成された時点の UTC タイムスタンプ（ミリ秒）。

- **shards_num** (*number*) -<br/>
  コレクションに設定されているシャード数。

- **num_partitions** (*string*) -<br/>
  コレクションに設定されているパーティション数。この値は、パーティションキーフィールドが宣言されている場合にのみ意味を持ちます。

- **db_name** (*string*) -<br/>
  このコレクションを所有するデータベース。

- **functions** (*FunctionObject[]*) -<br/>
  コレクションにアタッチされた doc-in / doc-out 関数のフラット化された一覧。

- **external_source** (*string*) -

    外部ソースのパス。任意。

- **external_spec** (*string*) -

    外部 spec の設定。任意。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうか。任意。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID。任意。

- **update_timestamp_str** (*string*) -<br/>
  コレクションが最後に更新された時点のハイブリッドタイムスタンプを文字列としてフォーマットしたもの。

- **update_timestamp** (*number*) -<br/>
  最終更新タイムスタンプの数値形式。

- **anns_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  ベクトルフィールド名からその **FieldSchema** へのマッピングで、コレクション上で宣言されているすべてのベクトルフィールドをカバーします。

- **scalar_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  スカラーフィールド名からその **FieldSchema** へのマッピングで、コレクション上で宣言されているすべてのスカラーフィールドをカバーします。

- **function_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  関数出力フィールド名からその **FieldSchema** へのマッピング。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```

