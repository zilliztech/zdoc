---
title: "create_resource_group() | Python | ORM"
slug: /python/python/utility-create_resource_group
sidebar_label: "create_resource_group()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、新しいリソースグループを作成します。 | Python | ORM"
type: docx
token: X5qsdhFQ5oOhkcxOprzcOZq4nMc
sidebar_position: 4
keywords: 
  - 密埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - NLP 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - create_resource_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_resource_group()

この操作は、新しいリソースグループを作成します。

<Admonition type="info" title="Note">

リソースグループとは何ですか？

リソースグループは、Zilliz Cloud クラスター内の複数またはすべてのクエリノードを保持できます。load() を呼び出してコレクションをロードすると、Zilliz Cloud はそのコレクションのデータを特定のクエリノードにロードします。

すべての Zilliz Cloud クラスターには、すべてのクエリノードを保持する **__default_resource_group** という名前のデフォルトのリソースグループが用意されています。

実際の数を確認するには、**describe_resource_group()** を使用します。利用可能なクエリノードが複数ある場合は、リソースグループを作成し、それらの間でクエリノードを分散することを検討してください。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
create_resource_group(
    name: str,
    using: str,
    timeout: float | None,
    **kwargs
)
```

**パラメーター:**

- **name** (*str*) -

    **[必須]**

    作成するリソースグループの名前です。

    これを既存のリソースグループの名前に設定すると、**MilvusException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs**

    オプションのパラメーターです。現在は、リソースグループの設定を指定するために **config** を設定できます。

    - **config** (*ResourceGroupConfig*) -

        リソースグループの設定を表す ResourceGroupConfig オブジェクトです。

        ```python
        ├── ResourceGroupConfig
        │   ├── requests
        │   │   └── node_num
        │   └── limits
        │       └── node_num
        ```

        - **requests** (*dict*) -

            リソースグループが保持すべきクエリノードの数を指定する辞書です。このキーには以下を含める必要があります。

            - **node_num** (*int*) - リソースグループに対して要求されるクエリノードの数。

        - **limits** (*dict*) -

            リソースグループが保持できるクエリノードの最大数を指定する辞書です。このキーには以下を含める必要があります。

            - **node_num** (*int*) - リソースグループに許可されるクエリノードの最大数。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#examples}

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

## 関連操作\{#related-operations}

以下の操作は `create_resource_group()` に関連しています。

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)
