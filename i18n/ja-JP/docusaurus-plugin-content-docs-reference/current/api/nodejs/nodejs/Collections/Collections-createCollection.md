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

displayed_sidbar: nodeSidebar
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
    id_type?: Int64 | VarChar;
    index_params?: CreateIndexParam;
    metric_type?: string;
    primary_field_name?: string;
    vector_field_name?: string;
    timeout?: number;
    external_source?: string;
    external_spec?: string;
    do_physical_backfill?: boolean;
    file_source_ids?: Array<number | string>;
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象のコレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成するコレクションの名前です。

- **dimension** (*number*) -

    ベクトル埋め込みの次元数です。値は 1 より大きい整数である必要があります。コレクションスキーマをカスタマイズする必要がある場合は、これを省略してください。

- **auto_id** (*boolean*) - 

    このコレクションへのデータ挿入時に、プライマリフィールドを自動的にインクリメントするかどうかです。

    デフォルト値は **False** です。これを **True** に設定すると、プライマリフィールドは自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めてはいけません。自動生成される ID は固定長であり、変更できません。

    このパラメータはコレクションをすばやくセットアップするためのもので、**スキーマ** が **None** でない場合は無視されます。

- **consistency_level** (*number* | *string*)

    対象コレクションの整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** のいずれかを指定できます。

    <Admonition type="info" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータの見え方を持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        ベクトル類似検索またはクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    予約済み JSON フィールド **&#36;meta** を使用して、未定義のフィールドとその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、メタフィールドが使用されることを示します。

- **id_type** (*Int64* | *VarChar*) -

    プライマリフィールドのデータ型です。

- **index_params** (*CreatIndexParam*) -

    作成するコレクションのインデックスパラメータです。

- **metric_type** (*string*) -

    メトリクスタイプは、ベクトル埋め込み間の類似性をどのように測定するかを決定します。

- **primary_field_name** (*string*) -

    プライマリフィールドのカスタム名です。

- **vector_field_name** (*string*) -

    ベクトルフィールドのカスタム名です。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが返るかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **external_source** (*string*) -

    外部ソースパスです。これは外部コレクションの作成に適用されます。

- **external_spec** (*string*) -

    外部スペック設定です。これは外部コレクションの作成に適用されます。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうかです。これは外部コレクションの作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは外部コレクションの作成に適用されます。

### With CreateCollectionReq\{#with-createcollectionreq}

このリクエストボディを使用すると、コレクションのスキーマ設定をカスタマイズできます。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: number | string,
   description: string,
   enable_dynamic_field: boolean,
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
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
       default_value: object,
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
   timeout?: number,
   external_source?: string;
   external_spec?: string;
   do_physical_backfill?: boolean;
   file_source_ids?: Array<number | string>;
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    対象のコレクションが属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成するコレクションの名前です。

- **consistency_level** (*number* | *string*)

    対象コレクションの整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** のいずれかを指定できます。

    <Admonition type="info" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータの見え方を持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        ベクトル類似検索またはクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    予約済み JSON フィールド **&#36;meta** を使用して、未定義のフィールドとその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、メタフィールドが使用されることを示します。

- **スキーマ** (*FieldType[]*) -

    - **name** (*string)* -

        フィールドの名前です。

    - **data_type** (*string)* -

        フィールドのデータ型です。使用可能なすべてのデータ型の一覧については、[DataType](./Collections-DataType) を参照してください。

    - **description** (*string)* -

        フィールドの説明です。

    - **is_partition_key** (*boolean)* -

        このフィールドがパーティションキーフィールドとして機能するかどうかを示すブール値です。

    - **is_primary_key** (*boolean)* -

        このフィールドがプライマリキーとして機能するかどうかです。

        デフォルト値は **False** です。これを **True** に設定すると、このフィールドはコレクション全体で一意のプライマリキーフィールドになります。

    - **is_function_output** (boolean) -

        このフィールドが関数の出力フィールドとして機能するかどうかです。

    - **type_params** (*string* | *number)* -

        フィールドのその他のパラメータです。

        - **dim** (*string* | *number*) -

            ベクトル埋め込みを保持するコレクションフィールドの次元数です。 

            値は 1 より大きい整数である必要があり、通常はベクトル埋め込みの生成に使用するモデルによって決まります。

        - **element_type** (string) -

            配列内の要素のデータ型です。 

            このパラメータは、現在のフィールドが配列フィールドの場合に適用されます。

        - **max_capacity** (*string* | *number)* -

            配列内の要素数です。

            このパラメータは、現在のフィールドが配列フィールドの場合に適用されます。

        - **max_length** (*string*) -

            このフィールド内の文字列の最大長です。

            このフィールドの **data_type** が **VarChar** の場合は必須です。

        - **enable_analyzer** (*boolean*) -

            指定された `VarChar` フィールドに対してテキスト解析を有効にするかどうかです。`true` に設定すると、Milvus にテキストアナライザーの使用を指示し、フィールドのテキスト内容をトークン化およびフィルタリングします。

        - **enable_match** (*boolean*)

            指定された `VarChar` フィールドに対してキーワードマッチングを有効にするかどうかです。`true` に設定すると、Milvus はそのフィールドに転置インデックスを作成し、高速かつ効率的なキーワード検索を可能にします。`enable_match` は `enable_analyzer` と連携して動作し、`enable_analyzer` がトークン化を担当し、`enable_match` がそれらのトークンに対する検索操作を担当することで、構造化された用語ベースのテキスト検索を提供します。

        - **analyzer_params** (*object*)

            テキスト処理用のアナライザーを設定します。特に `VarChar` フィールドを対象とします。このパラメータは、主に [keyword matching](https://milvus.io/docs/keyword-match.md) または [full text search](https://milvus.io/docs/full-text-search.md) に使用されるテキストフィールドのトークナイザーとフィルターの設定を構成します。アナライザーの種類に応じて、次のいずれかの方法で設定できます。

            - 組み込みアナライザー

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus に組み込まれた事前設定済みアナライザータイプです。名前を指定するだけですぐに使用できます。指定可能な値: `standard`, `english`, `chinese`。詳細は [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md)、[Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md) を参照してください。

            - カスタムアナライザー

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    トークナイザータイプを定義します。指定可能な値: `standard` （デフォルト）、`whitespace`、`jieba`。詳細は [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md)、[Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md) を参照してください。

                - `filter` (*list*) -

                    トークナイザーによって生成されたトークンを絞り込むためのフィルターの一覧で、組み込みフィルターとカスタムフィルターのオプションがあります。詳細は [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) などを参照してください。

        - **multi_analyzer_params** (*object*) -

            テキスト処理のために複数のアナライザーを設定します。このパラメータの値は単一の JSON オブジェクトで、Milvus が各エンティティに対して適切なアナライザーをどのように選択するかを決定します。

            ```javascript
            const multi_analyzer_params = {
              // Define language-specific analyzers
              // Each analyzer follows this format: <analyzer_name>: <analyzer_params>
              "analyzers": {
                "english": {"type": "english"},          // English-optimized analyzer
                "chinese": {"type": "chinese"},          // Chinese-optimized analyzer
                "default": {"tokenizer": "icu"}          // Required fallback analyzer
              },
              "by_field": "language",                    // Field determining analyzer selection
              "alias": {
                "cn": "chinese",                         // Use "cn" as shorthand for Chinese
                "en": "english"                          // Use "en" as shorthand for English
              }
            }
            ```

    - **autoID** (*boolean)* -

        このコレクションへのデータ挿入時に、プライマリフィールドを自動的にインクリメントするかどうかです。

        デフォルト値は **False** です。これを **True** に設定すると、プライマリフィールドは自動的にインクリメントされます。カスタマイズしたスキーマでコレクションをセットアップする必要がある場合は、このパラメータを省略してください。

    - **nullable** (*boolean*) -

        このフィールドが null 値を受け入れられるかどうかを指定するブールパラメータです。有効な値は次のとおりです。

        - **true**: フィールドは null 値を含むことができ、フィールドが任意であり、エントリに欠損データが許可されることを示します。

        - **false** （デフォルト）: フィールドは各エンティティに対して有効な値を含まなければならず、欠損データは許可されないため、フィールドは必須になります。

        詳細は [Nullable & Default](https://milvus.io/docs/nullable-and-default.md) を参照してください。

    - **default_value** (*object*)

        コレクションスキーマの作成時に、特定のフィールドにデフォルト値を設定します。これは、データ挿入時に値が明示的に指定されていなくても、特定のフィールドに初期値を持たせたい場合に特に便利です。

- **functions** (*list*)

    データをベクトル埋め込みに変換します。この関数はコレクションのスキーマに追加されます。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよびコレクション内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的の簡潔な説明です。これは大規模プロジェクトでのドキュメント化や明確化に役立ち、デフォルトは空文字列です。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数のタイプです。指定可能な値:

        - `FunctionType.BM25`: `VARCHAR` フィールドからスパース埋め込みを生成するために BM25 アルゴリズムを使用します。

    - **input_field_names** (*string[]*)

        ベクトル表現への変換が必要な生データを含むフィールドの名前です。`FunctionType.BM25` を使用する関数では、このパラメータは 1 つのフィールド名のみを受け付けます。

    - **output_field_names** (*string[]*)

        生成された埋め込みが保存されるフィールドの名前です。これはコレクションスキーマで定義されたベクトルフィールドに対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメータは 1 つのフィールド名のみを受け付けます。

- **num_partitions** (*number)* -

    コレクションに作成するパーティション数です。

    <Admonition type="info" title="Note">

    パーティショニングとは何ですか？
    
        データパーティショニングは、特定の基準に基づいてデータを整理するために使用される手法です。データパーティショニングを使用すると、パーティションを個別に作成、ロード、解放、削除できるほか、それらの中で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*string*) -

    パーティションキーとして機能するフィールドの名前です。

    <Admonition type="info" title="Note">

    パーティションキーとは何ですか？
    
        パーティションキーは、キー値に基づいてエンティティを異なるパーティションに保存するために使用されます。言い換えると、パーティションキーは同じキーを持つエンティティをまとめ、キーフィールドでフィルタリングする際に無関係なパーティションのスキャンを回避できます。パーティションキーは、従来のフィルタリング方法と比較してクエリ性能を大幅に向上させることができます。

    </Admonition>

- **shards_num** (*number)* -

    このコレクションの作成とあわせて作成するシャードの数です。 

    デフォルト値は **1** で、このコレクションとともに 1 つのシャードが作成されることを示します。

    <Admonition type="info" title="Note">

    シャーディングとは何ですか？
    
        シャーディングとは、データ書き込みにおける Milvus クラスターの並列計算能力を最大限活用するために、書き込み操作を異なるノードに分散することを指します。
    
        デフォルトでは、1 つのコレクションは 1 つのシャードを含みます。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    コレクションの追加プロパティをキーと値のペアで指定します。指定可能な値は次のとおりです。

    - **コレクション.ttl.seconds** (*number*) -

        現在のコレクションの有効期限（TTL）を秒単位で指定します。

    - **mmap.enabled** (*boolean*) -

        コレクション全体で mmap を有効にするかどうかです。

    - **partitionkey.isolation** (*boolean*) -

        パーティションキーの分離を有効にするかどうかです。

    - **dynamicfield.enabled** (*boolean*) -

        動的フィールドを有効にするかどうかです。

    - **allow_insert_auto_id** (*boolean*) -

        autoID が有効なときにプライマリキーの挿入を許可するかどうかです。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが返るかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **external_source** (*string*) -

    外部ソースパスです。これは外部コレクションの作成に適用されます。

- **external_spec** (*string*) -

    外部スペック設定です。これは外部コレクションの作成に適用されます。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうかです。これは外部コレクションの作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは外部コレクションの作成に適用されます。

### With CreateCollectionWithSchemaAndIndexParamsReq\{#with-createcollectionwithschemaandindexparamsreq}

このリクエストボディを使用すると、コレクションのスキーマとインデックス設定をカスタマイズできます。作成時に、コレクションは自動的にロードされます。

```javascript
await milvusClient.createCollection({
   db_name?: string,
   collection_name: string,
   consistency_level: number | string,
   description: string,
   enable_dynamic_field: boolean,
   schema: [
     {
       name: string,
       description: "vector field",
       data_type: DataType.FloatVector,
       element_type?: DataType,
       is_primary_key?: boolean,
       is_partition_key?: boolean,
       is_function_output?: boolean,
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
       default_value: object
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

- **consistency_level** (*number* | *string*)

    対象コレクションの整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        ベクトル類似検索やクエリの実行時に、アプリケーションに最適となるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成するコレクションの説明です。

- **enable_dynamic_field** (*boolean)* -

    **&#36;meta** という名前の予約済み JSON フィールドを使用して、未定義のフィールドとその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、メタフィールドが使用されることを示します。

- **スキーマ** (*FieldType[]*) -

    - **name** (*string)* -

        フィールドの名前です。

    - **data_type** (*string)* -

        フィールドのデータ型です。使用可能なすべてのデータ型の一覧については、[DataType](./Collections-DataType) を参照してください。

    - **description** (*string)* -

        フィールドの説明です。

    - **is_partition_key** (*boolean)* -

        このフィールドをパーティションキーフィールドとして使用するかどうかを示す真偽値です。

    - **is_primary_key** (*boolean)* -

        このフィールドを主キーとして使用するかどうかです。

    - **is_function_output** (boolean) -

        このフィールドが関数の出力フィールドとして機能するかどうかです。

    - **type_params** (*string* | *number)* -

        フィールドのその他のパラメーターです。

        - **dim** (*string* | *number*) -

            ベクトル埋め込みを保持するコレクションフィールドの次元数です。 

            値は 1 より大きい整数である必要があり、通常はベクトル埋め込みの生成に使用するモデルによって決まります。

        - **element_type** (string) -

            配列内の要素のデータ型です。 

            このパラメーターは、現在のフィールドが配列フィールドの場合に適用されます。

        - **max_capacity** (*string* | *number)* -

            配列内の要素数です。

            このパラメーターは、現在のフィールドが配列フィールドの場合に適用されます。

        - **max_length** (*string*) -

            このフィールド内の文字列の最大長です。

            このフィールドの **data_type** が **VarChar** の場合に必須です。

        - **enable_analyzer** (*boolean*) -

            指定した `VarChar` フィールドに対してテキスト解析を有効にするかどうかです。`true` に設定すると、Milvus はテキストアナライザーを使用して、そのフィールドのテキスト内容をトークン化およびフィルタリングします。

        - **enable_match** (*boolean*)

            指定した `VarChar` フィールドに対してキーワードマッチングを有効にするかどうかです。`true` に設定すると、Milvus はそのフィールドに対して転置インデックスを作成し、高速かつ効率的なキーワード検索を可能にします。`enable_match` は `enable_analyzer` と連携して、構造化された用語ベースのテキスト検索を提供します。`enable_analyzer` がトークン化を処理し、`enable_match` がそれらのトークンに対する検索操作を処理します。

        - **analyzer_params** (*object*)

            テキスト処理用のアナライザーを設定します。特に `VarChar` フィールドに対して使用されます。このパラメーターはトークナイザーとフィルターの設定を構成し、とくに [keyword matching](https://milvus.io/docs/keyword-match.md) や [full text search](https://milvus.io/docs/full-text-search.md) で使用されるテキストフィールドに適用されます。アナライザーの種類に応じて、次のいずれかの方法で設定できます。

            - 組み込みアナライザー

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus に組み込まれた事前設定済みのアナライザータイプで、名前を指定するだけですぐに使用できます。指定可能な値: `standard`, `english`, `chinese`。詳細は [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md)、[Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md) を参照してください。

            - カスタムアナライザー

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    トークナイザーのタイプを定義します。指定可能な値: `standard` （デフォルト）、`whitespace`、`jieba`。詳細は [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md)、[Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md) を参照してください。

                - `filter` (*list*) -

                    トークナイザーによって生成されたトークンを絞り込むためのフィルターを一覧表示します。組み込みフィルターとカスタムフィルターを使用できます。詳細は [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) などを参照してください。

        - **multi_analyzer_params** (*object*) -

            テキスト処理用に複数のアナライザーを設定します。このパラメーターの値は単一の JSON オブジェクト で、Milvus が各エンティティに対して適切なアナライザーをどのように選択するかを決定します。

            ```javascript
            const multi_analyzer_params = {
              // Define language-specific analyzers
              // Each analyzer follows this format: <analyzer_name>: <analyzer_params>
              "analyzers": {
                "english": {"type": "english"},          // English-optimized analyzer
                "chinese": {"type": "chinese"},          // Chinese-optimized analyzer
                "default": {"tokenizer": "icu"}          // Required fallback analyzer
              },
              "by_field": "language",                    // Field determining analyzer selection
              "alias": {
                "cn": "chinese",                         // Use "cn" as shorthand for Chinese
                "en": "english"                          // Use "en" as shorthand for English
              }
            }
            ```

    - **autoID** (*boolean)* -

        このコレクションへのデータ挿入時に、プライマリフィールドを自動インクリメントするかどうかです。

        デフォルト値は **False** です。これを **True** に設定すると、プライマリフィールドは自動インクリメントされます。カスタマイズされたスキーマを持つコレクションを設定する必要がある場合は、このパラメーターをスキップしてください。

    - **nullable** (*boolean*) -

        フィールドが null 値を受け入れられるかどうかを指定するブール値のパラメーターです。有効な値は次のとおりです。

        - **true**: フィールドは null 値を含むことができます。これはフィールドがオプションであり、エントリに欠損データが許可されることを示します。

        - **false** （デフォルト）: フィールドは各エンティティに対して有効な値を含む必要があります。欠損データは許可されず、フィールドは必須になります。

        詳細は [Nullable & Default](https://milvus.io/docs/nullable-and-default.md) を参照してください。

    - **default_value** (*[DataType](./Collections-DataType)*)

        コレクションスキーマの作成時に、特定のフィールドにデフォルト値を設定します。これは、データ挿入時に明示的に値が指定されない場合でも、特定のフィールドに初期値を持たせたい場合に特に便利です。

- **functions** (*list*)

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

    <Admonition type="info" title="Note">

    パーティショニングとは何ですか？
    
        データパーティショニングは、特定の基準に基づいてデータを整理するための手法です。データパーティショニングを使用すると、パーティションを個別に作成、ロード、解放、削除できるほか、その中で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*boolean)* -

    パーティションキーを有効にするかどうかを示す真偽値です。

    <Admonition type="info" title="Note">

    パーティションキーとは何ですか？
    
        パーティションキーは、そのキー値に基づいてエンティティを異なるパーティションに格納するために使用されます。つまり、パーティションキーは同じキーを持つエンティティをまとめ、キーフィールドでフィルタリングする際には無関係なパーティションのスキャンを回避できます。パーティションキーは、従来のフィルタリング方法と比較してクエリ性能を大幅に向上させることができます。

    </Admonition>

- **shards_num** (*number)* -

    このコレクションの作成に合わせて作成するシャードの数です。 

    デフォルト値は **1** で、このコレクションとともに 1 つのシャードが作成されることを示します。

    <Admonition type="info" title="Note">

    シャーディングとは何ですか？
    
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

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうかです。これは外部コレクションの作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは外部コレクションの作成に適用されます。

**RETURNS** *Promise\<ResStatus>*

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

## 例\{#example}

```java
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

