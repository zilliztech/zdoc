---
title: "selectUser() | Java | v1"
slug: /java/v1-RBAC-selectUser
sidebar_label: "selectUser()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法获取用户拥有的所有角色。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#KkFWd37sBoF0XrxMhNHcGWDVnYg
sidebar_position: 6
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# selectUser()

MilvusClient 接口。此方法获取用户拥有的所有角色。

```java
R<SelectUserResponse> selectUser(SelectUserParam requestParam);
```

#### SelectUserParam\{#selectuserparam}

使用 `SelectUserParam.Builder` 构造 `SelectUserParam` 对象。

```java
import io.milvus.param.SelectUserParam;
SelectUserParam.Builder builder = SelectUserParam.newBuilder();
```

`SelectUserParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withUsername(String username)</p></td>
        <td><p>设置用户名。用户名不能为空或 null。</p></td>
        <td><p>username: 用户名。</p></td>
    </tr>
    <tr>
        <td><p>withIncludeRoleInfo(boolean includeRoleInfo)</p></td>
        <td><p>设置 includeRoleInfo。默认值为 false。</p></td>
        <td><p>includeRoleInfo: 是否包含角色信息。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 SelectUserParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`SelectUserParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<SelectUserResponse>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板持有的有效 `SelectUserResponse`。您可以使用 `SelectUserResponse` 获取用户信息。

#### Example\{#example}

```java
import io.milvus.param.SelectUserParam;

R<SelectUserResponse> response = client.selectUser(SelectUserParam.newBuilder()
            .withUsername(userName)
            .build());

if (response.getStatus() != R.Status.Success.getCode()) {
    throw new RuntimeException(response.getMessage());
}
```
