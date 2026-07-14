---
title: "deleteUser() | Node.js"
slug: /node/node/Authentication-deleteUser
sidebar_label: "deleteUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーを削除します。 | Node.js"
type: docx
token: Cl5PdhU5jouHnrxyYXLcOQAZneb
sidebar_position: 8
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - deleteUser()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# deleteUser()

この操作はユーザーを削除します。

```javascript
await milvusClient.deleteUser(data)
```

## Request Syntax\{#request-syntax}

このメソッドには次の代替構文があります。

```javascript
await milvusClient.deleteUser({
    username: string,
    timeout?: number
})
```

**PARAMETERS:**

- **username** (*string*) -

    **[REQUIRED]**

    削除するユーザーの名前。

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURNS** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    操作結果を示すコード。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
await milvusClient.deleteUser({
    username: 'exampleUser'
})
```

