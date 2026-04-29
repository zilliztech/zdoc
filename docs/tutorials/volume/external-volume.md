---
title: "External Volumes | Cloud"
slug: /external-volume
sidebar_key: external-volume
sidebar_label: "External Volumes"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "An external volume is a read-only reference to a bucket or path in your own cloud object storage (such as AWS S3 or Google Cloud Storage), allowing Zilliz Cloud to access your data in-place without copying or moving it. | Cloud"
type: origin
token: JaLdw76LPiX003kLpKHcA0n8n2d
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - volume

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# External Volumes

An external volume is a read-only reference to a bucket or path in your own cloud object storage (such as AWS S3 or Google Cloud Storage), allowing Zilliz Cloud to access your data in-place without copying or moving it. 

This page explains how to create and delete external volumes via the web console and SDKs.                      

## Considerations\{#considerations}

- Volumes are available on **AWS** and **Google Cloud** only. For **Azure**, [contact support](https://support.zilliz.com/).

- A volume is restricted to your project’s cloud provider and region. For example, if your project is in AWS us-west-2, you can create volumes only in AWS us-west-2.

- To use a volume with a cluster, the cluster must be in the same cloud provider and region as the volume.

- To create and manage volumes, you need to be a **Project Admin**.

- You cannot edit the configurations of a volume once it is created. If you want to change the volume settings, please create a new volume with the desired settings instead.

- For external volumes, data stays in your bucket. Therefore you need to manage data files in your cloud object storage instead of the external volume.

- Each organization can create a maximum of **100 external volumes.**

## Before you start\{#before-you-start}

Before creating an external volume, you need to integrate your [AWS S3 bucket](./integrate-with-aws-s3), [Google GCS bucket](./integrate-with-gcp), or [Azure blob container](./integrate-with-azure-blob-storage). Note that the storage integration should be in the same cloud provider and region as the external volume you wish to create.

## Create an external volume\{#create-an-external-volume}

- **Via SDKs**

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
        volume_name="ext_volume",
        volume_type="EXTERNAL",
        storage_integration_id="integ-xxxx",
        path="data/",
    )
    
    print(f"\nVolume ext_volume created")
    
    # Volume ext_volume created
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
        .volumeName("ext_volume")
        .type("EXTERNAL")
        .storageIntegrationId("integ-xxxx")
        .path("data/")
        .build();
    
    volumeManager.createVolume(request);
    
    System.out.printf("\nVolume %s created%n", "ext_volume");
    
    // Volume ext_volume created
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/volumes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxx",
        "regionId": "aws-us-west-2",
        "volumeName": "ext_volume",
        "type": "EXTERNAL",
        "storageIntegrationId": "integ-xxxx",
        "path": "/data/"
    }'
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "ext_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

    The following table describes the parameters.

    <table>
       <tr>
         <th><p><strong>Parameter</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p><code>projectId</code></p></td>
         <td><p>The ID of the project in which you want to create the volume.</p></td>
       </tr>
       <tr>
         <td><p><code>regionId</code></p></td>
         <td><p>The region of the volume to create must match the cloud provider and region of the target cluster you plan to import or migrate data into.</p></td>
       </tr>
       <tr>
         <td><p><code>volumeName</code></p></td>
         <td><p>The name of the volume to create must be unique across the organization, no longer than 64 characters, start with a letter or underscore, and contain only letters, digits, hyphens, and underscores.</p></td>
       </tr>
       <tr>
         <td><p><code>type</code></p></td>
         <td><p>Set the parameter to <code>EXTERNAL</code> to create an external volume. Defaults to <code>MANAGED</code>.</p></td>
       </tr>
       <tr>
         <td><p><code>storageIntegrationId</code></p></td>
         <td><p>The ID of the storage integration to reference. Required when <code>type=EXTERNAL</code>. The storage integration you select must belong to the same org and region as the external volume you want to create.</p></td>
       </tr>
       <tr>
         <td><p><code>path</code></p></td>
         <td><p>The storage path. Required when <code>type=EXTERNAL</code>.</p></td>
       </tr>
    </table>

- **Via web console**

    <Supademo id="cmo15qfif005fy90jzr8ov1sd" title=""  />

    <Procedures>

    1. In the left navigation, click on **Volumes**.

    1. On the volumes page, click on **+ Volume**.

    1. Set the volume configurations.

        The following table describes each parameter used when creating an external volume.

        <table>
           <tr>
             <th><p><strong>Parameter</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>Name</p></td>
             <td><p>The volume name must be unique across the organization, no longer than 64 characters, start with a letter or underscore, and contain only letters, digits, hyphens, and underscores.</p></td>
           </tr>
           <tr>
             <td><p>Description</p></td>
             <td><p>This parameter is optional.</p></td>
           </tr>
           <tr>
             <td><p>Volume Type</p></td>
             <td><p>Select "External" as the volume type.</p></td>
           </tr>
           <tr>
             <td><p>Cloud Provider & Region</p></td>
             <td><p>The volume cloud provider and region must match the cloud provider and region of the target cluster you plan to import or migrate data into.</p></td>
           </tr>
           <tr>
             <td><p>Storage Integration & Path</p></td>
             <td><p>Storage integration (<a href="./integrate-with-aws-s3">AWS S3 bucket</a>, <a href="./integrate-with-gcp">Google GCS bucket</a>, or <a href="./integrate-with-azure-blob-storage">Azure blob container</a>) is the credential object that encapsulates the access configuration for your cloud storage.</p><p>Path is a pointer to where your data is placed. (Eg. <code>folder/</code>)</p></td>
           </tr>
        </table>

    1. Click on **Create**.

    </Procedures>

## View external volumes\{#view-external-volumes}

You can view all existing volumes in a project.

- **Via SDKs**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Shell","value":"shell"}]}>
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
    #             "volumeName": "ext_volume"
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
    //             "volumeName": "my_volume",
    //             "type":"EXTERNAL"
    //         }        
    //     ]
    // }
    ```

    </TabItem>
    </Tabs>

    ```shell
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes?projectId=proj-xxxxxxxxxxxxxxxxx" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumes": [
    #            {
    #                "volumeName": "my-volume",
    #                "type": "MANAGED"
    #            },
    #            {
    #                "volumeName": "ext-volume",
    #                "type": "EXTERNAL"
    #            }
    #        ],
    #        "count": 2,
    #        "currentPage": 1,
    #        "pageSize": 10
    #    }
    #}
    ```

- **Via web console**

    ![PeL0wrKF1hTHvwbNAZBctTQonZf](https://zdoc-images.s3.us-west-2.amazonaws.com/PeL0wrKF1hTHvwbNAZBctTQonZf.png)

## Check volume details\{#check-volume-details}

You can check the details of a specific volume.

- **Via SDKs**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Shell","value":"shell"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # View volumes
    volume_list = volume_manager.describe_volume(
            volume_name="ext_volume"
    )
    
    print(f"\ndescVolume results: \n", volume_list.json()['data'])
    
    # descVolume results: 
    # 
    # {
    #    "volumeName": "ext-volume",
    #    "type": "EXTERNAL",
    #    "regionId": "aws-us-west-2",
    #    "storageIntegrationId": "si-xxxx",
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
        .withCloudEndpoint("https://api.cloud.zilliz.com")
        .withApiKey("YOUR_API_KEY")
        .build();
            
    VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
    
    // View volumes
    import com.google.gson.Gson;
    import io.milvus.bulkwriter.request.volume.DescribeVolumeRequest;
    
    DescribeVolumeRequest request = DescribeVolumeRequest.builder()
        .volumeName("descVolume")
        .build();
        
    VolumeInfo volumeInfo = volumeManager.describeVolume(request);
    
    System.out.println("\ndescVolume results: " + new Gson().toJson(volumeInfo));
    
    // descVolume results: 
    // 
    // {
    //    "volumeName": "ext-volume",
    //    "type": "EXTERNAL",
    //    "regionId": "aws-us-west-2",
    //    "storageIntegrationId": "si-xxxx",
    //    "path": "data/",
    //    "status": "RUNNING",
    //    "createTime": "2024-04-15T12:00:00Z",
    // }
    ```

    </TabItem>
    </Tabs>

    ```shell
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #    "code": 0,
    #    "data": {
    #        "volumeName": "ext-volume",
    #        "type": "EXTERNAL",
    #        "regionId": "aws-us-west-2",
    #        "storageIntegrationId": "si-xxxx",
    #        "path": "data/",
    #        "status": "RUNNING",
    #        "createTime": "2024-04-15T12:00:00Z"
    #    }
    #}
    ```

- **Via web console**

    ![NrgXwPhxGhq78NbBfDYcWc6Ened](https://zdoc-images.s3.us-west-2.amazonaws.com/NrgXwPhxGhq78NbBfDYcWc6Ened.png)

## Delete an external volume\{#delete-an-external-volume}

You can delete an external volume at any time if it is no longer needed.

Deleting an external volume removes only the volume metadata from Zilliz Cloud; your data remains intact in your cloud object storage. 

- **Via SDKs**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # Delete a volume
    volume_manager.delete_volume(
        volume_name="my_volume"
    )
    
    print(f"\nVolume my_volume deleted")
    
    # Volume my_volume deleted
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
    
    // Delete a volume
    import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;
    
    DeleteVolumeRequest request = DeleteVolumeRequest.builder()
        .volumeName("my_volume")
        .build();
    
    volumeManager.deleteVolume(request);
    
    System.out.printf("\nVolume %s deleted%n", "my_volume");
    
    // Volume my_volume deleted
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    export VOLUME_NAME="my_volume"
    
    curl --request DELETE \
    --url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "my_volume"
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

## Billing\{#billing}

Creating and using an external volume incurs no Zilliz Cloud charges. No payment method is required.

However, your cloud provider may charge data request fees when Zilliz Cloud reads from your bucket during import or migration. For details, see [Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/) or [Google Cloud Storage Pricing](https://cloud.google.com/storage/pricing.).

## FAQs\{#faqs}

**What happens to my volumes if my organization is frozen due to overdue invoices?**

If an organization is frozen, all managed Volumes — both free trial and pay-as-you-go — and all files stored in them are deleted and cannot be restored. External volumes are also frozen and cannot be used for new operations, but your data in your own bucket is not affected.

To continue using volumes, first settle all outstanding invoices.

**What is the difference between an external volume and importing directly from external storage?**

Both allow you to import data from your own S3 or GCS bucket. The key differences are:

- External volume uses a [storage integration](null) for credential management. Credentials are set up once and reused across multiple volumes and operations. Data engineers do not need direct access to cloud storage keys.

- Direct [external storage import](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) requires you to provide credentials (access key, secret key) inline with each import request. This is simpler for one-time imports but does not offer credential separation or reusability.

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
     <td><p><strong>Running</strong></p></td>
     <td><p>The volume is active and usable.</p></td>
   </tr>
   <tr>
     <td><p><strong>Frozen</strong></p></td>
     <td><p>The organization is frozen due to overdue <a href="./view-invoice">invoices</a>. The volume cannot be used for new operations. Please pay your bill to continue using volumes.</p></td>
   </tr>
   <tr>
     <td><p><strong>Error</strong></p></td>
     <td><p>The <a href="null">storage integration</a> validation failed. Check the configuration and retry.</p></td>
   </tr>
</table>

