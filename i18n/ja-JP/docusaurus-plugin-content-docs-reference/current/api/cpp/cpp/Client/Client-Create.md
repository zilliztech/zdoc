---
title: "Create() | Cloud"
slug: /cpp/cpp/Client-Create
sidebar_label: "Create()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、新しい MilvusClientV2 インスタンスを作成します。 | Cloud"
type: docx
token: CfaudoM2CocOHtxYirFcJqbKnof
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - Create()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Create()

この操作は、新しい MilvusClientV2 インスタンスを作成します。

```c++
static std::shared_ptr<MilvusClientV2> Create()
```

**戻り値:**

*std::shared_ptr&lt;milvus::MilvusClientV2&gt;*

新しく作成されたクライアントインスタンスを返します。このインスタンスは、Connect() で設定できる状態です。

**エラー処理:**

- **std::exception**

    クライアントインスタンスを構築できない場合にスローされます。失敗の詳細については、例外メッセージを確認してください。

## 例\{#example}

クライアントインスタンスを作成し、Milvus サーバーに接続します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
