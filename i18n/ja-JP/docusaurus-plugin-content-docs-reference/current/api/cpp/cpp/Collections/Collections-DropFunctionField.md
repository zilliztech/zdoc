---
title: "DropFunctionField() | Cloud"
slug: /cpp/cpp/Collections-DropFunctionField
sidebar_label: "DropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "既存のコレクションの関数を、その出力フィールドおよびバインドされたインデックスとともに削除します。 | Cloud"
type: docx
token: CC9zdTSe3onmvrxGs5ic0e8inJd
sidebar_position: 37
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - DropFunctionField()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropFunctionField()

既存のコレクションの関数を、その出力フィールドおよびバインドされたインデックスとともに削除します。

```c++
Status DropFunctionField(const DropFunctionFieldRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropFunctionFieldRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースを使用します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFunctionName(std::string function_name)`

    削除する関数名を設定します。

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した DropFunctionField() の例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropFunctionFieldRequest();
util::CheckStatus(client->DropFunctionField(request));
```
