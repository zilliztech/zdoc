---
title: "Managed Volumes | BYOC"
slug: /managed-volume
sidebar_label: "Managed Volumes"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "managed volume は、インポートおよび移行で使用されるデータファイルを保持するための Zilliz Cloud ホスト型オブジェクトストアです。このページでは、Web コンソールおよび SDK を使用して managed volume を作成、管理、削除する方法を説明します。 | BYOC"
type: origin
token: A33MwQX84iXyQNkzopece3oenye
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Managed Volumes

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンおよびすべての Google Cloud リージョンで利用できます。Microsoft Azure では利用できません。Azure で volume を使用するには、[お問い合わせください](https://support.zilliz.com/)。

</FeatureNote>

managed volume は、インポートおよび移行で使用されるデータファイルを保持するための Zilliz Cloud ホスト型オブジェクトストアです。このページでは、Web コンソールおよび SDK を使用して managed volume を作成、管理、削除する方法を説明します。 

## Considerations\{#considerations}

- volume は、プロジェクトのクラウドプロバイダーおよびリージョンに制限されます。たとえば、プロジェクトが AWS us-west-2 にある場合、作成できる volume も AWS us-west-2 のみです。

- cluster で volume を使用するには、cluster が volume と同じクラウドプロバイダーおよびリージョンに存在している必要があります。

- volume を作成および管理するには、**Project Admin** である必要があります。

- volume は一度作成すると、その設定を編集できません。volume の設定を変更したい場合は、代わりに目的の設定で新しい volume を作成してください。

- 各 organization で作成できる managed volume の上限は **100 個**です。

## Before you start\{#before-you-start}

SDK を使用して volume を作成・管理する必要がある場合は、まず volume manager を初期化する必要があります。

volume manager は、Zilliz Cloud の volume service への接続を維持します。volume を管理する前に、volume manager を初期化する必要があります。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

## Create a managed volume\{#create-a-managed-volume}

volume は Web コンソールまたは SDK 経由で作成できます。

- **SDK 経由**

    volume は Zilliz Cloud プロジェクトに固有です。volume を作成する際は、次のようにプロジェクト ID、リージョン ID、volume 名を指定する必要があります。

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

    次の表はパラメータを説明しています。

    | **Parameter** | **Description** |
    | --- | --- |
    | `projectId` | volume を作成したいプロジェクトの ID。 |
    | `regionId` | 作成する volume のリージョンは、データをインポートまたは移行する対象 cluster のクラウドプロバイダーおよびリージョンと一致している必要があります。 |
    | `volumeName` | 作成する volume 名は organization 全体で一意である必要があり、64 文字以内、先頭は文字またはアンダースコアで、文字、数字、ハイフン、アンダースコアのみを含める必要があります。 |
    | `type`(optional) | オプション: `MANAGED`, `EXTERNAL`<br/>このパラメータを省略すると、デフォルトで managed cluster が作成されます。 |
    | `description`(optional) | 作成する volume の説明。255 文字まで。 |

- **Web コンソール経由**

    <Supademo id="cmi76tseu4ok8b7b4l5nods0s" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. Volumes ページで **+ Volume** をクリックします。

    1. volume の設定を行います。

        次の表は、managed volume の作成時に使用する各パラメータを説明しています。

        <table>
           <tr>
             <th><p><strong>Parameter</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>Name</p></td>
             <td><p>volume 名は organization 全体で一意である必要があり、64 文字以内、先頭は文字またはアンダースコアで、文字、数字、ハイフン、アンダースコアのみを含める必要があります。</p></td>
           </tr>
           <tr>
             <td><p>Description (optional)</p></td>
             <td><p>このパラメータは任意です。255 文字までです。</p></td>
           </tr>
           <tr>
             <td><p>Volume Type</p></td>
             <td><p>volume タイプとして「Managed」を選択します。</p></td>
           </tr>
           <tr>
             <td><p>Billing Type</p></td>
             <td><ul><li><p>managed volume 機能を試すだけであれば、<strong>free trial volume</strong> を作成します。free trial volume は <strong>organization ごとに 1 回のみ</strong> 作成でき、容量およびファイルアップロードに制限があります。詳細については、<a href="./managed-volume#billing">Billing</a> セクションの比較表を参照してください。</p></li><li><p>本番ワークロードには、<strong>pay-as-you-go volume</strong> を作成します。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>Cloud Provider & Region</p></td>
             <td><p>volume のクラウドプロバイダーおよびリージョンは、データをインポートまたは移行する対象 cluster のクラウドプロバイダーおよびリージョンと一致している必要があります。</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## List managed volumes\{#list-managed-volumes}

プロジェクト内の既存のすべての volume を表示できます。

- **SDK 経由**

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

- **Web コンソール経由**

    ![Hp1Hwxoj9hkJqdbECCYcB4G6nVe](https://zdoc-images.s3.us-west-2.amazonaws.com/Hp1Hwxoj9hkJqdbECCYcB4G6nVe.png)

## Describe managed volume\{#describe-managed-volume}

特定の managed volume の詳細を確認することもできます。

- **SDK 経由**

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
    volume_list = volume_manager.describe_volume(
        volume_name="managed_volume",
    )
    
    print(f"\ndescVolume result: \n", volume_list.json()['data'])
    
    # describeVolume result: 
    # {
    #    "volumeName": "managed_volume",
    #    "type": "MANAGED",
    #    "regionId": "aws-us-west-2",
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
        .withCloudEndpoint("https://api.cloud.zilliz.com")
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
    //    "regionId": "aws-us-west-2",
    //    "status": "RUNNING",
    //    "createTime": "2026-05-06T02:24:26Z"
    //}
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
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
    #        "type": "MANAGED",
    #        "regionId": "aws-us-west-2",
    #        "status": "RUNNING",
    #        "createTime": "2024-04-15T12:00:00Z"
    #    }
    #}
    ```

    </TabItem>
    </Tabs>

- **Web コンソール経由**

    プロジェクト内の volume の一覧を表示し、volume 名をクリックすることで特定の volume の詳細を確認できます。

    ![FU4ow2zIuht0CfbRiBJcFZ6RnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/FU4ow2zIuht0CfbRiBJcFZ6RnYf.png)

## Upload data into a managed volume\{#upload-data-into-a-managed-volume}

現時点では、managed volume へのデータファイルまたはフォルダのアップロードは SDK 経由でのみ可能です。

1. **volume file manager を初期化する**

    volume file manager は、Zilliz Cloud の volume service 上の特定の volume への接続を維持します。volume にファイルをアップロードする前に、volume file manager を初期化する必要があります。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager
    
    volume_file_manager = VolumeFileManager(
        cloud_endpoint='https://api.cloud.zilliz.com',
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
        .withCloudEndpoint("https://api.cloud.zilliz.com")
        .withApiKey("YOUR_API_KEY")
        .withVolumeName("managed_volume")
        .build();
    
    VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
    ```

    </TabItem>
    </Tabs>

1. **ファイルまたはフォルダをアップロードする**

    volume file manager の準備ができたら、これを使用して指定した managed volume にファイルまたはフォルダをアップロードします。 

    - **ファイルをアップロードする**

        次の例では、ローカルのソースファイルパスにあるファイルを、volume 内のターゲットファイルパスにアップロードします。

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

    - **フォルダをアップロードする**

        次の例では、ローカルのソースファイルパスにあるファイルを、volume 内のターゲットファイルパスにアップロードします。

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

## Delete data from a managed volume\{#delete-data-from-a-managed-volume}

managed volume からのデータ削除には、ファイルまたはフォルダのサイズによって数分かかる場合があります。

<Admonition type="info" icon="📘" title="⚠️ Warning">

削除されたファイルとフォルダは**復元できません**。注意して進めてください。

</Admonition>

現時点では、managed volume からのデータ削除は Web コンソール経由でのみ可能です。

<Supademo id="cmidzfkoqad9sb7b44vnbfzyd" title=""  />

<Procedures>

1. 左側のナビゲーションで **Volumes** をクリックします。

1. **Files** タブに切り替えます。

1. **Actions** 列で **...** をクリックし、**Delete** をクリックします。

</Procedures>

## Delete a managed volume\{#delete-a-managed-volume}

不要になった managed volume はいつでも削除できます。free trial volume は organization ごとに 1 回しか作成できない点に注意してください。削除すると、以後 free trial volume を新たに作成することはできません。

managed volume を削除すると、その中の**すべてのファイルとフォルダ**も削除されます。

<Admonition type="info" icon="📘" title="⚠️ Warning">

削除された volume は**復元できません**。注意して進めてください。

</Admonition>

- **SDK 経由**

    次のように managed volume を削除できます。

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
        .withCloudEndpoint("https://api.cloud.zilliz.com")
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
    export BASE_URL="https://api.cloud.zilliz.com"
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

- **Web コンソール経由**

    <Supademo id="cmi77c5554p1gb7b4sqqsm7nn" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. **Actions** 列の **...** をクリックし、**Delete** を選択します。

    1. volume 名を入力して **Delete** をクリックします。

    </Procedures>

## Billing\{#billing}

managed volume を作成する際は、**free trial** または **pay-as-you-go** プランを選択できます。以下の表は、それぞれの一般的なユースケースと制限を比較したものです。

|  | **Free Trial** | **Pay-as-you-go** |
| --- | --- | --- |
| **Use case** | テスト環境専用。 | 本番利用向け。 |
| **Capacity** | 5 GB | 無制限 |
| **File size & amount per upload** | 1 回のアップロードにつき最大 1 GB のデータ、かつファイル数は 1,000 個以下 | 1 回のアップロードにつき最大 100 GB のデータ、かつファイル数は無制限 |
| **Max. numbers volumes** | 1 | 100 |

**Free trial volume**

- 支払い方法は不要です。

- 各 organization で保持できる free trial volume は 1 つだけです。

- free trial volume は 30 日間保持され、その後自動的に削除されます。

**Pay-as-you-go volume**

- 有効な支払い方法が必要です。

- pay-as-you-go volume の使用には料金が発生します。

    - managed volume が利用可能なときにのみ課金されます。

    - 定価については、[Pricing Guide](http://zilliz.com/pricing/pricing-guide) を参照してください。

    - volume の課金方法について理解するには、[Storage Cost](./storage-cost) を参照してください。

## FAQs\{#faqs}

**請求書の未払いにより組織が凍結された場合、volume はどうなりますか？**

組織が凍結されると、無料トライアルと従量課金制の両方を含むすべての managed Volume と、その中に保存されているすべてのファイルは削除され、復元できません。external volume も凍結され、新しい操作には使用できなくなりますが、お客様自身の bucket 内のデータには影響ありません。

volume の利用を継続するには、まず未払いの請求書をすべて精算してください。

**Web コンソールで無料トライアル volume オプションが表示されないのはなぜですか？**

無料トライアル volume オプションは、組織用に無料トライアル volume が一度作成されると非表示になります。各組織で作成できる無料トライアル volume は 1 つだけです。

**volume のステータスは何を意味しますか？**

以下の表は、volume に設定される可能性のあるステータスを示しています。

| **Status** | **Description** |
| --- | --- |
| **Available** | この volume はアクティブで、使用可能です。 |
| **Frozen** | 組織は請求書の未払いにより凍結されています。volume は新しい操作には使用できません。volume の利用を継続するには、[請求書](./manage-invoice)をお支払いください。 |

