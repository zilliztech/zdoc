---
title: "create_resource_group() | Python | ORM"
slug: /python/python/utility-create_resource_group
sidebar_label: "create_resource_group()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しい resource group を作成します。 | Python | ORM"
type: docx
token: X5qsdhFQ5oOhkcxOprzcOZq4nMc
sidebar_position: 4
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - create_resource_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_resource_group()

この操作は新しい resource group を作成します。 

<Admonition type="info" icon="📘" title="注">

resource group とは何ですか？

resource group には、Zilliz Cloud cluster 内の複数またはすべての query node を保持できます。`load()` を呼び出して collection をロードすると、Zilliz Cloud はその collection のデータを特定の query node にロードします。

すべての Zilliz Cloud cluster には、すべての query node を保持する **__default_resource_group** という名前のデフォルトの resource group が用意されています。 

実際の数を確認するには **describe_resource_group()** を使用します。利用可能な query node が複数ある場合は、resource group を作成し、その間で query node を分散することを検討してください。

</Admonition>

## Request Syntax\{#request-syntax}

```python
create_resource_group(
    name: str,
    using: str,
    timeout: float | None,
    **kwargs
)
```

**PARAMETERS:**

- **name** (*str*) -

    **[REQUIRED]**

    作成する resource group の名前です。

    これを既存の resource group の名前に設定すると、**MilvusException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs**

    オプションのパラメータです。現在は、resource group の設定を指定するために **config** を設定できます。

    - **config** (*ResourceGroupConfig*) -

        resource group の設定を表す ResourceGroupConfig オブジェクトです。

        ```python
        ├── ResourceGroupConfig
        │   ├── requests
        │   │   └── node_num
        │   └── limits
        │       └── node_num
        ```

        - **requests** (*dict*) -

            resource group が保持すべき query node の数を指定する辞書です。このキーには以下を含める必要があります。

            - **node_num** (*int*) - resource group に対して要求する query node の数。

        - **limits** (*dict*) -

            resource group が保持できる query node の最大数を指定する辞書です。このキーには以下を含める必要があります。

            - **node_num** (*int*) - resource group に許可される query node の最大数。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a resource group

name = "rg" # A resource group name should be a string of 1 to 255 characters, starting with a letter or an underscore (_) and containing only numbers, letters, and underscores (_).
node_num = 1

config = utility.ResourceGroupConfig(
    requests={'node_num': node_num}, # The number of query nodes that the resource group should hold.
    limits={'node_num': node_num} # The maximum number of query nodes that the resource group can hold.
)

try:
    utility.create_resource_group(
        name, # The name of the resource group to be created.
        using='default', # The database to use.
        config=config, # The configuration of the resource group.
    )
    print(f'Succeeded in creating resource group {name}.')
except Exception:
    print(f'Failed to create resource group {name}.')
```

## Related operations\{#related-operations}

以下の操作は `create_resource_group()` に関連しています。

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

