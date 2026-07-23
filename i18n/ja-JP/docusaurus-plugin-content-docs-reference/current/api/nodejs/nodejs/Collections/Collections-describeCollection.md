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

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeCollection({ 
    db_name: string,
    collection_name: string 
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象の collection を保持するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の collection の名前です。

- **timeout** (*number*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、応答が到着した時点または何らかのエラーが発生した時点でこの操作はタイムアウトします。

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
  collection のスキーマです。

    - **name** (*string*) -

        collection 名です。

    - **description** (*string*) -

        collection の任意の説明です。

    - **enable_dynamic_field** (*boolean*) -

        dynamic field が有効かどうかを示します。**true** の場合、スキーマで宣言されていないフィールドは、隠し `$meta` JSON フィールドに格納されます。

    - **autoID** (*boolean*) -

        主キーが Milvus によって自動生成されるかどうかを示します。

    - **fields** (*FieldSchema[]*) -

        collection で宣言されているすべての scalar フィールドと vector フィールドです。**FieldSchema** の完全なフィールドリファレンスについては、`FieldSchema` クラスのドキュメントを参照してください。

    - **functions** (*FunctionObject[]*) -

        collection にアタッチされた doc-in / doc-out 関数です（例: BM25 sparse-vector 関数）。

- **collectionID** (*string*) -<br/>
  Milvus によって割り当てられた内部 collection ID です。

- **collection_name** (*string*) -<br/>
  collection 名です。

- **consistency_level** (*string*) -<br/>
  この collection に対するクエリのデフォルトの整合性レベルです。指定可能な値は **Strong**、**Session**、**Bounded**、**Eventually**、**Customized** です。

- **aliases** (*string[]*) -<br/>
  この collection を指す alias のリストです。

- **properties** (*KeyValuePair[]*) -<br/>
  collection レベルのプロパティです（例: **mmap.enabled**、**collection.ttl.seconds**）。作成時に宣言されるか、`alterCollectionProperties()` によって設定されます。

- **created_timestamp** (*string*) -<br/>
  collection が作成された時点のハイブリッドタイムスタンプです。

- **created_utc_timestamp** (*string*) -<br/>
  collection が作成された時点の UTC タイムスタンプ（ミリ秒単位）です。

- **shards_num** (*number*) -<br/>
  collection に設定されている shard 数です。

- **num_partitions** (*string*) -<br/>
  collection に設定されている partition 数です。この値は、partition key フィールドが宣言されている場合にのみ意味を持ちます。

- **db_name** (*string*) -<br/>
  この collection を所有するデータベースです。

- **functions** (*FunctionObject[]*) -<br/>
  collection にアタッチされた doc-in / doc-out 関数のフラット化されたリストです。

- **external_source** (*string*) -

    外部ソースのパスです。任意です。

- **external_spec** (*string*) -

    外部 spec の設定です。任意です。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうかを示します。任意です。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。任意です。

- **update_timestamp_str** (*string*) -<br/>
  collection が最後に更新された時点のハイブリッドタイムスタンプを文字列形式で表したものです。

- **update_timestamp** (*number*) -<br/>
  最終更新タイムスタンプの数値形式です。

- **anns_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  vector フィールド名からその **FieldSchema** へのマッピングです。collection で宣言されているすべての vector フィールドを対象とします。

- **scalar_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  scalar フィールド名からその **FieldSchema** へのマッピングです。collection で宣言されているすべての scalar フィールドを対象とします。

- **function_fields** (*Record&lt;string, FieldSchema&gt;*) -<br/>
  関数出力フィールド名からその **FieldSchema** へのマッピングです。

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
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```

