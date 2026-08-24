---
title: "Session() | Cloud"
slug: /cpp/cpp/Client-Session
sidebar_label: "Session()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "DQL インターフェースのみを公開するクラスター スコープのセッションを作成します。 | Cloud"
type: docx
token: VTkhdUYKvoYBPRx7EDiczhJhnhe
sidebar_position: 13
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - Session()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Session()

DQL インターフェースのみを公開するクラスター スコープのセッションを作成します。

## リクエスト構文\{#request-syntax}

```c++
Status Session(const std::string& cluster_id, MilvusClientV2SessionPtr& session)
```

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK での Session() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

milvus::MilvusClientV2SessionPtr session;
util::CheckStatus(client->Session("cluster-a", session));
```
