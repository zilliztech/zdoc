---
title: "LogLevel | Java | v1"
slug: /java/v1-Misc-LogLevel
sidebar_label: "LogLevel"
beta: NEAR DEPRECATE
notebook: FALSE
description: "用于在运行时设置日志级别的枚举。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#GqbrdhNhkooVlLxepyPcCB0unhg
sidebar_position: 6
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# LogLevel

用于在运行时设置日志级别的枚举。

```java
package io.milvus.param;
public enum LogLevel
```

<table>
   <tr>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p>Debug</p></td>
     <td><p>Debug 级别，所有日志均可见。</p></td>
   </tr>
   <tr>
     <td><p>Info</p></td>
     <td><p>Debug 级别、信息、警告和错误日志可见。</p></td>
   </tr>
   <tr>
     <td><p>Warning</p></td>
     <td><p>Debug 级别、警告和错误日志可见。</p></td>
   </tr>
   <tr>
     <td><p>Error</p></td>
     <td><p>Error 级别，仅错误日志可见。</p></td>
   </tr>
</table>
