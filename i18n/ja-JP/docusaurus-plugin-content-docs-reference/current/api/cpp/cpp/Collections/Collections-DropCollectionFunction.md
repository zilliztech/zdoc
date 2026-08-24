---
title: "DropCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-DropCollectionFunction
sidebar_label: "DropCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "既存のコレクションから関数を削除します。 | Cloud"
type: docx
token: C6UadudBVopgWOxeZRwcf0uKn6b
sidebar_position: 22
keywords: 
  - 最近傍検索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionFunction()

既存のコレクションから関数を削除します。

<Admonition type="info" icon="📘" title="Note">

v3.0.x で非推奨となりました。関数とその出力フィールド、および関連付けられたインデックスをまとめて削除するには、DropFunctionField() を使用してください。

</Admonition>

```c++
Status DropCollectionFunction(const DropCollectionFunctionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = DropCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunctionName(function_name);
```

### DropCollectionFunctionRequest\{#dropcollectionfunctionrequest}

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFunctionName(std::string function_name)`

    削除する関数名を設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、通信、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した DropCollectionFunction() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::DropCollectionFunctionRequest();
util::CheckStatus(client->DropCollectionFunction(request));
```
