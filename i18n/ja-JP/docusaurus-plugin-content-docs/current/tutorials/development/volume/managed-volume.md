---
title: "Managed Volumes | Cloud"
slug: /managed-volume
sidebar_label: "Managed Volumes"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "マネージドボリュームは、インポートや移行で使用するデータファイルを格納するための Zilliz Cloud ホスト型オブジェクトストアです。このページでは、Web コンソールおよび SDK を使用したマネージドボリュームの作成、管理、削除の方法について説明します。 | Cloud"
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

この機能は、すべての AWS リージョンおよび Google Cloud リージョンで利用可能ですが、Microsoft Azure では利用できません。Azure でボリュームを使用する場合は、[お問い合わせください](https://support.zilliz.com/)。

</FeatureNote>

マネージドボリュームは、インポートや移行で使用するデータファイルを格納するための Zilliz Cloud ホスト型オブジェクトストアです。このページでは、Web コンソールおよび SDK を使用したマネージドボリュームの作成、管理、削除の方法について説明します。 

## 考慮事項\{#considerations}

- ボリュームは、プロジェクトが属するクラウドプロバイダーおよびリージョンに限定されます。たとえば、プロジェクトが AWS us-west-2 にある場合、作成できるボリュームも AWS us-west-2 のみに限られます。

- クラスターでボリュームを使用するには、そのクラスターがボリュームと同じクラウドプロバイダーおよびリージョンに存在する必要があります。

- ボリュームの作成および管理を行うには、**Project Admin** 権限が必要です。

- ボリュームの設定は作成後に変更できません。設定を変更したい場合は、希望する設定で新しいボリュームを作成してください。

- 1 つの組織あたり、最大 **100 個のマネージドボリューム**を作成できます。

## 事前準備\{#before-you-start}

SDK を使用してボリュームを作成・管理する場合は、まずボリュームマネージャーを初期化する必要があります。

ボリュームマネージャーは、Zilliz Cloud のボリュームサービスへの接続を維持します。ボリュームを管理する前に、ボリュームマネージャーを初期化してください。 

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

## マネージドボリュームの作成\{#create-a-managed-volume}

ボリュームは、Web コンソールまたは SDK を通じて作成できます。

- **SDK を使用する場合**

    ボリュームは Zilliz Cloud プロジェクトに固有のものです。ボリュームを作成する際は、以下のようにプロジェクト ID、リージョン ID、ボリューム名を指定する必要があります。

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

    各パラメーターの説明は以下の表のとおりです。

    | **パラメーター** | **説明** |
    | --- | --- |
    | `projectId` | ボリュームを作成するプロジェクトの ID です。 |
    | `regionId` | 作成するボリュームのリージョンは、データのインポートまたは移行先となるターゲットクラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。 |
    | `volumeName` | 作成するボリュームの名前は、組織全体で一意である必要があります。64 文字以内で、先頭は英字またはアンダースコアとし、使用できる文字は英数字、ハイフン、アンダースコアに限られます。 |
    | `type`(任意) | 選択肢: `MANAGED`、`EXTERNAL`<br/>このパラメーターを省略した場合、デフォルトでマネージドクラスターが作成されます。 |
    | `description`(任意) | 作成するボリュームの説明です。最大 255 文字まで入力できます。 |

- **Web コンソールを使用する場合**

    <Supademo id="cmi76tseu4ok8b7b4l5nods0s" title=""  />

    <Procedures>

    1. 左側のナビゲーションメニューから **Volumes** をクリックします。

    1. ボリューム一覧ページで **+ Volume** をクリックします。

    1. ボリュームの設定を行います。

        マネージドボリューム作成時の各パラメーターについては、以下の表を参照してください。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>名前</p></td>
             <td><p>ボリューム名は組織全体で一意である必要があります。64 文字以内で、先頭は英字またはアンダースコアとし、使用できる文字は英数字、ハイフン、アンダースコアに限られます。</p></td>
           </tr>
           <tr>
             <td><p>説明 (任意)</p></td>
             <td><p>任意のパラメーターです。最大 255 文字まで入力できます。</p></td>
           </tr>
           <tr>
             <td><p>ボリュームタイプ</p></td>
             <td><p>ボリュームタイプとして「Managed」を選択します。</p></td>
           </tr>
           <tr>
             <td><p>課金タイプ</p></td>
             <td><ul><li><p>マネージドボリューム機能を試用するだけの場合は、<strong>無料トライアルボリューム</strong>を作成してください。無料トライアルボリュームは<strong>組織ごとに 1 回のみ</strong>作成可能で、容量やファイルアップロード数に制限があります。詳細は、<a href="./managed-volume#billing">課金</a>セクションの比較表をご確認ください。</p></li><li><p>本番ワークロードで使用する場合は、<strong>従量課金ボリューム</strong>を作成してください。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>クラウドプロバイダーとリージョン</p></td>
             <td><p>ボリュームのクラウドプロバイダーおよびリージョンは、データのインポートまたは移行先となるターゲットクラスターのものと一致している必要があります。</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## マネージドボリュームの一覧表示\{#list-managed-volumes}

プロジェクト内の既存のボリュームをすべて確認できます。

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

## マネージドボリュームの詳細確認\{#describe-managed-volume}

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

    プロジェクト内のボリューム一覧を表示し、ボリューム名をクリックするとその詳細を確認できます。

    ![FU4ow2zIuht0CfbRiBJcFZ6RnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/FU4ow2zIuht0CfbRiBJcFZ6RnYf.png)

## マネージドボリュームへのデータアップロード\{#upload-data-into-a-managed-volume}

現在、データファイルまたはフォルダーをマネージドボリュームにアップロードするには、SDK を使用する必要があります。

1. **ボリュームファイルマネージャーの初期化**

    ボリュームファイルマネージャーは、Zilliz Cloud のボリュームサービス上の特定のボリュームとの接続を管理します。ボリュームにファイルをアップロードする前に、ボリュームファイルマネージャーを初期化する必要があります。

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

1. **ファイルまたはフォルダーのアップロード**

    ボリュームファイルマネージャーの準備ができたら、それを使用して指定したマネージドボリュームにファイルまたはフォルダーをアップロードします。

    - **ファイルのアップロード**

        次の例では、ソースファイルパスのローカルファイルをボリューム内のターゲットファイルパスにアップロードします。

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

    - **フォルダーのアップロード**

        次の例では、ソースファイルパスのローカルファイルをボリューム内のターゲットファイルパスにアップロードします。

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

マネージドボリュームからのデータ削除は、ファイルやフォルダーのサイズに応じて数分かかる場合があります。

<Admonition type="info" icon="📘" title="⚠️ Warning">

削除したファイルやフォルダーは**復元できません**。操作の際はご注意ください。

</Admonition>

現在、マネージドボリュームからのデータ削除は Web コンソールでのみ行えます。

<Supademo id="cmidzfkoqad9sb7b44vnbfzyd" title=""  />

<Procedures>

1. 左側のナビゲーションで **Volumes** をクリックします。

1. **Files** タブに切り替えます。

1. **Actions** 列の **...** をクリックし、**Delete** をクリックします。

</Procedures>

## マネージドボリュームを削除する\{#delete-a-managed-volume}

不要になったマネージドボリュームはいつでも削除できます。なお、無料トライアルボリュームを作成できるのは組織あたり 1 回のみです。一度削除すると、再度作成することはできません。

マネージドボリュームを削除すると、**そのボリューム内のすべてのファイルとフォルダー**も同時に削除されます。

<Admonition type="info" icon="📘" title="⚠️ Warning">

削除したボリュームは**復元できません**。操作の際はご注意ください。

</Admonition>

- **SDK を使用する場合**

    マネージドボリュームは以下の方法で削除できます。

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

マネージドボリュームの作成時に、**無料トライアル**または**従量課金**プランを選択できます。下表に、それぞれの一般的なユースケースと制限を示します。

|  | **無料トライアル** | **従量課金** |
| --- | --- | --- |
| **ユースケース** | テスト環境専用 | 本番環境向け |
| **容量** | 5 GB | 無制限 |
| **アップロード時のファイルサイズと件数** | 1 回のアップロードにつき最大 1 GB、ファイル数は 1,000 件まで | 1 回のアップロードにつき最大 100 GB、ファイル数は無制限 |
| **作成可能な最大ボリューム数** | 1 | 100 |

**無料トライアルボリューム**

- 支払い方法の登録は不要です。

- 無料トライアルボリュームは、各組織につき 1 つのみ作成できます。

- 無料トライアルボリュームは 30 日間保持され、その後自動的に削除されます。

**従量課金ボリューム**

- 有効な支払い方法の登録が必要です。

- 従量課金ボリュームの使用には料金が発生します。

    - 料金は、マネージドボリュームが利用可能な状態にある期間のみ請求されます。

    - 価格の詳細については、[Pricing Guide](http://zilliz.com/pricing/pricing-guide) を参照してください。

    - ボリューム料金の計算方法については、[Storage Cost](./storage-cost) を参照してください。

## よくある質問\{#faqs}

**請求書の未払いにより組織が凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、無料トライアルおよび従量課金を含むすべてのマネージドボリュームと、そこに保存されているすべてのファイルが削除され、復元できなくなります。外部ボリュームも凍結され、新たな操作には使用できませんが、ご自身のバケット内のデータに影響はありません。

ボリュームの利用を再開するには、まず未払いの請求書をすべてお支払いください。

**Web コンソールに無料トライアルボリュームのオプションが表示されないのはなぜですか？**

組織内で一度でも無料トライアルボリュームを作成すると、そのオプションは非表示になります。無料トライアルボリュームは各組織につき 1 つのみ作成可能です。

**ボリュームのステータスにはどのような意味がありますか？**

ボリュームのステータスとその説明を下表に示します。

| **ステータス** | **説明** |
| --- | --- |
| **Available** | ボリュームがアクティブで、使用可能な状態です。 |
| **Frozen** | [請求書](./manage-invoice)の未払いにより組織が凍結されています。このボリュームでは新たな操作を行えません。利用を再開するには、請求書のお支払いが必要です。 |

