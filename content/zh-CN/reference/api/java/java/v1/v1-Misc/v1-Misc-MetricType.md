---
title: "MetricType | Java | v1"
slug: /java/v1-Misc-MetricType
sidebar_label: "MetricType"
beta: NEAR DEPRECATE
notebook: FALSE
description: "可用度量类型的枚举。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#DlwfdQZ94oJ4iKxxBY9c7spLnVF
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# MetricType

可用度量类型的枚举。

```java
package io.milvus.param;
public enum MetricType
```

<table>
   <tr>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p>NONE</p></td>
     <td><p>供内部使用。</p></td>
   </tr>
   <tr>
     <td><p>L2</p></td>
     <td><p>欧几里得距离。仅适用于 float 向量。</p></td>
   </tr>
   <tr>
     <td><p>IP</p></td>
     <td><p>内积。仅适用于归一化的 float 向量。</p></td>
   </tr>
   <tr>
     <td><p>COSINE</p></td>
     <td><p>余弦相似度。仅适用于 float 向量</p></td>
   </tr>
   <tr>
     <td><p>HAMMING</p></td>
     <td><p>仅适用于二进制向量。</p></td>
   </tr>
   <tr>
     <td><p>JACCARD</p></td>
     <td><p>仅适用于二进制向量。</p></td>
   </tr>
</table>
