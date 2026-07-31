---
title: "R&lt;T&gt; | Java | v1"
slug: /java/v1-Misc-RT
sidebar_label: "R&lt;T&gt;"
beta: NEAR DEPRECATE
notebook: FALSE
description: "一个模板类，用于保存每个客户端接口返回的状态码、错误消息和响应。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#An4sdhbC8oSxHZxQLzZcGfz1n4f
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# R\<T>

一个模板类，用于保存每个客户端接口返回的状态码、错误消息和响应。

```java
package io.milvus.param;
public class R<T>
```

#### R.Status\{#rstatus}

R.Status 是状态码的枚举。每个 R\<T> 对象都包含一个可映射到 R.Status 的整数值。

注意：并非所有状态码都会被使用，其中一些是保留值。

<table>
   <tr>
     <th><p><strong>状态</strong></p></th>
     <th><p><strong>代码</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p>IllegalResponse</p></td>
     <td><p>-6</p></td>
     <td><p>服务器返回的响应不正确。客户端解析响应失败。</p></td>
   </tr>
   <tr>
     <td><p>ParamError</p></td>
     <td><p>-5</p></td>
     <td><p>客户端侧的参数不合法。</p></td>
   </tr>
   <tr>
     <td><p>VersionMismatch</p></td>
     <td><p>-4</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>Unknown</p></td>
     <td><p>-3</p></td>
     <td><p>由于未知原因导致的一般错误。</p></td>
   </tr>
   <tr>
     <td><p>ClientNotConnected</p></td>
     <td><p>-2</p></td>
     <td><p>连接尚未就绪。</p></td>
   </tr>
   <tr>
     <td><p>RpcError</p></td>
     <td><p>-1</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>Success</p></td>
     <td><p>0</p></td>
     <td><p>操作成功。</p></td>
   </tr>
   <tr>
     <td><p>UnexpectedError</p></td>
     <td><p>1</p></td>
     <td><p>由意外原因引起的错误。</p></td>
   </tr>
   <tr>
     <td><p>ConnectFailed</p></td>
     <td><p>2</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>PermissionDenied</p></td>
     <td><p>3</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>CollectionNotExists</p></td>
     <td><p>4</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalArgument</p></td>
     <td><p>5</p></td>
     <td><p>服务端侧的参数不合法。</p></td>
   </tr>
   <tr>
     <td><p>IllegalDimension</p></td>
     <td><p>7</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalIndexType</p></td>
     <td><p>8</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalCollectionName</p></td>
     <td><p>9</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalTOPK</p></td>
     <td><p>10</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalRowRecord</p></td>
     <td><p>11</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalVectorID</p></td>
     <td><p>12</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalSearchResult</p></td>
     <td><p>13</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>FileNotFound</p></td>
     <td><p>14</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>MetaFailed</p></td>
     <td><p>15</p></td>
     <td><p>服务端获取元数据失败。</p></td>
   </tr>
   <tr>
     <td><p>CacheFailed</p></td>
     <td><p>16</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>CannotCreateFolder</p></td>
     <td><p>17</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>CannotCreateFile</p></td>
     <td><p>18</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>CannotDeleteFolder</p></td>
     <td><p>19</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>CannotDeleteFile</p></td>
     <td><p>20</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>BuildIndexError</p></td>
     <td><p>21</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalNLIST</p></td>
     <td><p>22</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IllegalMetricType</p></td>
     <td><p>23</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>OutOfMemory</p></td>
     <td><p>24</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>IndexNotExist</p></td>
     <td><p>25</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
   <tr>
     <td><p>EmptyCollection</p></td>
     <td><p>26</p></td>
     <td><p>*<em>此错误为保留值，当前未使用。</em></p></td>
   </tr>
</table>

#### 方法\{#methods}

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>返回值</p></th>
    </tr>
    <tr>
        <td><p>getMessage()</p></td>
        <td><p>获取错误消息。</p></td>
        <td><p>String</p></td>
    </tr>
    <tr>
        <td><p>getStatus()</p></td>
        <td><p>获取状态码。</p></td>
        <td><p>Integer</p></td>
    </tr>
    <tr>
        <td><p>getData()</p></td>
        <td><p>获取服务器返回的响应对象。</p></td>
        <td><p>RPC response class</p></td>
    </tr>
</table>

#### 示例\{#example}

```java
import io.milvus.param.*;

R<RpcStatus> response = client.dropCollection(DropCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build());
if (response.getStatus() != R.Status.Success.getCode()) {
    System.out.println(response.getMessage());
}
```
