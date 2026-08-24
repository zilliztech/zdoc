---
title: "Disconnect() | Cloud"
slug: /cpp/cpp/Client-Disconnect
sidebar_label: "Disconnect()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クライアントとサーバー間の接続を閉じます。 | Cloud"
type: docx
token: Wom0dLES1ojjtKxa8OdckAK3n1C
sidebar_position: 6
keywords: 
  - Zilliz
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - zilliz
  - zilliz cloud
  - cloud
  - Disconnect()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Disconnect()

この操作は、クライアントとサーバー間の接続を閉じます。

```c++
Status Disconnect()
```

**戻り値:**

*Status*

成功したかどうかを確認するには、`status.IsOk()` を参照してください。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

client->Disconnect();
```
