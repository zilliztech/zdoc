---
title: "DropDatabase() | Cloud"
slug: /cpp/cpp/Database-DropDatabase
sidebar_label: "DropDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はデータベースを削除します。 | Cloud"
type: docx
token: H6bldn5xxoPeGJxoX7Icp0tpnMb
sidebar_position: 4
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabase()

この操作はデータベースを削除します。

```c++
Status DropDatabase(const DropDatabaseRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropDatabaseRequest()
    .WithDatabaseName(db_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

**戻り値:**

*Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` と `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->DropDatabase(
    milvus::DropDatabaseRequest()
        .WithDatabaseName(my_db_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
