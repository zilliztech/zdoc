---
title: "create_collection() | Python | MilvusClient"
slug: /python/python/Collections-create_collection
sidebar_label: "create_collection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、クイックセットアップまたはカスタムセットアップという 2 つの異なる方法でコレクションを作成することをサポートします。 | Python | MilvusClient"
type: docx
token: NbYidGUPcokra9xJ6IAcUNLEn9f
sidebar_position: 5
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - create_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_collection()

この操作は、クイックセットアップまたはカスタムセットアップという 2 つの異なる方法でコレクションを作成することをサポートします。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターとオンデマンドコンピュートに適用されます。

- serving クラスター内のコレクションの場合は、クラスターエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内のコレクションの場合は、プロジェクトエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
create_collection(
    collection_name: str,
    dimension: int,
    primary_field_name: str = "id",
    id_type: str = DataType,
    vector_field_name: str = "vector",
    metric_type: str = "COSINE",
    auto_id: bool = False,
    timeout: Optional[float] = None,
    schema: Optional[CollectionSchema] = None, # Used for custom setup
    index_params: Optional[IndexParams] = None, # Used for custom setup
    **kwargs,
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    作成するコレクションの名前です。

- **dimension** (*int*) -

    ベクトル埋め込みを保持するコレクションフィールドの次元数です。

    この値は通常、ベクトル埋め込みの生成に使用するモデルによって決まり、1 より大きい整数である必要があります。

    このパラメーターはコレクションのクイックセットアップ用に設計されており、**スキーマ**が **None** ではなく、スキーマ内のフィールドの **dim** が正の整数に設定されている場合は無視されます。

- **primary_field_name** (*str*) -

    このコレクションのプライマリフィールドの名前です。

    デフォルト値は **id** です。適切と思われる別の名前を使用できます。カスタマイズしたスキーマでコレクションをセットアップする必要がある場合は、このパラメーターを省略してください。

    このパラメーターはコレクションのクイックセットアップ用に設計されており、**スキーマ**が **None** ではなく、スキーマ内のフィールドの **is_primary** が **True** に設定されている場合は無視されます。

- **id_type** (*[DataType](./Collections-DataType)*) -

    このコレクションのプライマリフィールドのデータ型です。

    デフォルト値は **DataType.INT64** です。指定可能な値は **DataType.INT64** と **DataType.VARCHAR** です。 

    このパラメーターはコレクションのクイックセットアップ用に設計されており、**スキーマ**が **None** ではない場合は無視されます。

- **vector_field_name** (*str*) -

    ベクトル埋め込みを保持するコレクションフィールドの名前です。

    デフォルト値は **ベクトル** です。適切と思われる別の名前を使用できます。

    このパラメーターはコレクションのクイックセットアップ用に設計されており、**スキーマ**が **None** ではない場合は無視されます。

- **metric_type** (*str*) -

    このコレクションがベクトル埋め込み間の類似度を測定するために使用するアルゴリズムです。

    デフォルト値は **COSINE** です。指定可能な値は **L2**、**IP**、**COSINE** です。これらのメトリックタイプの詳細については、[Similarity Metrics Explained](/docs/search-metrics-explained) を参照してください。

    このパラメーターはコレクションのクイックセットアップ用に設計されており、**スキーマ**が **None** ではない場合は無視されます。

- **auto_id** (*bool*) -

    このコレクションにデータを挿入したときにプライマリフィールドが自動的に増分されるかどうかを指定します。

    デフォルト値は **False** です。これを **True** に設定すると、プライマリフィールドが自動的に増分されます。この場合、エラーを避けるために、挿入するデータにプライマリフィールドを含めないようにしてください。自動生成される ID は固定長であり、変更できません。

    このパラメーターはコレクションのクイックセットアップ用に設計されており、**スキーマ**が **None** ではない場合は無視されます。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかの応答が返るかエラーが発生した時点で、この操作はタイムアウトします。

- **スキーマ** (*[CollectionSchema](./MilvusClient-CollectionSchema)* | *None*)

    このコレクションのスキーマです。

    これを **None** に設定すると、このコレクションはクイックセットアップ方式で作成されます。

    カスタマイズしたスキーマでコレクションをセットアップするには、**[CollectionSchema](./MilvusClient-CollectionSchema)** オブジェクトを作成し、ここで参照する必要があります。この場合、Zilliz Cloud はリクエストに含まれる他のすべてのスキーマ関連設定を無視します。

- **index_params** (*IndexParams* | *None*)

    このコレクションのベクトルフィールドにインデックスを構築するためのパラメーターです。カスタマイズしたスキーマでコレクションをセットアップし、そのコレクションを自動的にメモリにロードするには、**IndexParams** オブジェクトを作成し、ここで参照する必要があります。

    少なくとも、このコレクションのベクトルフィールドに対するインデックスを追加する必要があります。後でインデックスパラメーターを設定する場合は、このパラメーターを省略することもできます。

- **kwargs** -

    - **enable_dynamic_field** (*bool*) -

        **&#36;meta** という名前の予約済み JSON フィールドを使用して、未定義のフィールドとその値をキーと値のペアとして保存するかどうかを指定します。

        デフォルト値は **True** で、**&#36;meta** フィールドが使用されることを示します。

        **スキーマ**が **None** ではない場合、このパラメーターは無視されます。

    - **num_shards** (*int*) -

        このコレクションの作成と同時に作成するシャードの数です。

        デフォルト値は **1** で、このコレクションとともに 1 つのシャードが作成されることを示します。

        <Admonition type="info" title="Note">

        シャーディングとは何ですか？
        
                シャーディングとは、書き込み操作を異なるノードに分散させ、データの書き込みにおいて Milvus クラスターの並列コンピューティング能力を最大限に活用することを指します。
        
                デフォルトでは、1 つのコレクションに 1 つのシャードが含まれます。

        </Admonition>

    - **partition_key_field** (*str*) -

        パーティションキーとして機能するフィールドの名前です。各コレクションに設定できるパーティションキーは 1 つだけです。

        **スキーマ**が **None** ではなく、スキーマ内のフィールドの **is_parition_key** が **True** に設定されている場合、このパラメーターは無視されます。

        <Admonition type="info" title="Note">

        パーティションキーとは何ですか？
        
                パーティション指向のマルチテナンシーを容易にするために、フィールドをパーティションキーフィールドとして設定すると、Zilliz Cloud はそのフィールドの値をハッシュ化し、指定された数のパーティションに応じてエンティティを分散します。
        
                エンティティを取得する際は、特定のフィールド値のエンティティを絞り込むために、ブール式でパーティションキーフィールドを使用するようにしてください。
        
                詳細については、[Use Partition Key](/docs/use-partition-key) と [Multi-tenancy](https://milvus.io/docs/multi_tenancy.md) を参照してください。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        パーティションキーに対するスカラーフィルタリングにおける検索パフォーマンスをさらに向上させるために、パーティションキー分離を有効にするかどうかを指定します。詳細については、[Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation) を参照してください。

    - **num_partitions** (*int*) -

        パーティションキー機能用に作成するパーティションの数です。

        デフォルト値は **64** で、このコレクションとともに 64 個のパーティションが作成されることを示します。このパラメーターは、**partition_key_field** にフィールド名を設定した場合に適用されます。

    - **consistency_level** (*int* | *str*)

        対象のコレクションの整合性レベルです。

        デフォルト値は **Bounded**（**2**）で、**Strong**（**0**）、**Session**（**1**）、**Bounded**（**2**）、**Eventually**（**3**）から選択できます。

        <Admonition type="info" title="Note">

        整合性レベルとは何ですか？
        
                分散データベースにおける整合性とは、特定の時点でデータを書き込んだり読み取ったりする際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
        
                Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
        
                ベクトル類似検索やクエリを実行する際に、アプリケーションに最適になるように整合性レベルを簡単に調整できます。

        </Admonition>

    - **properties** (*dict*) -

        キーと値のペアによる追加プロパティです。

        - **コレクション.ttl.seconds** (*int*)

            コレクションレベルの time-to-live（TTL）を秒単位で指定します。

        - **ttl_field** (*str*)

            エンティティレベルの TTL 期限切れの論理タイムスタンプとして使用する `TIMESTAMPTZ` フィールドの名前です。

        - **mmap.enabled** (*bool*) -

            コレクション内のすべてのフィールドの生データとインデックスに対して mmap を有効にするかどうかを指定します。

        - **partitionkey.isolation** (bool) -

            パーティションキー分離を有効にするかどうかを指定します。詳細については、[Use Partition Key](/docs/use-partition-key) を参照してください。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **PrimaryKeyException**

    プライマリフィールドのデータ型が整数または文字列でない場合に、この例外が発生します。

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#examples}

### Milvus クライアントをセットアップする\{#set-up-a-milvus-client}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)
```

### コレクションを作成する\{#create-a-collection}

以下のように、クイックセットアップまたはカスタマイズしたセットアップを選択できます。

- **クイックセットアップ**

    クイックセットアップのコレクションには、プライマリフィールドとベクトルフィールドという 2 つの必須フィールドがあります。また、動的フィールドに、未定義のフィールドとその値をキーと値のペアとして挿入することもできます。

    ```python
    client.create_collection(
        collection_name="test_collection", 
        dimension=5
    )
    ```

    上記のセットアップでは、 

    - プライマリフィールドとベクトルフィールドは、デフォルト名（**id** と **ベクトル**）を使用します。

    - メトリックタイプもデフォルト値（**COSINE**）に設定されます。

    - プライマリフィールドは整数を受け入れ、自動増分されません。

    - **&#36;meta** という予約済み JSON フィールドは、スキーマで定義されていないフィールドとその値を保存するために使用されます。

    プライマリフィールドとベクトルフィールドの名前を変更したり、メトリックタイプを変更したりできます。さらに、プライマリフィールドを自動増分に設定することもできます。

    ```python
    client.create_collection(
        collection_name="quick_setup",
        dimension=5,
        primary_field_name="my_id",
        id_type="string",
        vector_field_name="my_vector",
        metric_type="L2",
        auto_id=True,
        max_length=512
    )
    ```

    上記のコードでは、コレクションが作成され、インデックスが作成され、メモリにロードされます。

- **インデックスパラメーターを使用したカスタマイズセットアップ**

    カスタマイズしたセットアップでは、事前にスキーマとインデックスパラメーターを作成します。

    ```python
    from pymilvus import MilvusClient, DataType
    
    # 1. Create schema
    schema = MilvusClient.create_schema(
        auto_id=False,
        enable_dynamic_field=False,
    )
    
    # 2. Add fields to schema
    schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
    schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)
    
    # 3. Prepare index parameters
    index_params = client.prepare_index_params()
    
    # 4. Add indexes
    index_params.add_index(
        field_name="my_id",
        index_type="STL_SORT"
    )
    
    index_params.add_index(
        field_name="my_vector", 
        index_type="AUTOINDEX",
        metric_type="L2",
        params={"nlist": 1024}
    )
    
    # 5. Create a collection
    client.create_collection(
        collection_name="customized_setup",
        schema=schema,
        index_params=index_params
    )
    ```

    上記のコードでは、コレクションが作成され、インデックスが作成され、メモリにロードされます。

- **インデックスパラメーターを使用しないカスタマイズセットアップ**

    ```python
    from pymilvus import MilvusClient, DataType
    
    # 1. Create schema
    schema = MilvusClient.create_schema(
        auto_id=False,
        enable_dynamic_field=False,
    )
    
    # 2. Add fields to schema
    schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
    schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)
    
    # 3. Create a collection
    client.create_collection(
        collection_name="customized_setup",
        schema=schema
    )
    ```

    上記のコードでもコレクションは作成されます。ただし、`index_param` がないため、コレクション内のデータにはインデックスが作成されず、メモリにもロードされません。

- **外部コレクションを作成する**

    ```python
    from pymilvus import MilvusClient, DataType
    
    # connect the database
    client = MilvusClient(
        uri="https://{project-id}.{region}.api.zillizcloud.com",
        token="YOUR_API_KEY"
    )
    
    schema = MilvusClient.create_schema(
        external_source='volume://my_volume/path/to/a/folder/',
        external_spec='{"format": "parquet"}'
    )
    
    schema.add_field(
        field_name="product_id",
        datatype=DataType.INT64,
        # highlight-next
        external_field="id" # field name in the external data file
    )
    schema.add_field(
        field_name="product_name",
        datatype=DataType.VARCHAR,
        max_length=512,
        # highlight-next
        external_field="name"
    )
    schema.add_field(
        field_name="embedding",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        # highlight-next
        external_field="vector"
    )
    
    client.use_database(
        db_name="my_database"
    )
    # create the collection
    client.create_collection(
        collection_name="test_collection",
        schema=schema
    )
    
    index_params = client.prepare_index_params()
    # Add indexes
    index_params.add_index(
        field_name="embedding",
        index_type="AUTOINDEX",
        metric_type="COSINE"
    )
    index_params.add_index(
        field_name="product_name",
        index_type="AUTOINDEX"
    )
    client.create_index(
        db_name="my_database",
        collection_name="test_collection",
        index_params=index_params
    )
    
    job_id = client.refresh_external_collection(
        db_name="my_database",
        collection_name="test_collection"
    )
    while True:
        progress = client.get_refresh_external_collection_progress(job_id=job_id)
        print(f"  {progress.state}: {progress.progress}%")
        if progress.state == "RefreshCompleted":
            elapsed = progress.end_time - progress.start_time
            print(f"  Completed in {elapsed}ms")
            break
        elif progress.state == "RefreshFailed":
            print(f"  Failed: {progress.reason}")
            break
        time.sleep(2)
    ```
