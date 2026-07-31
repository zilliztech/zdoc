---
title: "ConsistencyLevelEnum | Java | v1"
slug: /java/v1-Misc-ConsistencyLevelEnum
sidebar_label: "ConsistencyLevelEnum"
beta: NEAR DEPRECATE
notebook: FALSE
description: "搜索/查询期间一致性级别的枚举。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#L7rWd3NvuonDAUxNVjTce9rAnXd
sidebar_position: 5
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# ConsistencyLevelEnum

搜索/查询期间一致性级别的枚举。

```java
package io.milvus.common.clientenum;
public enum ConsistencyLevelEnum
```

<table>
   <tr>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>代码</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>STRONG</p></td>
     <td><p>0</p></td>
     <td><p>在执行搜索/查询之前，等待所有操作完成。</p></td>
   </tr>
   <tr>
     <td><p>BOUNDED</p></td>
     <td><p>2</p></td>
     <td><p>在执行搜索/查询之前，等待某一时间跨度内的操作完成。</p></td>
   </tr>
   <tr>
     <td><p>EVENTUALLY</p></td>
     <td><p>3</p></td>
     <td><p>立即执行搜索/查询。</p></td>
   </tr>
</table>
