---
title: "支持的对象存储 | Cloud"
slug: /data-import-storage-options
sidebar_key: data-import-storage-options
sidebar_label: "支持的对象存储"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在导入数据前，您需要了解 Zilliz Cloud 支持的存储方式及对应的 URL 格式，以确保 Zilliz Cloud 可以正确处理您的上传请求，避免验证失败。 | Cloud"
type: origin
token: HaxowqeGdi8uyakrLc9c6Lb0nEb
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据导入
  - 支持的对象存储
  - aliyun
  - 阿里云
  - tencent cloud
  - 腾讯云

---

import Admonition from '@theme/Admonition';


# 支持的对象存储

在导入数据前，您需要了解 Zilliz Cloud 支持的存储方式及对应的 URL 格式，以确保 Zilliz Cloud 可以正确处理您的上传请求，避免验证失败。

## 阿里云 OSS\{#aliyun-oss}

- **对象访问 URI**

    <table>
       <tr>
         <th><p>URI Style</p></th>
         <th><p>URI</p></th>
       </tr>
       <tr>
         <td><p>公共访问 URL</p></td>
         <td><ul><li><p><strong>文件</strong>：<i>http</i>s://&lt;bucket_name&gt;.oss-&lt;region_code&gt;.aliyuncs.com/&lt;object_name&gt;</p></li><li><p><strong>文件夹</strong>：https://&lt;bucket_name&gt;.oss-&lt;region_code&gt;.aliyuncs.com/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
       <tr>
         <td><p>OSS URI</p></td>
         <td><ul><li><p><strong>文件</strong>: oss://&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>文件夹</strong>: oss://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
    </table>

关于如何填写 &lt;region_code&gt;，可以参考 [OSS 访问域名使用规则](https://help.aliyun.com/zh/oss/user-guide/regions-and-endpoints)中的地域 ID。

- **Required permissions**

    - `oss:GetObject`

    - `oss:ListObjects`

- **获取凭证**

    基于您的数据安全要求，可以在数据导入时使用 Access Key 或 STS Token 临时凭证方案。

    - 如果您希望使用长期 Access Key，强烈建议您创建专用于 API 访问的 RAM 用户，并为其创建 Access Key。具体步骤可以参考[创建阿里云 Access Key](https://help.aliyun.com/zh/ram/user-guide/create-an-accesskey-pair)。

    - 如果您希望使用 STS Token 临时凭证方案，可以参考 [临时访问凭证](https://help.aliyun.com/zh/oss/developer-reference/use-temporary-access-credentials-provided-by-sts-to-access-oss)

## 腾讯云 COS\{#tencent-cloud-cos}

- **对象访问 URI**

<table>
   <tr>
     <th><p><strong>URI Style</strong></p></th>
     <th><p><strong>URI</strong></p></th>
   </tr>
   <tr>
     <td><p>对象访问 URL</p></td>
     <td><ul><li><p><strong>文件</strong>：<i>http</i>s://&lt;bucket_name&gt;.cos.&lt;region_code&gt;.myqcloud.com/&lt;object_name&gt;</p></li><li><p><strong>文件夹</strong>：https://&lt;bucket_name&gt;.cos.&lt;region_code&gt;.myqcloud.com/&lt;folder_name&gt;/</p></li></ul></td>
   </tr>
</table>

关于如何填写 &lt;region_code&gt;，可以参考[地域和可用区](https://www.tencentcloud.com/zh/document/product/239/4106)。

关于如何获取对象访问 URL，请参考[导出对象 URL](https://www.tencentcloud.com/zh/document/product/436/42391)。

- **Required permissions**

    - `cos:GetBucket`

    - `cos:GetObject`

    - `cos:HeadObject`

- **获取凭证**

    基于您的数据安全要求，可以在数据导入时使用 Access Key 或 STS Token 临时凭证方案。

    - 如果您希望使用长期 Access Key，强烈建议您创建专用于 API 访问的 RAM 用户，并为其创建 Access Key。具体步骤可以参考[创建密钥](https://cloud.tencent.com/document/product/598/40488)。

    - 如果您希望使用 STS Token 临时凭证方案，可以参考 [创建临时密钥](https://cloud.tencent.com/document/product/436/14048)

## 亚马逊云科技 S3\{#amazon-cn-s3}

- **对象访问 URI**

<table>
   <tr>
     <th><p><strong>URI Style</strong></p></th>
     <th><p><strong>URI</strong></p></th>
   </tr>
   <tr>
     <td><p>virtual-hosted–style</p></td>
     <td><ul><li><p><strong>文件</strong>：<i>http</i>s://&lt;bucket_name&gt;.s3.&lt;region_code&gt;.amazonaws.com.cn/&lt;object_name&gt;</p></li><li><p><strong>文件夹</strong>：https://&lt;bucket_name&gt;.s3.&lt;region_code&gt;.amazonaws.com.cn/&lt;folder_name&gt;/</p></li></ul></td>
   </tr>
   <tr>
     <td><p>path-style</p></td>
     <td><ul><li><p><strong>文件</strong>：<i>http</i>s://s3.&lt;region_code&gt;.amazonaws.com.cn/&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>文件夹</strong>：https://s3.&lt;region_code&gt;.amazonaws.com.cn/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
   </tr>
   <tr>
     <td><p>S3 URI</p></td>
     <td><ul><li><p><strong>文件</strong>：s3://&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>文件夹</strong>：s3://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
   </tr>
</table>

当前仅支持亚马逊云科技中国（宁夏），因此，&lt;region_code&gt; 为 `northwest-1`。

- **Required permissions**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

- **获取凭证**

    基于您的数据安全要求，可以在数据导入时使用 Access Key 或 STS Token 临时凭证方案。

    - 如果您希望使用长期 Access Key，强烈建议您创建专用于 API 访问的 RAM 用户，并为其创建 Access Key。具体步骤可以参考 [使用长期凭证](https://docs.amazonaws.cn/sdkref/latest/guide/access-iam-users.html)。

    - 如果您希望使用 STS Token 临时凭证方案，可以参考 [使用短期凭证](https://docs.amazonaws.cn/sdkref/latest/guide/access-temp-idc.html)

