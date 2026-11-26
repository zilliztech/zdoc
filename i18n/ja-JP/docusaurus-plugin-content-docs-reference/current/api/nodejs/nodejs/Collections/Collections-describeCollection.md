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

---

# describeCollection()

この操作は、特定のコレクションの詳細情報を一覧表示します。

```javascript
await milvusClient.describeCollection(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeCollection({ 
    db_name: string,
    collection_name: string,
    cache?: boolean
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象のコレクションを保持するデータベース名。

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存のコレクションの名前。

- **cache** (*boolean*) -

    キャッシュされたコレクションスキーマを使用するかどうか。デフォルト値は **false** です。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値:**

*Promise&lt;DescribeCollectionResponse&gt;*

このメソッドは、**DescribeCollectionResponse** オブジェクトに解決される promise を返します。

```javascript
{
    schema: CollectionSchema,
    collectionID: string,
    collection_name: string,
    consistency_level: string,
    aliases: string[],
    virtual_channel_names: string[],
    physical_channel_names: string[],
    start_positions: string[],
    properties: KeyValuePair[],
    created_timestamp: string,
    created_utc_timestamp: string,
    shards_num: number,
    num_partitions: string,
    db_name: string,
    functions: FunctionObject[],
    update_timestamp_str: string,
    update_timestamp: number,
    anns_fields: Record<string, FieldSchema>,
    scalar_fields: Record<string, FieldSchema>,
    function_fields: Record<string, FieldSchema>,
    status:  ResStatus
}
```

**PARAMETERS:**

<NextChannel action="exclude">

- **スキーマ** (*CollectionSchema*) -
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

    - **functions** (*[FunctionObject](./Collections-FunctionObject)[]*) -

        コレクションにアタッチされた doc-in / doc-out 関数（例: BM25 スパースベクトル関数）。

    - **struct_array_fields** (*FieldSchema[]*) -

        コレクションで宣言されているすべての Struct フィールドと Array フィールド。

    - **external_source** (*string*) -

        外部ソースのパス。任意。

    - **external_spec** (*string*) -

        外部 spec の設定。任意。

    - **file_resource_ids** (*string[]*) -

        外部ファイルリソース ID。任意。

- **collectionID** (*string*) -
Milvus によって割り当てられたコレクションの内部 ID。

- **collection_name** (*string*) -
コレクション名。

- **consistency_level** (*string*) -
このコレクションに対するクエリのデフォルトの整合性レベル。指定可能な値は **Strong**、**Session**、**Bounded**、**Eventually**、**Customized** です。

- **aliases** (*string[]*) -
このコレクションを指すエイリアスのリスト。

- **virtual_channel_names** (*string[]*) -
コレクションに割り当てられた仮想チャネルの名前。この値は現在のところ有用ではありません。

- **physical_channel_names** (*string[]*) -
コレクションに割り当てられた物理チャネルの名前。この値は現在のところ有用ではありません。

- **start_positions** (*string[]*) -
作成時点のコレクションの開始位置。

- **properties** (*KeyValuePair[]*) -
作成時に宣言された、または `alterCollectionProperties()` を使用して設定されたコレクションレベルのプロパティ（例: **mmap.enabled**、**コレクション.ttl.seconds**）。

- **created_timestamp** (*string*) -
コレクションが作成されたハイブリッドタイムスタンプ。

- **created_utc_timestamp** (*string*) -
コレクションが作成された UTC タイムスタンプ（ミリ秒単位）。

- **shards_num** (*number*) -
コレクションに設定されているシャード数。

- **num_partitions** (*string*) -
コレクションに設定されているパーティション数。この値は、パーティションキーフィールドが宣言されている場合にのみ意味を持ちます。

- **db_name** (*string*) -
このコレクションを所有するデータベース。

- **functions** (*[FunctionObject](./Collections-FunctionObject)[]*) -

</NextChannel>

<NextChannel action="include">

- **スキーマ** (*CollectionSchema*) -
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

        コレクションで宣言されているすべてのスカラーフィールドとベクトルフィールド。各 **FieldSchema** には、次のメンバーがあります。

        - **fieldID** (*string* | *number*) -

            フィールドの ID。

        - **name** (*string*) -

            フィールドの名前。

        - **description** (*string*) -

            フィールドの任意の説明。

        - **data_type** (*keyof typeof DataType*) -

            フィールドのデータ型。

        - **dataType** (*DataType*) -

            フィールドの数値データ型。

        - **element_type** (*keyof typeof DataType*) -

            配列フィールドの要素型。

        - **is_primary_key** (*boolean*) -

            フィールドが主キーであるかどうか。

        - **autoID** (*boolean*) -

            主キーの値が自動生成されるかどうか。

        - **is_partition_key** (*boolean*) -

            フィールドがパーティションキーであるかどうか。

        - **is_clustering_key** (*boolean*) -

            フィールドがクラスタリングキーであるかどうか。

        - **is_dynamic** (*boolean*) -

            フィールドが動的フィールドであるかどうか。

        - **is_function_output** (*boolean*) -

            フィールドが関数によって生成されるかどうか。

        - **nullable** (*boolean*) -

            フィールドが null 許容であるかどうか。

        - **default_value** (*number* | *string* | *null*) -

            フィールドのデフォルト値。

        - **state** (*string*) -

            フィールドの状態。

        - **external_field** (*string*) -

            外部フィールドのマッピング名。

        - **type_params** (*KeyValuePair&lt;TypeParamKey, TypeParam&gt;[]*) -

            フィールドの型パラメーター。

        - **index_params** (*KeyValuePair[]*) -

            フィールドのインデックスパラメーター。

        - **fields** (*FieldSchema[]*) -

            Struct フィールドまたは Array フィールドのサブフィールド。

    - **functions** (*[FunctionObject](./Collections-FunctionObject)[]*) -

        コレクションにアタッチされた doc-in / doc-out 関数（例: BM25 スパースベクトル関数）。

    - **struct_array_fields** (*FieldSchema[]*) -

        コレクションで宣言されているすべての Struct フィールドと Array フィールド。各エントリには、**FieldSchema** と同じメンバーがあります。

    - **external_source** (*string*) -

        外部ソースのパス。任意。

    - **external_spec** (*string*) -

        外部 spec の設定。任意。

    - **file_resource_ids** (*string[]*) -

        外部ファイルリソース ID。任意。

- **collectionID** (*string*) -
Milvus によって割り当てられたコレクションの内部 ID。

- **collection_name** (*string*) -
コレクション名。

- **consistency_level** (*string*) -
このコレクションに対するクエリのデフォルトの整合性レベル。指定可能な値は **Strong**、**Session**、**Bounded**、**Eventually**、**Customized** です。

- **aliases** (*string[]*) -
このコレクションを指すエイリアスのリスト。

- **virtual_channel_names** (*string[]*) -
コレクションに割り当てられた仮想チャネルの名前。この値は現在のところ有用ではありません。

- **physical_channel_names** (*string[]*) -
コレクションに割り当てられた物理チャネルの名前。この値は現在のところ有用ではありません。

- **start_positions** (*string[]*) -
作成時点のコレクションの開始位置。

- **properties** (*KeyValuePair[]*) -
作成時に宣言された、または `alterCollectionProperties()` を使用して設定されたコレクションレベルのプロパティ（例: **mmap.enabled**、**コレクション.ttl.seconds**）。

- **created_timestamp** (*string*) -
コレクションが作成されたハイブリッドタイムスタンプ。

- **created_utc_timestamp** (*string*) -
コレクションが作成された UTC タイムスタンプ（ミリ秒単位）。

- **shards_num** (*number*) -
コレクションに設定されているシャード数。

- **num_partitions** (*string*) -
コレクションに設定されているパーティション数。この値は、パーティションキーフィールドが宣言されている場合にのみ意味を持ちます。

- **db_name** (*string*) -
このコレクションを所有するデータベース。

- **functions** (*[FunctionObject](./Collections-FunctionObject)[]*) -

</NextChannel>

コレクションにアタッチされた doc-in / doc-out 関数をフラット化したリスト。

- **update_timestamp_str** (*string*) -
コレクションが最後に更新されたハイブリッドタイムスタンプ（文字列形式）。

- **update_timestamp** (*number*) -
最終更新タイムスタンプの数値形式。

- **anns_fields** (*Record&lt;string, FieldSchema&gt;*) -
ベクトルフィールド名から対応する **FieldSchema** へのマッピング。コレクションで宣言されているすべてのベクトルフィールドを対象とします。

- **scalar_fields** (*Record&lt;string, FieldSchema&gt;*) -
スカラーフィールド名から対応する **FieldSchema** へのマッピング。コレクションで宣言されているすべてのスカラーフィールドを対象とします。

- **function_fields** (*Record&lt;string, FieldSchema&gt;*) -
関数出力フィールド名から対応する **FieldSchema** へのマッピング。

- **ResStatus**
**ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由。この操作が成功した場合は空文字列のままです。

**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```
