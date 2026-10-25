---
title: "alterRole() | Node.js"
slug: /node/node/Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のロールの説明を変更します。 | Node.js"
type: docx
token: Fvw0dyRalo2ceVxdY4Fcf9uTnBg
sidebar_position: 30
keywords: 
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画重複排除
  - 動画類似性検索
  - zilliz
  - zilliz cloud
  - クラウド
  - alterRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# alterRole()

この操作は、既存のロールの説明を変更します。

## リクエスト構文\{#request-syntax}

```typescript
milvusClient.alterRole({ roleName, description, timeout? })
```

**PARAMETERS:**

- **roleName** (*string*) -

    変更するロールの名前。

- **description** (*string*) -

    ロールの新しい説明。

- **timeout** (*number*) -

    RPC に許可する時間をミリ秒単位で指定します（任意）。undefined に設定すると、クライアントはサーバーが応答するかエラーが発生するまで待機し続けます。デフォルトは undefined です。

**RETURNS:**

*ResStatus*

レスポンスステータスは `{error_code, reason}` の形式です。

**PARAMETERS:**

- **error_code** (*number*) -

    エラーコード番号です。0 は成功を意味します。

- **reason** (*string*) -

    エラーの原因です（存在する場合）。

**EXCEPTIONS:**

- **MilvusError**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#example}

```javascript
await milvusClient.alterRole({
  roleName: 'exampleRole',
  description: 'example role description',
});
```
