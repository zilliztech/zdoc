---
title: "DataType | Java | v1"
slug: /java/v1-Misc-DataType
sidebar_label: "DataType"
beta: NEAR DEPRECATE
notebook: FALSE
description: "由 RPC proto 定义的可用数据类型枚举。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#MdMXdCNstouL1fxstYbcfzc9nTc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# DataType

由 RPC proto 定义的可用数据类型枚举。

```java
package io.milvus.grpc;
public enum DataType
```

<table>
   <tr>
     <th><p><strong>类型</strong></p></th>
     <th><p><strong>代码</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>None</p></td>
     <td><p>0</p></td>
     <td><p>供内部使用。</p></td>
   </tr>
   <tr>
     <td><p>Bool</p></td>
     <td><p>1</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Int8</p></td>
     <td><p>2</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Int16</p></td>
     <td><p>3</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Int32</p></td>
     <td><p>4</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Int64</p></td>
     <td><p>5</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Float</p></td>
     <td><p>10</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Double</p></td>
     <td><p>11</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>String</p></td>
     <td><p>20</p></td>
     <td><p>保留。请勿使用。</p></td>
   </tr>
   <tr>
     <td><p>VarChar</p></td>
     <td><p>21</p></td>
     <td><p>可变长度字符串，对最大长度有限制。</p></td>
   </tr>
   <tr>
     <td><p>Array</p></td>
     <td><p>22</p></td>
     <td><p>数组数据类型。元素类型可以是以下数据类型之一：Int8、Int16、Int32、Int64、Varchar、Bool、Float 或 Double。</p></td>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>23</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>BinaryVector</p></td>
     <td><p>100</p></td>
     <td><p>二进制向量。每个维度由 1 bit 表示。</p></td>
   </tr>
   <tr>
     <td><p>FloatVector</p></td>
     <td><p>101</p></td>
     <td><p>Float 向量。每个维度由 1 个 float（4 bits）值表示。</p></td>
   </tr>
   <tr>
     <td><p>Float16Vector</p></td>
     <td><p>102</p></td>
     <td><p>Float16 向量。每个维度都是一个 16 位半精度浮点数。</p></td>
   </tr>
   <tr>
     <td><p>BFloat16Vector</p></td>
     <td><p>103</p></td>
     <td><p>BFloat16 向量。每个维度都是一个 16 位浮点数，精度较低，但指数范围与 Float32 相同。</p></td>
   </tr>
   <tr>
     <td><p>SparseFloatVector</p></td>
     <td><p>104</p></td>
     <td><p>稀疏向量使用向量嵌入表示单词或短语，其中大多数元素为零。稀疏向量是键值对列表，键类型为无符号整数，值类型为 Float32。</p></td>
   </tr>
</table>
