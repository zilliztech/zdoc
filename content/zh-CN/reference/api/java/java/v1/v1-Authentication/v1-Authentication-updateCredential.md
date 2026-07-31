---
title: "updateCredential() | Java | v1"
slug: /java/v1-Authentication-updateCredential
sidebar_label: "updateCredential()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法会更新给定用户名对应的密码。必须提供原始用户名和密码，以检查更新操作是否有效。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#GqZldXhBwoOd1Vx1k36co7scnEL
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# updateCredential()

MilvusClient 接口。此方法会更新给定用户名对应的密码。必须提供原始用户名和密码，以检查更新操作是否有效。 

<Admonition type="info" icon="📘" title="更新凭据时，Milvus 客户端不会更新对应的连接。因此，原始连接可能失效。">

</Admonition>

```java
R<RpcStatus> updateCredential(UpdateCredentialParam requestParam);
```

#### UpdateCredentialParam\{#updatecredentialparam}

使用 `UpdateCredentialParam.Builder` 构造 `UpdateCredentialParam` 对象。

```java
import io.milvus.param.UpdateCredentialParam;
UpdateCredentialParam.Builder builder = UpdateCredentialParam.newBuilder();
```

`UpdateCredentialParam.Builder` 的方法：

<table>
    <tr>
        <th><p>withUsername(String username)</p></th>
        <th><p>设置用户名。用户名不能为空或 null。</p></th>
        <th><p>username：用户名。</p></th>
    </tr>
    <tr>
        <td><p>withUsername(String username)</p></td>
        <td><p>设置用户名。用户名不能为空或 null。</p></td>
        <td><p>username：用户名。</p></td>
    </tr>
    <tr>
        <td><p>withOldPassword(String password)</p></td>
        <td><p>设置旧密码。旧密码不能为空或 null。</p></td>
        <td><p>password：旧密码。</p></td>
    </tr>
    <tr>
        <td><p>withNewPassword(String password)</p></td>
        <td><p>设置新密码。新密码不能为空或 null。</p></td>
        <td><p>password：新密码。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 UpdateCredentialParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`UpdateCredentialParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

UpdateCredentialParam param = UpdateCredentialParam.newBuilder()
        .withUsername("user")
        .withOldPassword("old_password")
        .withNewPassword("new_password")
        .build();
R<RpcStatus> response = client.updateCredential(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
