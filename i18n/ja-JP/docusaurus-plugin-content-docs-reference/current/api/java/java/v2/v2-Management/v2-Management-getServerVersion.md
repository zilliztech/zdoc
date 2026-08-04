---
title: "getServerVersion() | Java | v2"
slug: /java/java/v2-Management-getServerVersion
sidebar_label: "getServerVersion()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、接続先サーバーのバージョン文字列を返します。 | Java | v2"
type: docx
token: FuDHdadxHoX9qSxe4aac4wzNnRh
sidebar_position: 26
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - getServerVersion()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getServerVersion()

この操作は、接続先サーバーのバージョン文字列を返します。

```java
public String getServerVersion()
```

**戻り値:**

*String*

サーバーのバージョン文字列（例: `"2.6.13"`）。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
String version = client.getServerVersion();
System.out.println(version); // "2.6.13"
```
