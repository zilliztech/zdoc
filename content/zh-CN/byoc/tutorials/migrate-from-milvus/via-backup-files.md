---
title: "通过备份文件从 Milvus 迁移至 Zilliz Cloud | BYOC"
slug: /via-backup-files
sidebar_label: "通过备份文件从 Milvus 迁移至 Zilliz Cloud"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供基于 Milvus 的完全托管的向量数据库解决方案，适合希望使用 Milvus 向量数据库但不想自己管理基础设施的用户。本文介绍如何通过备份文件从 Milvus 进行数据迁移。 | BYOC"
type: origin
token: YBlmwO9ajiU4tYklnjmc6fJPn8e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 通过备份文件从 Milvus 迁移至 Zilliz Cloud

Zilliz Cloud 提供基于 Milvus 的完全托管的向量数据库解决方案，适合希望使用 Milvus 向量数据库但不想自己管理基础设施的用户。本文介绍如何通过备份文件从 Milvus 进行数据迁移。

## 开始前\{#before-you-start}

- 您已根据迁移方法做好必要的迁移准备：

    - **从本地文件**：提前准备本地备份文件。有关如何准备备份文件的信息，请参阅[准备迁移数据](./via-backup-files#prepare-migration-data)。

    - **从对象存储**：Milvus 对象存储的公共 URL 和访问凭据。您可以选择长期或临时凭据。您可以查看[常见问题](./via-backup-files#faq)，了解对象存储公共 URL 的格式示例。

        <Admonition type="info" icon="📘" title="说明">

        建议您将备份文件放置在与目标集群同云服务商同地域的对象存储桶中，以便获得低时延、高稳定的迁移体验。

        </Admonition>

    - **从 Volume**：对于非常大的本地备份文件，可以先将其上传到 Zilliz Cloud 的 Volume，然后填写该 Volume 内的文件路径。

- 您需要拥有组织管理员或项目管理员的角色。如果您没有相应的权限，请联系您的 Zilliz Cloud 管理员。

- 确保目标集群的 CU 容量足以容纳源数据。要估算所需的 CU 规格，请使用[计算器](https://zilliz.com.cn/pricing#calculator)。

## 准备迁移数据\{#prepare-migration-data}

Zilliz Cloud 支持从 Milvus 2.x 和更高版本迁移数据。要从 Milvus 2.x 迁移数据，请按如下准备数据：

<Procedures>

1. 下载 [milvus-backup](https://github.com/zilliztech/milvus-backup/releases)。推荐下载最新版本。

1. 在下载的二进制文件所在的同级目录下，创建 `configs` 文件夹，然后将 [backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml) 保存到 `configs`。

    此步骤完成后，文件夹的结构应如下所示：

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. 自定义 `backup.yaml` 配置。

    一般情况下，您不需要自定义该文件。 在下一步前，您可以检查以下配置项是否正确：

    ```yaml
    ...
    # milvus proxy address, compatible to milvus.yaml
    milvus:
      address: localhost
      port: 19530
      ...
      
    # Related configuration of minio, which is responsible for data persistence for Milvus.
    minio:
      # Milvus storage configs, make them the same with milvus config
      storageType: "minio" # support storage type: local, minio, s3, aws, gcp, ali(aliyun), azure, tc(tencent), gcpnative
      # You can use "gcpnative" for the Google Cloud Platform provider. Uses service account credentials for authentication.
      address: localhost # Address of MinIO/S3
      port: 9000   # Port of MinIO/S3
      bucketName: "a-bucket" # Milvus Bucket name in MinIO/S3, make it the same as your milvus instance
      backupBucketName: "a-bucket" # Bucket name to store backup data. Backup data will store to backupBucketName/backupRootPath
      rootPath: "files" # Milvus storage root path in MinIO/S3, make it the same as your milvus instance
      ...
    ```

    <Admonition type="info" icon="📘" title="📘 说明">

    如果 Milvus 实例是通过 Docker Compose 安装，`minio.bucketName` 默认为 `a-bucket`， `rootPath` 默认为 `files`。
    
    如果 Milvus 实例是通过 Kubernetes 安装，`minio.bucketName` 默认为 `milvus-bucket`， `rootPath` 默认为 `file`。

    </Admonition>

1. 创建 Milvus 的安装备份。

    ```bash
    ./milvus-backup --config backup.yaml create -n my_backup
    ```

1. 获取备份文件。

    ```bash
    ./milvus-backup --config backup.yaml get -n my_backup
    ```

1. 检查备份文件。

    - 如果您将 `minio.address` 和 `minio.port` 设置为 OSS 存储，则您的备份文件已在 OSS 存储中。

    - 如果您将 `minio.address` 和 `minio.port` 设置为 MinIO 存储，则可以通过 MinIO 控制台或 mc 客户端下载备份文件。 

        - 如果从 [MinIO 控制台](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html)下载，请先登录 MinIO 控制台，找到 `minio.address` 中指定的存储桶，选择存储桶中的文件，然后开始下载。

        - 如果使用 [mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install) 客户端，则执行以下命令：

        ```bash
        # 配置 Minio 主机
        mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
        
        # 查询当前桶列表
        mc ls my_minio
        
        # 从桶中下载文件
        mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
        ```

1. 解压下载的文件，然后将备份文件夹下的子文件夹上传到 Zilliz Cloud。

    ```plaintext
    backup
    └── my_backup  <= 上传此文件夹
    ```

</Procedures>

## 将数据迁移到 Zilliz Cloud\{#migrate-data-to-zilliz-cloud}

<Supademo id="cme9nfjc94bofh3py7kldqzx9" title="Zilliz Cloud - 通过备份文件从 Milvus 迁移" />

<Admonition type="info" icon="📘" title="Notes">

如果源 Collection 已启用 Full Text Search 功能，Zilliz Cloud 会在迁移后保留目标 Collection 的 Function 设置。这些继承的设置无法修改。

</Admonition>

## 查看迁移进度\{#monitor-the-migration-process}

生成迁移任务后，您可前往[任务中心](https://docs.zilliz.com.cn/docs/job-center)查看任务状态和进度。如果迁移任务的状态从**进行中**变更为**成功**，则代表迁移成功。

<Admonition type="info" icon="📘" title="说明">

迁移完成后，请验证目标集群中的 collection 和 entity 数量是否与数据源一致。如果发现不一致，请删除缺失 entity 的 collection 并重新进行迁移。

</Admonition>

## 迁移后\{#post-migration}

迁移任务完成后，请注意以下事项：

- **索引创建**：迁移过程中会自动为迁移的 Collection 创建 [AUTOINDEX](./autoindex-explained)。

- **手动 Load Collection**：虽然索引已自动创建，但迁移后的 Collection 并不会立即支持搜索或查询操作。您必须手动 Load Collection，才能启用搜索和查询功能。详细信息请参阅 [Load 和 Release](./load-release-collections)。

## 取消迁移任务\{#cancel-migration-job}

如果迁移过程遇到任何问题，您可以采取以下步骤进行故障排除并恢复迁移：

<Procedures>

1. 在**任务中心**页面，取消失败的迁移任务。

1. 在**操作**列点击**查看详情**以访问日志信息。

</Procedures>

## 常见问题\{#faq}

1. **通过备份文件迁移时，上传的对象存储中的备份文件 URL 应遵循什么样的格式？**

    <table>
       <tr>
         <th colspan="2"><p><strong>Cloud Object Storage</strong></p></th>
         <th><p><strong>URL Format</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>阿里云 OSS</strong></p></td>
         <td><p>公共访问 URL</p></td>
         <td><p>https://&lt;bucket_name&gt;.oss-&lt;region_code&gt;.aliyuncs.com/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td><p>OSS URI</p></td>
         <td><p>oss://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>腾讯云 COS</strong></p></td>
         <td><p>https://&lt;bucket_name&gt;.cos.&lt;region_code&gt;.myqcloud.com/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td rowspan="3"><p><strong>亚马逊云科技 Amazon S3</strong></p></td>
         <td><p>virtual-hosted–style</p></td>
         <td><p>https://&lt;bucket_name&gt;.s3.&lt;region-code&gt;.amazonaws.com/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td><p>path-style</p></td>
         <td><p>https://s3.&lt;region-code&gt;.amazonaws.com/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></td>
       </tr>
       <tr>
         <td><p>S3 URI</p></td>
         <td><p>s3://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></td>
       </tr>
    </table>

    