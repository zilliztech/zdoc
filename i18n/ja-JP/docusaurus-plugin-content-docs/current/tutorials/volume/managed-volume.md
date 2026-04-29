---
title: "マネージドボリューム | Cloud"
slug: /managed-volume
sidebar_key: managed-volume
sidebar_label: "マネージドボリューム"
beta: FALSE
notebook: FALSE
description: "マネージドボリュームは、インポートや移行に使用するデータファイルを保存するための Zilliz Cloud ホスト型オブジェクトストレージです。このページでは、Web コンソールおよび SDK を介してマネージドボリュームを作成、管理、削除する方法について説明します。| Cloud"
type: origin
token: A33MwQX84iXyQNkzopece3oenye
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - ボリューム

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# マネージドボリューム

マネージドボリュームは、インポートおよび移行に使用するデータファイルを格納するための Zilliz Cloud ホスト型オブジェクトストレージです。このページでは、Web コンソールおよび SDK を介してマネージドボリュームを作成、管理、削除する方法について説明します。

## 考慮事項\{#considerations}

- ボリュームは **AWS** および **Google Cloud** のみで利用可能です。**Azure** については、[サポートにお問い合わせください](https://support.zilliz.com/)。

- ボリュームは、プロジェクトのクラウドプロバイダーおよびリージョンに制限されます。たとえば、プロジェクトが AWS us-west-2 にある場合、ボリュームを作成できるのは AWS us-west-2 のみです。

- クラスターでボリュームを使用するには、クラスターがボリュームと同じクラウドプロバイダーおよびリージョンにある必要があります。

- ボリュームを作成および管理するには、**プロジェクト管理者** である必要があります。

- ボリュームの設定は、一度作成すると編集できません。ボリューム設定を変更する場合は、希望する設定で新しいボリュームを作成してください。

- 各組織で作成できるマネージドボリュームの最大数は **100** です。

## 始める前に\{#before-you-start}

SDK を介してボリュームを作成および管理する必要がある場合は、まずボリュームマネージャーを初期化する必要があります。

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

<TabItem value='java'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

## マネージドボリュームの作成\{#create-a-managed-volume}

Web コンソールまたは SDK を使用してボリュームを作成できます。

- **SDK を使用する場合**

    ボリュームは Zilliz Cloud プロジェクト固有です。ボリュームを作成する際は、プロジェクト ID、リージョン ID、およびボリューム名を以下のように指定する必要があります。

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
        region_id="aws-us-west-1", 
        volume_name="my_volume"
    )
    
    print(f"\nVolume my_volume created")
    
    # Volume my_volume created
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
        .regionId("aws-us-west-1")
        .volumeName("my_volume")
        .build();
    
    volumeManager.createVolume(request);
    
    System.out.printf("\nVolume %s created%n", "my_volume");
    
    // Volume my_volume created
    ```

    </TabItem>

    <TabItem value='java'>

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/volumes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-1",
        "volumeName": "my_volume",
        "type": "MANAGED"
    }'
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "my_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

    以下の表は、パラメーターについて説明しています。

    <table>
       <tr>
         <th><p><strong>パラメーター</strong></p></th>
         <th><p><strong>説明</strong></p></th>
       </tr>
       <tr>
         <td><p><code>projectId</code></p></td>
         <td><p>ボリュームを作成するプロジェクトの ID。</p></td>
       </tr>
       <tr>
         <td><p><code>regionId</code></p></td>
         <td><p>作成するボリュームのリージョンは、データのインポートまたは移行先となるターゲットクラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。</p></td>
       </tr>
       <tr>
         <td><p><code>volumeName</code></p></td>
         <td><p>作成するボリュームの名前は、組織全体で一意であり、64 文字以下で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含む必要があります。</p></td>
       </tr>
       <tr>
         <td><p><code>type</code>(オプション)</p></td>
         <td><p>このパラメーターを省略した場合、デフォルトでマネージドクラスターが作成されます。</p></td>
       </tr>
    </table>

- **ウェブコンソール経由**

    <Supademo id="cmi76tseu4ok8b7b4l5nods0s" title=""  />

    <Procedures>

    1. 左側のナビゲーションで、**ボリュームs** をクリックします。

    1. ボリュームページで、**+ ボリューム** をクリックします。

    1. ボリュームの設定を行います。

        以下の表は、マネージドボリュームを作成する際に使用される各パラメーターについて説明しています。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>Name</p></td>
             <td><p>ボリューム名は、組織全体で一意であり、64 文字以下で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含む必要があります。</p></td>
           </tr>
           <tr>
             <td><p>Description</p></td>
             <td><p>このパラメーターはオプションです。</p></td>
           </tr>
           <tr>
             <td><p>ボリューム Type</p></td>
             <td><p>ボリュームタイプとして「Managed」を選択します。</p></td>
           </tr>
           <tr>
             <td><p>請求 Type</p></td>
             <td><ul><li><p>マネージドボリューム機能を試すだけであれば、<strong>無料トライアルボリューム</strong>を作成します。無料トライアルボリュームは<strong>組織ごとに 1 回</strong>作成でき、容量とファイルアップロードに制限があります。詳細については、<a href="./managed-volume#billing">請求</a>セクションの比較表をご覧ください。</p></li><li><p>本番ワークロードの場合は、<strong>従量課金ボリューム</strong>を作成します。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>クラウドプロバイダーとリージョン</p></td>
             <td><p>ボリュームのクラウドプロバイダーおよびリージョンは、データのインポートまたは移行先となるターゲットクラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## View managed volumes\{#view-managed-volumes}

プロジェクト内の既存のすべてのボリュームを表示できます。

- **SDK 経由**

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

- **ウェブコンソール経由**

    ![Hp1Hwxoj9hkJqdbECCYcB4G6nVe](https://zdoc-images.s3.us-west-2.amazonaws.com/Hp1Hwxoj9hkJqdbECCYcB4G6nVe.png)

## ボリュームの詳細を確認する\{#check-volume-details}

特定の管理ボリュームの詳細も確認できます。

- **SDK 経由**

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

- **ウェブコンソール経由**

    プロジェクト内のボリュームの一覧を表示し、ボリューム名をクリックして特定のボリュームの詳細を確認できます。

    ![FU4ow2zIuht0CfbRiBJcFZ6RnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/FU4ow2zIuht0CfbRiBJcFZ6RnYf.png)

## Upload data into a managed volume\{#upload-data-into-a-managed-volume}

現在、管理対象ボリュームへデータファイルまたはフォルダーをアップロードできるのは SDK のみです。

1. **ボリュームファイルマネージャーの初期化**

    ボリュームファイルマネージャーは、Zilliz Cloud のボリュームサービス上の特定ボリュームへの接続を維持します。ファイルのアップロード前に、ボリュームファイルマネージャーを初期化する必要があります。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager
    
    volume_file_manager = VolumeFileManager(
        cloud_endpoint='https://api.cloud.zilliz.com',
        api_key='YOUR_API_KEY',
        volume_name='my_volume',
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
        .withVolumeName("my_volume")
        .build();
    
    VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
    ```

    </TabItem>
    </Tabs>

1. **ファイルまたはフォルダーのアップロード**

    ボリュームファイルマネージャーの準備が整ったら、それを使用してファイルまたはフォルダーを指定された管理ボリュームにアップロードします。

    - **ファイルのアップロード**

        次の例では、ソースファイルパスにあるローカルファイルを、ボリューム内のターゲットファイルパスにアップロードします。

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
        #     "volumeName": "my_volume",
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
        //     "volumeName": "my_volume",
        //     "path": "data/"
        // }
        ```

        </TabItem>
        </Tabs>

    - **フォルダのアップロード**

        次の例では、ソースファイルパスにあるローカルファイルをボリューム内のターゲットファイルパスにアップロードします。

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
        #     "volumeName": "my_volume",
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
        //     "volumeName": "my_volume",
        //     "path": "data/"
        // }
        ```

        </TabItem>
        </Tabs>

## マネージドボリュームからデータを削除する\{#delete-data-from-a-managed-volume}

マネージドボリュームからデータを削除するには、ファイルまたはフォルダーのサイズに応じて数分かかる場合があります。

<Admonition type="caution" icon="🚧" title="Warning">

<p>削除されたファイルとフォルダーは<strong>復元できません</strong>。慎重に進めてください。</p>

</Admonition>

現在、マネージドボリュームからデータを削除できるのは Web コンソールのみです。

<Supademo id="cmidzfkoqad9sb7b44vnbfzyd" title=""  />

<Procedures>

1. 左側のナビゲーションで、**ボリュームs** をクリックします。

1. **Files** タブに切り替えます。

1. **Actions** 列で **...** をクリックし、次に **Delete** をクリックします。

</Procedures>

## マネージドボリュームを削除する\{#delete-a-managed-volume}

不要になったマネージドボリュームはいつでも削除できます。なお、無料トライアルボリュームは組織ごとに 1 回のみ作成可能です。一度削除すると、二度と無料トライアルボリュームを作成することはできません。

マネージドボリュームを削除すると、その中の**すべてのファイルとフォルダー**も同時に削除されます。

<Admonition type="caution" icon="🚧" title="Warning">

<p>削除されたボリュームは<strong>復元できません</strong>。慎重に進めてください。</p>

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

    <TabItem value='java'>

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

- **ウェブコンソール経由**

    <Supademo id="cmi77c5554p1gb7b4sqqsm7nn" title=""  />

    <Procedures>

    1. 左側のナビゲーションで、**ボリュームs** をクリックします。

    1. **Actions** 列の **...** をクリックし、**Delete** を選択します。

    1. ボリューム名を入力し、**Delete** をクリックします。

    </Procedures>

## 請求\{#billing}

管理ボリュームを作成する際、**無料トライアル** または **pay-as-you-go** プランのいずれかを選択できます。以下の表は、それぞれの典型的なユースケースと制限を比較したものです。

<table>
   <tr>
     <th></th>
     <th><p><strong>Free Trial</strong></p></th>
     <th><p><strong>Pay-as-you-go</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Use case</strong></p></td>
     <td><p>テスト環境専用です。</p></td>
     <td><p>本番運用用です。</p></td>
   </tr>
   <tr>
     <td><p><strong>Capacity</strong></p></td>
     <td><p>5 GB</p></td>
     <td><p>無制限</p></td>
   </tr>
   <tr>
     <td><p><strong>File size & amount per upload</strong></p></td>
     <td><p>各アップロードで最大 1 GB のデータおよび最大 1,000 ファイル</p></td>
     <td><p>各アップロードで最大 100 GB のデータおよび無制限のファイル数</p></td>
   </tr>
   <tr>
     <td><p><strong>Max. numbers volumes</strong></p></td>
     <td><p>1</p></td>
     <td><p>100</p></td>
   </tr>
</table>

**無料トライアル volume**

- 支払い方法は不要です。

- 各組織は 無料トライアル volume を 1 つのみ保有できます。

- 無料トライアル volume は 30 日間保持され、その後自動的に削除されます。

**従量課金ボリューム**

- 有効な支払い方法が必要です。

- 従量課金ボリューム の利用には料金が発生します。

    - 管理ボリュームが実行されている場合にのみ課金されます。

    - 価格一覧については、[Pricing Guide](http://zilliz.com/pricing/pricing-guide) をご覧ください。

    - ボリューム料金の計算方法については、[Storage Cost](./storage-cost) をご覧ください。

## FAQs\{#faqs}

**請求書の未払いにより組織が凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、無料トライアル および pay-as-you-go を含むすべての管理 ボリューム と、そこに保存されたすべてのファイルが削除され、復元できなくなります。外部ボリュームも凍結され、新しい操作には使用できなくなりますが、お客様自身のバケット内のデータには影響ありません。

ボリュームを引き続き使用するには、まず未払いの請求書をすべて精算してください。

**なぜウェブコンソールで 無料トライアル volume のオプションが表示されないのですか？**

組織に 無料トライアル volume が一度作成されると、無料トライアル volume のオプションは非表示になります。各組織は 無料トライアル volume を 1 つのみ作成できます。

**ボリュームステータスの意味は何ですか？**

以下の表に、考えられるボリュームステータスを示します。

<table>
   <tr>
     <th><p><strong>Status</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Running</strong></p></td>
     <td><p>ボリュームはアクティブで使用可能です。</p></td>
   </tr>
   <tr>
     <td><p><strong>Frozen</strong></p></td>
     <td><p>組織が<a href="./view-invoice">請求書</a>の未払いにより凍結されています。ボリュームは新しい操作に使用できません。ボリュームを引き続き使用するには、お支払いをお願いします。</p></td>
   </tr>
</table>

