---
title: "createCollection() | Node.js"
slug: /node/node/Collections-createCollection
sidebar_label: "createCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、デフォルト設定またはカスタマイズ設定で collection を作成します。 | Node.js"
type: docx
token: KPZZd2TiAodSeWxUdlJciHGcnbg
sidebar_position: 5
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
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

この操作は、デフォルト設定またはカスタマイズ設定で collection を作成します。 

```javascript
await milvusClient.createCollection(data)
```

## Request Syntax\{#request-syntax}

このメソッドには以下の代替形式があります。

### With CreateColReq\{#with-createcolreq}

このリクエストボディを使用すると、collection 名と vector field の次元を指定するだけで、簡単に collection を作成できます。

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

    対象の collection が属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成する collection の名前です。

- **dimension** (*number*) -

    vector embeddings の次元数です。値は 1 より大きい整数である必要があります。collection schema をカスタマイズする必要がある場合は、これを省略してください。

- **auto_id** (*boolean*) - 

    この collection へのデータ挿入時に、primary field を自動的にインクリメントするかどうかです。

    デフォルト値は **False** です。これを **True** に設定すると、primary field は自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータに primary field を含めてはいけません。自動生成される ID は固定長であり、変更できません。

    このパラメータは collection をすばやくセットアップするためのもので、**schema** が **None** でない場合は無視されます。

- **consistency_level** (*number* | *string*)

    対象 collection の整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** のいずれかを指定できます。

    <Admonition type="info" icon="📘" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータの見え方を持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        vector 類似検索またはクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成する collection の説明です。

- **enable_dynamic_field** (*boolean)* -

    予約済み JSON field **&#36;meta** を使用して、未定義の field とその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、meta field が使用されることを示します。

- **id_type** (*Int64* | *VarChar*) -

    primary field のデータ型です。

- **index_params** (*CreatIndexParam*) -

    作成する collection の index パラメータです。

- **metric_type** (*string*) -

    metric type は、vector embeddings 間の類似性をどのように測定するかを決定します。

- **primary_field_name** (*string*) -

    primary field のカスタム名です。

- **vector_field_name** (*string*) -

    vector field のカスタム名です。

- **timeout** (number) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが返るかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **external_source** (*string*) -

    外部ソースパスです。これは external collection の作成に適用されます。

- **external_spec** (*string*) -

    external spec 設定です。これは external collection の作成に適用されます。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうかです。これは external collection の作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは external collection の作成に適用されます。

### With CreateCollectionReq\{#with-createcollectionreq}

このリクエストボディを使用すると、collection の schema 設定をカスタマイズできます。

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

    対象の collection が属するデータベースの名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成する collection の名前です。

- **consistency_level** (*number* | *string*)

    対象 collection の整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** のいずれかを指定できます。

    <Admonition type="info" icon="📘" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータの見え方を持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        vector 類似検索またはクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成する collection の説明です。

- **enable_dynamic_field** (*boolean)* -

    予約済み JSON field **&#36;meta** を使用して、未定義の field とその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、meta field が使用されることを示します。

- **schema** (*FieldType[]*) -

    - **name** (*string)* -

        field の名前です。

    - **data_type** (*string)* -

        field のデータ型です。使用可能なすべてのデータ型の一覧については、[DataType](./Collections-DataType) を参照してください。

    - **description** (*string)* -

        field の説明です。

    - **is_partition_key** (*boolean)* -

        この field が partition key field として機能するかどうかを示すブール値です。

    - **is_primary_key** (*boolean)* -

        この field が primary key として機能するかどうかです。

        デフォルト値は **False** です。これを **True** に設定すると、この field は collection 全体で一意の primary key field になります。

    - **is_function_output** (boolean) -

        この field が関数の出力 field として機能するかどうかです。

    - **type_params** (*string* | *number)* -

        field のその他のパラメータです。

        - **dim** (*string* | *number*) -

            vector embeddings を保持する collection field の次元数です。 

            値は 1 より大きい整数である必要があり、通常は vector embeddings の生成に使用するモデルによって決まります。

        - **element_type** (string) -

            配列内の要素のデータ型です。 

            このパラメータは、現在の field が array field の場合に適用されます。

        - **max_capacity** (*string* | *number)* -

            配列内の要素数です。

            このパラメータは、現在の field が array field の場合に適用されます。

        - **max_length** (*string*) -

            この field 内の文字列の最大長です。

            この field の **data_type** が **VarChar** の場合は必須です。

        - **enable_analyzer** (*boolean*) -

            指定された `VarChar` field に対してテキスト解析を有効にするかどうかです。`true` に設定すると、Milvus にテキストアナライザーの使用を指示し、field のテキスト内容をトークン化およびフィルタリングします。

        - **enable_match** (*boolean*)

            指定された `VarChar` field に対してキーワードマッチングを有効にするかどうかです。`true` に設定すると、Milvus はその field に inverted index を作成し、高速かつ効率的なキーワード検索を可能にします。`enable_match` は `enable_analyzer` と連携して動作し、`enable_analyzer` がトークン化を担当し、`enable_match` がそれらのトークンに対する検索操作を担当することで、構造化された用語ベースのテキスト検索を提供します。

        - **analyzer_params** (*object*)

            テキスト処理用の analyzer を設定します。特に `VarChar` fields を対象とします。このパラメータは、主に [keyword matching](https://milvus.io/docs/keyword-match.md) または [full text search](https://milvus.io/docs/full-text-search.md) に使用されるテキスト field の tokenizer と filter の設定を構成します。analyzer の種類に応じて、次のいずれかの方法で設定できます。

            - Built-in analyzer

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus に組み込まれた事前設定済み analyzer type です。名前を指定するだけですぐに使用できます。指定可能な値: `standard`, `english`, `chinese`。詳細は [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md)、[Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md) を参照してください。

            - Custom analyzer

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    tokenizer type を定義します。指定可能な値: `standard` (デフォルト)、`whitespace`、`jieba`。詳細は [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md)、[Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md) を参照してください。

                - `filter` (*list*) -

                    tokenizer によって生成されたトークンを絞り込むための filter の一覧で、組み込み filter とカスタム filter のオプションがあります。詳細は [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) などを参照してください。

        - **multi_analyzer_params** (*object*) -

            テキスト処理のために複数の analyzer を設定します。このパラメータの値は単一の JSON オブジェクトで、Milvus が各エンティティに対して適切な analyzer をどのように選択するかを決定します。

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

        この collection へのデータ挿入時に、primary field を自動的にインクリメントするかどうかです。

        デフォルト値は **False** です。これを **True** に設定すると、primary field は自動的にインクリメントされます。カスタマイズした schema で collection をセットアップする必要がある場合は、このパラメータを省略してください。

    - **nullable** (*boolean*) -

        この field が null 値を受け入れられるかどうかを指定するブールパラメータです。有効な値は次のとおりです。

        - **true**: field は null 値を含むことができ、field が任意であり、エントリに欠損データが許可されることを示します。

        - **false** (デフォルト): field は各エンティティに対して有効な値を含まなければならず、欠損データは許可されないため、field は必須になります。

        詳細は [Nullable & Default](https://milvus.io/docs/nullable-and-default.md) を参照してください。

    - **default_value** (*object*)

        collection schema の作成時に、特定の field にデフォルト値を設定します。これは、データ挿入時に値が明示的に指定されていなくても、特定の field に初期値を持たせたい場合に特に便利です。

- **functions** (*list*)

    データを vector embeddings に変換します。この関数は collection の schema に追加されます。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよび collection 内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的の簡潔な説明です。これは大規模プロジェクトでのドキュメント化や明確化に役立ち、デフォルトは空文字列です。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数のタイプです。指定可能な値:

        - `FunctionType.BM25`: `VARCHAR` field から sparse embeddings を生成するために BM25 アルゴリズムを使用します。

    - **input_field_names** (*string[]*)

        vector 表現への変換が必要な生データを含む field の名前です。`FunctionType.BM25` を使用する関数では、このパラメータは 1 つの field 名のみを受け付けます。

    - **output_field_names** (*string[]*)

        生成された embeddings が保存される field の名前です。これは collection schema で定義された vector field に対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメータは 1 つの field 名のみを受け付けます。

- **num_partitions** (*number)* -

    collection に作成する partition 数です。

    <Admonition type="info" icon="📘" title="Note">

    partitioning とは何ですか？
    
        データ partitioning は、特定の基準に基づいてデータを整理するために使用される手法です。データ partitioning を使用すると、partitions を個別に作成、ロード、解放、削除できるほか、それらの中で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*string*) -

    partition key として機能する field の名前です。

    <Admonition type="info" icon="📘" title="Note">

    partition key とは何ですか？
    
        partition key は、キー値に基づいてエンティティを異なる partitions に保存するために使用されます。言い換えると、partition key は同じキーを持つエンティティをまとめ、キー field でフィルタリングする際に無関係な partitions のスキャンを回避できます。partition keys は、従来のフィルタリング方法と比較してクエリ性能を大幅に向上させることができます。

    </Admonition>

- **shards_num** (*number)* -

    この collection の作成とあわせて作成する shards の数です。 

    デフォルト値は **1** で、この collection とともに 1 つの shard が作成されることを示します。

    <Admonition type="info" icon="📘" title="Note">

    sharding とは何ですか？
    
        sharding とは、データ書き込みにおける Milvus cluster の並列計算能力を最大限活用するために、書き込み操作を異なるノードに分散することを指します。
    
        デフォルトでは、1 つの collection は 1 つの shard を含みます。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    collection の追加プロパティをキーと値のペアで指定します。指定可能な値は次のとおりです。

    - **collection.ttl.seconds** (*number*) -

        現在の collection の有効期限（TTL）を秒単位で指定します。

    - **mmap.enabled** (*boolean*) -

        collection 全体で mmap を有効にするかどうかです。

    - **partitionkey.isolation** (*boolean*) -

        partition key の分離を有効にするかどうかです。

    - **dynamicfield.enabled** (*boolean*) -

        dynamic field を有効にするかどうかです。

    - **allow_insert_auto_id** (*boolean*) -

        autoID が有効なときに primary key の挿入を許可するかどうかです。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが返るかエラーが発生した時点でこの操作がタイムアウトすることを示します。

- **external_source** (*string*) -

    外部ソースパスです。これは external collection の作成に適用されます。

- **external_spec** (*string*) -

    external spec 設定です。これは external collection の作成に適用されます。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうかです。これは external collection の作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは external collection の作成に適用されます。

### With CreateCollectionWithSchemaAndIndexParamsReq\{#with-createcollectionwithschemaandindexparamsreq}

このリクエストボディを使用すると、collection の schema と index 設定をカスタマイズできます。作成時に、collection は自動的にロードされます。

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

    対象 collection が属する database の名前です。

- **collection_name** (*string*) -

    **[REQUIRED]**

    作成する collection の名前です。

- **consistency_level** (*number* | *string*)

    対象 collection の整合性レベルです。

    デフォルト値は **Bounded** で、**Strong**、**Bounded**、**Session**、**Eventually**、**Customized** を指定できます。

    <Admonition type="info" icon="📘" title="Note">

    整合性レベルとは何ですか？
    
        分散データベースにおける整合性とは、特定の時点でデータの書き込みまたは読み取りを行う際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する性質を指します。
    
        Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
    
        ベクトル類似検索やクエリの実行時に、アプリケーションに最適となるよう整合性レベルを簡単に調整できます。

    </Admonition>

- **description** (*string)* -

    作成する collection の説明です。

- **enable_dynamic_field** (*boolean)* -

    **&#36;meta** という名前の予約済み JSON field を使用して、未定義の field とその値をキーと値のペアで保存するかどうかです。

    デフォルト値は **True** で、meta field が使用されることを示します。

- **schema** (*FieldType[]*) -

    - **name** (*string)* -

        field の名前です。

    - **data_type** (*string)* -

        field のデータ型です。使用可能なすべてのデータ型の一覧については、[DataType](./Collections-DataType) を参照してください。

    - **description** (*string)* -

        field の説明です。

    - **is_partition_key** (*boolean)* -

        この field を partition key field として使用するかどうかを示す真偽値です。

    - **is_primary_key** (*boolean)* -

        この field を主キーとして使用するかどうかです。

    - **is_function_output** (boolean) -

        この field が関数の出力 field として機能するかどうかです。

    - **type_params** (*string* | *number)* -

        field のその他のパラメーターです。

        - **dim** (*string* | *number*) -

            ベクトル埋め込みを保持する collection field の次元数です。 

            値は 1 より大きい整数である必要があり、通常はベクトル埋め込みの生成に使用するモデルによって決まります。

        - **element_type** (string) -

            配列内の要素のデータ型です。 

            このパラメーターは、現在の field が配列 field の場合に適用されます。

        - **max_capacity** (*string* | *number)* -

            配列内の要素数です。

            このパラメーターは、現在の field が配列 field の場合に適用されます。

        - **max_length** (*string*) -

            この field 内の文字列の最大長です。

            この field の **data_type** が **VarChar** の場合に必須です。

        - **enable_analyzer** (*boolean*) -

            指定した `VarChar` field に対してテキスト解析を有効にするかどうかです。`true` に設定すると、Milvus はテキスト analyzer を使用して、その field のテキスト内容をトークン化およびフィルタリングします。

        - **enable_match** (*boolean*)

            指定した `VarChar` field に対してキーワードマッチングを有効にするかどうかです。`true` に設定すると、Milvus はその field に対して inverted index を作成し、高速かつ効率的なキーワード検索を可能にします。`enable_match` は `enable_analyzer` と連携して、構造化された用語ベースのテキスト検索を提供します。`enable_analyzer` がトークン化を処理し、`enable_match` がそれらのトークンに対する検索操作を処理します。

        - **analyzer_params** (*object*)

            テキスト処理用の analyzer を設定します。特に `VarChar` fields に対して使用されます。このパラメーターは tokenizer と filter の設定を構成し、とくに [keyword matching](https://milvus.io/docs/keyword-match.md) や [full text search](https://milvus.io/docs/full-text-search.md) で使用されるテキスト field に適用されます。analyzer の種類に応じて、次のいずれかの方法で設定できます。

            - 組み込み analyzer

                ```javascript
                const analyzer_params: { type: 'english' };
                ```

                - `type` (*string*) -

                    Milvus に組み込まれた事前設定済みの analyzer タイプで、名前を指定するだけですぐに使用できます。指定可能な値: `standard`, `english`, `chinese`。詳細は [Standard Analyzer](https://milvus.io/docs/standard-analyzer.md)、[English Analyzer](https://milvus.io/docs/english-analyzer.md)、[Chinese Analyzer](https://milvus.io/docs/chinese-analyzer.md) を参照してください。

            - カスタム analyzer

                ```javascript
                const analyzer_params: {
                    "tokenizer": "standard",
                    "filter": ["lowercase"],
                };
                ```

                - `tokenizer` (*string*) -

                    tokenizer のタイプを定義します。指定可能な値: `standard` (デフォルト)、`whitespace`、`jieba`。詳細は [Standard Tokenizer](https://milvus.io/docs/standard-tokenizer.md)、[Whitespace Tokenizer](https://milvus.io/docs/whitespace-tokenizer.md)、[Jieba Tokenizer](https://milvus.io/docs/jieba-tokenizer.md) を参照してください。

                - `filter` (*list*) -

                    tokenizer によって生成されたトークンを絞り込むための filters を一覧表示します。組み込み filter とカスタム filter を使用できます。詳細は [Alphanumonly Filter](https://milvus.io/docs/alphanumonly-filer.md) などを参照してください。

        - **multi_analyzer_params** (*object*) -

            テキスト処理用に複数の analyzer を設定します。このパラメーターの値は単一の JSON object で、Milvus が各 entity に対して適切な analyzer をどのように選択するかを決定します。

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

        この collection へのデータ挿入時に、primary field を自動インクリメントするかどうかです。

        デフォルト値は **False** です。これを **True** に設定すると、primary field は自動インクリメントされます。カスタマイズされた schema を持つ collection を設定する必要がある場合は、このパラメーターをスキップしてください。

    - **nullable** (*boolean*) -

        field が null 値を受け入れられるかどうかを指定する Boolean パラメーターです。有効な値は次のとおりです。

        - **true**: field は null 値を含むことができます。これは field がオプションであり、エントリに欠損データが許可されることを示します。

        - **false** (デフォルト): field は各 entity に対して有効な値を含む必要があります。欠損データは許可されず、field は必須になります。

        詳細は [Nullable & Default](https://milvus.io/docs/nullable-and-default.md) を参照してください。

    - **default_value** (*[DataType](./Collections-DataType)*)

        collection schema の作成時に、特定の field にデフォルト値を設定します。これは、データ挿入時に明示的に値が指定されない場合でも、特定の field に初期値を持たせたい場合に特に便利です。

- **functions** (*list*)

    データをベクトル埋め込みに変換します。この関数は collection の schema に追加されます。

    - **name** (*string*)

        関数の名前です。この識別子は、クエリおよび collection 内で関数を参照するために使用されます。

    - **description** (*string*)

        関数の目的を簡潔に説明したものです。これはドキュメント化や大規模プロジェクトでの明確化に役立ち、デフォルトでは空文字列です。

    - **type** (*[FunctionType](./Collections-FunctionType)*)

        生データを処理する関数の種類です。指定可能な値:

        - `FunctionType.BM25`: `VARCHAR` field から sparse embeddings を生成するために BM25 アルゴリズムを使用します。

    - **input_field_names** (*string[]*)

        ベクトル表現への変換が必要な生データを含む field の名前です。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つの field 名のみを受け入れます。

    - **output_field_names** (*string[]*)

        生成された埋め込みが保存される field の名前です。これは collection schema で定義された vector field に対応している必要があります。`FunctionType.BM25` を使用する関数では、このパラメーターは 1 つの field 名のみを受け入れます。

- **num_partitions** (*number)* -

    collection に作成する partitions の数です。

    <Admonition type="info" icon="📘" title="Note">

    partitioning とは何ですか？
    
        データ partitioning は、特定の基準に基づいてデータを整理するための手法です。データ partitioning を使用すると、partitions を個別に作成、ロード、解放、削除できるほか、その中で検索やクエリを実行できます。

    </Admonition>

- **partition_key_field** (*boolean)* -

    partition key を有効にするかどうかを示す真偽値です。

    <Admonition type="info" icon="📘" title="Note">

    partition key とは何ですか？
    
        partition key は、その key 値に基づいて entities を異なる partitions に格納するために使用されます。つまり、partition key は同じ key を持つ entities をまとめ、key field でフィルタリングする際には無関係な partitions のスキャンを回避できます。partition keys は、従来のフィルタリング方法と比較してクエリ性能を大幅に向上させることができます。

    </Admonition>

- **shards_num** (*number)* -

    この collection の作成と同時に作成する shards の数です。 

    デフォルト値は **1** で、この collection とともに 1 つの shard が作成されることを示します。

    <Admonition type="info" icon="📘" title="Note">

    sharding とは何ですか？
    
        sharding とは、データ書き込みのために Milvus cluster の並列計算能力を最大限に活用できるよう、書き込み操作を異なるノードに分散することを指します。
    
        デフォルトでは、collection には 1 つの shard が含まれます。

    </Admonition>

- **properties** (Record&lt;string, string | number | boolean&gt;) 

    collection の追加プロパティをキーと値のペアで指定します。指定可能な値は次のとおりです。

    - **collection.ttl.seconds** (*number*) -

        現在の collection の有効期限（秒）です。

    - **mmap.enabled** (*boolean*) -

        collection 全体で mmap を有効にするかどうかです。

    - **partitionkey.isolation** (*boolean*) -

        partition key isolation を有効にするかどうかです。

    - **dynamicfield.enabled** (*boolean*) -

        dynamic field を有効にするかどうかです。

    - **allow_insert_auto_id** (*boolean*) -

        autoID が有効な場合に primary key の挿入を許可するかどうかです。

- **index_params** (*CreateIndexSimpleReq[]* | *CreateIndexSimpleReq*)

    index パラメーターです。

    - **field_name** (*string*) -

        index を作成する field の名前です。

    - **index_name** (*string*) -

        生成する index ファイルの名前です。

    - **index_type** (*string*) -

        使用する index アルゴリズムの種類です。

    - **metric_type** (*string*) -

        ベクトル埋め込み間の類似度を測定するために使用される metric タイプです。

    - **params** (*KeyValueObj*) -

        index 関連の追加パラメーターをキーと値のペアで指定します。

- **timeout** (*number*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

- **external_source** (*string*) -

    外部ソースのパスです。これは external collections の作成に適用されます。

- **external_spec** (*string*) -

    外部 spec の設定です。これは external collections の作成に適用されます。

- **do_physical_backfill** (*boolean*) -

    外部データを物理的にバックフィルするかどうかです。これは external collections の作成に適用されます。

- **file_resource_ids** (*Array&lt;number | string&gt;*) -

    外部ファイルリソース ID です。これは external collections の作成に適用されます。

**RETURNS** *Promise\<ResStatus>*

このメソッドは **ResStatus** object に解決される promise を返します。

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

## Example\{#example}

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

