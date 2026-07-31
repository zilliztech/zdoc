---
title: "IndexType | Java | v1"
slug: /java/v1-Misc-IndexType
sidebar_label: "IndexType"
beta: NEAR DEPRECATE
notebook: FALSE
description: "可用索引类型的枚举。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#YvosdUhmtokAqRxV8hdctSUznCv
sidebar_position: 3
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# IndexType

可用索引类型的枚举。

```java
package io.milvus.param;
public enum IndexType
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
     <td><p>FLAT</p></td>
     <td><p>1</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>IVF_FLAT</p></td>
     <td><p>2</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>IVF_SQ8</p></td>
     <td><p>3</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>IVF_PQ</p></td>
     <td><p>4</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>HNSW</p></td>
     <td><p>5</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>DISKANN</p></td>
     <td><p>10</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>AUTOINDEX</p></td>
     <td><p>11</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。自动索引参数在 milvus.yaml 中定义。</p></td>
   </tr>
   <tr>
     <td><p>SCANN</p></td>
     <td><p>12</p></td>
     <td><p>适用于 FloatVector/Float16Vector/BFloat16Vector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>GPU_IVF_FLAT</p></td>
     <td><p>50</p></td>
     <td><p>仅适用于 FloatVector 类型字段。仅在服务器处于 GPU 模式时生效。</p></td>
   </tr>
   <tr>
     <td><p>GPU_IVF_PQ</p></td>
     <td><p>51</p></td>
     <td><p>仅适用于 FloatVector 类型字段。仅在服务器处于 GPU 模式时生效。</p></td>
   </tr>
   <tr>
     <td><p>GPU_BRUTE_FORCE</p></td>
     <td><p>52</p></td>
     <td><p>仅适用于 FloatVector 类型字段。仅在服务器处于 GPU 模式时生效。</p></td>
   </tr>
   <tr>
     <td><p>GPU_CAGRA</p></td>
     <td><p>53</p></td>
     <td><p>仅适用于 FloatVector 类型字段。仅在服务器处于 GPU 模式时生效。</p></td>
   </tr>
   <tr>
     <td><p>BIN_FLAT</p></td>
     <td><p>80</p></td>
     <td><p>仅适用于 BinaryVector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>BIN_IVF_FLAT</p></td>
     <td><p>81</p></td>
     <td><p>仅适用于 BinaryVector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>TRIE</p></td>
     <td><p>100</p></td>
     <td><p>仅适用于 VarChar 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>STL_SORT</p></td>
     <td><p>200</p></td>
     <td><p>仅适用于数值类型字段。</p></td>
   </tr>
   <tr>
     <td><p>INVERTED</p></td>
     <td><p>201</p></td>
     <td><p>适用于除 JSON 类型字段外的所有标量字段。</p></td>
   </tr>
   <tr>
     <td><p>SPARSE_INVERTED_INDEX</p></td>
     <td><p>300</p></td>
     <td><p>仅适用于 SparseFloatVector 类型字段。</p></td>
   </tr>
   <tr>
     <td><p>SPARSE_WAND</p></td>
     <td><p>301</p></td>
     <td><p>仅适用于 SparseFloatVector 类型字段。</p></td>
   </tr>
</table>
