---
title: "ConsistencyLevelEnum | Java | v1"
slug: /java/v1-Misc-ConsistencyLevelEnum
sidebar_label: "ConsistencyLevelEnum"
beta: FALSE
notebook: FALSE
description: "The enumeration for consistency level during a search/query. | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#L7rWd3NvuonDAUxNVjTce9rAnXd
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# ConsistencyLevelEnum

The enumeration for consistency level during a search/query.

```java
package io.milvus.common.clientenum;
public enum ConsistencyLevelEnum
```

<table>
   <tr>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Code</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>STRONG</p></td>
     <td><p>0</p></td>
     <td><p>Waits until all operations are completed before a search/query.</p></td>
   </tr>
   <tr>
     <td><p>BOUNDED</p></td>
     <td><p>2</p></td>
     <td><p>Waits until operations in a time span are completed before a search/query.</p></td>
   </tr>
   <tr>
     <td><p>EVENTUALLY</p></td>
     <td><p>3</p></td>
     <td><p>Executes a search/query immediately.</p></td>
   </tr>
</table>
