---
title: "LoadState | Cloud"
slug: /cpp/cpp/Collections-LoadState
sidebar_label: "LoadState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この列挙型は、`GetLoadState()` が返すコレクションまたはパーティションのロード状態を表します。検索やクエリを実行するには、対象のコレクションまたはパーティションが `LOADSTATELOADED` 状態である必要があります。 | Cloud"
type: docx
token: AeHodu7bqoOWJcxdR1Gc0dounzf
sidebar_position: 30
keywords: 
  - hnsw algorithm
  - ベクトル類似度検索
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - LoadState
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# LoadState

この列挙型は、`GetLoadState()` が返すコレクションまたはパーティションのロード状態を表します。検索やクエリを実行するには、対象のコレクションまたはパーティションが `LOAD_STATE_LOADED` 状態である必要があります。

```c++
enum class LoadState {
    LOAD_STATE_NOT_EXIST = 0,
    LOAD_STATE_NOT_LOAD  = 1,
    LOAD_STATE_LOADING   = 2,
    LOAD_STATE_LOADED    = 3,
};
```

**値:**

- **LOAD_STATE_NOT_EXIST** (0) - コレクションまたはパーティションが存在しません。

- **LOAD_STATE_NOT_LOAD** (1) - コレクションまたはパーティションは存在しますが、クエリノードのメモリにロードされていません。検索を実行する前に、`LoadCollection()` または `LoadPartitions()` を呼び出してください。

- **LOAD_STATE_LOADING** (2) - コレクションまたはパーティションをクエリノードのメモリにロード中です。状態が `LOAD_STATE_LOADED` に遷移するまでお待ちください。

- **LOAD_STATE_LOADED** (3) - ロードが完了しており、`Search()` および `Query()` を実行できます。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/LoadState.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

GetLoadStateResponse resp;
auto status = client->GetLoadState(
    GetLoadStateRequest().WithCollectionName("my_collection"), resp);

switch (resp.State()) {
    case LoadState::LOAD_STATE_LOADED:
        std::cout << "Collection is ready for search." << std::endl;
        break;
    case LoadState::LOAD_STATE_LOADING:
        std::cout << "Collection is still loading..." << std::endl;
        break;
    case LoadState::LOAD_STATE_NOT_LOAD:
        std::cout << "Collection is not loaded. Call LoadCollection() first." << std::endl;
        break;
    case LoadState::LOAD_STATE_NOT_EXIST:
        std::cout << "Collection does not exist." << std::endl;
        break;
}
```
