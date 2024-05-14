---
slug: /java/v1-Misc-ConsistencyLevelEnum
beta: FALSE
notebook: FALSE
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
     <th><strong>Type</strong></th>
     <th><strong>Code</strong></th>
     <th><strong>Description</strong></th>
   </tr>
   <tr>
     <td>STRONG</td>
     <td>0</td>
     <td>Waits until all operations are completed before a search/query.</td>
   </tr>
   <tr>
     <td>BOUNDED</td>
     <td>2</td>
     <td>Waits until operations in a time span are completed before a search/query.</td>
   </tr>
   <tr>
     <td>EVENTUALLY</td>
     <td>3</td>
     <td>Executes a search/query immediately.</td>
   </tr>
</table>
