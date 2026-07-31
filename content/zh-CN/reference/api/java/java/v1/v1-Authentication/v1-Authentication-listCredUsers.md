---
title: "listCredUsers() | Java | v1"
slug: /java/v1-Authentication-listCredUsers
sidebar_label: "listCredUsers()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法列出所有用户名。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#Th34dgQQaoByE8xLVv4cvUEInne
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listCredUsers()

MilvusClient 接口。此方法列出所有用户名。

```java
R<ListCredUsersResponse> listCredUsers(ListCredUsersParam requestParam);
```

#### ListCredUsersParam\{#listcredusersparam}

使用 `ListCredUsersParam.Builder` 构造 `ListCredUsersParam` 对象。

```java
import io.milvus.param.ListCredUsersParam;
ListCredUsersParam.Builder builder = ListCredUsersParam.newBuilder();
```

`ListCredUsersParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 ListCredUsersParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回来自服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 调用成功，则返回由 `R` 模板持有的有效 `ListCredUsersResponse`。你可以使用 `ListCredUsersResponse` 获取用户信息。

#### 示例\{#example}

```java
import io.milvus.param.*;

ListCredUsersParam param = ListCredUsersParam.newBuilder().build();
R<RpcStatus> response = client.listCredUsers(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
