---
title: "マネージドボリューム | Cloud"
slug: /managed-volume
sidebar_label: "マネージドボリューム"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "マネージドボリュームは、インポートおよび移行で使用するデータファイルを保持するための、Zilliz Cloud がホストするオブジェクトストアです。このページでは、Web コンソールおよび SDK を使用してマネージドボリュームを作成、管理、削除する方法について説明します。 | Cloud"
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

# マネージドボリューム

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンおよびすべての Google Cloud リージョンで利用できます。Microsoft Azure では利用できません。Azure でボリュームを使用するには、[お問い合わせください](https://support.zilliz.com/)。

</FeatureNote>

マネージドボリュームは、インポートおよび移行で使用するデータファイルを保持するための、Zilliz Cloud がホストするオブジェクトストアです。このページでは、Web コンソールおよび SDK を使用してマネージドボリュームを作成、管理、削除する方法について説明します。 

## 考慮事項\{#considerations}

- ボリュームは、プロジェクトのクラウドプロバイダーとリージョンに制限されます。たとえば、プロジェクトが AWS us-west-2 にある場合、作成できるボリュームも AWS us-west-2 のみです。

- ボリュームをクラスターで使用するには、そのクラスターがボリュームと同じクラウドプロバイダーおよびリージョンに存在している必要があります。

- ボリュームを作成および管理するには、**Project Admin** である必要があります。

- ボリュームは作成後に設定を編集できません。ボリューム設定を変更したい場合は、代わりに希望する設定で新しいボリュームを作成してください。

- 各組織では、最大 **100 個のマネージドボリューム** を作成できます。

## 始める前に\{#before-you-start}

SDK を使用してボリュームを作成および管理する必要がある場合は、まずボリュームマネージャーを初期化する必要があります。

ボリュームマネージャーは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームを管理する前に、ボリュームマネージャーを初期化する必要があります。 

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

## マネージドボリュームを作成する\{#create-a-managed-volume}

Web コンソールまたは SDK を介してボリュームを作成できます。

- **SDK を使用する場合**

    ボリュームは Zilliz Cloud のプロジェクトに固有です。ボリュームを作成する際には、次のようにプロジェクト ID、リージョン ID、およびボリューム名を指定する必要があります。

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

    次の表は、各パラメータを説明しています。

    | **Parameter** | **Description** |
    | --- | --- |
    | `projectId` | ボリュームを作成したいプロジェクトの ID。 |
    | `regionId` | 作成するボリュームのリージョンは、データをインポートまたは移行する予定の対象クラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。 |
    | `volumeName` | 作成するボリューム名は組織全体で一意である必要があり、64 文字以下で、文字またはアンダースコアで始まり、英字、数字、ハイフン、アンダースコアのみを含めることができます。 |
    | `type`(optional) | オプション: `MANAGED`, `EXTERNAL`<br/>このパラメータを省略した場合、デフォルトでマネージドクラスターが作成されます。 |
    | `description`(optional) | 作成するボリュームの説明。255 文字まで。 |

- **Web コンソールを使用する場合**

    <Supademo id="cmi76tseu4ok8b7b4l5nods0s" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. ボリュームページで **+ Volume** をクリックします。

    1. ボリューム設定を指定します。

        次の表は、マネージドボリュームの作成時に使用される各パラメータを説明しています。

        <table>
           <tr>
             <th><p><strong>Parameter</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>Name</p></td>
             <td><p>ボリューム名は組織全体で一意である必要があり、64 文字以下で、文字またはアンダースコアで始まり、英字、数字、ハイフン、アンダースコアのみを含めることができます。</p></td>
           </tr>
           <tr>
             <td><p>Description (optional)</p></td>
             <td><p>このパラメータは任意です。255 文字までです。</p></td>
           </tr>
           <tr>
             <td><p>Volume Type</p></td>
             <td><p>ボリュームタイプとして "Managed" を選択します。</p></td>
           </tr>
           <tr>
             <td><p>Billing Type</p></td>
             <td><ul><li><p>マネージドボリューム機能を試すだけであれば、<strong>無料トライアルボリューム</strong>を作成してください。無料トライアルボリュームは<strong>組織ごとに 1 回のみ</strong>作成でき、容量およびファイルアップロード数に制限があります。詳細については、<a href="./managed-volume#billing">課金</a>セクションの比較表を参照してください。</p></li><li><p>本番ワークロード向けには、<strong>従量課金制ボリューム</strong>を作成してください。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>Cloud Provider & Region</p></td>
             <td><p>ボリュームのクラウドプロバイダーとリージョンは、データをインポートまたは移行する予定の対象クラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## マネージドボリュームを一覧表示する\{#list-managed-volumes}

プロジェクト内の既存のすべてのボリュームを表示できます。

- **SDK を使用する場合**

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

- **Web コンソールを使用する場合**

    ![Hp1Hwxoj9hkJqdbECCYcB4G6nVe](https://zdoc-images.s3.us-west-2.amazonaws.com/Hp1Hwxoj9hkJqdbECCYcB4G6nVe.png)

## マネージドボリュームの詳細を確認する\{#describe-managed-volume}

特定のマネージドボリュームの詳細を確認することもできます。

- **SDK を使用する場合**

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

- **Web コンソールを使用する場合**

    プロジェクト内のボリューム一覧を表示し、ボリューム名をクリックして特定のボリュームの詳細を確認できます。

    ![FU4ow2zIuht0CfbRiBJcFZ6RnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/FU4ow2zIuht0CfbRiBJcFZ6RnYf.png)

## マネージドボリュームにデータをアップロードする\{#upload-data-into-a-managed-volume}

現在、マネージドボリュームへのデータファイルまたはフォルダのアップロードは SDK 経由でのみ可能です。

1. **ボリュームファイルマネージャーを初期化する**

    ボリュームファイルマネージャーは、Zilliz Cloud のボリュームサービス上の特定のボリュームへの接続を維持します。ボリュームにファイルをアップロードする前に、ボリュームファイルマネージャーを初期化する必要があります。

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

    ボリュームファイルマネージャーの準備ができたら、それを使用して指定したマネージドボリュームにファイルまたはフォルダをアップロードします。 

    - **ファイルをアップロードする**

        次の例では、ローカルのソースファイルパスにあるファイルを、ボリューム内のターゲットファイルパスにアップロードします。

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

        次の例では、ローカルのソースファイルパスにあるフォルダを、ボリューム内のターゲットファイルパスにアップロードします。

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

## マネージドボリュームからデータを削除する\{#delete-data-from-a-managed-volume}

マネージドボリュームからのデータ削除には、ファイルまたはフォルダのサイズによって数分かかる場合があります。

<Admonition type="info" icon="📘" title="⚠️ Warning">

削除されたファイルとフォルダは**復元できません**。十分注意して操作してください。

</Admonition>

現在、マネージドボリュームからのデータ削除は Web コンソール経由でのみ可能です。

<Supademo id="cmidzfkoqad9sb7b44vnbfzyd" title=""  />

<Procedures>

1. 左側のナビゲーションで **Volumes** をクリックします。

1. **Files** タブに切り替えます。

1. **Actions** 列で **...** をクリックし、**Delete** をクリックします。

</Procedures>

## マネージドボリュームを削除する\{#delete-a-managed-volume}

不要になったマネージドボリュームはいつでも削除できます。無料トライアルボリュームは組織ごとに 1 回しか作成できない点に注意してください。削除すると、以後無料トライアルボリュームを作成できなくなります。

マネージドボリュームを削除すると、その中の**すべてのファイルとフォルダ**も削除されます。

<Admonition type="info" icon="📘" title="⚠️ Warning">

削除されたボリュームは**復元できません**。十分注意して操作してください。

</Admonition>

- **SDK を使用する場合**

    次のようにマネージドボリュームを削除できます。

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

- **Web コンソールを使用する場合**

    <Supademo id="cmi77c5554p1gb7b4sqqsm7nn" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. **Actions** 列の **...** をクリックし、**Delete** を選択します。

    1. ボリューム名を入力し、**Delete** をクリックします。

    </Procedures>

## 課金\{#billing}

マネージドボリュームを作成する際は、**無料トライアル**または**従量課金制**プランのいずれかを選択できます。以下の表では、それぞれの一般的な用途と制限を比較しています。

|  | **Free Trial** | **Pay-as-you-go** |
| --- | --- | --- |
| **Use case** | テスト環境専用。 | 本番利用向け。 |
| **Capacity** | 5 GB | 無制限 |
| **File size & amount per upload** | 1 回のアップロードにつき最大 1 GB のデータ、かつファイル数は 1,000 個以下 | 1 回のアップロードにつき最大 100 GB のデータ、かつファイル数は無制限 |
| **Max. numbers volumes** | 1 | 100 |

**無料トライアルボリューム**

- 支払い方法の登録は不要です。

- 各組織で保持できる無料トライアルボリュームは 1 つだけです。

- 無料トライアルボリュームは 30 日間保持され、その後自動的に削除されます。

**従量課金制ボリューム**

- 有効な支払い方法が必要です。

- 従量課金制ボリュームの使用には料金が発生します。

    - マネージドボリュームが利用可能な場合にのみ課金されます。

    - 定価については、[Pricing Guide](http://zilliz.com/pricing/pricing-guide) を参照してください。

    - ボリューム料金の計算方法については、[Storage Cost](./storage-cost) を参照してください。

## FAQs\{#faqs}

**請求書の支払い遅延により組織が凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、無料トライアルおよび従量課金制のすべてのマネージド Volume と、それらに保存されているすべてのファイルは削除され、復元できません。外部ボリュームも凍結され、新しい操作には使用できなくなりますが、お客様自身のバケット内のデータには影響しません。

ボリュームの利用を継続するには、まず未払いの請求書をすべて精算してください。

**Web コンソールで無料トライアルボリュームのオプションが表示されないのはなぜですか？**

無料トライアルボリュームのオプションは、組織で無料トライアルボリュームが作成されると非表示になります。各組織で作成できる無料トライアルボリュームは 1 つだけです。

**ボリュームのステータスにはどのような意味がありますか？**

次の表に、ボリュームで取り得るステータスを示します。

| **Status** | **Description** |
| --- | --- |
| **Available** | ボリュームはアクティブで、使用可能です。 |
| **Frozen** | 組織は請求書の支払い遅延により凍結されています（[invoices](./manage-invoice) を参照）。このボリュームは新しい操作には使用できません。ボリュームの利用を継続するには、請求書をお支払いください。 |

