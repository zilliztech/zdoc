---
slug: /java/v1-Misc-ConsistencyLevelEnum
beta: undefined
notebook: undefined
type: origin
token: L7rWd3NvuonDAUxNVjTce9rAnXd
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
   <th>
     <td>**Type**</td>
     <td>**Code**</td>
     <td>**Description**</td>
   </th>
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
