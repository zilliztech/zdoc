---
title: "Connect() | Cloud"
slug: /cpp/cpp/Client-Connect
sidebar_label: "Connect()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は Zilliz Cloud クラスターに接続します。 | Cloud"
type: docx
token: FBXDdgCrfoG5mzx2p1KcX2Kbnib
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

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Connect()

この操作は Zilliz Cloud クラスターへの接続を行います。

```c++
Status Connect(const ConnectParam& connect_param)
```

**パラメーター:**

- **connect_param** (*const [ConnectParam](./Client-ConnectParam)&*)

    接続パラメーターを指定します。

**戻り値:**

*Status*

`status.IsOk()` を参照して、処理の成否を確認します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
