---
title: "Managed Volume | BYOC"
slug: /managed-volume
sidebar_label: "Managed Volume"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Managed Volume 是由 Zilliz Cloud 提供的存储空间，用于存放导入和迁移所需的数据文件。 | BYOC"
type: origin
token: JVtGwoZ0Ni6ZEmkTZvyc58kAnjc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Managed Volume

Managed Volume 是由 Zilliz Cloud 提供的存储空间，用于存放导入和迁移所需的数据文件。

本文将介绍如何通过 Web 控制台 和 SDK 创建、管理和删除 Managed Volume。

## 注意事项\{#considerations}

- Volume 目前仅支持在**阿里云**和**亚马逊云科技**上使用。若您需要在腾讯云上使用，请[提交工单](http://support.zilliz.com.cn)。

- Volume 受限于项目的云地域。例如，如果您的项目地域为阿里云华东1（杭州），则您只能在阿里云华东1（杭州）创建 Volume。

- 若要将 Volume 用于某个集群，该集群必须与 Volume 位于相同的云地域。

- 创建和管理 Volume 需要项目**管理员权限**。

- Volume 创建后，其配置不可编辑。如需修改配置，请按目标设置重新创建一个新的 Volume。

- 每个组织最多可创建 **100 个 Managed Volum**e。

## 开始之前\{#before-you-start}

如果您需要通过 SDK 创建和管理 Volume，需先初始化 Volume Manager。

Volume Manager 用于维护与 Zilliz Cloud Volume Service 的连接；在执行任何 Volume 管理操作前，都必须先完成初始化。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com.cn",
    api_key="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com.cn")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com.cn"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

## 创建 Managed Volume\{#create-a-managed-volume}

您可以通过 Web 控制台或 SDK 创建 Managed Volume。

- **通过 SDK**

    Volume 为 Zilliz Cloud 项目层级下的资源。创建 Volume 时，您需要提供项目 ID、地域 ID 和 Volume 名称，如下所示：

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # Create a managed volume
    volume_manager.create_volume(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
        region_id="aws-us-west-2", 
        volume_name="managed_volume"
    )
    
    print(f"\nVolume managed_volume created")
    
    # Volume managed_volume created
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Initiate a volume manager
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com")
        .withApiKey("YOUR_API_KEY")
        .build();
            
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    // Create a managed volume
    import io.milvus.bulkwriter.request.volume.CreateVolumeRequest;
    
    CreateVolumeRequest request = CreateVolumeRequest.builder()
        .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
        .regionId("aws-us-west-2")
        .volumeName("managed_volume")
        .build();
    
    volumeManager.createVolume(request);
    
    System.out.printf("\nVolume %s created%n", "managed_volume");
    
    // Volume managed_volume created
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/volumes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "volumeName": "my_volume",
        "description": "A volume for storing collection data."
    }'
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "managed_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

    下表为参数说明

    | **Parameter** | **说明** |
    | --- | --- |
    | `projectId` | 您要创建 Volume 的所属项目的 ID。 |
    | `regionId` | 要创建的 Volume 所在地域。该地域必须与您计划用于导入或迁移数据的目标集群的云地域一致。 |
    | `volumeName` | 要创建的 Volume 名称。该名称在组织内必须唯一；长度不超过 64 个字符；必须以字母或下划线开头；仅可包含字母、数字、连字符和下划线。 |
    | `type`(可选) | 可填写的参数值：`MANAGED` 或 `EXTERNAL`。<br/>若省略该参数，默认创建 Managed Volume。 |
    | `description`(可选) | 要创建的 Volume 描述。最多 255 个字符。 |

- **通过 Web 控制台**

    <Supademo id="cmimhl79mght1b7b4n3qkbo3n" title=""  />

    <Procedures>

    1. 在左侧导航栏，点击 **Volume。**

    1. 在 Volume 页面，点击 **+ Volume。**

    1. 设置 Volume。

        下表为参数说明。

        <table>
           <tr>
             <th><p><strong>参数</strong></p></th>
             <th><p><strong>说明</strong></p></th>
           </tr>
           <tr>
             <td><p>名称</p></td>
             <td><p>Volume 名称必须在组织范围内唯一，长度不超过 64 个字符，以字母或下划线开头，并且只能包含字母、数字、连字符（-）和下划线（_）。</p></td>
           </tr>
           <tr>
             <td><p>描述</p></td>
             <td><p>可选参数。最多 255 个字符。</p></td>
           </tr>
           <tr>
             <td><p>Volume 类型</p></td>
             <td><p>选择“Managed”作为 Volume 类型。</p></td>
           </tr>
           <tr>
             <td><p>计费类型</p></td>
             <td><ul><li><p>若您仅想体验 Managed Volume 功能，可创建免费试用 Volume。每个组织仅可创建一次免费试用 Volume，且对容量和文件上传有所限制。详情请参见<a href="./managed-volume#billing">计费</a>章节中的对比表。</p></li><li><p>对于生产环境中的应用，请创建按量计费 Volume。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>云地域</p></td>
             <td><p>Volume 所在地域必须与计划导入或迁移数据的目标集群所使用的云服务商和地域完全一致。</p></td>
           </tr>
        </table>

    1. 点击**创建**。

    </Procedures>

## 查看 Managed Volume\{#list-managed-volumes}

- **通过 SDK**

    您可以通过如下方式查看特定项目内的所有 Volume。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # View volumes
    volume_list = volume_manager.list_volumes(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
        current_page=1, 
        page_size=10
    )
    
    print(f"\nlistVolumes results: \n", volume_list.json()['data'])
    
    # listVolumes results: 
    # 
    # {
    #     "count": 1,
    #     "currentPage": 1,
    #     "pageSize": 10,
    #     "volumes": [
    #         {
    #             "volumeName": "external_volume"
    #             "type":"EXTERNAL"
    #         }        
    #     ]
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Initiate a volume manager
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com")
        .withApiKey("YOUR_API_KEY")
        .build();
            
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    // View volumes
    import com.google.gson.Gson;
    import io.milvus.bulkwriter.request.volume.ListVolumesRequest;
    import io.milvus.bulkwriter.response.volume.ListVolumesResponse;
    
    ListVolumesRequest request = ListVolumesRequest.builder()
        .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
        .currentPage(1)
        .pageSize(10)
        .build();
        
    ListVolumesResponse listVolumesResponse = volumeManager.listVolumes(request);
    
    System.out.println("\nlistVolumes results: " + new Gson().toJson(listVolumesResponse));
    
    // listVolumes results: 
    // 
    // {
    //     "count": 1,
    //     "currentPage": 1,
    //     "pageSize": 10,
    //     "volumes": [
    //         {
    //             "volumeName": "external_volume",
    //             "type":"EXTERNAL"
    //         }        
    //     ]
    // }
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes?projectId=proj-xxxxxxxxxxxxxxxxx" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #    "code": 200,
    #    "data": {
    #        "count": 3,
    #        "currentPage": 1,
    #        "pageSize": 10,
    #        "volumes": [
    #            {
    #                "volumeName": "my_volume_1",
    #                "type": "MANAGED",
    #                "description": "A volume for storing collection data."
    #            },
    #            {
    #                "volumeName": "my_volume_2",
    #                "type": "EXTERNAL",
    #                "description": "A volume for storing collection data."
    #            },
    #            {
    #                "volumeName": "my_volume_3",
    #                "type": "MANAGED",
    #                "description": "A volume for storing collection data."
    #            }
    #        ]
    #    }
    #}
    ```

    </TabItem>
    </Tabs>

- **通过 Web 控制台**

    ![WXtPwcoT4heZicblLYmctLRunrf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/WXtPwcoT4heZicblLYmctLRunrf.png)

## 查看 Volume 详情\{#Describe-managed-volume}

您还可以查看特定 Volume 的详细信息。

- **通过 SDK**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com.cn",
        api_key="YOUR_API_KEY"
    )
    
    # View volumes
    volume_list = volume_manager.describe_volume(
        volume_name="managed_volume",
    )
    
    print(f"\ndescVolume result: \n", volume_list.json()['data'])
    
    # describeVolume result: 
    # {
    #    "volumeName": "managed_volume",
    #    "type": "MANAGED",
    #    "regionId": "ali-cn-hangzhou",
    #    "status": "RUNNING",
    #    "createTime": "2026-05-06T02:24:26Z"
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Initiate a volume manager
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com.cn")
        .withApiKey("YOUR_API_KEY")
        .build();
            
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    // View volumes
    import com.google.gson.Gson;
    import io.milvus.bulkwriter.request.volume.ListVolumesRequest;
    import io.milvus.bulkwriter.response.volume.ListVolumesResponse;
    
    DescribeVolumeRequest request = DescribeVolumeRequest.builder()
            .volumeName("managed_volume")
            .build();
    VolumeInfo volumeInfo = volumeManager.describeVolume(request);
    System.out.println("\ndescribeVolume result: " + new Gson().toJson(volumeInfo));;
    
    // describeVolume results: 
    //{
    //    "volumeName": "managed_volume",
    //    "type": "MANAGED",
    //    "regionId": "ali-cn-hangzhou",
    //    "status": "RUNNING",
    //    "createTime": "2026-05-06T02:24:26Z"
    //}
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com.cn"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #    "code": 0,
    #    "data": {
    #        "volumeName": "ext-volume",
    #        "type": "MANAGED",
    #        "regionId": "ali-cn-hangzhou",
    #        "status": "RUNNING",
    #        "createTime": "2024-04-15T12:00:00Z"
    #    }
    #}
    ```

    </TabItem>
    </Tabs>

- **通过 Web 控制台**

    ![G2kawpwZNh3wgZbZckpcPqhjnef](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/G2kawpwZNh3wgZbZckpcPqhjnef.png)

## 上传数据至 Managed Volume\{#-upload-data-into-a-managed-volume}

目前您仅可以通过 SDK 上传文件或文件夹。

1. **初始化 Volume File Manager**

    Volume File Manager 用于维护与 Zilliz Cloud Volume Service 中指定 Volume 的连接。在向 Volume 上传文件之前，您需要先完成 Volume File Manager 的初始化。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager
    
    volume_file_manager = VolumeFileManager(
        cloud_endpoint='https://api.cloud.zilliz.com.cn',
        api_key='YOUR_API_KEY',
        volume_name='managed_volume',
    )
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.VolumeFileManager;
    import io.milvus.bulkwriter.VolumeFileManagerParam;
    
    VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com.cn")
        .withApiKey("YOUR_API_KEY")
        .withVolumeName("managed_volume")
        .build();
    
    VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
    ```

    </TabItem>
    </Tabs>

1. **上传文件或文件夹**

    当 Volume File Manager 初始化完成后，您可以使用它将文件或文件夹上传到指定的 Managed Volume。

    - **上传文件**

        以下示例展示如何上传文件。

        <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
        <TabItem value='python'>

        ```python
        result = volume_file_manager.upload_file_to_volume(
            source_file_path="/path/to/your/local/data/file", 
            target_volume_path="data/"
        )
        
        print(f"\nuploadFileToVolume results: {result}")
        
        # uploadFileToVolume results: 
        # 
        # {
        #     "volumeName": "managed_volume",
        #     "path": "data/"
        # }
        ```

        </TabItem>

        <TabItem value='java'>

        ```java
        import com.google.gson.Gson;
        import io.milvus.bulkwriter.model.UploadFilesResult;
        import io.milvus.bulkwriter.request.volume.UploadFilesRequest;
        
        UploadFilesRequest request = UploadFilesRequest.builder()
            .sourceFilePath("/path/to/your/local/data/file")
            .targetVolumePath("data/")
            .build();
        
        UploadFilesResult result = volumeFileManager.uploadFilesAsync(request).get();
        
        System.out.println("\nuploadFiles results: " + new Gson().toJson(result));
        
        // uploadFileToVolume results: 
        // 
        // {
        //     "volumeName": "managed_volume",
        //     "path": "data/"
        // }
        ```

        </TabItem>
        </Tabs>

    - **上传文件夹**

        以下示例展示如何上传文件夹。

        <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
        <TabItem value='python'>

        ```python
        result = volume_file_manager.upload_file_to_volume(
            source_file_path="/path/to/your/local/data/folder/", 
            target_volume_path="data/"
        )
        
        print(f"\nuploadFileToVolume results: {result}")
        
        # uploadFileToVolume results: 
        # 
        # {
        #     "volumeName": "managed_volume",
        #     "path": "data/"
        # }
        ```

        </TabItem>

        <TabItem value='java'>

        ```java
        import com.google.gson.Gson;
        import io.milvus.bulkwriter.model.UploadFilesResult;
        import io.milvus.bulkwriter.request.volume.UploadFilesRequest;
        
        UploadFilesRequest request = UploadFilesRequest.builder()
            .sourceFilePath("/path/to/your/local/data/folder/")
            .targetVolumePath("data/")
            .build();
        
        UploadFilesResult result = volumeFileManager.uploadFilesAsync(request).get();
        
        System.out.println("\nuploadFiles results: " + new Gson().toJson(result));
        
        // uploadFileToVolume results: 
        // 
        // {
        //     "volumeName": "managed_volume",
        //     "path": "data/"
        // }
        ```

        </TabItem>
        </Tabs>

## 从 Managed Volume 中删除数据\{#delete-data-from-a-managed-volume}

从 Managed Volume 删除数据可能需要几分钟，具体取决于文件或文件夹大小。

<Admonition type="info" icon="📘" title="⚠️  警告">

已删除的文件和文件夹无法恢复，请谨慎操作。

</Admonition>

目前，您只能通过 Web 控制台 从 Managed Volume 删除数据。

<Supademo id="cmimk40f8gjlub7b43mcvp2x3?utm_source=link" title=""  />

<Procedures>

1. 在左侧导航栏中，点击 **Volume**。

1. 切换至**文件**页签。

1. 在**操作**作栏，点击**...**，随后点击**删除**。

</Procedures>

## 删除 Managed Volume\{#delete-a-managed-volume}

如果不再需要，您可以随时删除 Managed Volume。请注意，每个组织的免费试用 Volume 仅可创建一次；删除后将无法再次创建免费试用 Volume。

删除 Managed Volume 时，其中的所有文件和文件夹也会一并删除。

<Admonition type="info" icon="📘" title="⚠️  警告">

已删除的 Volume 无法恢复，请谨慎操作。      

</Admonition>

- **通过 SDK**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com.cn",
        api_key="YOUR_API_KEY"
    )
    
    # Delete a volume
    volume_manager.delete_volume(
        volume_name="managed_volume"
    )
    
    print(f"\nVolume managed_volume deleted")
    
    # Volume managed_volume deleted
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // Initiate a volume manager
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
        .withCloudEndpoint("https://api.cloud.zilliz.com.cn")
        .withApiKey("YOUR_API_KEY")
        .build();
            
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    // Delete a volume
    import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;
    
    DeleteVolumeRequest request = DeleteVolumeRequest.builder()
        .volumeName("managed_volume")
        .build();
    
    volumeManager.deleteVolume(request);
    
    System.out.printf("\nVolume %s deleted%n", "managed_volume");
    
    // Volume managed_volume deleted
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com.cn"
    export TOKEN="YOUR_API_KEY"
    export VOLUME_NAME="managed_volume"
    
    curl --request DELETE \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "managed_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

- **通过 Web 控制台**

    <Supademo id="cmimilchegik5b7b47tza70vz?utm_source=link" title=""  />

    <Procedures>

    1. 在左侧导航栏中，点击 **Volume**。

    1. 点击**操作**栏中的 **...** ，选择**删除**。

    1. 输入Volume 名称并点击**删除**。

    </Procedures>

## 计费\{#billing}

创建 Volume 时，您可以选择**免费试用 Volume** 或**按量计费 Volume**。下表比较了它们的典型使用场景和限制。

|  | 免费试用 | 按量计费 |
| --- | --- | --- |
| 使用场景 | 仅适用于测试环境。 | 适用于生产环境。 |
| 容量 | 5 GB | 无限制 |
| 单次上传的文件大小和数量 | 每次上传最多 1 GB 且不可超过 1,000 个文件 | 每次上传最多 100 GB 且文件数量不限 |
| 最多可创建的数量 | 1 个 | 100 个 |

**免费试用 Volume**

- 无需绑定支付方式。

- 每个组织中只能创建 1 个免费试用 Volume。

- 免费试用 Volume 最多保留 30 天，过期会被自动删除。

**按量计费 Volume**

- 需要绑定支付方式。

- 使用按量计费 Volume 会产生相关费用。

    - 如需查询列表价，请参见[定价详情](https://zilliz.com.cn/pricing/pricing-guide)。

    - 如需了解 Volume 费用的计算方式，请参见[存储费用](./storage-cost)。

## 常见问题\{#faqs}

**如果我的组织因为账单逾期被冻结，是否影响 Volume ？**

如果组织被冻结，该组织下的所有 Volume（包括免费试用和按量计费 Volume）以及其中存储的所有文件都会被删除且无法恢复。

如需继续使用 Volume，请先结清所有未支付账单，然后重新创建 Volume 并重新上传文件。

**为什么我在 Web 控制台中看不到免费试用 Volume 的选项？**

如果您的组织中已经创建过免费试用 Volume，该选项会从控制台中隐藏。每个组织只能创建一个免费试用 Volume。

**Volume 状态的含义是什么？**

下表罗列了所有您可能看到的 Volume 状态及对应说明。

| **状态** | **说明** |
| --- | --- |
| **可用** | Volume 处于正常运行状态，可正常使用。 |
| **已冻结** | 由于逾期账单，组织已被冻结。该 Volume 无法用于新的操作。请先完成[支付](./view-invoice)后再继续使用 Volume。 |

