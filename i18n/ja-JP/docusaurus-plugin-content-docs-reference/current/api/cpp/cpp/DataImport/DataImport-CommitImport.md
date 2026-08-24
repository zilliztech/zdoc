---
title: "CommitImport() | Cloud"
slug: /cpp/cpp/DataImport-CommitImport
sidebar_label: "CommitImport()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "options.autocommit=false で作成された 2PC インポートジョブをコミットし、ステージング済みのインポートデータを参照可能にします。 | Cloud"
type: docx
token: DvRYdqk6qonziIxPQlJcqZN9nBd
sidebar_position: 5
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - CommitImport()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CommitImport()

options.auto_commit=false で作成された 2PC インポートジョブをコミットし、ステージング済みのインポートデータを参照可能にします。

## リクエスト構文\{#request-syntax}

```c++
static nlohmann::json CommitImport(const std::string& url, const std::string& job_id, const std::string& db_name = "default", const std::string& api_key = "")
```

**戻り値:**

*nlohmann::json*

バルクインポートエンドポイントからの JSON レスポンスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、通信、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 使用例\{#example}

C++ SDK を使用した CommitImport() の実行例を示します。

```c++
auto response = milvus::BulkImport::CommitImport(
    "YOUR_CLUSTER_ENDPOINT", "import-job-id", "default", "YOUR_CLUSTER_TOKEN");
```
