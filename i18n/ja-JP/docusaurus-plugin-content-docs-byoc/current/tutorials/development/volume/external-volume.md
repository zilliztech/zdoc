---
title: "外部ボリューム | BYOC"
slug: /external-volume
sidebar_label: "外部ボリューム"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部ボリュームは、お客様自身のクラウドオブジェクトストレージ（AWS S3 など）内のバケットまたはパスへの読み取り専用参照であり、Zilliz Cloud がデータをコピーまたは移動せずにその場でアクセスできるようにします。 | BYOC"
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

# 外部ボリューム

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能はすべての AWS リージョンで利用できます。Microsoft Azure では利用できません。Azure でボリュームを使用するには、[お問い合わせください](https://support.zilliz.com/)。

</FeatureNote>

外部ボリュームは、お客様自身のクラウドオブジェクトストレージ（AWS S3 など）内のバケットまたはパスへの読み取り専用参照であり、Zilliz Cloud がデータをコピーまたは移動せずにその場でアクセスできるようにします。 

このページでは、Web コンソールおよび SDK を使用して外部ボリュームを作成および削除する方法を説明します。                      

## 注意事項\{#considerations}

- ボリュームはプロジェクトのクラウドプロバイダーとリージョンに制限されます。たとえば、プロジェクトが AWS us-west-2 にある場合、作成できるボリュームも AWS us-west-2 のみです。

- クラスターでボリュームを使用するには、そのクラスターがボリュームと同じクラウドプロバイダーおよびリージョンに存在している必要があります。

- ボリュームを作成および管理するには、**Project Admin** である必要があります。

- ボリュームは一度作成すると構成を編集できません。ボリュームの設定を変更したい場合は、代わりに希望する設定で新しいボリュームを作成してください。

- 外部ボリュームの場合、データはお客様のバケット内に保持されます。そのため、データファイルは外部ボリューム上ではなく、お客様のクラウドオブジェクトストレージ上で管理する必要があります。

- 各組織では最大 **100 個の外部ボリューム** を作成できます。

## 開始する前に\{#before-you-start}

外部ボリュームを作成する前に、[AWS S3 バケット](./integrate-with-aws-s3) を統合する必要があります。なお、ストレージ統合は、作成したい外部ボリュームと同じクラウドプロバイダーおよびリージョンに存在している必要があります。

## 外部ボリュームを作成する\{#create-an-external-volume}

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

    次の表は各パラメータを説明したものです。

    | **Parameter** | **Description** |
    | --- | --- |
    | `projectId` | ボリュームを作成したいプロジェクトの ID。 |
    | `regionId` | 作成するボリュームのリージョンは、データをインポートまたは移行する対象クラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。 |
    | `volumeName` | 作成するボリュームの名前は組織全体で一意である必要があり、64 文字以下、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含めることができます。 |
    | `type` | 外部ボリュームを作成するには、このパラメータを `EXTERNAL` に設定します。デフォルトは `MANAGED` です。 |
    | `storageIntegrationId` | 参照するストレージ統合の ID。`type=EXTERNAL` の場合に必須です。選択するストレージ統合は、作成したい外部ボリュームと同じ組織およびリージョンに属している必要があります。 |
    | `path` | ストレージパス。`type=EXTERNAL` の場合に必須です。 |
    | `description`(optional) | 作成するボリュームの説明。最大 255 文字。 |

- **Web コンソールを使用する場合**

    <Supademo id="cmo15qfif005fy90jzr8ov1sd" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. Volumes ページで **+ Volume** をクリックします。

    1. ボリュームの設定を行います。

        次の表は、外部ボリュームの作成時に使用する各パラメータを説明したものです。

        | **Parameter** | **Description** |
        | --- | --- |
        | Name | ボリューム名は組織全体で一意である必要があり、64 文字以下、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含めることができます。 |
        | Description | このパラメータは任意です。最大 255 文字。 |
        | Volume Type | ボリュームタイプとして「External」を選択します。 |
        | Cloud Provider & Region | ボリュームのクラウドプロバイダーとリージョンは、データをインポートまたは移行する対象クラスターのクラウドプロバイダーとリージョンに一致している必要があります。 |
        | Storage Integration & Path | ストレージ統合（[AWS S3 バケット](./integrate-with-aws-s3)）は、クラウドストレージのアクセス設定をカプセル化した認証情報オブジェクトです。<br/>Path はデータが配置されている場所を指すポインタです。（例: `folder/`） |

    1. **Create** をクリックします。

    </Procedures>

## ボリュームを一覧表示する\{#list-volumes}

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

    ![PeL0wrKF1hTHvwbNAZBctTQonZf](https://zdoc-images.s3.us-west-2.amazonaws.com/PeL0wrKF1hTHvwbNAZBctTQonZf.png)

## 外部ボリュームの詳細を表示する\{#describe-external-volume}

特定のボリュームの詳細を確認できます。

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
            volume_name="external_volume"
    )
    
    print(f"\ndescVolume results: \n", volume_list.json()['data'])
    
    # descVolume results: 
    # 
    # {
    #    "volumeName": "external_volume",
    #    "type": "EXTERNAL",
    #    "regionId": "aws-us-west-2",
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
        .withCloudEndpoint("https://api.cloud.zilliz.com")
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
    //    "regionId": "aws-us-west-2",
    //    "storageIntegrationId": "integ-lir5xfbcgrkla6fjc39w15qjk",
    //    "path": "",
    //    "status": "RUNNING",
    //    "createTime": "2026-04-27T15:40:53Z"
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
    #        "volumeName": "external_volume",
    #        "type": "EXTERNAL",
    #        "regionId": "aws-us-west-2",
    #        "storageIntegrationId": "si-xxxx",
    #        "path": "data/",
    #        "status": "RUNNING",
    #        "createTime": "2024-04-15T12:00:00Z"
    #    }
    #}
    ```

    </TabItem>
    </Tabs>

- **Web コンソールを使用する場合**

    ![NrgXwPhxGhq78NbBfDYcWc6Ened](https://zdoc-images.s3.us-west-2.amazonaws.com/NrgXwPhxGhq78NbBfDYcWc6Ened.png)

## 外部ボリュームを削除する\{#delete-an-external-volume}

不要になった外部ボリュームはいつでも削除できます。

外部ボリュームを削除しても、Zilliz Cloud から削除されるのはボリュームのメタデータのみであり、データ自体はクラウドオブジェクトストレージ内にそのまま保持されます。 

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
        .withCloudEndpoint("https://api.cloud.zilliz.com")
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

- **Web コンソールを使用する場合**

    <Supademo id="cmo168p180083y90jhb7al4cb" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. **Actions** 列の **...** をクリックし、**Delete** を選択します。

    1. ボリューム名を入力し、**Delete** をクリックします。

    </Procedures>

## FAQs\{#faqs}

**請求書の未払いにより組織が凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、すべてのマネージド Volume（無料トライアルと従量課金の両方）およびそこに保存されているすべてのファイルは削除され、復元できません。外部ボリュームも凍結され、新しい操作には使用できなくなりますが、ご自身のバケット内のデータには影響ありません。

ボリュームの利用を継続するには、まず未払いの請求書をすべて支払ってください。

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらも、ご自身の S3 または GCS バケットからデータをインポートできます。主な違いは次のとおりです。

- 外部ボリュームでは、認証情報管理のために [AWS S3 bucket](./integrate-with-aws-s3) を Zilliz Cloud と統合する必要があります。認証情報は一度設定すれば、複数のボリュームや操作で再利用できます。データエンジニアがクラウドストレージのキーに直接アクセスする必要はありません。

- 直接の [external storage import](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、インポートリクエストごとに認証情報（access key と secret key）を指定する必要があります。これは一度限りのインポートにはより簡単ですが、認証情報の分離や再利用性は提供されません。

**外部ボリューム作成後に、ストレージ統合やパスを変更できますか？**

いいえ。外部ボリュームの作成後は、ストレージ統合およびパスを変更できません。別のストレージ統合またはパスを使用するには、新しい外部ボリュームを作成してください。

**アクティブなジョブまたは external collection から参照されている外部ボリュームを削除できますか？**

いいえ。下流の external collection またはアクティブなジョブがそのボリュームを参照している場合、削除はブロックされます。

**外部ボリュームを使用すると、データ転送料金は発生しますか？**

いいえ。外部ボリュームは、お使いの cluster と同じクラウドプロバイダーおよびリージョン内になければなりません。すべてのデータアクセスは同一リージョン内で行われるため、Zilliz Cloud ではリージョン間のデータ転送料金は発生しません。

**ボリュームのステータスは何を意味しますか？**

以下の表は、可能なボリュームステータスを示しています。

<table>
   <tr>
     <th><p><strong>ステータス</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Available</strong></p></td>
     <td><p>このボリュームはアクティブで、使用可能です。</p></td>
   </tr>
   <tr>
     <td><p><strong>Frozen</strong></p></td>
     <td><p>組織は未払いの<a href="/docs/view-invoice">請求書</a>により凍結されています。このボリュームは新しい操作には使用できません。ボリュームの利用を継続するには、料金をお支払いください。</p></td>
   </tr>
   <tr>
     <td><p><strong>Error</strong></p></td>
     <td><p>ストレージ統合の検証に失敗しました。設定を確認して再試行してください。</p><p>利用可能なアプリケーションストレージ統合は次のとおりです。</p><ul><li><a href="./integrate-with-aws-s3">AWS S3 bucket</a>、</li></ul></td>
   </tr>
</table>

