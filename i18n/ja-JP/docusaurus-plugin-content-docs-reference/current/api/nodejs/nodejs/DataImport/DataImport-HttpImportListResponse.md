---
title: "HttpImportListResponse | Node.js"
slug: /node/node/DataImport-HttpImportListResponse
sidebar_label: "HttpImportListResponse"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "`listImportJobs()` によって返されるレスポンスを記述するインターフェースです。 | Node.js"
type: docx
token: L709dd1mWo6CFjxi2ygczQmpn9e
sidebar_position: 5
keywords: 
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - HttpImportListResponse
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# HttpImportListResponse

このインターフェースは、`listImportJobs()` によって返されるレスポンスを記述します。

```typescript
interface HttpImportListResponse
```

**FIELDS:**

- **code** (*number*) -

    HTTP API のレスポンスコードを指定します。

- **data.records** (*ImportJobType[]*) -

    コレクション名、ジョブ ID、進行状況、および状態を含むインポートジョブを一覧表示します。

- **message** (*string*) -

    レスポンスメッセージを指定します。

## Example\{#example}

```javascript
const records = response.data.records;
```
