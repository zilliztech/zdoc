---
title: "External Volume | Cloud"
slug: /external-volume
sidebar_label: "External Volume"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "External Volume 映射至您自有云服务对象存储（如阿里云 OSS 或亚马逊云科技 S3）中某个存储桶。通过 External Volume，Zilliz Cloud 可访问您的数据，您无需将数据复制或迁移到 Zilliz Cloud。 | Cloud"
type: origin
token: E9QNwMMUbiVDvtkJQKUcuHR0nxc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# External Volume

External Volume 映射至您自有云服务对象存储（如阿里云 OSS 或亚马逊云科技 S3）中某个存储桶。通过 External Volume，Zilliz Cloud 可访问您的数据，您无需将数据复制或迁移到 Zilliz Cloud。

本页说明如何通过 Web 控制台和 SDK 创建与删除 External Volume。

## 注意事项\{#considerations}

- Volume 目前仅支持在**阿里云**和**亚马逊云科技**上使用。若您需要在腾讯云上使用，请[提交工单](http://support.zilliz.com.cn)。

- Volume 受限于项目的云地域。例如，如果您的项目地域为阿里云华东1（杭州），则您只能在阿里云华东1（杭州）创建 Volume。

- 若要将 Volume 用于某个集群，该集群必须与 Volume 位于相同的云地域。

- 创建和管理 Volume 需要项目**管理员权限**。

- Volume 创建后，其配置不可编辑。如需修改配置，请按目标设置重新创建一个新的 Volume。

- 每个组织最多可创建 **100 个 External Volume**。

## 开始之前\{#before-you-start}

创建 External Volume 前，您需要先创建[阿里云对象存储](./integrate-with-alibaba-cloud-oss)或 [Amazon S3](./integrate-with-amazon-s3-cn) 集成。请注意，存储集成必须与您要创建的 External Volume 位于相同的云地域。      

## 创建 External Volume\{#create-an-external-volume}

- **通过 SDK**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # Create a volume
    volume_manager.create_volume(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
        region_id="aws-us-west-2", 
        volume_name="external_volume",
        volume_type="EXTERNAL",
        storage_integration_id="integ-xxxx",
        path="data/",
    )
    
    print(f"\nVolume external_volume created")
    
    # Volume external_volume created
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
    
    // Create a EXTERNAL volume
    import io.milvus.bulkwriter.request.volume.CreateVolumeRequest;
    
    CreateVolumeRequest request = CreateVolumeRequest.builder()
        .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
        .regionId("aws-us-west-2")
        .volumeName("external_volume")
        .type("EXTERNAL")
        .storageIntegrationId("integ-xxxx")
        .path("data/")
        .build();
    
    volumeManager.createVolume(request);
    
    System.out.printf("\nVolume %s created%n", "external_volume");
    
    // Volume external_volume created
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
        "volumeName": "my_external_volume",
        "type": "EXTERNAL",
        "storageIntegrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "path": "data/",
        "description": "A volume for storing collection data."
    }'
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "external_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

    下表为参数说明。

    | **参数** | **说明** |
    | --- | --- |
    | `projectId` | 您要创建 Volume 的所属项目的 ID。 |
    | `regionId` | 要创建的 Volume 所在地域。该地域必须与您计划用于导入或迁移数据的目标集群的云地域一致。 |
    | `volumeName` | 要创建的 Volume 名称。该名称在组织内必须唯一；长度不超过 64 个字符；必须以字母或下划线开头；仅可包含字母、数字、连字符和下划线。 |
    | `type` | 将类型设置为 `EXTERNAL`, 否则默认为 `MANAGED`。 |
    | `storageIntegrationId` | 引用的存储集成 ID。当 `type=EXTERNAL` 时必填。所选存储集成必须与要创建的 External Volume 属于同一组织、同一云地域。 |
    | `path` | 存储路径。当 `type=EXTERNAL` 时必填。 |
    | `description`(可选) | 要创建的 Volume 描述。最多 255 个字符。 |

- **通过 Web 控制台**

    <Supademo id="cmogvfs100005x40j4d15i2lu" title=""  />

    <Procedures>

    1. 在左侧导航栏，点击 **Volume。**

    1. 在 Volume 页面，点击 **+ Volume。**

    1. 设置 Volume。

        下表为参数说明。

        | **参数** | **说明** |
        | --- | --- |
        | 名称 | Volume 名称必须在组织范围内唯一，长度不超过 64 个字符，以字母或下划线开头，并且只能包含字母、数字、连字符（-）和下划线（_）。 |
        | 描述 | 可选参数。最多 255 个字符。 |
        | Volume 类型 | 选择“External”作为 Volume 类型。 |
        | 云地域 | Volume 所在地域必须与计划导入或迁移数据的目标集群所使用的云服务商和地域完全一致。 |
        | 存储集成 & 路径 | 存储集成（[阿里云对象存储](./integrate-with-alibaba-cloud-oss)或 [Amazon S3](./integrate-with-amazon-s3-cn)）是一种凭证对象，用于封装访问您的云存储所需的配置信息。<br/>路径用于指向您的数据所在位置（例如：`folder/`）。 |

    1. 点击**创建**。

    </Procedures>

## 查看 External Volume\{#list-external-volumes}

- **通过 SDK**

    您可以查看一个项目中的所有 Volume。

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

    ![IQsNwwOfBh5m3rbOA3wcrOTPn5c](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/IQsNwwOfBh5m3rbOA3wcrOTPn5c.png)

## 查看 External Volume 详情\{#describe-external-volume}

您也可以查看某个特定 Volume 的详情。

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
            volume_name="external_volume"
    )
    
    print(f"\ndescVolume results: \n", volume_list.json()['data'])
    
    # descVolume results: 
    # 
    # {
    #    "volumeName": "external_volume",
    #    "type": "EXTERNAL",
    #    "regionId": "ali-cn-hangzhou",
    #    "storageIntegrationId": "integ-xxxx",
    #    "path": "data/",
    #    "status": "RUNNING",
    #    "createTime": "2024-04-15T12:00:00Z",
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
    import io.milvus.bulkwriter.request.volume.DescribeVolumeRequest;
    import io.milvus.bulkwriter.response.volume.VolumeInfo;
    
    DescribeVolumeRequest request = DescribeVolumeRequest.builder()
        .volumeName("descVolume")
        .build();
        
    VolumeInfo volumeInfo = volumeManager.describeVolume(request);
    
    System.out.println("\ndescVolume results: " + new Gson().toJson(volumeInfo));
    
    // descVolume results: 
    // 
    //{
    //    "volumeName": "volume-22222lentitude",
    //    "type": "EXTERNAL",
    //    "regionId": "ali-cn-hangzhou",
    //    "storageIntegrationId": "integ-lir5xfbcgrkla6fjc39w15qjk",
    //    "path": "",
    //    "status": "RUNNING",
    //    "createTime": "2026-04-27T15:40:53Z"
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
    #        "volumeName": "external_volume",
    #        "type": "EXTERNAL",
    #        "regionId": "ali-cn-hangzhou",
    #        "storageIntegrationId": "si-xxxx",
    #        "path": "data/",
    #        "status": "RUNNING",
    #        "createTime": "2024-04-15T12:00:00Z"
    #    }
    #}
    ```

    </TabItem>
    </Tabs>

- **通过 Web 控制台**

    ![PJxwwarRShaHm8bgUGBcGqxwnkc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/PJxwwarRShaHm8bgUGBcGqxwnkc.png)

## 删除  External Volume\{#delete-an-external-volume}

如果不再需要，您可以随时删除 External Volume。

删除 External Volume 仅会移除 Zilliz Cloud 中的 Volume 元数据；您的数据仍完整保留在自有的云服务对象存储中。

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
        volume_name="external_volume"
    )
    
    print(f"\nVolume external_volume deleted")
    
    # Volume external_volume deleted
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
        .volumeName("external_volume")
        .build();
    
    volumeManager.deleteVolume(request);
    
    System.out.printf("\nVolume %s deleted%n", "external_volume");
    
    // Volume external_volume deleted
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com.cn"
    export TOKEN="YOUR_API_KEY"
    export VOLUME_NAME="external_volume"
    
    curl --request DELETE \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "external_volume"
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

创建和使用 External Volume 不会产生 Zilliz Cloud 费用，也不需要添加支付方式。

但当 Zilliz Cloud 在导入或迁移过程中读取您的存储桶数据时，云服务提供商可能收取数据请求费用。详情请参见[阿里云请求费用](https://help.aliyun.com/zh/oss/api-operation-calling-fees?spm=5176.8064714.J_504817.6.59762bc6ymdT53)或[亚马逊云科技 S3 定价](https://aws.amazon.com/cn/s3/pricing/)。

## 常见问题\{#faqs}

**如果我的组织因为账单逾期被冻结，是否影响 Volume ？**

如果组织被冻结，该组织下的所有 Volume（包括免费试用和按量计费 Volume）以及其中存储的所有文件都会被删除且无法恢复。

如需继续使用 Volume，请先结清所有未支付账单，然后重新创建 Volume 并重新上传文件。

**使用 External Volume 与直接从外部存储中导入数据有何不同？**

两种方式都允许您从外部的云服务对象存储中导入数据。不同之处在于：

-  External Volume 通过[存储集成](./integrate-with-alibaba-cloud-oss)来管理凭证。凭证只需配置一次，即可在多个 Volume 和操作中复用。数据工程师无需直接接触云存储密钥。

- 直接从外部存储导入时，需要在每次导入请求中提供凭证（access key、secret key）。这种方式更适合一次性导入，但不具备凭证隔离和复用能力。

**创建后可以修改 External** **Volume** **的存储集成或路径吗？**

不可以。 ExternalVolume 创建后，存储集成和路径都不能修改。若要修改，请创建新的 External Volume。

**正被任务或外表** **Collection** **引用的 External** **Volume** **可以删除吗？**

不可以。如果存在下游 External Collection 或正在进行中的人物引用了该 Volume，删除请求会被拒绝。

**使用 External** **Volume** **会产生数据传输费用吗？**

不会。 External Volume 必须与您的集群位于相同云地域。由于数据访问均发生在同一地域内，不会在 Zilliz Cloud 内部产生跨地域数据传输费用。

**Volume 状态的含义是什么？**

下表列出了您可能看到的 Volume 状态及对应说明。

| **状态** | **说明** |
| --- | --- |
| **运行中** | Volume 处于正常运行状态，可正常使用。 |
| **已冻结** | 由于逾期账单，组织已被冻结。该 Volume 无法用于新的操作。请先完成[支付](./view-invoice)后再继续使用 Volume。 |
| **错误** | 存储集成校验失败。请检查配置后重试。 |

