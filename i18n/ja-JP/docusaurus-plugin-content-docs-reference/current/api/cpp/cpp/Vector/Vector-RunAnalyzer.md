---
title: "RunAnalyzer() | Cloud"
slug: /cpp/cpp/Vector-RunAnalyzer
sidebar_label: "RunAnalyzer()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "アナライザーを実行します。分析結果のトークンを返します。 | Cloud"
type: docx
token: ACnNdxazbo8zRUx2zeMcmoN2nah
sidebar_position: 7
keywords: 
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - zilliz
  - zilliz cloud
  - cloud
  - RunAnalyzer()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RunAnalyzer()

アナライザーを実行します。分析結果のトークンを返します。

```c++
Status RunAnalyzer(const RunAnalyzerRequest& request, RunAnalyzerResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = RunAnalyzerRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name)
    .WithTexts(texts)
    .AddText(text)
    .AddAnalyzerName(name)
    .WithAnalyzerParams(params)
    .WithDetail(with_detail)
    .WithHash(with_hash);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。デフォルトは空です。これは、MilvusClient のデータベース名を使用することを意味します。

- `WithCollectionName(std::string collection_name)`

    このコレクションの名前を設定します。空にすることはできません。

- `WithFieldName(std::string field_name)`

    対象フィールドの名前を設定します。空にすることはできません。

- `WithTexts(const std::vector<std::string>& texts)`

    分析するテキストを設定します。

- `AddText(std::string text)`

    分析するテキストを追加します。

- `AddAnalyzerName(std::string name)`

    アナライザーを指定します。

- `WithAnalyzerParams(const nlohmann::json& params)`

    アナライザーのパラメーターを設定します。

- `WithDetail(bool with_detail)`

    結果に詳細を含めます。

- `WithHash(bool with_hash)`

    結果にハッシュ値を含めます。

**戻り値：**

*Status*

操作が成功したかどうかを示すステータスを返します。

- **response** (*RunAnalyzerResponse*) -

    - **Results** (*const AnalyzerResults&*) -

        アナライザーの結果を取得します。

        - **Tokens** (*const std::ベクトル&lt;AnalyzerToken&gt;&*) -

            分析するトークンを設定します。

            - **token_** (*std::string*) -

            - **start_offset_** (*int64_t*) -

            - **end_offset_** (*int64_t*) -

            - **position_** (*int64_t*) -

            - **position_length_** (*int64_t*) -

            - **hash_** (*uint32_t*) -

**エラーハンドリング：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

MilvusClientV2 に接続した後で、RunAnalyzer() を使用します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::RunAnalyzerRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithFieldName(field_name);
status = client->RunAnalyzer(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
