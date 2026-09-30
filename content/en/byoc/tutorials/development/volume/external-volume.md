---
title: "External Volumes | BYOC"
slug: /external-volume
sidebar_label: "External Volumes"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "An external volume is a read-only reference to a bucket or path in your own cloud object storage (such as AWS S3), allowing Zilliz Cloud to access your data in place without copying or moving it. | BYOC"
type: origin
token: JaLdw76LPiX003kLpKHcA0n8n2d
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# External Volumes

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is available in all AWS regions. It is not available on Microsoft Azure. To use volumes in Azure, [contact us](https://support.zilliz.com/).

</FeatureNote>

An external volume is a read-only reference to a bucket or path in your own cloud object storage (such as AWS S3), allowing Zilliz Cloud to access your data in place without copying or moving it. 

This page explains how to create and delete external volumes via the web console and SDKs.                      

## Considerations\{#considerations}

- A volume is restricted to your project’s cloud provider and region. For example, if your project is in AWS us-west-2, you can create volumes only in AWS us-west-2.

- To use a volume with a cluster, the cluster must be in the same cloud provider and region as the volume.

- To create and manage volumes, you need to be a **Project Admin**.

- You cannot edit the configurations of a volume once it is created. If you want to change the volume settings, please create a new volume with the desired settings instead.

- For external volumes, data stays in your bucket. Therefore, you need to manage data files in your cloud object storage rather than on the external volume.

- Each organization can create up to **100 external volumes.**

## Before you start\{#before-you-start}

Before creating an external volume, you need to integrate your [AWS S3 bucket](./integrate-with-aws-s3). Note that the storage integration should be in the same cloud provider and region as the external volume you wish to create.

## Create an external volume\{#create-an-external-volume}

- **Via SDKs**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    volume_name = "external_volume"
    
    # Create an EXTERNAL volume
    volume_manager.create_volume(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
        region_id="aws-us-west-2",
        volume_name=volume_name,
        volume_type="EXTERNAL",
        storage_integration_id="integ-xxxx",
        path="data/"
    )
    
    print(f"\nVolume {volume_name} created")
    
    # Note: description is not supported by VolumeManager.create_volume as of pymilvus v3.0.2.
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.CreateVolumeRequest;
    
    String cloudEndpoint = "https://api.cloud.zilliz.com";
    String apiKey = "YOUR_API_KEY";
    String projectId = "proj-xxxxxxxxxxxxxxxxxxxxxxx";
    String regionId = "aws-us-west-2";
    String volumeName = "external_volume";
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint(cloudEndpoint)
            .withApiKey(apiKey)
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    CreateVolumeRequest request = CreateVolumeRequest.builder()
            .projectId(projectId)
            .regionId(regionId)
            .volumeName(volumeName)
            .type("EXTERNAL")
            .storageIntegrationId("integ-xxxx")
            .path("data/")
            .build();
    
    volumeManager.createVolume(request);
    System.out.printf("%nVolume %s created%n", volumeName);
    
    // Note: description is not supported by CreateVolumeRequest as of milvus-sdk-java-bulkwriter v3.0.10.
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>
    </Tabs>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    <Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
    <TabItem value='c++'>

    ```c++
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.createVolume({
        projectId: "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        regionId: "aws-us-west-2",
        volumeName: "external_volume",
        type: "EXTERNAL",
        storageIntegrationId: "integ-xxxx",
        path: "data/"
    });
    
    console.log(res.data);
    
    // Note: description is not supported by VolumeCreateReq as of @zilliz/milvus2-sdk-node v3.0.6.
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/volumes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "volumeName": "external_volume",
        "type": "EXTERNAL",
        "storageIntegrationId": "integ-xxxx",
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

    The following table describes the parameters.

    | **Parameter** | **Description** |
    | --- | --- |
    | `projectId` | The ID of the project in which you want to create the volume. |
    | `regionId` | The region of the volume to create must match the cloud provider and region of the target cluster you plan to import or migrate data into. |
    | `volumeName` | The name of the volume to create must be unique across the organization, no longer than 64 characters, start with a letter or underscore, and contain only letters, digits, hyphens, and underscores. |
    | `type` | Set the parameter to `EXTERNAL` to create an external volume. Defaults to `MANAGED`. |
    | `storageIntegrationId` | The ID of the storage integration to reference. Required when `type=EXTERNAL`. The storage integration you select must belong to the same org and region as the external volume you want to create. |
    | `path` | The storage path. Required when `type=EXTERNAL`. |
    | `description`(optional) | The description of the volume to create. Up to 255 characters. |

- **Via web console**

    <Supademo id="cmo15qfif005fy90jzr8ov1sd" title=""  />

    <Procedures>

    1. In the left navigation, click on **Volumes**.

    1. On the volumes page, click on **+ Volume**.

    1. Set the volume configurations.

        The following table describes each parameter used when creating an external volume.

        | **Parameter** | **Description** |
        | --- | --- |
        | Name | The volume name must be unique across the organization, no longer than 64 characters, start with a letter or underscore, and contain only letters, digits, hyphens, and underscores. |
        | Description | This parameter is optional. Up to 255 characters. |
        | Volume Type | Select "External" as the volume type. |
        | Cloud Provider & Region | The volume cloud provider and region must match the cloud provider and region of the target cluster you plan to import or migrate data into. |
        | Storage Integration & Path | Storage integration ([AWS S3 bucket](./integrate-with-aws-s3)) is the credential object that encapsulates the access configuration for your cloud storage.<br/>Path is a pointer to where your data is placed. (Eg. `folder/`) |

    1. Click on **Create**.

    </Procedures>

## List volumes\{#list-volumes}

You can view all existing volumes in a project.

- **Via SDKs**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # List volumes
    volume_list = volume_manager.list_volumes(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
        current_page=1,
        page_size=10
    )
    
    print("\nlistVolumes results:\n", volume_list.json()["data"])
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import com.google.gson.Gson;
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.ListVolumesRequest;
    import io.milvus.bulkwriter.response.volume.ListVolumesResponse;
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint("https://api.cloud.zilliz.com")
            .withApiKey("YOUR_API_KEY")
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    ListVolumesRequest request = ListVolumesRequest.builder()
            .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
            .currentPage(1)
            .pageSize(10)
            .build();
    ListVolumesResponse response = volumeManager.listVolumes(request);
    System.out.println("listVolumes results: " + new Gson().toJson(response));
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>
    </Tabs>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    <Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
    <TabItem value='c++'>

    ```c++
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.listVolumes({
        projectId: "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        currentPage: 1,
        pageSize: 10
    });
    
    console.log(res.data);
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes?projectId=proj-xxxxxxxxxxxxxxxxxxxxxxx&currentPage=1&pageSize=10" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    </TabItem>
    </Tabs>

- **Via web console**

    ![PeL0wrKF1hTHvwbNAZBctTQonZf](https://zdoc-images.s3.us-west-2.amazonaws.com/PeL0wrKF1hTHvwbNAZBctTQonZf.png)

## Describe  external volume\{#describe-external-volume}

You can check the details of a specific volume.

- **Via SDKs**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    volume_name = "external_volume"
    
    # Describe an external volume
    volume_info = volume_manager.describe_volume(
        volume_name=volume_name
    )
    
    print("\ndescribeVolume result:\n", volume_info.json()["data"])
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import com.google.gson.Gson;
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.DescribeVolumeRequest;
    import io.milvus.bulkwriter.response.volume.VolumeInfo;
    
    String cloudEndpoint = "https://api.cloud.zilliz.com";
    String apiKey = "YOUR_API_KEY";
    String volumeName = "external_volume";
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint(cloudEndpoint)
            .withApiKey(apiKey)
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    DescribeVolumeRequest request = DescribeVolumeRequest.builder()
            .volumeName(volumeName)
            .build();
    VolumeInfo volumeInfo = volumeManager.describeVolume(request);
    System.out.println("describeVolume result: " + new Gson().toJson(volumeInfo));
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>
    </Tabs>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    <Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
    <TabItem value='c++'>

    ```c++
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.describeVolume({
        volumeName: "external_volume"
    });
    
    console.log(res.data);
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    export VOLUME_NAME="external_volume"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "external_volume",
    #         "type": "EXTERNAL",
    #         "regionId": "aws-us-west-2",
    #         "storageIntegrationId": "integ-xxxx",
    #         "path": "data/",
    #         "status": "RUNNING",
    #         "createTime": "2024-04-15T12:00:00Z"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

- **Via web console**

    ![NrgXwPhxGhq78NbBfDYcWc6Ened](https://zdoc-images.s3.us-west-2.amazonaws.com/NrgXwPhxGhq78NbBfDYcWc6Ened.png)

## Delete an external volume\{#delete-an-external-volume}

You can delete an external volume at any time if it is no longer needed.

Deleting an external volume removes only the volume metadata from Zilliz Cloud; your data remains intact in your cloud object storage. 

- **Via SDKs**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    volume_name = "external_volume"
    
    # Delete an external volume
    volume_manager.delete_volume(
        volume_name=volume_name
    )
    
    print(f"\nVolume {volume_name} deleted")
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.VolumeManager;
    import io.milvus.bulkwriter.VolumeManagerParam;
    import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;
    
    String cloudEndpoint = "https://api.cloud.zilliz.com";
    String apiKey = "YOUR_API_KEY";
    String volumeName = "external_volume";
    
    VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
            .withCloudEndpoint(cloudEndpoint)
            .withApiKey(apiKey)
            .build();
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    DeleteVolumeRequest request = DeleteVolumeRequest.builder()
            .volumeName(volumeName)
            .build();
    
    volumeManager.deleteVolume(request);
    System.out.printf("%nVolume %s deleted%n", volumeName);
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0-beta.
    ```

    </TabItem>
    </Tabs>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    <Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
    <TabItem value='c++'>

    ```c++
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-cpp as of v3.0.3.
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { VolumeManager } from "@zilliz/milvus2-sdk-node";
    
    const volumeManager = new VolumeManager({
        cloudEndpoint: "https://api.cloud.zilliz.com",
        apiKey: "YOUR_API_KEY"
    });
    
    const res = await volumeManager.deleteVolume({
        volumeName: "external_volume"
    });
    
    console.log(res.data);
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
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

- **Via web console**

    <Supademo id="cmo168p180083y90jhb7al4cb" title=""  />

    <Procedures>

    1. In the left navigation, click on **Volumes**.

    1. Click on **...** in the **Actions** column, and then select **Delete**.

    1. Enter the volume name and click on **Delete**.

    </Procedures>

## FAQs\{#faqs}

**What happens to my volumes if my organization is frozen due to overdue invoices?**

If an organization is frozen, all managed Volumes — both free trial and pay-as-you-go — and all files stored in them are deleted and cannot be restored. External volumes are also frozen and cannot be used for new operations, but your data in your own bucket is not affected.

To continue using volumes, first settle all outstanding invoices.

**What is the difference between an external volume and importing directly from external storage?**

Both allow you to import data from your own S3 or GCS bucket. The key differences are:

- External volume requires you to integrate an [AWS S3 bucket](./integrate-with-aws-s3) with Zilliz Cloud for credential management. Credentials are set up once and reused across multiple volumes and operations. Data engineers do not need direct access to cloud storage keys.

- Direct [external storage import](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) requires you to provide credentials (access key and secret key) with each import request. This is simpler for one-time imports but does not offer credential separation or reusability.

**Can I modify the storage integration or path of an external volume after creation?**

No. The storage integration and path cannot be changed after an external volume is created. To use a different storage integration or path, create a new external volume.

**Can I delete an external volume that is referenced by an active job or external collection?**

No. Deletion is blocked if downstream external collections or active jobs reference the volume.

**Will I be charged for data transfer fees when I use an external volume?**

No. External volumes must be in the same cloud provider and region as your cluster. Since all data access occurs within the same region, no cross-region data transfer fees are incurred on Zilliz Cloud.

**What do the volume statuses mean?**

The following table lists the possible volume statuses.

<table>
   <tr>
     <th><p><strong>Status</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Available</strong></p></td>
     <td><p>The volume is active and usable.</p></td>
   </tr>
   <tr>
     <td><p><strong>Frozen</strong></p></td>
     <td><p>The organization is frozen due to overdue <a href="/docs/view-invoice">invoices</a>. The volume cannot be used for new operations. Please pay your bill to continue using volumes.</p></td>
   </tr>
   <tr>
     <td><p><strong>Error</strong></p></td>
     <td><p>The storage integration validation failed. Check the configuration and retry.</p><p>Application storage integrations are as follows:</p><ul><li><a href="./integrate-with-aws-s3">AWS S3 bucket</a>,</li></ul></td>
   </tr>
</table>

