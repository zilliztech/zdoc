---
title: "close() | Java | v2"
slug: /java/java/v2-Client-close
sidebar_label: "close()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クライアントを閉じて基盤となる gRPC チャネルを解放し、保留中の非同期再試行をキャンセルするとともに、実行中の呼び出しが完了するまで最大 1 分間待機します。 | Java | v2"
type: docx
token: TX2vdOOxtomTrQxK4EbcjxPCn1g
sidebar_position: 4
keywords: 
  - HNSW アルゴリズム
  - ベクトル類似性検索
  - 近似最近傍探索
  - DiskANN
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - close()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# close()

この操作は、クライアントを閉じて基盤となる gRPC チャネルを解放し、保留中の非同期再試行をキャンセルするとともに、実行中の呼び出しが完了するまで最大 1 分間待機します。

```java
public void close()
```

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

すべての操作が完了したら、クライアントを閉じます。

```java
client.close();
```
