---
title: "connect() | Python | ORM"
slug: /python/python/Connections-connect
sidebar_label: "connect()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたエイリアス、アドレス、および認証パラメータを使用して、Zilliz Cloud クラスターへの接続を確立します。 | Python | ORM"
type: docx
token: KzCXdTVVSoOmkbxuFjsccDlXnff
sidebar_position: 2
keywords: 
  - 次元削減
  - HNSW アルゴリズム
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

この操作は、指定されたエイリアス、アドレス、および認証パラメータを使用して、Zilliz Cloud クラスターへの接続を確立します。

## リクエスト構文\{#request-syntax}

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

**パラメーター:**

- **alias** (*string*) -

    **[必須]**

    接続エイリアス。

    <Admonition type="info" title="Notes">

    - 指定された接続エイリアスが存在しない場合は、新しいエイリアスが追加され、以下で指定するパラメータがその接続エイリアスのパラメータとして追加されます。
    
    - 指定された接続エイリアスが **add_connection()** の呼び出しによってすでに追加されている場合は、以下で指定するパラメータがその接続エイリアスのパラメータを上書きします。

    </Admonition>

- **user** (*string*) -

    指定された Zilliz Cloud クラスターへの接続に使用する有効なユーザー名です。

    これは **password** と併せて使用する必要があります。

- **password** (*string*) -

    指定された Zilliz Cloud クラスターへの接続に使用する有効なパスワードです。

    これは **user** と併せて使用する必要があります。

- **db_name** (*string*) -

    対象の Milvus インスタンスが属するデータベースの名前です。

- **token** (*string*) -

    指定された Zilliz Cloud クラスターにアクセスするための有効なアクセストークンです。これは、**user** と **password** を個別に設定する代わりに使用できます。

    このフィールドを設定する際は、次の点に注意してください。

    有効なトークンは、次のいずれかである必要があります。

    - 十分な権限を持つ API キー、または

    - 対象クラスターへのアクセスに使用するユーザー名とパスワードをコロン（:）で連結したもの。たとえば、これは `username:p@ssw0rd` に設定できます。

- **kwargs** (*dict*) -

    接続を構成するためのキーワード引数です。次のキーがサポートされています。

    - **address** (*string*) -

        実際に接続するアドレスです。アドレスの例: **YOUR_CLUSTER_ENDPOINT**。

    - **uri** (*string*) -

        Zilliz Cloud クラスターの URI です。例: **https://in01-&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540**.

    - **host** (*string*) -

        Zilliz Cloud クラスターのホストです。値のデフォルトは **localhost** で、**port** のみが指定された場合、PyMilvus がデフォルトのホストを補います。

    - **port** (*string | int*) -

        Zilliz Cloud クラスターがリッスンするポートです。値のデフォルトは **19530** で、**host** のみが指定された場合、PyMilvus がデフォルトのポートを補います。

    - **secure** (*bool*) -

        接続で TLS を使用するかどうかを示すブール値です。

    - **client_key_path** (*string*) -

        クライアント側での TLS 証明書検証に使用する、有効な **client.key** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合は、このパラメータを **client_pem_path**、**ca_pem_path**、**server_pem_path**、および **server_name** と併せて使用します。

    - **client_pem_path** (*string*) -

        クライアント側での TLS 証明書検証に使用する、有効な **client.pem** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合は、このパラメータを **client_key_path**、**ca_pem_path**、**server_pem_path**、および **server_name** と併せて使用します。

    - **ca_pem_path** (*string*) -

        TLS 証明書検証に使用する、有効な **ca.pem** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合は、このパラメータを **client_key_path**、**client_pem_path**、**server_pem_path**、および **server_name** と併せて使用します。

    - **server_pem_path** (*string*) -

        サーバー側での TLS 証明書検証に使用する、有効な **server.pem** ファイルへのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合は、このパラメータを **client_key_path**、**client_pem_path**、**ca_pem_path**、および **server_name** と併せて使用します。

    - **server_name** (*string*) -

        サーバー側での TLS 証明書検証に使用する、有効なサーバー名へのパスです。

        このパラメータは、自己署名 TLS 証明書または未知の認証局によって署名された証明書を使用する場合に必要です。

        該当する場合は、このパラメータを **client_key_path**、**client_pem_path**、**ca_pem_path**、および **server_pem_path** と併せて使用します。

**戻り値の型:**

None

**戻り値:**

None

## 例外\{#exceptions}

- **NotImplementedError**:

    handler パラメータの値が GRPC でない場合に、この例外が発生します。

- **ParamError**: 

    pool パラメータにサポートされていない値が渡された場合に、この例外が発生します。

- **Exception**: 

    接続パラメータで指定されたサーバーに到達できない、または /ready ではないためにクライアントがそのサーバーに接続できない場合に、この例外が発生します。

## 例\{#examples}

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

## 関連操作\{#related-operations}

次の操作は `connect()` に関連しています。

- [add_connection()](./Connections-add_connection)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

