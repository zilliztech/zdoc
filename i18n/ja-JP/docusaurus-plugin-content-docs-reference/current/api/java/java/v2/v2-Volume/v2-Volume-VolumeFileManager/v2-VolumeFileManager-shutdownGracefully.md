---
title: "shutdownGracefully() | Java | v2"
slug: /java/java/v2-VolumeFileManager-shutdownGracefully
sidebar_label: "shutdownGracefully()"
beta: false
added_since: false
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "現在の Volume ストレージセッションを閉じ、そのリソースを解放します。 | Java | v2"
type: docx
token: F1GvdNp0rosDfCxonr7cJpzcn9w
sidebar_position: 3
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - shutdownGracefully()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# shutdownGracefully()

現在の Volume ストレージセッションを閉じ、そのリソースを解放します。

```java
public void shutdownGracefully()
```

**戻り値:**

*void*

この操作は値を返しません。

**例外:**

- **Exception**

    リクエストの検証、トランスポート、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
manager.shutdownGracefully();
```
