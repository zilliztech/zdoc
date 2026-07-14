---
title: "connect() | Python | ORM"
slug: /python/python/Connections-connect
sidebar_label: "connect()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された alias、address、および認証パラメータを使用して Zilliz Cloud クラスターへの接続を確立します。 | Python | ORM"
type: docx
token: KzCXdTVVSoOmkbxuFjsccDlXnff
sidebar_position: 2
keywords: 
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - 近似最近傍探索
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

この操作は、指定された alias、address、および認証パラメータを使用して Zilliz Cloud クラスターへの接続を確立します。

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **alias** (*string*) -

    **[REQUIRED]**

    接続 alias。

    <Admonition type="info" icon="📘" title="Notes">

    - 指定された接続 alias が存在しない場合、新しい alias が追加され、以下で指定されたパラメータがその接続 alias のパラメータとして追加されます。
    
    - 指定された接続 alias がすでに **add_connection()** の呼び出しによって追加されている場合、以下で指定されたパラメータがその接続 alias のパラメータを上書きします。

    </Admonition>

- **user** (*string*) -

    指定された Zilliz Cloud クラスターへの接続に使用する有効なユーザー名です。

    これは **password** とともに使用する必要があります。

- **password** (*string*) -

    指定された Zilliz Cloud クラスターへの接続に使用する有効なパスワードです。

    これは **user** とともに使用する必要があります。

- **db_name** (*string*) -

    対象の Milvus インスタンスが属するデータベースの名前です。

- **token** (*string*) -

    指定された Zilliz Cloud クラスターにアクセスするための有効なアクセストークンです。これは **user** と **password** を個別に設定する代わりに使用できます。

    このフィールドを設定する場合は、以下に注意してください。

    有効な token は次のいずれかである必要があります。

    - 十分な権限を持つ API キー、または

    - 対象クラスターへのアクセスに使用するユーザー名とパスワードをコロン (:) で連結したもの。たとえば、これを `username:p@ssw0rd` に設定できます。

- **kwargs** (*dict*) -

    接続を構成するためのキーワード引数です。次のキーがサポートされています。

    - **address** (*string*) -

        実際に接続する address です。address の例: **YOUR_CLUSTER_ENDPOINT**。

    - **uri** (*string*) -

        Zilliz Cloud クラスターの URI です。例: **`https://in01-&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540`**。

    - **host** (*string*) -

        Zilliz Cloud クラスターの host です。値のデフォルトは **localhost** で、**port** のみが指定された場合、PyMilvus はデフォルトの host を補います。

    - **port** (*string | int*) -

        Zilliz Cloud クラスターが待ち受ける port です。値のデフォルトは **19530** で、**host** のみが指定された場合、PyMilvus はデフォルトの port を補います。

    - **secure** (*bool*) -

        接続で TLS を使用するかどうかを示すブール値です。

    - **client_key_path** (*string*) -

        クライアント側での TLS 証明書検証のための、有効な **client.key** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合、このパラメータは **client_pem_path**、**ca_pem_path**、**server_pem_path**、および **server_name** と併用できます。

    - **client_pem_path** (*string*) -

        クライアント側での TLS 証明書検証のための、有効な **client.pem** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合、このパラメータは **client_key_path**、**ca_pem_path**、**server_pem_path**、および **server_name** と併用できます。

    - **ca_pem_path** (*string*) -

        TLS 証明書検証のための、有効な **ca.pem** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合、このパラメータは **client_key_path**、**client_pem_path**、**server_pem_path**、および **server_name** と併用できます。

    - **server_pem_path** (*string*) -

        サーバー側での TLS 証明書検証のための、有効な **server.pem** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合、このパラメータは **client_key_path**、**client_pem_path**、**ca_pem_path**、および **server_name** と併用できます。

    - **server_name** (*string*) -

        サーバー側での TLS 証明書検証のための、有効なサーバー名へのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合、このパラメータは **client_key_path**、**client_pem_path**、**ca_pem_path**、および **server_pem_path** と併用できます。

**RETURN TYPE:**

None

**RETURNS:**

None

## Exceptions\{#exceptions}

- **NotImplementedError**:

    handler パラメータの値が GRPC ではない場合に、この例外が発生します。

- **ParamError**: 

    pool パラメータにサポートされていない値が渡された場合に、この例外が発生します。

- **Exception**: 

    接続パラメータで指定されたサーバーに到達できない、または準備ができておらず、クライアントが接続できない場合に、この例外が発生します。

## Examples\{#examples}

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

## Related operations\{#related-operations}

次の操作は `connect()` に関連しています。

- [add_connection()](./Connections-add_connection)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

