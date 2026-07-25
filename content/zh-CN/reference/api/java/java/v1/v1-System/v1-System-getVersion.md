---
title: "getVersion() | Java | v1"
slug: /java/v1-System-getVersion
sidebar_label: "getVersion()"
beta: NEAR DEPRECATE
notebook: FALSE
description: "MilvusClient interface. This method gets the milvus kernel version. | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#QK1rdJJazo2ZqhxClzack6ucnDc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getVersion()

MilvusClient interface. This method gets the milvus kernel version. 

<Admonition type="info" icon="📘" title="Notes">

<p>This method works for open-source Milvus, but might not work for Zilliz Cloud.</p>

</Admonition>

```java
R<GetVersionResponse> getVersion();
```

#### Returns

This method catches all the exceptions and returns an `R<CheckHealthResponse>` object.

- If the API fails on the server side, it returns the error code and message from the server.

- If the API fails by RPC exception, it returns `R.Status.Unknown` and error message of the exception.

- If the API succeeds, it returns a valid `GetVersionResponse` held by the `R` template. You can use `GetVersionResponse` to get resource group information.

#### Example

```java

R<GetVersionResponse> response = client.getVersion();

if (response.getStatus() != R.Status.Success.getCode()) {
    throw new RuntimeException(response.getMessage());
}
```

