---
title: "addUserToRole() | Java | v1"
slug: /java/v1-RBAC-addUserToRole
sidebar_label: "addUserToRole()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法将用户添加到角色中。该用户将获得该角色被允许执行操作的权限。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#Fqz8d1jZpofjR4x6sARctkAFnzg
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addUserToRole()

MilvusClient 接口。此方法将用户添加到角色中。该用户将获得该角色被允许执行操作的权限。

```java
R<RpcStatus> addUserToRole(AddUserToRoleParam requestParam);
```

#### AddUserToRoleParam\{#addusertoroleparam}

使用 `AddUserToRoleParam.Builder` 构造 `AddUserToRoleParam` 对象。

```java
import io.milvus.param.AddUserToRoleParam;
AddUserToRoleParam.Builder builder = AddUserToRoleParam.newBuilder();
```

`AddUserToRoleParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withRoleName(String roleName)</p></td>
        <td><p>设置 roleName。RoleName 不能为空或 null。</p></td>
        <td><p>roleName：用于创建权限的角色名称。</p></td>
    </tr>
    <tr>
        <td><p>withUsername(String username)</p></td>
        <td><p>设置 username。Username 不能为空或 null。</p></td>
        <td><p>username：用户名。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 AddUserToRoleParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`AddUserToRoleParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端失败，将返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，将返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 成功，将返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.AddUserToRoleParam;

R<RpcStatus> response = client.addUserToRole(AddUserToRoleParam.newBuilder()
            .withRoleName(roleName)
            .withUserName(userName)
            .build());

if (response.getStatus() != R.Status.Success.getCode()) {
    throw new RuntimeException(response.getMessage());
}
```
