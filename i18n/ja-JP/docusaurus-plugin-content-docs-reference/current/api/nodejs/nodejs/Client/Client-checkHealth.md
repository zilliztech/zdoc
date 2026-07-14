---
title: "checkHealth() | Node.js"
slug: /node/node/Client-checkHealth
sidebar_label: "checkHealth()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は Milvus サーバーのヘルスステータスを確認します。 | Node.js"
type: docx
token: DDvudeY20o6tV5xwwo4cKovjnHf
sidebar_position: 2
keywords: 
  - Serverless ベクターデータベース
  - milvus オープンソース
  - milvus はどのように動作するか
  - Zilliz ベクターデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - checkHealth()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# checkHealth()

この操作は Milvus サーバーのヘルスステータスを確認します。

```javascript
await milvusClient.checkHealth()
```

## リクエスト構文\{#request-syntax}

```javascript
milvusClient.checkHealth()
```

**RETURN TYPE:**

*Promise*\<*CheckHealthResponse*>

**RETURNS** *Promise&lt;CheckHealthResponse&gt;*

このメソッドは、**CheckHealthResponse** オブジェクトに解決される promise を返します。

```typescript
{
    isHealthy: boolean,
    reasons: string[]
}
```

**PARAMETERS:**

- **isHealthy** (*boolean*) -

    Milvus デプロイメントのすべての重要なコンポーネントが正常であるかどうかを示す boolean 値です。

- **reasons** (*string[]*) -

    **isHealthy** が **false** の場合、どのコンポーネントが正常でないかを説明する、人が読める理由のリストです。**isHealthy** が **true** の場合、リストは空です。

## 例\{#examples}

```javascript
milvusClient.checkHealth()
```
