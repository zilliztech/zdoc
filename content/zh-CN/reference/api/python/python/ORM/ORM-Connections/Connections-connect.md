---
title: "connect() | Python | ORM"
slug: /python/python/Connections-connect
sidebar_label: "connect()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用提供的别名、地址和身份验证参数与 Zilliz Cloud 集群建立连接。 | Python | ORM"
type: docx
token: KzCXdTVVSoOmkbxuFjsccDlXnff
sidebar_position: 2
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - connect()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# connect()

此操作使用提供的别名、地址和身份验证参数与 Zilliz Cloud 集群建立连接。

## 请求语法\{#request-syntax}

```python
connect(
    alias: str,
    user: str | "",
    password: str | "",
    db_name: str | "default",
    token: str | "",
    **kwargs
)
```

**参数：**

- **alias** (*string*) -

    **[必需]**

    连接别名。

    <Admonition type="info" icon="📘" title="说明">

    - 如果指定的连接别名不存在，则会新增一个连接别名，并将下面指定的参数添加为该连接别名的参数。
    
    - 如果指定的连接别名已通过调用 **add_connection()** 添加，则下面指定的参数会覆盖该连接别名原有的参数。

    </Admonition>

- **user** (*string*) -

    用于连接到指定 Zilliz Cloud 集群的有效用户名。

    应与 **password** 一起使用。

- **password** (*string*) -

    用于连接到指定 Zilliz Cloud 集群的有效密码。

    应与 **user** 一起使用。

- **db_name** (*string*) -

    目标 Milvus 实例所属数据库的名称。

- **token** (*string*) -

    用于访问指定 Zilliz Cloud 集群的有效访问令牌。可作为分别设置 **user** 和 **password** 的替代方式。

    设置此字段时，请注意：

    有效的令牌应为以下之一：

    - 具有足够权限的 API key，或

    - 用于访问目标集群的一组用户名和密码，并使用冒号 (:) 连接。例如，你可以将其设置为 `username:p@ssw0rd`。

- **kwargs** (*dict*) -

    用于配置连接的关键字参数。支持以下键：

    - **address** (*string*) -

        实际连接地址。示例地址：**YOUR_CLUSTER_ENDPOINT**。

    - **uri** (*string*) -

        Zilliz Cloud 集群的 URI。例如：**`https://in01-&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540`**。

    - **host** (*string*) -

        Zilliz Cloud 集群的主机名。该值默认为 **localhost**；如果仅提供 **port**，PyMilvus 将补全默认主机。

    - **port** (*string | int*) -

        Zilliz Cloud 集群监听的端口。该值默认为 **19530**；如果仅提供 **host**，PyMilvus 将补全默认端口。

    - **secure** (*bool*) -

        一个布尔值，用于指示连接中是否使用 TLS。

    - **client_key_path** (*string*) -

        指向有效 **client.key** 文件的路径，用于客户端侧的 TLS 证书验证。

        使用自签名 TLS 证书或由未知证书颁发机构签名的证书时，此参数是必需的。

        如适用，此参数应与 **client_pem_path**、**ca_pem_path**、**server_pem_path** 和 **server_name** 配合使用。

    - **client_pem_path** (*string*) -

        指向有效 **client.pem** 文件的路径，用于客户端侧的 TLS 证书验证。

        使用自签名 TLS 证书或由未知证书颁发机构签名的证书时，此参数是必需的。

        如适用，此参数应与 **client_key_path**、**ca_pem_path**、**server_pem_path** 和 **server_name** 配合使用。

    - **ca_pem_path** (*string*) -

        指向有效 **ca.pem** 文件的路径，用于 TLS 证书验证。

        使用自签名 TLS 证书或由未知证书颁发机构签名的证书时，此参数是必需的。

        如适用，此参数应与 **client_key_path**、**client_pem_path**、**server_pem_path** 和 **server_name** 配合使用。

    - **server_pem_path** (*string*) -

        指向有效 **server.pem** 文件的路径，用于服务端侧的 TLS 证书验证。

        使用自签名 TLS 证书或由未知证书颁发机构签名的证书时，此参数是必需的。

        如适用，此参数应与 **client_key_path**、**client_pem_path**、**ca_pem_path** 和 **server_name** 配合使用。

    - **server_name** (*string*) -

        指向有效服务器名称的路径，用于服务端侧的 TLS 证书验证。

        使用自签名 TLS 证书或由未知证书颁发机构签名的证书时，此参数是必需的。

        如适用，此参数应与 **client_key_path**、**client_pem_path**、**ca_pem_path** 和 **server_pem_path** 配合使用。

**返回类型：**

None

**返回值：**

None

## 异常\{#exceptions}

- **NotImplementedError**:

    当 handler 参数值不是 GRPC 时，将引发此异常。

- **ParamError**: 

    当为 pool 参数传入了不受支持的值时，将引发此异常。

- **Exception**: 

    当连接参数中指定的服务器不可达/未就绪，且客户端无法连接到该服务器时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections

# Use host and port
connections.connect(
  alias="default", 
  host='localhost', 
  port='19530'
)

# Use uri
uri="YOUR_CLUSTER_ENDPOINT"
connections.connect(uri=uri)

# Use environment variable
# The following assumes that you have already set an environment 
# variable using export MILVUS_URI=http://username:password@YOUR_CLUSTER_ENDPOINT
connections.connect()

# Use environment files
# A sample file at https://github.com/milvus-io/pymilvus/blob/master/.env.example
# Rename the file to .env so that pymilvus will automatically load it.
connections.connect()

# Connect to a specific database
# Ensure the specified database exists.
connections.connect(db_name="books")
```

## 相关操作\{#related-operations}

以下操作与 `connect()` 相关：

- [add_connection()](./Connections-add_connection)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

