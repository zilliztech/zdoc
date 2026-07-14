---
title: "describe_index() | Python | MilvusClient"
slug: /python/python/Management-describe_index
sidebar_label: "describe_index()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は特定のインデックスの詳細を取得します。 | Python | MilvusClient"
type: docx
token: WhsHdyIgyoFlsQxNJt9cFCTxnDe
sidebar_position: 4
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - describe_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_index()

この操作は特定のインデックスの詳細を取得します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated serving cluster と on-demand compute にのみ適用されます。 

- serving cluster の collection でこの操作を行うには、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用の collection でこの操作を行うには、project endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand cluster にアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
describe_index(
    collection_name: str,
    index_name: str,
    timeout: Optional[float] = None
) -> Dict
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    既存の collection の名前。

    これを存在しない collection に設定すると、**MilvusException** が発生します。

- **index_name** (*str*) -

    **[必須]**

    詳細を取得するインデックスの名前。

    これを存在しない collection に設定すると、**MilvusException** が発生します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:** 

*Dict*

**戻り値:**

指定したインデックスの詳細を含む辞書。

```python
{
    'index_type': 'AUTOINDEX',
    'metric_type': 'IP',
    'M': 32,
    'efConstruction': 360,
    'total_rows': 0,
    'indexed_rows': 0,
    'pending_index_rows': 0,
    'state': 'Finished',
    'field_name': 'my_vector',
    'index_name': 'my_vector'
}
```

**パラメータ:**

- **index_type** (*str*) -

    インデックスの構築に使用されるアルゴリズム。 

    Zilliz Cloud では、この値は常に **AUTOINDEX** です。詳細については、[AUTOINDEX Explained](/docs/autoindex-explained) を参照してください。

- **metric_type** (*str*) -

    vector 間の類似度を測定するために使用されるアルゴリズム。指定可能な値は **IP**、**L2**、**COSINE** です。

    これは、指定された field が vector field である場合にのみ利用できます。 

- **total_rows** (*int*) -

    このインデックスの対象 field に含まれる行数。

- **indexed_rows** (*int*) -

    このインデックスの対象 field でインデックス化済みの行数。

- **pending_index_rows** (*int*) -

    指定された field でインデックス化される予定の行数。

- **state** (*str*) -

    インデックス構築プロセスの状態。

- **field_name** (*str*) -

    インデックスが作成された field の名前。

- **index_name** (*str*) -

    作成されたインデックスの名前。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
    metric_type="L2",
    params={"nlist": 1024}
)

# 5. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 6. List indexes
client.list_indexes(collection_name="customized_setup")

# ['my_id', 'my_vector']

# 7. Describe the indexes
client.describe_index(
    collection_name="customized_setup",
    index_name="my_vector"
)

# {
#     'index_type': 'AUTOINDEX',
#     'metric_type': 'L2',
#     'field_name': 'my_vector',
#     'index_name': 'my_vector'
# }

client.describe_index(
    collection_name="customized_setup",
    index_name="my_id"    
)

# {
#     'index_type': 'STL_SORT',
#     'field_name': 'my_id', 
#     'index_name': 'my_id'
# }
```

## 関連メソッド\{#related-methods}

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

