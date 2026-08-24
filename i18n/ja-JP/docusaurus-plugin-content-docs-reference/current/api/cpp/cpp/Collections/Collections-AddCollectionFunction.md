---
title: "AddCollectionFunction() | Cloud"
slug: /cpp/cpp/Collections-AddCollectionFunction
sidebar_label: "AddCollectionFunction()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: v3.0.x
notebook: false
description: "既存のコレクションに関数を追加します。 | Cloud"
type: docx
token: OrRqdvj4yoN2cMxbHUkcEE9Xnbg
sidebar_position: 2
keywords: 
  - ベクトルデータベースとは
  - ベクトルDB
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - zilliz
  - zilliz cloud
  - cloud
  - AddCollectionFunction()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionFunction()

既存のコレクションに関数を追加します。

<Admonition type="info" icon="📘" title="Note">

v3.0.x では非推奨です。関数を新しい出力フィールドおよび関連付けられたインデックスとともに追加するには、AddFunctionField() を使用してください。

</Admonition>

```c++
Status AddCollectionFunction(const AddCollectionFunctionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = AddCollectionFunctionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFunction(function);
```

### AddCollectionFunctionRequest\{#addcollectionfunctionrequest}

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithFunction(const FunctionPtr& function)`

    追加する関数を設定します。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した AddCollectionFunction() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::AddCollectionFunctionRequest();
util::CheckStatus(client->AddCollectionFunction(request));
```
