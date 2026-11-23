---
title: "listPrivilegeGroups() | Node.js"
slug: /node/node/Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有权限组。 | Node.js"
type: docx
token: HGpSdc7AOo7AV3xKCmOcWaIEnrd
sidebar_position: 19
keywords: 
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - listPrivilegeGroups()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listPrivilegeGroups()

此操作会列出所有权限组。

```javascript
await milvusClient.listPrivilegeGroups(data?)
```

## 请求语法\{#request-syntax}

```javascript
 milvusClient.listPrivilegeGroups({
   timeout?: number
 })
```

**参数：**

- **timeout** （*number*）  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回：**

*Promise&lt;ListPrivilegeGroupsResponse&gt;*

此方法返回一个 Promise，该 Promise 会解析为 **ListPrivilegeGroupsResponse** 对象。

```javascript
{
    privilege_groups: PrivelegeGroup[],
    status:  ResStatus
}
```

**参数：**

- **privilege_groups** (*[PrivelegeGroup](./Authentication-PrivelegeGroup)[]*) -

当前 Milvus 实例中定义的所有权限组列表。

    - **group_name** （*string*） -

        权限组的名称。

    - **privileges** (*[PrivilegeEntity](./Authentication-PrivilegeEntity)[]*) -

        组中包含的权限。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code** （*number*） -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** （*string* | *number*） -

        表示所发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** （*string*） -

        说明所报告错误的原因。如果此操作成功，则其值为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
await milvusClient.listPrivilegeGroups();
```

