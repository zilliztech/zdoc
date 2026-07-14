---
title: "HttpImportProgressResponse | Node.js"
slug: /node/node/DataImport-HttpImportProgressResponse
sidebar_label: "HttpImportProgressResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "`getImportJobProgress()` によって返されるレスポンスを記述するインターフェースです。 | Node.js"
type: docx
token: WadbddIBYoC4GcxDzORcjMQYnmW
sidebar_position: 7
keywords: 
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportProgressResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportProgressResponse

このインターフェースは、`getImportJobProgress()` によって返されるレスポンスを記述します。

```typescript
interface HttpImportProgressResponse
```

**FIELDS:**

- **code** (*number*) -

    HTTP API レスポンスコードを指定します。

- **data.jobId** (*string*) -

    インポートジョブ ID を指定します。

- **data.progress** (*number*) -

    ジョブの進行状況を指定します。

- **data.state** (*string*) -

    現在のジョブ状態を指定します。

- **data.totalRows** (*number*) -

    利用可能な場合、合計行数を指定します。

- **data.importedRows** (*number*) -

    利用可能な場合、インポート済みの行数を指定します。

- **data.details** (*ImportJobDetailType[]*) -

    利用可能な場合、ファイルごとのインポート進行状況の詳細を一覧表示します。

- **data.reason** (*string*) -

    ジョブが失敗した場合の失敗理由を指定します。

## 例\{#example}

```javascript
const state = response.data.state;
const progress = response.data.progress;
```
