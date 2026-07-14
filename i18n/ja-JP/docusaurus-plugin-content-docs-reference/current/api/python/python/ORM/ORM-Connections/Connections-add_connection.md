---
title: "add_connection() | Python | ORM"
slug: /python/python/Connections-add_connection
sidebar_label: "add_connection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、異なる目的のために複数の Zilliz Cloud クラスターへの接続を一括で追加します。 | Python | ORM"
type: docx
token: C37ldNLbFog6ThxA23ScMldnnmb
sidebar_position: 1
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - cloud
  - add_connection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_connection()

この操作は、異なる目的のために複数の Zilliz Cloud クラスターに対する [connections](./ORM-Connections) を一括で追加します。 

## Request Syntax\{#request-syntax}

```python
add_connection(
    default: dict,
    # add other connections
    # your_conn_name: dict
)
```

**PARAMETERS:**

- **kwargs** - 

    キーワード引数を渡す場合、各引数の名前は **connect()** メソッドにおける接続エイリアスとして機能します。

    引数の値は、以下のフィールドを1つ以上含む辞書である必要があります。

    - **address** (*string*) -

        接続先の実際のアドレスです。アドレスの例: **YOUR_CLUSTER_ENDPOINT**。

    - **uri** (*string*) -

        Zilliz Cloud クラスターの URI です。例: **`https://in01-&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;&ast;.aws-us-west-2.vectordb-uat3.zillizcloud.com:19540`**。

    - **host** (*string*) -

        Zilliz Cloud クラスターのホストです。値のデフォルトは **localhost** で、**port** のみが指定された場合、PyMilvus はデフォルトのホストを補完します。

    - **port** (*string | int*) -

        Zilliz Cloud クラスターが待ち受けるポートです。値のデフォルトは **19530** で、**host** のみが指定された場合、PyMilvus はデフォルトのポートを補完します。

    - **user** (*string*) -

        指定された Zilliz Cloud クラスターに接続するために使用される有効なユーザー名です。

        これは **password** と一緒に使用する必要があります。

    - **password** (*string*) -

        指定された Zilliz Cloud クラスターに接続するために使用される有効なパスワードです。

        これは **user** と一緒に使用する必要があります。

    - **token** (string) -

        指定された Zilliz Cloud クラスターにアクセスするための有効なアクセストークンです。これは **user** と **password** を個別に設定する代わりに使用できます。

        このフィールドを設定する場合は、以下に注意してください。

        有効なトークンは次のいずれかである必要があります。

        - 十分な権限を持つ API キー、または

        - ターゲットクラスターにアクセスするためのユーザー名とパスワードをコロン (:) で連結したもの。たとえば、これを `username:p@ssw0rd` に設定できます。

<Admonition type="info" icon="📘" title="Note">

クラスターエンドポイントとトークンはどのように取得できますか？

- **Cluster endpoint**

    [Zilliz Cloud](https://cloud.zilliz.com) コンソールにログインし、左側のナビゲーションペインで **Clusters** をクリックします。クラスターの一覧で対象のクラスター名をクリックし、**Connect** 領域にあるエンドポイントをコピーして、上記の URI として使用できます。

- **Access token**

    Zilliz Cloud クラスターに接続するには、次のいずれかを使用できます。

    - API キー

        [Zilliz Cloud](https://cloud.zilliz.com) コンソールにログインし、左側のナビゲーションペインで **API Keys** をクリックします。

    - クラスターにアクセスするためのユーザー名とパスワードをコロン (**:**) で連結したもの。

        Zilliz Cloud コンソールでクラスター作成時に指定したクラスター認証情報、または既存の任意のクラスター ユーザーの認証情報を使用できます。

</Admonition>

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

- **ConnectionConfigException**

    接続設定が無効な場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import connections

SERVERLESS_ENDPOINT = "https://in03-************.api.gcp-us-west1.zillizcloud.com"
SERVERLESS_TOKEN = "db_admin:************"
DEDICATED_ENDPOINT = "https://in03-************.api.gcp-us-west1.zillizcloud.com:19541"
DEDICATED_USER = "db_admin"
DEDICATED_PASS = "*****************"

connections.add_connection(
  serverless={"uri": SERVERLESS_ENDPOINT, "token": SERVERLESS_TOKEN},
  dedicated={"uri": DEDICATED_ENDPOINT, "user": DEDICATED_USER, "password": DEDICATED_PASS}
)
```

## Related operations\{#related-operations}

以下の操作は `add_connection()` に関連しています。

- [connect()](./Connections-connect)

- [disconnect()](./Connections-disconnect)

- [get_connection_addr()](./Connections-get_connection_addr)

- [has_connection()](./Connections-has_connection)

- [list_connections()](./Connections-list_connections)

- [remove_connection()](./Connections-remove_connection)

