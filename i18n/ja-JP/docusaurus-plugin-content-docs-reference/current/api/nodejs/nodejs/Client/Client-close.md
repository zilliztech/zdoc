---
title: "close() | Node.js"
slug: /node/node/Client-close
sidebar_label: "close()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は `MilvusClientSession` インスタンスを閉じ、それ以降のセッションリクエストを防止します。 | Node.js"
type: docx
token: Xwg8dMovYoRP94xNDjOc1TSNnsg
sidebar_position: 6
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベース チュートリアル
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# close()

この操作は `MilvusClientSession` インスタンスを閉じ、それ以降のセッションリクエストを防止します。

```typescript
session.close(): void
```

## Request Syntax\{#request-syntax}

```typescript
session.close()
```

**PARAMETERS:**

この操作にはパラメータはありません。

**RETURNS:**

*void*

セッションハンドルのみを閉じます。親の `MilvusClient` 接続プールは閉じません。

**EXCEPTIONS:**

- **Error**

    後続のセッション操作では `MilvusClient session is closed` がスローされます。

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const session = client.session('cluster-a');
session.close();
```
