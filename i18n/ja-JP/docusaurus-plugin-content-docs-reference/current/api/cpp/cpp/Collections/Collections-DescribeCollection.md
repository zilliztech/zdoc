---
title: "DescribeCollection() | Cloud"
slug: /cpp/cpp/Collections-DescribeCollection
sidebar_label: "DescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スキーマやプロパティを含むコレクションの詳細情報を返します。 | Cloud"
type: docx
token: XQLWd904koQK58x9tkHcqqbZnVb
sidebar_position: 18
keywords: 
  - ベクトル Dimension
  - ANN Search
  - What are ベクトル embeddings
  - ベクトル データベース tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeCollection()

この操作は、スキーマやプロパティを含むコレクションの詳細情報を返します。

```c++
Status DescribeCollection(const DescribeCollectionRequest& request, DescribeCollectionResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を指定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を指定します。

**戻り値:**

*DescribeCollectionResponse* を含む *Status*

`status.IsOk()` を確認して、処理の成否を判定します。

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

milvus::DescribeCollectionResponse desc_response;
status = client->DescribeCollection(
    milvus::DescribeCollectionRequest()
        .WithDatabaseName(db_name)
        .WithCollectionName(collection_name),
    desc_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "Collection ID: " << desc_response.Desc().ID() << std::endl;
```
