---
slug: /java/v1-Misc-MetricType
beta: FALSE
notebook: FALSE
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#DlwfdQZ94oJ4iKxxBY9c7spLnVF
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# MetricType

The enumeration for available metric types.

```java
package io.milvus.param;
public enum MetricType
```

<table>
   <tr>
     <th><strong>Type</strong></th>
     <th><strong>Description</strong></th>
   </tr>
   <tr>
     <td>NONE</td>
     <td>For internal usage.</td>
   </tr>
   <tr>
     <td>L2</td>
     <td>Euclidean distance. Only for float vectors.</td>
   </tr>
   <tr>
     <td>IP</td>
     <td>Inner product. Only for normalized float vectors.</td>
   </tr>
   <tr>
     <td>COSINE</td>
     <td>Cosine similarity. Only for float vectors</td>
   </tr>
   <tr>
     <td>HAMMING</td>
     <td>Only for binary vectors.</td>
   </tr>
   <tr>
     <td>JACCARD</td>
     <td>Only for binary vectors.</td>
   </tr>
</table>
