---
title: "listFileResources() | Node.js"
slug: /node/node/FileResources-listFileResources
sidebar_label: "listFileResources()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Milvus メタデータに登録されているファイルリソースを一覧表示します。 | Node.js"
type: docx
token: GK8hdiDs8olcOtxu0BKc89Vxn0b
sidebar_position: 2
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - クラウド
  - listFileResources()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listFileResources()

この操作は、Milvus メタデータに登録されているファイルリソースを一覧表示します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.listFileResources({ timeout? })
```

**パラメーター：**

- **timeout**（*number*） -

    RPC で許容される時間をミリ秒単位で指定します（省略可能）。デフォルトは undefined です。

**戻り値の型：**

*ListFileResourcesResponse*

**戻り値：**

レスポンスのステータスと、登録されたファイルリソースのリストです。

**パラメーター：**

- **status**（*ResStatus*） -

    操作のステータス：`{error_code, reason}`。

- **resources**（*FileResourceInfo[]*） -

    登録されたファイルリソース：各エントリには `{id, name, path}` が含まれます。

**例外：**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
const response = await milvusClient.listFileResources({});
```
