---
title: "createCollection() | Node.js"
slug: /node/node/Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、既定の設定またはカスタム設定でコレクションを作成します。 | Node.js"
type: docx
token: KPZZd2TiAodSeWxUdlJciHGcnbg
sidebar_position: 5
keywords: 
  - 動画の類似性検索
  - ベクトル検索
  - 音声の類似性検索
  - 伸縮性のあるベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - createCollection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';

# createCollection()

この操作では、既定の設定またはカスタム設定でコレクションを作成します。 

```javascript
await milvusClient.createCollection(data)
```

## リクエスト構文\{#request-syntax}

このメソッドには次の代替方法があります。

### CreateColReq を使用する\{#with-createcolreq}

このリクエストボディを使用すると、コレクション名とベクトルフィールドの次元を設定するだけでコレクションを作成できます。

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

**パラメーター:**

- **db_name** (*string*) -

    対象のコレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[必須]**

    作成するコレクションの名前です。

- **dimension** (*number*) -

    **[必須]**

    ベクトル埋め込みの次元数です。値は 1 より大きい整数にする必要があります。コレクションスキーマをカスタマイズする場合は、この項目をスキップしてください。

- **auto_id** (*boolean*) - 

    データをこのコレクションに挿入するときにプライマリフィールドを自動的にインクリメントするかどうか。

    値は既定で **False** になります。これを **True** に設定すると、プライマリフィールドが自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めないでください。自動生成される ID は固定長であり、変更できません。

    このパラメーターはコレクションをすばやくセットアップするためのものであり、**スキーマ** が **None** でない場合は無視されます。

- **consistency_level** (*string*)

    対象のコレクションの整合性レベルです。

    値は既定で **Bounded** になり、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" icon="📘" title="Notes">
    
    分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
    
    Milvus は **Strong**、**Bounded Staleness**、**Session**、**Eventually** の 4 つの整合性レベルをサポートしています。Milvus の既定の整合性レベルは **Bounded Staleness** です。
    
    ベクトル類似性検索またはクエリを実行する際に整合性レベルを簡単に調整し、アプリケーションに最適な設定にできます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    未定義のフィールドとその値をキーと値のペアで格納するために、**&#36;meta** という名前の予約済み JSON フィールドを使用するかどうか。

    値は既定で **True** になり、メタフィールドが使用されることを示します。

- **enableDynamicField** (*boolean)* -

    **enable_dynamic_field** のエイリアスです。

- **id_type** (*Int64* | *VarChar*) -

    プライマリフィールドのデータ型です。

- **index_params** (*CreateIndexParam*) -

    作成するコレクションのインデックスパラメーターです。

- **metric_type** (*string* | *MetricType*) -

    メトリックタイプは、ベクトル埋め込み間の類似性を測定する方法を決定します。

- **primary_field_name** (*string*) -

    プライマリフィールドのカスタム名です。

- **vector_field_name** (*string*) -

    ベクトルフィールドのカスタム名です。

- **timeout** (number) -

    この操作のタイムアウト期間です。**None** に設定すると、応答が返るかエラーが発生した時点でこの操作がタイムアウトすることを示します。

### CreateCollectionReq を使用する\{#with-createcollectionreq}

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

**パラメーター:**

- **db_name** (*string*) -

    対象のコレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[必須]**

    作成するコレクションの名前です。

- **consistency_level** (*string*)

    対象のコレクションの整合性レベルです。

    値は既定で **Bounded** になり、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" icon="📘" title="Notes">
    
    分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
    
    Milvus は **Strong**、**Bounded Staleness**、**Session**、**Eventually** の 4 つの整合性レベルをサポートしています。Milvus の既定の整合性レベルは **Bounded Staleness** です。
    
    ベクトル類似性検索またはクエリを実行する際に整合性レベルを簡単に調整し、アプリケーションに最適な設定にできます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    未定義のフィールドとその値をキーと値のペアで格納するために、**&#36;meta** という名前の予約済み JSON フィールドを使用するかどうか。

    値は既定で **True** になり、メタフィールドが使用されることを示します。

- **スキーマ** (*[FieldType](./Collections-FieldType)[]*) -

    フィールド定義のリストとしてのコレクションのスキーマです。

- **fields** (*[FieldType](./Collections-FieldType)[]*) -

    **スキーマ** の代替で、コレクションのフィールドをフィールド定義のリストとして指定します。

- **functions** (*[FunctionObject](./Collections-FunctionObject)[]*)

    データをベクトル埋め込みに変換します。この関数はコレクションのスキーマに追加されます。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的の簡単な説明です。これはドキュメント化や大規模プロジェクトでの明確化に役立ち、既定では空の文字列になります。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数のタイプです。指定可能な値:

        - `FunctionType.BM25`: BM25 アルゴリズムを使用して、`VARCHAR` フィールドからスパース埋め込みを生成します。

    - **input_field_names** (*string[]*)

        ベクトル表現に変換する必要がある生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け付けます。

    - **output_field_names** (*string[]*)

        生成された埋め込みが格納されるフィールドの名前です。これは、コレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- **num_partitions** (*number)* -

    コレクション内に作成するパーティションの数です。

    <Admonition type="info" icon="📘" title="Notes">
    
    データパーティショニングは、特定の基準に基づいてデータを整理する手法です。データパーティショニングを使用すると、パーティションを個別に作成、ロード、リリース、削除できるほか、パーティション内で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*string*) -

    パーティションキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    パーティションキーは、キーの値に基づいてエンティティをさまざまなパーティションに格納するために使用されます。つまり、パーティションキーは同じキーを持つエンティティをグループ化し、キーフィールドでフィルタリングする際に無関係なパーティションのスキャンを回避できます。パーティションキーを使用すると、従来のフィルタリング方法と比べてクエリパフォーマンスを大幅に向上できます。

    </Admonition>

- **clustering_key_field** (*string*) -

    クラスタリングキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    クラスタリング Compaction は、スカラーフィールドの値に基づいてコレクション内のセグメント間でエンティティを再分配する Milvus の機能です。この機能を有効にするには、まずクラスタリングキーとしてスカラーフィールドを選択する必要があります。これにより、クラスタリングキーの値が特定の範囲に収まるエンティティを Milvus がセグメントに再分配できるようになります。クラスタリング Compaction をトリガーすると、Milvus は PartitionStats というグローバルインデックスを生成または更新します（generates/updates）。このインデックスは、セグメントとクラスタリングキーの値の間のマッピング関係を記録します。

    </Admonition>

- **shards_num** (*number)* -

    このコレクションの作成とともに作成するシャードの数です。 

    値は既定で **1** になり、このコレクションの作成とともに 1 つのシャードが作成されることを示します。

    <Admonition type="info" icon="📘" title="Notes">
    
    シャーディングとは、書き込み操作をさまざまなノードに分散し、Milvus クラスターの並列計算能力を最大限に活用してデータを書き込むことを指します。
    
    既定では、コレクションには 1 つのシャードが含まれます。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    キーと値のペアで表されるコレクションの追加プロパティです。指定可能な値:

    - **コレクション.ttl.seconds** (*number*) -

        現在のコレクションの有効期間（秒単位）です。

    - **mmap.enabled** (*boolean*) -

        コレクション全体で mmap を有効にするかどうか。

    - **partitionkey.isolation** (*boolean*) -

        パーティションキーの分離を有効にするかどうか。

    - **dynamicfield.enabled** (*boolean*) -

        動的フィールドを有効にするかどうか。

    - **allow_insert_auto_id** (*boolean*) -

        autoID が有効な場合にプライマリキーの挿入を許可するかどうか。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト期間です。**None** に設定すると、応答が返るかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **external_source** (*string*) -

    外部ソースパスです。これは外部コレクションの作成に適用されます。

    Zilliz Cloud では、`external_source` は `volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを受け付けます。`milvus://` スキームは、同じプロジェクトおよびリージョン内にある Milvus v3.0.x と互換性のある別のクラスター上のコレクションを指します。スキームは小文字である必要があり、3 つのセグメントはすべて必須で、末尾のスラッシュは 1 つまで許容されます。外部コレクションを作成する場合に必要です。

- **external_spec** (*string*) -

    外部仕様設定です。これは外部コレクションの作成に適用されます。

    Zilliz Cloud では、外部コレクションの作成時に `external_spec` は省略可能です。`milvus://` ソースの場合は省略すると `format` が `milvus-table` に既定設定され、それ以外のソースの場合は一致する `format`（`parquet`、`vortex`、`lance-table`、`iceberg-table`）を指定した仕様を指定します。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルのリソース ID です。これは外部コレクションの作成に適用されます。

### CreateColWithSchemaAndIndexParamsReq を使用する\{#with-createcolwithschemaandindexparamsreq}

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

**パラメーター:**

- **db_name** (*string*) -

    対象のコレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[必須]**

    作成するコレクションの名前です。

- **consistency_level** (*string*)

    対象のコレクションの整合性レベルです。

    値は既定で **Bounded** になり、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" icon="📘" title="Notes">
    
    分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
    
    Milvus は **Strong**、**Bounded Staleness**、**Session**、**Eventually** の 4 つの整合性レベルをサポートしています。Milvus の既定の整合性レベルは **Bounded Staleness** です。
    
    ベクトル類似性検索またはクエリを実行する際に整合性レベルを簡単に調整し、アプリケーションに最適な設定にできます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    未定義のフィールドとその値をキーと値のペアで格納するために、**&#36;meta** という名前の予約済み JSON フィールドを使用するかどうか。

    値は既定で **True** になり、メタフィールドが使用されることを示します。

- **スキーマ** (*[FieldType](./Collections-FieldType)[]*) -

    フィールド定義のリストとしてのコレクションのスキーマです。

- **fields** (*[FieldType](./Collections-FieldType)[]*) -

    **スキーマ** の代替で、コレクションのフィールドをフィールド定義のリストとして指定します。

- **functions** (*[FunctionObject](./Collections-FunctionObject)[]*)

    データをベクトル埋め込みに変換します。この関数はコレクションのスキーマに追加されます。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的の簡単な説明です。これはドキュメント化や大規模プロジェクトでの明確化に役立ち、既定では空の文字列になります。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数のタイプです。指定可能な値:

        - `FunctionType.BM25`: BM25 アルゴリズムを使用して、`VARCHAR` フィールドからスパース埋め込みを生成します。

    - **input_field_names** (*string[]*)

        ベクトル表現に変換する必要がある生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け付けます。

    - **output_field_names** (*string[]*)

        生成された埋め込みが格納されるフィールドの名前です。これは、コレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つのフィールド名のみを受け付けます。

- **num_partitions** (*number)* -

    コレクション内に作成するパーティションの数です。

    <Admonition type="info" icon="📘" title="Notes">
    
    データパーティショニングは、特定の基準に基づいてデータを整理する手法です。データパーティショニングを使用すると、パーティションを個別に作成、ロード、リリース、削除できるほか、パーティション内で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*string*) -

    パーティションキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    パーティションキーは、キーの値に基づいてエンティティをさまざまなパーティションに格納するために使用されます。つまり、パーティションキーは同じキーを持つエンティティをグループ化し、キーフィールドでフィルタリングする際に無関係なパーティションのスキャンを回避できます。パーティションキーを使用すると、従来のフィルタリング方法と比べてクエリパフォーマンスを大幅に向上できます。

    </Admonition>

- **clustering_key_field** (*string*) -

    クラスタリングキーとして機能するフィールドの名前です。

    <Admonition type="info" icon="📘" title="Notes">
    
    クラスタリング Compaction は、スカラーフィールドの値に基づいてコレクション内のセグメント間でエンティティを再分配する Milvus の機能です。この機能を有効にするには、まずクラスタリングキーとしてスカラーフィールドを選択する必要があります。これにより、クラスタリングキーの値が特定の範囲に収まるエンティティを Milvus がセグメントに再分配できるようになります。クラスタリング Compaction をトリガーすると、Milvus は PartitionStats というグローバルインデックスを生成または更新します（generates/updates）。このインデックスは、セグメントとクラスタリングキーの値の間のマッピング関係を記録します。

    </Admonition>

- **shards_num** (*number)* -

    このコレクションの作成とともに作成するシャードの数です。 

    値は既定で **1** になり、このコレクションの作成とともに 1 つのシャードが作成されることを示します。

    <Admonition type="info" icon="📘" title="Notes">
    
    シャーディングとは、書き込み操作をさまざまなノードに分散し、Milvus クラスターの並列計算能力を最大限に活用してデータを書き込むことを指します。
    
    既定では、コレクションには 1 つのシャードが含まれます。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    キーと値のペアで表されるコレクションの追加プロパティです。指定可能な値:

    - **コレクション.ttl.seconds** (*number*) -

        現在のコレクションの有効期間（秒単位）です。

    - **mmap.enabled** (*boolean*) -

        コレクション全体で mmap を有効にするかどうか。

    - **partitionkey.isolation** (*boolean*) -

        パーティションキーの分離を有効にするかどうか。

    - **dynamicfield.enabled** (*boolean*) -

        動的フィールドを有効にするかどうか。

    - **allow_insert_auto_id** (*boolean*) -

        autoID が有効な場合にプライマリキーの挿入を許可するかどうか。

- **index_params** (*CreateIndexSimpleReq[]* | *CreateIndexSimpleReq*)

    インデックスパラメーターです。

    - **field_name** (*string*) -

        インデックスを作成するフィールドの名前です。

    - **index_name** (*string*) -

        生成するインデックスファイルの名前です。

    - **index_type** (*string*) -

        使用するインデックスアルゴリズムのタイプです。

    - **metric_type** (*string*) -

        ベクトル埋め込み間の類似性を測定するために使用するメトリックタイプです。

    - **params** (*KeyValueObj*) -

        キーと値のペアで表される追加のインデックス関連パラメーターです。

- **timeout** (*number*) -

    この操作のタイムアウト期間です。**None** に設定すると、応答が返るかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **external_source** (*string*) -

    外部ソースパスです。これは外部コレクションの作成に適用されます。

    Zilliz Cloud では、`external_source` は `volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを受け付けます。`milvus://` スキームは、同じプロジェクトおよびリージョン内にある Milvus v3.0.x と互換性のある別のクラスター上のコレクションを指します。スキームは小文字である必要があり、3 つのセグメントはすべて必須で、末尾のスラッシュは 1 つまで許容されます。外部コレクションを作成する場合に必要です。

- **external_spec** (*string*) -

    外部仕様設定です。これは外部コレクションの作成に適用されます。

    Zilliz Cloud では、外部コレクションの作成時に `external_spec` は省略可能です。`milvus://` ソースの場合は省略すると `format` が `milvus-table` に既定設定され、それ以外のソースの場合は一致する `format`（`parquet`、`vortex`、`lance-table`、`iceberg-table`）を指定した仕様を指定します。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルのリソース ID です。これは外部コレクションの作成に適用されます。

**戻り値:**

*Promise\<ResStatus\>*

このメソッドは、**ResStatus** オブジェクトに解決される Promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメーター:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合、**0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由です。この操作が成功した場合、空の文字列のままです。


**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

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
