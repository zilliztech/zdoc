---
title: "CurrentUsedDatabase() | Cloud"
slug: /cpp/cpp/Client-CurrentUsedDatabase
sidebar_label: "CurrentUsedDatabase()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "現在使用中のデータベース名を返します。複数のデータベースを扱うシナリオで便利な API です。 | Cloud"
type: docx
token: ZmS3drufioCOIBxq3PSc26O7nie
sidebar_position: 5
keywords: 
  - ベクトルデータベース比較
  - Faiss
  - ビデオ検索
  - AI幻覚
  - zilliz
  - zilliz cloud
  - cloud
  - CurrentUsedDatabase()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CurrentUsedDatabase()

現在使用中のデータベース名を返します。複数のデータベースを扱うシナリオで便利な API です。

```c++
Status CurrentUsedDatabase(std::string& db_name)
```

**パラメータ:**

- **db_name** (*std::string&*)

    現在使用中のデータベース名を格納する変数を指定します。

**戻り値:**

*Status*

処理の成否を確認するには、`status.IsOk()` を参照してください。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string current_db_name;
client->CurrentUsedDatabase(current_db_name);
std::cout << "Current in-used database: " << current_db_name << std::endl;
```
