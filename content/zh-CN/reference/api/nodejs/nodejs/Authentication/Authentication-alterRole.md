---
title: "alterRole() | Node.js"
slug: /node/node/Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改现有角色的描述。 | Node.js"
type: docx
token: Fvw0dyRalo2ceVxdY4Fcf9uTnBg
sidebar_position: 30
keywords: 
  - LLM 作为评判者
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - alterRole()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterRole()

此操作会修改现有角色的描述。

## 请求语法\{#request-syntax}

```typescript
milvusClient.alterRole({ roleName, description, timeout? })
```

**参数：**

- **roleName** (*string*) -

    要修改的角色的名称。

- **description** (*string*) -

    新的角色描述。

- **timeout** (*number*) -

    允许 RPC 执行的以毫秒为单位的可选时长。如果将其设置为 undefined，客户端会一直等待，直到服务器响应或发生错误。默认值为 undefined。

**返回：**

*ResStatus*

响应状态的形式为 `{error_code, reason}`。

**参数：**

- **error_code** (*number*) -

    错误代码：0 表示成功。

- **reason** (*string*) -

    错误原因（如有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时引发此异常。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.alterRole({
  roleName: 'exampleRole',
  description: 'example role description',
});
```
