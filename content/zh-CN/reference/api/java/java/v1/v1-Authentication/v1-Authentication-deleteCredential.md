---
title: "deleteCredential() | Java | v1"
slug: /java/v1-Authentication-deleteCredential
sidebar_label: "deleteCredential()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法用于删除对应用户名的凭证。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#BImddM2M9oepyDxuwcEcXZvOnfe
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# deleteCredential()

MilvusClient 接口。此方法用于删除对应用户名的凭证。

```java
R<RpcStatus> deleteCredential(DeleteCredentialParam requestParam);
```

#### DeleteCredentialParam\{#deletecredentialparam}

使用 `DeleteCredentialParam.Builder` 构建 `DeleteCredentialParam` 对象。

```java
import io.milvus.param.DeleteCredentialParam;
DeleteCredentialParam.Builder builder = DeleteCredentialParam.newBuilder();
```

`DeleteCredentialParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withUsername(String username)</p></td>
        <td><p>设置用户名。用户名不能为空或为 null。</p></td>
        <td><p>username：用于删除凭证的用户名。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构建一个 DeleteCredentialParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`DeleteCredentialParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时抛出错误。

#### Returns\{#returns}

此方法会捕获所有异常并返回一个 `R<RpcStatus>` 对象。

- 如果 API 在服务端执行失败，则返回来自服务端的错误码和错误消息。

- 如果 API 因 RPC 异常失败，则返回 `R.Status.Unknown` 以及该异常的错误消息。

- 如果 API 执行成功，则返回 `R.Status.Success`。

#### Example\{#example}

```java
import io.milvus.param.*;

DeleteCredentialParam param = DeleteCredentialParam.newBuilder()
        .withUsername("user")
        .build();
R<RpcStatus> response = client.deleteCredential(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
