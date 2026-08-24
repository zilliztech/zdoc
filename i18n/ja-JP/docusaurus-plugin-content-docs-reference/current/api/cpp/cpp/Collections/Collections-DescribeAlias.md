---
title: "DescribeAlias() | Cloud"
slug: /cpp/cpp/Collections-DescribeAlias
sidebar_label: "DescribeAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、エイリアスの詳細情報を返します。 | Cloud"
type: docx
token: WGXadLPOjobTmnxp0oacSo1znEf
sidebar_position: 17
keywords: 
  - 最近傍検索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeAlias()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DescribeAlias()

この操作は、エイリアスの詳細情報を返します。

```c++
Status DescribeAlias(const DescribeAliasRequest& request, DescribeAliasResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DescribeAliasRequest()
    .WithDatabaseName(db_name)
    .WithAlias(alias);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithAlias(const std::string& alias)`

    エイリアス名を設定します。

**戻り値:**

*DescribeAliasResponse* を含む *Status*

成功したかどうかは `status.IsOk()` で確認できます。

**例外:**

- **StatusCode**

    エラーの詳細は、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::DescribeAliasResponse response;
status = client->DescribeAlias(
    milvus::DescribeAliasRequest()
        .WithAlias("my_alias"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Alias: " << response.Alias()
          << ", Collection: " << response.Collection() << std::endl;
```
