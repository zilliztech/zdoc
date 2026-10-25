---
title: "Connect() | Cloud"
slug: /cpp/cpp/Client-Connect
sidebar_label: "Connect()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定された接続パラメーターを使用して、クライアントと Milvus サーバー間の接続を確立します。 | Cloud"
type: docx
token: TuY9d4LfuoEptYxb25HcXmqcncb
sidebar_position: 2
keywords: 
  - ハイブリッド検索
  - 語彙検索
  - 最近傍検索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - Connect()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Connect()

この操作は、指定された接続パラメーターを使用して、クライアントと Milvus サーバー間の接続を確立します。

```c++
Status Connect(const ConnectParam& connect_param)
```

**戻り値:**

*Status*

接続が正常に確立されたかどうかを示す Status を返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

URI とトークン認証情報を使用して Milvus サーバーに接続し、返されたステータスを確認します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
