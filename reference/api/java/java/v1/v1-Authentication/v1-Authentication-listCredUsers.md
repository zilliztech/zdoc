---
slug: /java/v1-Authentication-listCredUsers
beta: FALSE
notebook: FALSE
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

#### ListCredUsersParam{#listcredusersparam}

Use the `ListCredUsersParam.Builder` to construct a `ListCredUsersParam` object.

```java
import io.milvus.param.ListCredUsersParam;
ListCredUsersParam.Builder builder = ListCredUsersParam.newBuilder();
```

Methods of `ListCredUsersParam.Builder`:

<table>
    <tr>
        <th>Method</th>
        <th>Description</th>
        <th>Parameters</th>
    </tr>
    <tr>
        <td>build()</td>
        <td>Constructs a ListCredUsersParam object.</td>
        <td>N/A</td>
    </tr>
</table>

#### Returns{#returns}

This method catches all the exceptions and returns an `R<RpcStatus>` object.

- If the API fails on the server side, it returns the error code and message from the server.

- If the API fails by RPC exception, it returns `R.Status.Unknown` and the error message of the exception.

- If the API succeeds, it returns a valid `ListCredUsersResponse` held by the `R` template. You can use `ListCredUsersResponse` to get the information of users.

#### Example{#example}

```java
import io.milvus.param.*;

ListCredUsersParam param = ListCredUsersParam.newBuilder().build();
R<RpcStatus> response = client.listCredUsers(param)
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
