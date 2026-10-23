---
title: "AlterCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AlterCollectionFunction
sidebar_label: "AlterCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、既存のコレクションの関数を変更します。変更する関数は、Function オブジェクトが保持する関数名によって識別されます。 | Cloud"
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

この操作では、既存のコレクションの関数を変更します。変更する関数は、Function オブジェクトが保持する関数名によって識別されます。

```c++
Status AlterCollectionFunction(const AlterCollectionFunctionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AlterCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクションの名前を設定します。

- `WithFunction(const FunctionPtr& function)`

    新しい定義を持つ関数を、関数定義への共有ポインターとして設定します。その名前によって、変更する関数が識別されます。

**戻り値:**

*Status*

関数が正常に変更されたかどうかを示す Status を返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で AlterCollectionFunction() を呼び出し、既存のコレクションの関数を変更します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::AlterCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
status = client->AlterCollectionFunction(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
