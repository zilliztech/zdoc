---
title: "describe_resource_group() | Python | ORM"
slug: /python/python/utility-describe_resource_group
sidebar_label: "describe_resource_group()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のリソースグループの詳細を取得します。 | Python | ORM"
type: docx
token: HScCdxLNJotPCcxb4AZcxsNJn9c
sidebar_position: 7
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_resource_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_resource_group()

この操作は、特定のリソースグループの詳細を取得します。

## リクエスト構文\{#request-syntax}

```python
describe_resource_group(
    name: str,
    using: str,
    timeout: float | None
)
```

**パラメータ:**

- **name** (*str*) -

    **[必須]**

    詳細を取得するリソースグループの名前。

    指定されたリソースグループが存在しない場合、**MilvusException** が発生します。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*ResourceGroupInfo*

**戻り値:**

リソースグループの詳細な説明を含む **ResourceGroupInfo** オブジェクト。

```python
├── ResourceGroupInfo 
│   ├── name
│   ├── capacity
│   ├── num_available_node
│   ├── num_loaded_replica
│   ├── num_outgoing_node
│   ├── num_incoming_node
│   ├── config
│   │   ├── requests
│   │   │   └── node_num
│   │   └── limits
│   │       └── node_num
│   └── nodes
│       └── NodeInfo
│           ├── node_id
│           ├── address
│           └── hostname
```

**ResourceGroupInfo** オブジェクトには、以下のフィールドが含まれます。

- **name** (*str*)

    リソースグループの名前。

- **capacity** (*int*)

    このリソースグループに転送されたクエリノードの数。

- **num_available_node** (*int*)

    このリソースグループ内で利用可能なクエリノードの数。

- **num_loaded_replica** (*google._upb._message.ScalarMapContainer*)

    このリソースグループ内のコレクションの名前と、それに対応するロード済みレプリカ数。

- **num_outgoing_node** (*google._upb._message.ScalarMapContainer*)

    コレクションの名前と、その送信リクエスト用クエリノードの数。 

- **num_incoming_node** (*google._upb._message.ScalarMapContainer*)

    コレクションの名前と、その受信リクエスト用クエリノードの数。 

- **config** (*ResourceGroupConfig*)

    リソースグループの構成を表す ResourceGroupConfig オブジェクト。

    - **requests** (*dict*) -

        リソースグループが保持すべきクエリノード数を指定する辞書。このキーには以下を含める必要があります。

        - **node_num** (*int*) - リソースグループに要求されるクエリノードの数。

    - **limits** (*dict*) -

        リソースグループが保持できるクエリノードの最大数を指定する辞書。このキーには以下を含める必要があります。

        - **node_num** (*int*) - リソースグループに許可されるクエリノードの最大数。

- **nodes** (*list*)

    NodeInfo オブジェクトのリスト。それぞれに以下が含まれます。

    - **node_id** (*int*) - ノードの ID。

    - **address** (*str*) - ノードのアドレス。

    - **hostname** (*str*) - ノードのホスト名。

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
node_num = 1 # Number of query nodes you expect the target resource group to hold.

config = utility.ResourceGroupConfig(
    requests={'node_num': node_num}, # The number of query nodes that the resource group should hold.
    limits={'node_num': node_num} # The maximum number of query nodes that the resource group can hold.
)

try:
    utility.create_resource_group(
        name=name, # The name of the resource group to be created.
        using='default', # The database to use.
        config=config, # The configuration of the resource group.
    )
    print(f'Succeeded in creating resource group {name}.')
except Exception:
    print(f'Failed to create resource group {name}.')
    
# Succeeded in creating resource group rg.

# Describe the details of the created resource group `rg`

info = utility.describe_resource_group(name='rg')

print(f"Resource group rg description: {info}")

# Output:
# Resource group rg description: ResourceGroupInfo:
# <name:rg>, # Name of the resource group
# <capacity:1>, # Number of query nodes in the resource group
# <num_available_node:1>, # Number of available query nodes in the resource group
# <num_loaded_replica:{}>, 
# <num_outgoing_node:{}>,
# <num_incoming_node:{}>,
# <config:requests {
#   node_num: 1 # Number of query nodes required in the resource group
# }
# limits {
#   node_num: 1 # Maximum number of query nodes allowed in the resource group
# }
# >,
# <nodes:[NodeInfo:
# <node_id:8>,
# <address:10.102.7.12:21123>,
# <hostname:doc-test1-axjfu-milvus-querynode-776bb5768-v2dqh>]>
```

## 関連操作\{#related-operations}

以下の操作は `describe_resource_group()` に関連しています。

- [create_resource_group()](./utility-create_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

