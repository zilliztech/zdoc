---
title: "GetCompactionPlans() | Cloud"
slug: /cpp/cpp/Management-GetCompactionPlans
sidebar_label: "GetCompactionPlans()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション上の Compaction ジョブの現在の状態とマージプランを取得します。Compact() から返される Compaction ジョブ ID を渡してください。 | Cloud"
type: docx
token: Q9LBd7Mano2Sgyx3wJUcv4YrnLc
sidebar_position: 9
keywords: 
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - マネージドベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetCompactionPlans()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetCompactionPlans()

この操作は、コレクション上の Compaction ジョブの現在の状態とマージプランを取得します。Compact() から返される Compaction ジョブ ID を渡してください。

```c++
Status GetCompactionPlans(const GetCompactionPlansRequest& request, GetCompactionPlansResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetCompactionPlansRequest()
    .WithCompactionID(id);
```

**リクエストメソッド:**

- `WithCompactionID(int64_t id)`

    Compact() から返される、クエリ対象の Compaction ジョブ ID を設定します。

**戻り値:**

*Status*

操作が成功したかどうかを示す Status を返します。Compaction の状態とマージプランはレスポンスに含まれます。プランの一覧を取得するには Plans() を呼び出します。各プランはソースセグメントをマージ後のターゲットセグメントにマッピングし、CompactionStateCode を取得するには State() を呼び出します。

- **response** (*GetCompactionPlansResponse*) -

    - **Plans** (*const CompactionPlans&*) -

        Compaction のプランを取得します。

        - **SourceSegments** (*const std::ベクトル&lt;int64_t&gt;&*) -

            マージ対象のセグメント ID 配列。

        - **DestinySegemnt** (*int64_t*) -

            マージ後に新たに生成されるセグメント ID。

    - **CompactionID** (*int64_t*) -

        Compaction の ID を取得します。

    - **State** (*CompactionStateCode*) -

        Compaction の状態を取得します。

**エラー処理:**

- **std::exception**

    リクエストの構築、トランスポート、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で GetCompactionPlans() を呼び出し、Compaction ジョブの状態とマージプランを取得します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

int64_t compaction_id = 448702239994542855;

auto request = milvus::GetCompactionPlansRequest().WithCompactionID(compaction_id);
milvus::GetCompactionPlansResponse response;
status = client->GetCompactionPlans(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::cout << "compaction state: " << static_cast<int>(response.State()) << std::endl;
for (const auto& plan : response.Plans()) {
    std::cout << "plan merges " << plan.SourceSegments().size() << " segments into segment "
              << plan.DestinySegemnt() << std::endl;
}
```
