---
title: "FAQ：数据导入 | BYOC"
slug: /faq-data-import
sidebar_label: "FAQ：数据导入"
beta: FALSE
notebook: FALSE
description: " | BYOC"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 4

---

# FAQ：数据导入

本文列举了在 Zilliz Cloud 导入数据时可能遇到的常见问题及对应解决方法。

## 目录

- [从对象存储服务导入数据时，我能否使用临时 Token？](#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)
- [能否向 Zilliz Cloud 集群批量导入数据？](#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases)
- [在使用 Node.js SDK 导入数据或查询时，遇到 ECONNRESET错误该怎么办？](#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk)

## 问答




### 从对象存储服务导入数据时，我能否使用临时 Token？ \{#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service}

可以。根据您的数据安全需求，在从对象存储服务导入数据时您可以根据以下步骤使用临时 Token。

1. 生成临时 Token。

    - 阿里云对象存储 OSS：[使用STS临时访问凭证访问OSS](https://help.aliyun.com/zh/oss/developer-reference/use-temporary-access-credentials-provided-by-sts-to-access-oss)

    - 腾讯云对象存储 COS：[临时密钥生成及使用指引](https://cloud.tencent.com/document/product/436/14048)

    - Amazon S3（亚马逊云科技对象存储）：[使用短期凭证进行身份验证](https://docs.amazonaws.cn/sdkref/latest/guide/access-temp-idc.html)

1. 在数据导入时提供以下验证信息：

    - 阿里云对象存储 OSS： `AccessKeyId`、`AccessKeySecret`、`SecurityToken`

    - 腾讯云对象存储 COS：`tmpSecretId`、`tmpSecretKey`、`token`

    - Amazon S3（亚马逊云科技对象存储）：`accessKeyId`、`secretAccessKey`、`sessionToken`

### 能否向 Zilliz Cloud 集群批量导入数据？ \{#can-i-bulk-insert-data-into-the-zilliz-cloud-vector-databases}

目前，您只能使用 Zilliz Cloud 界面批量导入数据。更多详情，请参阅[数据导入](./data-import)。

### 在使用 Node.js SDK 导入数据或查询时，遇到 ECONNRESET错误该怎么办？ \{#what-can-i-do-if-i-receive-econnreset-errors-when-importing-data-to-or-querying-zilliz-cloud-clusters-with-nodejs-sdk}

请执行以下步骤，解决`ECONNRESET`错误问题：

1. 升级至支持 `channelOptions` 的最新版 Milvus NodeJS SDK。

1. 手动添加 `channelOptions`。

    ```plaintext
    const channelOptions: ChannelOptions = {
    
    // Send keepalive pings every 10 seconds, default is 2 hours.'grpc.keepalive_time_ms': 10 * 1000,
    
    // Keepalive ping timeout after 5 seconds, default is 20 seconds.'grpc.keepalive_timeout_ms': 5 * 1000,
    
    // Allow keepalive pings when there are no gRPC calls.'grpc.keepalive_permit_without_calls': 1,
    
    };
    ```

1. 使用 `channelOptions` 初始化客户端。

    ```javascript
    import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';
    
    new MilvusClient({
      address: 'your-zilliz-cloud-address',
      ssl: true,
      username: 'username',
      password: 'your-pass',
      channelOptions: channelOptions
    })`
    ```
