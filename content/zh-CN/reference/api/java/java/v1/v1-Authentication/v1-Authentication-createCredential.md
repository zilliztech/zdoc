---
title: "createCredential() | Java | v1"
slug: /java/v1-Authentication-createCredential
sidebar_label: "createCredential()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个 MilvusClient 接口。此方法使用给定的用户名和密码创建凭证。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#UqkRdXxUhoXGjSxCm9BcFNwPnod
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createCredential()

一个 MilvusClient 接口。此方法使用给定的用户名和密码创建凭证。

```java
R<RpcStatus> createCredential(CreateCredentialParam requestParam);
```

#### CreateCredentialParam\{#createcredentialparam}

使用 `CreateCredentialParam.Builder` 构造 `CreateCredentialParam` 对象。

```java
import io.milvus.param.CreateCredentialParam;
CreateCredentialParam.Builder builder = CreateCredentialParam.newBuilder();
```

`CreateCredentialParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withUsername(String username)</p></td>
        <td><p>设置用户名。用户名不能为空或 null。</p></td>
        <td><p>username：用于创建凭证的用户名。</p></td>
    </tr>
    <tr>
        <td><p>withPassword(String password)</p></td>
        <td><p>设置密码。密码不能为空或 null。</p></td>
        <td><p>password：用于创建凭证的对应密码。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 CreateCredentialParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`CreateCredentialParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### 返回值\{#returns}

此方法会捕获所有异常，并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### 示例\{#example}

```java
import io.milvus.param.*;

CreateCredentialParam param = CreateCredentialParam.newBuilder()
        .withUsername("user")
        .withPassword("password")
        .build();
R<RpcStatus> response = client.createCredential(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
