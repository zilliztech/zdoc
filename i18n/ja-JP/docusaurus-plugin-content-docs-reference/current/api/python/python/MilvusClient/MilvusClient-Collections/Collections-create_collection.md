---
title: "create_collection() | Python | MilvusClient"
slug: /python/python/Collections-create_collection
sidebar_label: "create_collection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、クイックセットアップまたはカスタムセットアップという2つの異なる方法で collection を作成することをサポートします。 | Python | MilvusClient"
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

この操作は、クイックセットアップまたはカスタムセットアップという2つの異なる方法で collection を作成することをサポートします。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、専用の serving cluster とオンデマンドコンピュートに適用されます。 

- serving cluster 内の collection の場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内の collection の場合は、project endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request syntax\{#request-syntax}

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    作成する collection の名前です。

- **dimension** (*int*) -

    vector embedding を格納する collection field の次元数です。

    この値は通常、vector embedding の生成に使用するモデルによって決まり、1 より大きい整数である必要があります。

    このパラメータは collection のクイックセットアップ用に設計されており、**schema** が **None** ではなく、schema 内の field の **dim** が正の整数に設定されている場合は無視されます。

- **primary_field_name** (*str*) -

    この collection の primary field の名前です。

    デフォルト値は **id** です。適切と思われる別の名前を使用できます。カスタマイズされた schema で collection をセットアップする必要がある場合は、このパラメータを省略してください。

    このパラメータは collection のクイックセットアップ用に設計されており、**schema** が **None** ではなく、schema 内の field の **is_primary** が **True** に設定されている場合は無視されます。

- **id_type** (*[DataType](./Collections-DataType)*) -

    この collection の primary field のデータ型です。

    デフォルト値は **DataType.INT64** です。指定可能な値は **DataType.INT64** と **DataType.VARCHAR** です。 

    このパラメータは collection のクイックセットアップ用に設計されており、**schema** が **None** ではない場合は無視されます。

- **vector_field_name** (*str*) -

    vector embedding を格納する collection field の名前です。

    デフォルト値は **vector** です。適切と思われる別の名前を使用できます。 

    このパラメータは collection のクイックセットアップ用に設計されており、**schema** が **None** ではない場合は無視されます。

- **metric_type** (*str*) -

    この collection が vector embedding 間の類似度を測定するために使用するアルゴリズムです。

    デフォルト値は **COSINE** です。指定可能な値は **L2**、**IP**、**COSINE** です。これらの metric type の詳細については、[Similarity Metrics Explained](/docs/search-metrics-explained) を参照してください。

    このパラメータは collection のクイックセットアップ用に設計されており、**schema** が **None** ではない場合は無視されます。

- **auto_id** (*bool*) -

    この collection へのデータ挿入時に primary field を自動増分するかどうかを指定します。

    デフォルト値は **False** です。これを **True** に設定すると、primary field は自動的に増分されます。この場合、エラーを避けるために、挿入するデータに primary field を含めるべきではありません。自動生成される ID は固定長であり、変更できません。

    このパラメータは collection のクイックセットアップ用に設計されており、**schema** が **None** ではない場合は無視されます。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかの応答が返るかエラーが発生した時点でこの操作はタイムアウトします。

- **schema** (*[CollectionSchema](./MilvusClient-CollectionSchema)* | *None*)

    この collection の schema です。

    これを **None** に設定すると、この collection はクイックセットアップ方式で作成されます。 

    カスタマイズされた schema で collection をセットアップするには、**[CollectionSchema](./MilvusClient-CollectionSchema)** オブジェクトを作成し、ここで参照する必要があります。この場合、Zilliz Cloud はリクエスト内の他のすべての schema 関連設定を無視します。

- **index_params** (*IndexParams* | *None*)

    この collection の vector field 上に index を構築するためのパラメータです。カスタマイズされた schema で collection をセットアップし、collection を自動的にメモリにロードするには、**IndexParams** オブジェクトを作成し、ここで参照する必要があります。 

    少なくとも、この collection の vector field に対する index を追加する必要があります。後で index パラメータを設定したい場合は、このパラメータを省略することもできます。

- **kwargs** -

    - **enable_dynamic_field** (*bool*) -

        **&#36;meta** という予約済み JSON field を使用して、未定義の field とその値をキーと値のペアとして保存するかどうかを指定します。

        デフォルト値は **True** で、**&#36;meta** field が使用されることを示します。

        **schema** が **None** ではない場合、このパラメータは無視されます。

    - **num_shards** (*int*) -

        この collection の作成時に同時に作成する shard の数です。 

        デフォルト値は **1** で、この collection とともに 1 つの shard が作成されることを示します。

        <Admonition type="info" icon="📘" title="Note">

        シャーディングとは何ですか？
        
                シャーディングとは、書き込み操作を異なるノードに分散し、データ書き込みにおける Milvus cluster の並列計算能力を最大限に活用することを指します。
        
                デフォルトでは、collection には 1 つの shard が含まれます。

        </Admonition>

    - **partition_key_field** (*str*) -

        partition key として機能する field の名前です。各 collection には 1 つの partition key を設定できます。

        **schema** が **None** ではなく、schema 内の field の **is_parition_key** が **True** に設定されている場合、このパラメータは無視されます。

        <Admonition type="info" icon="📘" title="Note">

        partition key とは何ですか？
        
                partition 指向のマルチテナンシーを容易にするために、field を partition key field として設定すると、Zilliz Cloud はその field の値をハッシュ化し、指定された数の partition に応じて entity を分散します。
        
                entity を取得する際は、特定の field 値の entity をフィルタリングするために、boolean expression で partition key field を使用してください。
        
                詳細については、[Use Partition Key](/docs/use-partition-key) と [Multi-tenancy](https://milvus.io/docs/multi_tenancy.md) を参照してください。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        partition key に対する scalar filtering において、検索パフォーマンスをさらに向上させるために partition key isolation を有効にするかどうかを指定します。詳細については、[Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation) を参照してください。

    - **num_partitions** (*int*) -

        partition key 機能用に作成する partition の数です。

        デフォルト値は **64** で、この collection とともに 64 個の partition が作成されることを示します。このパラメータは、**partition_key_field** が field 名に設定されている場合に適用されます。

    - **consistency_level** (*int* | *str*)

        対象 collection の整合性レベルです。

        デフォルト値は **Bounded** (**2**) で、**Strong** (**0**)、**Session** (**1**)、**Bounded** (**2**)、**Eventually** (**3**) から選択できます。

        <Admonition type="info" icon="📘" title="Note">

        整合性レベルとは何ですか？
        
                分散データベースにおける整合性とは、特定の時点でデータを書き込んだり読み取ったりする際に、すべてのノードまたはレプリカが同じデータビューを持つことを保証する特性を指します。
        
                Zilliz Cloud は、**Strong**、**Bounded Staleness**、**Eventually** の 3 つの整合性レベルを提供しており、デフォルトは **Bounded Staleness** です。
        
                vector 類似検索やクエリを実行する際に、アプリケーションに最適になるよう整合性レベルを簡単に調整できます。

        </Admonition>

    - **properties** (*dict*) -

        キーと値のペアによる追加プロパティです。

        - **collection.ttl.seconds** (*int*)

            collection レベルの time-to-live (TTL) を秒単位で指定します。

        - **ttl_field** (*str*)

            entity レベルの TTL 期限切れにおける論理タイムスタンプとして使用する `TIMESTAMPTZ` field の名前です。

        - **mmap.enabled** (*bool*) -

            collection 内のすべての field の生データと index に対して mmap を有効にするかどうかを指定します。

        - **partitionkey.isolation** (bool) -

            partition key isolation を有効にするかどうかを指定します。詳細については、[Use Partition Key](/docs/use-partition-key) を参照してください。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **PrimaryKeyException**

    primary field のデータ型が整数または文字列でない場合に、この例外が発生します。

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## Examples\{#examples}

### Milvus client をセットアップする\{#set-up-a-milvus-client}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)
```

### collection を作成する\{#create-a-collection}

以下のように、クイックセットアップまたはカスタマイズされたセットアップを選択できます。

- **Quick setup**

    クイックセットアップの collection には、primary field と vector field という 2 つの必須 field があります。また、dynamic field に、未定義の field とその値をキーと値のペアとして挿入することもできます。

    ```python
    client.create_collection(
        collection_name="test_collection", 
        dimension=5
    )
    ```

    上記のセットアップでは、 

    - primary field と vector field はデフォルト名（**id** と **vector**）を使用します。

    - metric type もデフォルト値（**COSINE**）に設定されます。

    - primary field は整数を受け入れ、自動増分しません。

    - **&#36;meta** という予約済み JSON field が、schema で定義されていない field とその値を保存するために使用されます。

    primary field と vector field の名前を変更したり、metric type を変更したりできます。さらに、primary field を自動増分に設定することもできます。

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

    上記のコードでは、collection が作成され、index が作成され、メモリにロードされます。

- **Customized setup with index parameters**

    カスタマイズされたセットアップでは、事前に schema と index パラメータを作成します。 

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

    上記のコードでは、collection が作成され、index が作成され、メモリにロードされます。

- **Customized setup without index parameters**

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

    上記のコードでも collection は作成されます。ただし、`index_param` がないため、collection 内のデータには index が作成されず、メモリにもロードされません。

- **外部 collection を作成する**

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
