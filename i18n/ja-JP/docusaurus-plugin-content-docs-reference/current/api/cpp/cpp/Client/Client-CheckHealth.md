---
title: "CheckHealth() | Cloud"
slug: /cpp/cpp/Client-CheckHealth
sidebar_label: "CheckHealth()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、接続先の Milvus サーバーのヘルスを確認します。レスポンスでは、サーバーが正常かどうか、正常でない場合はその理由が報告されます。 | Cloud"
type: docx
token: H8bEdNoDNoQMojxNEWKc7xIQnPb
sidebar_position: 1
keywords: 
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - 語彙検索
  - zilliz
  - zilliz cloud
  - クラウド
  - CheckHealth()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CheckHealth()

この操作は、接続先の Milvus サーバーのヘルスを確認します。レスポンスでは、サーバーが正常かどうか、正常でない場合はその理由が報告されます。

```c++
Status CheckHealth(const CheckHealthRequest& request, CheckHealthResponse& response)
```

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。レスポンスには、ヘルスフラグと、正常でない場合にはその理由が含まれます。

- **response** (*CheckHealthResponse*) -

    - **IsHealthy** (*bool*) -

        Milvus サーバーが正常かどうかを取得します。

    - **Reasons** (*const std::ベクトル&lt;std::string&gt;&*) -

        Milvus サーバーが正常でない理由を取得します。

    - **QuotaStates** (*const std::ベクトル&lt;std::string&gt;&*) -

        Milvus サーバーがサービスを提供できないクォータ状態を取得します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で CheckHealth() を呼び出してサーバーのヘルスを確認し、失敗理由を報告します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CheckHealthRequest request;
milvus::CheckHealthResponse response;
status = client->CheckHealth(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
