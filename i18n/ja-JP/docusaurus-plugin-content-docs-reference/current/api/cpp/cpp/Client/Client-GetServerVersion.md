---
title: "GetServerVersion() | Cloud"
slug: /cpp/cpp/Client-GetServerVersion
sidebar_label: "GetServerVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Zilliz Cloud サーバーのバージョンを返します。 | Cloud"
type: docx
token: VgZtdAUzyoJplBxYfdMc1OGonng
sidebar_position: 8
keywords: 
  - ビデオ検索
  - AIハルシネーション
  - AIエージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - cloud
  - GetServerVersion()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersion()

この操作は、Zilliz Cloud サーバーのバージョンを返します。

```c++
Status GetServerVersion(std::string& version)
```

**パラメータ:**

- **version** (*std::string&*)

    返されるサーバーのバージョン番号を格納する変数を指定します。

**戻り値:**

*Status*

`status.IsOk()` を確認して、処理の成否を判定します。

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

std::string version;
status = client->GetServerVersion(version);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "The milvus server version is: " << version << std::endl;
```
