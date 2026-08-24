---
title: "GetSDKVersion() | Cloud"
slug: /cpp/cpp/Client-GetSDKVersion
sidebar_label: "GetSDKVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "SDK のバージョンを取得します。 | Cloud"
type: docx
token: ZPS0ddywzo9DObxXS9Rc7yornDc
sidebar_position: 7
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - ベクトル search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - GetSDKVersion()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetSDKVersion()

SDK のバージョンを取得します。

```c++
Status GetSDKVersion(std::string& version)
```

**パラメータ:**

- **version** (*std::string&*)

    返される SDK バージョン番号を格納する変数を指定します。

**戻り値:**

*Status*

`status.IsOk()` を参照して、処理の成功を確認します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// print the SDK version
client->GetSDKVersion(version);
std::cout << "The CPP SDK version is: " << version << std::endl;
```
