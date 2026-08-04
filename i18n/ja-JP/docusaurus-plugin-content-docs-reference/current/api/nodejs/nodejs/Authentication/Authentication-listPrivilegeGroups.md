---
title: "listPrivilegeGroups() | Node.js"
slug: /node/node/Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はすべての privilege group を一覧表示します。 | Node.js"
type: docx
token: HGpSdc7AOo7AV3xKCmOcWaIEnrd
sidebar_position: 19
keywords: 
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - listPrivilegeGroups()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPrivilegeGroups()

この操作はすべての privilege group を一覧表示します。

```javascript
await milvusClient.listPrivilegeGroups(data?)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.listPrivilegeGroups({
   timeout?: number
 })
```

**パラメーター:**

- **timeout** (*number*)  

    この操作のタイムアウト時間。 

    **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値** *Promise&lt;ListPrivilegeGroupsResponse&gt;*

このメソッドは、**ListPrivilegeGroupsResponse** オブジェクトに解決される promise を返します。

```typescript
{
    privilege_groups: PrivelegeGroup[],
    status:  ResStatus
}
```

**パラメーター:**

- **privilege_groups** (*PrivelegeGroup[]*) -<br/>
  現在の Milvus インスタンスで定義されている privilege group の一覧。

    - **group_name** (*string*) -

        privilege group の名前。

    - **privileges** (*PrivilegeEntity[]*) -

        グループに含まれる権限。

        - **name** (*string*) -

        権限名（例: **Insert**、**Search**、**CreateCollection**）。

        - **name** (*string*) -

            権限名（例: **Insert**、**Search**、**CreateCollection**）。

- **ResStatus**<br/>
  **ResStatus** オブジェクト。

    - **code** (*number*) -

        操作結果を示すコード。この操作が成功した場合は **0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコード。この操作が成功した場合は **Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由。この操作が成功した場合は空文字列のままです。

## Example\{#example}

```java
await milvusClient.listPrivilegeGroups();
```

