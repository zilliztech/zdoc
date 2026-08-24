---
title: "AbortImport() | Cloud"
slug: /cpp/cpp/DataImport-AbortImport
sidebar_label: "AbortImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "options.autocommit=false で作成された 2PC インポートジョブを中止し、ステージング済みのインポートデータを破棄します。 | Cloud"
type: docx
token: GUnjd6RiHooH3CxHbjOc81vInBf
sidebar_position: 4
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - AbortImport()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# AbortImport()

options.auto_commit=false で作成された 2PC インポートジョブを中止し、ステージング済みのインポートデータを破棄します。

## リクエスト構文\{#request-syntax}

```c++
static nlohmann::json AbortImport(const std::string& url, const std::string& job_id, const std::string& db_name = "default", const std::string& api_key = "")
```

**戻り値:**

*nlohmann::json*

バルクインポートエンドポイントからの JSON レスポンスを返します。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した AbortImport() の使用例を示します。

```c++
auto response = milvus::BulkImport::AbortImport(
    "YOUR_CLUSTER_ENDPOINT", "import-job-id", "default", "YOUR_CLUSTER_TOKEN");
```
