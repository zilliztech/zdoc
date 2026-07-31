---
title: "selectRole() | Java | v1"
slug: /java/v1-RBAC-selectRole
sidebar_label: "selectRole()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法获取某个角色的所有用户信息。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#AKADdJj4koIqW2xzNV7cEd5kn4d
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# selectRole()

MilvusClient 接口。此方法获取某个角色的所有用户信息。

```java
R<SelectRoleResponse> selectRole(SelectRoleParam requestParam);
```

#### SelectRoleParam\{#selectroleparam}

使用 `SelectRoleParam.Builder` 构造 `SelectRoleParam` 对象。

```java
import io.milvus.param.SelectRoleParam;
SelectRoleParam.Builder builder = SelectRoleParam.newBuilder();
```

`SelectRoleParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>描述</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withRoleName(String roleName)</p></td>
        <td><p>设置 roleName。RoleName 不能为空或 null。</p></td>
        <td><p>roleName: 用于创建权限的角色名称。</p></td>
    </tr>
    <tr>
        <td><p>withIncludeUserInfo(boolean includeUserInfo)</p></td>
        <td><p>设置 includeUserInfo。includeUserInfo 默认为 false。</p></td>
        <td><p>includeUserInfo: 是否包含用户信息。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 SelectRoleParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`SelectRoleParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时出错。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<SelectRoleResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误信息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 以及该异常的错误信息。

- 如果 API 调用成功，则返回由 `R` 模板持有的有效 `SelectRoleResponse`。你可以使用 `SelectRoleResponse` 获取角色信息。

#### Example\{#example}

```java
import io.milvus.param.SelectRoleParam;

R<SelectRoleResponse> response = client.selectRole(SelectRoleParam.newBuilder()
            .withRoleName(roleName)
            .build());

if (response.getStatus() != R.Status.Success.getCode()) {
    throw new RuntimeException(response.getMessage());
}
```
