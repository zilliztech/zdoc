---
title: "UseDatabase() | Cloud"
slug: /cpp/cpp/Client-UseDatabase
sidebar_label: "UseDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、接続先をあるデータベースから別のデータベースへ切り替えます。 | Cloud"
type: docx
token: GvrfdEbvAoziA8xsAgPcBXDJnAb
sidebar_position: 12
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - cloud
  - UseDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# UseDatabase()

この操作は、接続先をあるデータベースから別のデータベースへ切り替えます。

```c++
Status UseDatabase(const std::string& db_name)
```

**パラメーター:**

- **db_name** (*const std::string&*)

    使用するデータベースの名前を指定します。

**戻り値:**

*Status*

`status.IsOk()` を参照して、成功したかどうかを確認します。

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

status = client->UseDatabase(db_name);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
