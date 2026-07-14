---
title: "addUserToRole() | Node.js"
slug: /node/node/Authentication-addUserToRole
sidebar_label: "addUserToRole()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザーを特定のロールに追加します。 | Node.js"
type: docx
token: Qc72dTKgroNdHjxIG2xcwNdmnHb
sidebar_position: 2
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - 動画重複排除
  - 動画類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - addUserToRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# addUserToRole()

この操作は、ユーザーを特定のロールに追加します。

```javascript
await milvusClient.addUserToRole(data)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.addUserToRole({
   username: string,
   rolename: string,
   timeout?: number
 })
```

**パラメータ:**

- **username** (*string*) -

    **[必須]**

    ユーザー名。

- **rolename** (*string*) -

    **[必須]**

    ロール名

- **timeout** (*number*) -  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise\<ResStatus>*

このメソッドは、**ResStatus** オブジェクトに解決される promise を返します。

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**パラメータ:**

- **code** (*number*) -

    操作結果を示すコードです。この操作が成功した場合は **0** のままです。

- **error_code** (*string* | *number*) -

    発生したエラーを示すエラーコードです。この操作が成功した場合は **Success** のままです。 

- **reason** (*string*) - 

    報告されたエラーの理由を示す理由です。この操作が成功した場合は空文字列のままです。

## 例\{#example}

```java
await milvusClient.addUserToRole({
    username: 'myUser',
    roleName: 'myRole'
});
```

