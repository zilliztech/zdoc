---
title: "createCollection() | Node.js"
slug: /node/node/Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、デフォルト設定またはカスタマイズ設定でコレクションを作成します。 | Node.js"
type: docx
token: KPZZd2TiAodSeWxUdlJciHGcnbg
sidebar_position: 5
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - createCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# createCollection()

この操作は、デフォルト設定またはカスタマイズ設定でコレクションを作成します。 

```javascript
await milvusClient.createCollection(data)
```

## リクエスト構文\{#request-syntax}

このメソッドには以下の代替形式があります。

### With CreateColReq\{#with-createcolreq}

このリクエストボディを使用すると、コレクション名とベクトルフィールドの次元を指定するだけで、簡単にコレクションを作成できます。

```javascript
await milvusClient.createCollection({
    db_name?: string
    collection_name: string;
    dimension: number;
    auto_id?: boolean;
    consistency_level?: "Strong" | "Session" | "Bounded" | "Eventually" | "Customized";
    description?: string;
    enable_dynamic_field?: boolean;
    enableDynamicField?: boolean;
    id_type?: Int64 | VarChar;
    index_params?: CreateIndexParam;
    metric_type?: string | MetricType;
    primary_field_name?: string;
    vector_field_name?: string;
    timeout?: number;
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象コレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成するコレクションの名前です。

- **dimension** (*number*) -

    **[REQUIRED]**

    ベクトル埋め込みの次元数です。値は 1 より大きい整数である必要があります。コレクションスキーマをカスタマイズする必要がある場合は、これを省略してください。

- **auto_id** (*boolean*) - 

    このコレクションへのデータ挿入時に、プライマリフィールドを自動インクリメントするかどうかです。

    デフォルト値は **False** です。これを **True** に設定すると、プライマリフィールドは自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めてはいけません。自動生成される ID は固定長であり、変更できません。

    このパラメータはコレクションをすばやくセットアップするためのもので、**スキーマ** が **None** でない場合は無視されます。

- **consistency_level** (*string*)

    対象コレクションの整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" icon="📘" title="Notes">
    
    分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
    Milvus は **Strong**、**Bounded Staleness**、**Session**、**Eventually** の 4つの整合性レベルをサポートしています。Milvus のデフォルトの整合性レベルは **Bounded Staleness** です。
    
    ベクトル類似検索やクエリの実行時に、アプリケーションに最適となるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    **&#36;meta** という名前の予約済み JSON フィールドを使用して、未定義のフィールドとその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、メタフィールドが使用されることを示します。

- **enableDynamicField** (*boolean)* -

    **enable_dynamic_field** のエイリアスです。

- **id_type** (*Int64* | *VarChar*) -

    プライマリフィールドのデータ型です。

- **index_params** (*CreateIndexParam*) -

    作成するコレクションのインデックスパラメータです。

- **metric_type** (*string* | *MetricType*) -

    メトリクスタイプは、ベクトル埋め込み間の類似性をどのように測定するかを決定します。

- **primary_field_name** (*string*) -

    プライマリフィールドのカスタム名です。

- **vector_field_name** (*string*) -

    ベクトルフィールドのカスタム名です。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

### With CreateCollectionReq\{#with-createcollectionreq}

このリクエストボディを使用すると、コレクションのスキーマ設定をカスタマイズできます。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: string,
   description: string,
   enable_dynamic_field: boolean,
   fields?: FieldType[],
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
       is_clustering_key?: boolean,
       type_params: {
         dim: number,
         max_length: number,
         max_capacity: number,
         analyzer_params: Record<String, any>,
         enable_analyzer: boolean,
         enable_match: boolean,
         multi_analyzer_params: Record<String, any>,
         'mmap.enabled': boolean
       },
       autoID?: boolean,
       nullable: boolean,
       default_value: number | string
     }
   ],
   functions: [
      {
        name: string,
        description: string,
        type: FunctionType,
        input_field_names: string[],
        output_field_names: string[],
        params: Record<string, any>,
      },
   ],
   num_partitions?: number,
   partition_key_field?: string,
   clustering_key_field?: string,
   shards_num?: number,
   properties?: Properties,
   timeout?: number,
   external_source?: string;
   external_spec?: string;
   file_resource_ids?: Array<number | string>;
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象コレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成するコレクションの名前です。

- **consistency_level** (*string*)

    対象コレクションの整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" icon="📘" title="Notes">
    
    分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
    Milvus は **Strong**、**Bounded Staleness**、**Session**、**Eventually** の 4つの整合性レベルをサポートしています。Milvus のデフォルトの整合性レベルは **Bounded Staleness** です。
    
    ベクトル類似検索やクエリの実行時に、アプリケーションに最適となるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    **&#36;meta** という名前の予約済み JSON フィールドを使用して、未定義のフィールドとその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、メタフィールドが使用されることを示します。

- **スキーマ** (*FieldType[]*) -

    コレクションのスキーマをフィールド定義のリストとして表したものです。

- **fields** (*FieldType[]*) -

    **スキーマ** の代替であり、コレクションのフィールドをフィールド定義のリストとして指定します。

- **functions** (*FunctionObject[]*)

    データをベクトル埋め込みに変換します。この関数はコレクションのスキーマに追加されます。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的を簡潔に説明したものです。これはドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトでは空文字列です。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数の種類です。指定可能な値:

        - `FunctionType.BM25`: `VARCHAR` フィールドからスパース埋め込みを生成するために BM25 アルゴリズムを使用します。

    - **input_field_names** (*string[]*)

        ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け入れます。

    - **output_field_names** (*string[]*)

        生成された埋め込みが保存されるフィールドの名前です。これはコレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け入れます。

- **num_partitions** (*number)* -

    コレクションに作成するパーティションの数です。

    <Admonition type="info" icon="📘" title="Notes">
    
    データパーティショニングは、特定の基準に基づいてデータを整理するための手法です。データパーティショニングを使用すると、パーティションを個別に作成、ロード、解放、削除できるほか、その中で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*string*) -

    パーティションキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    パーティションキーは、そのキー値に基づいてエンティティを異なるパーティションに格納するために使用されます。つまり、パーティションキーは同じキーを持つエンティティをまとめ、キーフィールドでフィルタリングする際には無関係なパーティションのスキャンを回避できます。パーティションキーは、従来のフィルタリング方法と比較してクエリ性能を大幅に向上させることができます。

    </Admonition>

- **clustering_key_field** (*string*) -

    クラスタリングキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction は、スカラーフィールドの値に基づいて、コレクション内のセグメント間でエンティティを再配置する Milvus の機能です。この機能を有効にするには、まずスカラーフィールドをクラスタリングキーとして選択する必要があります。これにより、クラスタリングキーの値が特定の範囲に収まる場合に、Milvus がエンティティをセグメントに再配置できるようになります。クラスタリング Compaction をトリガーすると、Milvus は PartitionStats というグローバルインデックスを生成または更新します（generates/updates）。このインデックスには、セグメントとクラスタリングキーの値のマッピング関係が記録されます。

    </Admonition>

- **shards_num** (*number)* -

    このコレクションの作成に合わせて作成するシャードの数です。 

    デフォルト値は **1** で、このコレクションとともに 1 つのシャードが作成されることを示します。

    <Admonition type="info" icon="📘" title="Notes">
    
    シャーディングとは、データ書き込みのために Milvus クラスターの並列計算能力を最大限に活用できるよう、書き込み操作を異なるノードに分散することを指します。
    
    デフォルトでは、コレクションには 1 つのシャードが含まれます。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    コレクションの追加プロパティをキーと値のペアで指定します。指定可能な値は次のとおりです。

    - **コレクション.ttl.seconds** (*number*) -

        現在のコレクションの有効期限（秒）です。

    - **mmap.enabled** (*boolean*) -

        コレクション全体で mmap を有効にするかどうかです。

    - **partitionkey.isolation** (*boolean*) -

        パーティションキーの分離を有効にするかどうかです。

    - **dynamicfield.enabled** (*boolean*) -

        動的フィールドを有効にするかどうかです。

    - **allow_insert_auto_id** (*boolean*) -

        autoID が有効な場合にプライマリキーの挿入を許可するかどうかです。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

- **external_source** (*string*) -

    外部ソースのパスです。これは外部コレクションの作成に適用されます。

- **external_spec** (*string*) -

    外部スペックの設定です。これは外部コレクションの作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは外部コレクションの作成に適用されます。

### CreateColWithSchemaAndIndexParamsReq を使用\{#with-createcolwithschemaandindexparamsreq}

このリクエストボディを使用すると、コレクションのスキーマとインデックス設定をカスタマイズできます。作成時に、コレクションは自動的にロードされます。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: string,
   description: string,
   enable_dynamic_field: boolean,
   fields?: FieldType[],
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
       is_clustering_key?: boolean,
       type_params: {
         dim: number,
         max_length: number,
         max_capacity: number,
         analyzer_params: Record<String, any>,
         enable_analyzer: boolean,
         enable_match: boolean,
         multi_analyzer_params: Record<String, any>,
         'mmap.enabled': boolean
       },
       nullable: boolean,
       default_value: number | string
     }
   ],
   functions: [
      {
        name: string,
        description: string,
        type: FunctionType,
        input_field_names: string[],
        output_field_names: string[],
        params: Record<string, any>,
      },
   ],
   num_partitions?: number,
   partition_key_field?: string,
   shards_num?: number,
   properties?: Properties,
   index_params: [
     {
       field_name: string,
       index_name?: string,
       index_type: string,
       metric_type?: string,
       params?: keyValueObj
     }     
   ],
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象コレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成するコレクションの名前です。

- **consistency_level** (*string*)

    対象コレクションの整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" icon="📘" title="Notes">
    
    分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
    Milvus は **Strong**、**Bounded Staleness**、**Session**、**Eventually** の 4つの整合性レベルをサポートしています。Milvus のデフォルトの整合性レベルは **Bounded Staleness** です。
    
    ベクトル類似検索やクエリの実行時に、アプリケーションに最適となるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    **&#36;meta** という名前の予約済み JSON フィールドを使用して、未定義のフィールドとその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、メタフィールドが使用されることを示します。

- **スキーマ** (*FieldType[]*) -

    コレクションのスキーマをフィールド定義のリストとして表したものです。

- **fields** (*FieldType[]*) -

    **スキーマ** の代替であり、コレクションのフィールドをフィールド定義のリストとして指定します。

- **functions** (*FunctionObject[]*)

    データをベクトル埋め込みに変換します。この関数はコレクションのスキーマに追加されます。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的を簡潔に説明したものです。これはドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトでは空文字列です。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数の種類です。指定可能な値:

        - `FunctionType.BM25`: `VARCHAR` フィールドからスパース埋め込みを生成するために BM25 アルゴリズムを使用します。

    - **input_field_names** (*string[]*)

        ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け入れます。

    - **output_field_names** (*string[]*)

        生成された埋め込みが保存されるフィールドの名前です。これはコレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け入れます。

- **num_partitions** (*number)* -

    コレクションに作成するパーティションの数です。

    <Admonition type="info" icon="📘" title="Notes">
    
    データパーティショニングは、特定の基準に基づいてデータを整理するための手法です。データパーティショニングを使用すると、パーティションを個別に作成、ロード、解放、削除できるほか、その中で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*string*) -

    パーティションキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    パーティションキーは、そのキー値に基づいてエンティティを異なるパーティションに格納するために使用されます。つまり、パーティションキーは同じキーを持つエンティティをまとめ、キーフィールドでフィルタリングする際には無関係なパーティションのスキャンを回避できます。パーティションキーは、従来のフィルタリング方法と比較してクエリ性能を大幅に向上させることができます。

    </Admonition>

- **clustering_key_field** (*string*) -

    クラスタリングキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    Clustering Compaction は、スカラーフィールドの値に基づいて、コレクション内のセグメント間でエンティティを再配置する Milvus の機能です。この機能を有効にするには、まずスカラーフィールドをクラスタリングキーとして選択する必要があります。これにより、クラスタリングキーの値が特定の範囲に収まる場合に、Milvus がエンティティをセグメントに再配置できるようになります。クラスタリング Compaction をトリガーすると、Milvus は PartitionStats というグローバルインデックスを生成または更新します（generates/updates）。このインデックスには、セグメントとクラスタリングキーの値のマッピング関係が記録されます。

    </Admonition>

- **shards_num** (*number)* -

    このコレクションの作成に合わせて作成するシャードの数です。 

    デフォルト値は **1** で、このコレクションとともに 1 つのシャードが作成されることを示します。

    <Admonition type="info" icon="📘" title="Notes">
    
    シャーディングとは、データ書き込みのために Milvus クラスターの並列計算能力を最大限に活用できるよう、書き込み操作を異なるノードに分散することを指します。
    
    デフォルトでは、コレクションには 1 つのシャードが含まれます。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    コレクションの追加プロパティをキーと値のペアで指定します。指定可能な値は次のとおりです。

    - **コレクション.ttl.seconds** (*number*) -

        現在のコレクションの有効期限（秒）です。

    - **mmap.enabled** (*boolean*) -

        コレクション全体で mmap を有効にするかどうかです。

    - **partitionkey.isolation** (*boolean*) -

        パーティションキーの分離を有効にするかどうかです。

    - **dynamicfield.enabled** (*boolean*) -

        動的フィールドを有効にするかどうかです。

    - **allow_insert_auto_id** (*boolean*) -

        autoID が有効な場合にプライマリキーの挿入を許可するかどうかです。

- **index_params** (*CreateIndexSimpleReq[]* | *CreateIndexSimpleReq*)

    インデックスパラメーターです。

    - **field_name** (*string*) -

        インデックスを作成するフィールドの名前です。

    - **index_name** (*string*) -

        生成するインデックスファイルの名前です。

    - **index_type** (*string*) -

        使用するインデックスアルゴリズムの種類です。

    - **metric_type** (*string*) -

        ベクトル埋め込み間の類似度を測定するために使用されるメトリクスタイプです。

    - **params** (*KeyValueObj*) -

        インデックス関連の追加パラメーターをキーと値のペアで指定します。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

- **external_source** (*string*) -

    外部ソースのパスです。これは外部コレクションの作成に適用されます。

- **external_spec** (*string*) -

    外部スペックの設定です。これは外部コレクションの作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは外部コレクションの作成に適用されます。

**戻り値:**

*Promise\<ResStatus\>*

このメソッドは **ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。


**例外:**

- **Error**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.createCollection({
   collection_name: 'my_collection',
   fields: [
     {
       name: "vector_01",
       description: "vector field",
       data_type: DataType.FloatVector,
       type_params: {
         dim: "8"
       }
     },
     {
       name: "age",
       data_type: DataType.Int64,
       autoID: true,
       is_primary_key: true,
       description: "",
     },
   ],
 });
```
