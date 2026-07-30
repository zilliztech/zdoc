---
title: "describe_resource_group() | Python | ORM"
slug: /python/python/utility-describe_resource_group
sidebar_label: "describe_resource_group()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作描述特定资源组的详细信息。 | Python | ORM"
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

此操作描述特定资源组的详细信息。

## 请求语法\{#request-syntax}

```python
describe_resource_group(
    name: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **name** (*str*) -

    **[必填]**

    要描述的资源组名称。

    如果指定的资源组不存在，将引发 **MilvusException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*ResourceGroupInfo*

**返回：**

一个 **ResourceGroupInfo** 对象，包含资源组的详细描述信息。

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

**ResourceGroupInfo** 对象包含以下字段：

- **name** (*str*)

    资源组的名称。

- **capacity** (*int*)

    转移到该资源组的 query node 数量。

- **num_available_node** (*int*)

    此资源组中可用的 query node 数量。

- **num_loaded_replica** (*google._upb._message.ScalarMapContainer*)

    集合名称及其在此资源组中对应的已加载副本数量。

- **num_outgoing_node** (*google._upb._message.ScalarMapContainer*)

    集合名称及其用于传出请求的 query node 数量。 

- **num_incoming_node** (*google._upb._message.ScalarMapContainer*)

    集合名称及其用于传入请求的 query node 数量。 

- **config** (*ResourceGroupConfig*)

    表示资源组配置的 ResourceGroupConfig 对象。

    - **requests** (*dict*) -

        指定资源组应持有的 query node 数量的字典。该键应包含：

        - **node_num** (*int*) - 为资源组请求的 query node 数量。

    - **limits** (*dict*) -

        指定资源组可持有的最大 query node 数量的字典。该键应包含：

        - **node_num** (*int*) - 资源组允许的最大 query node 数量。

- **nodes** (*list*)

    NodeInfo 对象列表，每个对象包含：

    - **node_id** (*int*) - 节点 ID。

    - **address** (*str*) - 节点地址。

    - **hostname** (*str*) - 节点主机名。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

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

## 相关操作\{#related-operations}

以下操作与 `describe_resource_group()` 相关：

- [create_resource_group()](./utility-create_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

