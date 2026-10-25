---
title: "UseDatabase() | Cloud"
slug: /cpp/cpp/Client-UseDatabase
sidebar_label: "UseDatabase()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、同じ Milvus サーバー上の別のデータベースへクライアントの接続を切り替えます。 | Cloud"
type: docx
token: G70Odip3yoLDIwxaUGEc2e2Snoh
sidebar_position: 13
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - クラウド
  - UseDatabase()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# UseDatabase()

この操作は、同じ Milvus サーバー上の別のデータベースへクライアントの接続を切り替えます。

```c++
Status UseDatabase(const std::string& db_name)
```

**戻り値：**

*Status*

操作が成功したかどうかを示すステータスを返します。

**エラーハンドリング：**

- **std::exception**

    クライアントが対象のデータベースへの切り替えに失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で UseDatabase() を呼び出し、接続先を別のデータベースに切り替えます。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->UseDatabase();
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
