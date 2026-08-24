---
title: "HasCollection() | Cloud"
slug: /cpp/cpp/Collections-HasCollection
sidebar_label: "HasCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "指定したコレクションが存在するかどうかを確認します。 | Cloud"
type: docx
token: ZLfgdRLpXolwPYx2ZOrcDmxGnnw
sidebar_position: 27
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - HasCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# HasCollection()

指定したコレクションが存在するかどうかを確認します。

```c++
Status HasCollection(const HasCollectionRequest& request, HasCollectionResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = HasCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    対象のコレクション名を設定します。

**戻り値:**

*Status* および *HasCollectionResponse*

`status.IsOk()` を確認して、成功したかどうかを判定します。

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

milvus::HasCollectionResponse response;
status = client->HasCollection(
    milvus::HasCollectionRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Collection exists: " << response.HasCollection() << std::endl;
```
