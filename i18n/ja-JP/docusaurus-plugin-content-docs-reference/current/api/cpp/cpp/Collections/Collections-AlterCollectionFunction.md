---
title: "AlterCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFunction
sidebar_label: "AlterCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された Function オブジェクトの関数名で識別される既存のコレクション関数の定義を置き換えます。 | Cloud"
type: docx
token: YuvidafRvob4HuxnxrGcU7Vsnbh
sidebar_position: 6
keywords: 
  - ベクトルデータベース オープンソース
  - オープンソース ベクトルDB
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFunction()

この操作は、指定された Function オブジェクトの関数名で識別される既存のコレクション関数の定義を置き換えます。

```c++
Status AlterCollectionFunction(const AlterCollectionFunctionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterCollectionFunctionRequest()
    .WithCollectionName(collection_name)
    .WithFunction(function_ptr);
```

### AlterCollectionFunctionRequest\{#altercollectionfunctionrequest}

**リクエストメソッド:**

- `WithCollectionName(const std::string& collection_name)`

    関数定義を変更する対象のコレクションを指定します。

- `WithDatabaseName(const std::string& db_name)`

    対象のコレクションが含まれるデータベースを指定します。

- `WithFunction(const FunctionPtr& function)`

    更新後の関数定義を指定します。関数名によって変更対象の関数が識別されます。

**戻り値:**

*Status*

**例外:**

- **StatusCode**

    関数名の欠落、無効な関数定義、または利用できないコレクションについては、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto function = std::make_shared<milvus::Function>();
function->SetName("bm25_fn");

status = client->AlterCollectionFunction(
    milvus::AlterCollectionFunctionRequest()
        .WithCollectionName("docs")
        .WithFunction(function));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
