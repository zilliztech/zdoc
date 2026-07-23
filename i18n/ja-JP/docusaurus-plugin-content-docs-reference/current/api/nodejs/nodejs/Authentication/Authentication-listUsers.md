---
title: "listUsers() | Node.js"
slug: /node/node/Authentication-listUsers
sidebar_label: "listUsers()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は現在利用可能なユーザーを一覧表示します。 | Node.js"
type: docx
token: Z0EOd1PXooNeowx4SQgcq3synBc
sidebar_position: 21
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - listUsers()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listUsers()

この操作は現在利用可能なユーザーを一覧表示します。

```javascript
await milvusClient.listUsers(data)
```

## リクエスト構文\{#request-syntax}

```javascript
milvusClient.listUsers()
```

**パラメーター:**

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;ListCredUsersResponse&gt;*

このメソッドは、**ListCredUsersResponse** オブジェクトに解決される promise を返します。

```typescript
{
    usernames: string[],
    status:  ResStatus
}
```

**パラメーター:**

- **usernames** (*string[]*) -<br/>
  現在の Milvus インスタンスに存在するユーザー名のリスト。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示します。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
milvusClient.listUsers()
```

