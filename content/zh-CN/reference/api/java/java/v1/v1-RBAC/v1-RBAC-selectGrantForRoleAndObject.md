---
title: "selectGrantForRoleAndObject() | Java | v1"
slug: /java/v1-RBAC-selectGrantForRoleAndObject
sidebar_label: "selectGrantForRoleAndObject()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient 接口。此方法列出某个角色的授权信息。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#CaRWdR3PRop7dMxejYXcvsrMnXg
sidebar_position: 10
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# selectGrantForRoleAndObject()

MilvusClient 接口。此方法列出某个角色的授权信息。

```java
R<SelectGrantResponse> selectGrantForRoleAndObject(SelectGrantForRoleAndObjectParam requestParam);
```

#### SelectGrantForRoleAndObjectParam\{#selectgrantforroleandobjectparam}

使用 `SelectGrantForRoleAndObjectParam.Builder` 构造 `SelectGrantForRoleAndObjectParam` 对象。

```java
import io.milvus.param.SelectGrantForRoleAndObjectParam;
SelectGrantForRoleAndObjectParam.Builder builder = SelectGrantForRoleAndObjectParam.newBuilder();
```

`SelectGrantForRoleAndObjectParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withRoleName(String roleName)</p></td>
        <td><p>设置 roleName。roleName 不能为空或 null。</p></td>
        <td><p>roleName：角色名称。</p></td>
    </tr>
    <tr>
        <td><p>withObject(String object)</p></td>
        <td><p>设置 object。object 不能为空或 null。</p></td>
        <td><p>object：Milvus 中被授予权限的对象，例如 collection、partition 和 database。</p></td>
    </tr>
    <tr>
        <td><p>withObjectName(String objectName)</p></td>
        <td><p>设置 objectName。objectName 不能为空或 null。</p></td>
        <td><p>objectName：对象名称。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 SelectGrantForRoleAndObjectParam 对象。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

`SelectGrantForRoleAndObjectParam.Builder.build()` 可能抛出以下异常：

- ParamException：当参数无效时发生错误。

#### Returns\{#returns}

此方法会捕获所有异常，并返回一个 `R<SelectGrantResponse>` 对象。

- 如果 API 在服务端执行失败，则返回来自服务端的错误码和错误消息。

- 如果 API 因 RPC 异常而失败，则返回 `R.Status.Unknown` 和该异常的错误消息。

- 如果 API 执行成功，则返回由 `R` 模板承载的有效 `SelectGrantResponse`。你可以使用 `SelectGrantResponse` 获取授权信息。

#### Example\{#example}

```java
import io.milvus.param.SelectGrantForRoleParam;

R<SelectGrantResponse> response = client.selectGrantForRoleAndObject(SelectGrantForRoleAndObjectParam.newBuilder()
        .withRoleName(roleName)
        .withObject(objectType)
        .withObjectName(objectName)
        .build());

if (response.getStatus() != R.Status.Success.getCode()) {
    throw new RuntimeException(response.getMessage());
}
```
