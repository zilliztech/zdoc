---
title: "listCredUsers() | Java | v1"
slug: /java/v1-Authentication-listCredUsers
sidebar_label: "listCredUsers()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "A MilvusClient interface. This method lists all user names. | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#Th34dgQQaoByE8xLVv4cvUEInne
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listCredUsers()

A MilvusClient interface. This method lists all user names.

```java
R<ListCredUsersResponse> listCredUsers(ListCredUsersParam requestParam);
```

#### ListCredUsersParam

Use the `ListCredUsersParam.Builder` to construct a `ListCredUsersParam` object.

```java
import io.milvus.param.ListCredUsersParam;
ListCredUsersParam.Builder builder = ListCredUsersParam.newBuilder();
```

Methods of `ListCredUsersParam.Builder`:

<table>
    <tr>
        <th><p>Method</p></th>
        <th><p>Description</p></th>
        <th><p>Parameters</p></th>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>Constructs a ListCredUsersParam object.</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### Returns

This method catches all the exceptions and returns an `R<RpcStatus>` object.

- If the API fails on the server side, it returns the error code and message from the server.

- If the API fails by RPC exception, it returns `R.Status.Unknown` and the error message of the exception.

- If the API succeeds, it returns a valid `ListCredUsersResponse` held by the `R` template. You can use `ListCredUsersResponse` to get the information of users.

#### Example

```java
import io.milvus.param.*;

ListCredUsersParam param = ListCredUsersParam.newBuilder().build();
R<RpcStatus> response = client.listCredUsers(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
