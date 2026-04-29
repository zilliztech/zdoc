---
title: "外部ボリューム | Cloud"
slug: /external-volume
sidebar_key: external-volume
sidebar_label: "外部ボリューム"
beta: FALSE
notebook: FALSE
description: "外部ボリュームとは、お客様自身のクラウドオブジェクトストレージ（AWS S3 や Google Cloud Storage など）内のバケットまたはパスへの読み取り専用参照であり、Zilliz Cloud がデータをコピーや移動することなくその場でアクセスできるようにします。| Cloud"
type: origin
token: JaLdw76LPiX003kLpKHcA0n8n2d
sidebar_position: 2
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

# 外部ボリューム

外部ボリュームは、お客様自身のクラウドオブジェクトストレージ（AWS S3 や Google Cloud Storage など）内のバケットまたはパスへの読み取り専用参照であり、Zilliz Cloud がデータをコピーまたは移動することなく、その場でデータにアクセスできるようにします。

このページでは、Web コンソールおよび SDK を介して外部ボリュームを作成および削除する方法について説明します。                      

## 考慮事項\{#considerations}

- ボリュームは **AWS** および **Google Cloud** のみで利用可能です。**Azure** については、[サポートにお問い合わせください](https://support.zilliz.com/)。

- ボリュームは、お客様のプロジェクトのクラウドプロバイダーおよびリージョンに制限されます。たとえば、プロジェクトが AWS us-west-2 にある場合、作成できるボリュームは AWS us-west-2 のみに限定されます。

- クラスターでボリュームを使用するには、クラスターがボリュームと同じクラウドプロバイダーおよびリージョンにある必要があります。

- ボリュームを作成および管理するには、**プロジェクト管理者** である必要があります。

- ボリュームの設定は一度作成すると編集できません。ボリューム設定を変更したい場合は、希望する設定で新しいボリュームを作成してください。

- 外部ボリュームの場合、データはお客様のバケット内に残ります。したがって、データファイルの管理は外部ボリュームではなく、お客様のクラウドオブジェクトストレージで行う必要があります。

- 各組織で作成できる外部ボリュームの最大数は **100** です。

## 事前準備\{#before-you-start}

外部ボリュームを作成する前に、[AWS S3 バケット](./integrate-with-aws-s3)、[Google GCS バケット](./integrate-with-gcp)、または [Azure blob コンテナ](./integrate-with-azure-blob-storage) を統合する必要があります。ストレージ統合は、作成しようとする外部ボリュームと同じクラウドプロバイダーおよびリージョンにある必要があることに注意してください。

## 外部ボリュームの作成\{#create-an-external-volume}

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

    <TabItem value='java'>

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
         <td><p>作成するボリュームのリージョンは、データのインポートまたは移行先のターゲットクラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。</p></td>
       </tr>
       <tr>
         <td><p><code>volumeName</code></p></td>
         <td><p>作成するボリュームの名前は、組織全体で一意である必要があり、64 文字以下で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含めることができます。</p></td>
       </tr>
       <tr>
         <td><p><code>type</code></p></td>
         <td><p>外部ボリュームを作成するには、このパラメーターを <code>EXTERNAL</code> に設定します。デフォルトは <code>MANAGED</code> です。</p></td>
       </tr>
       <tr>
         <td><p><code>storageIntegrationId</code></p></td>
         <td><p>参照するストレージ統合の ID。<code>type=EXTERNAL</code> の場合に必須です。選択するストレージ統合は、作成する外部ボリュームと同じ組織およびリージョンに属している必要があります。</p></td>
       </tr>
       <tr>
         <td><p><code>path</code></p></td>
         <td><p>ストレージパス。<code>type=EXTERNAL</code> の場合に必須です。</p></td>
       </tr>
    </table>

- **ウェブコンソール経由**

    <Supademo id="cmo15qfif005fy90jzr8ov1sd" title=""  />

    <Procedures>

    1. 左側のナビゲーションで、**ボリュームs** をクリックします。

    1. ボリュームページで、**+ ボリューム** をクリックします。

    1. ボリュームの設定を行います。

        以下の表は、外部ボリュームを作成する際に使用される各パラメーターについて説明しています。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>Name</p></td>
             <td><p>ボリューム名は、組織全体で一意である必要があり、64 文字以下で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含めることができます。</p></td>
           </tr>
           <tr>
             <td><p>Description</p></td>
             <td><p>このパラメーターはオプションです。</p></td>
           </tr>
           <tr>
             <td><p>ボリューム Type</p></td>
             <td><p>ボリュームタイプとして「External」を選択します。</p></td>
           </tr>
           <tr>
             <td><p>クラウドプロバイダーとリージョン</p></td>
             <td><p>ボリュームのクラウドプロバイダーおよびリージョンは、データのインポートまたは移行先のターゲットクラスターのクラウドプロバイダーおよびリージョンと一致している必要があります。</p></td>
           </tr>
           <tr>
             <td><p>ストレージ統合とパス</p></td>
             <td><p>ストレージ統合（<a href="./integrate-with-aws-s3">AWS S3 bucket</a>、<a href="./integrate-with-gcp">Google GCS bucket</a>、または <a href="./integrate-with-azure-blob-storage">Azure blob container</a>）は、クラウドストレージへのアクセス設定をカプセル化する認証情報オブジェクトです。</p><p>パスは、データが配置されている場所へのポインターです。（例：<code>folder/</code>）</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## View external volumes\{#view-external-volumes}

プロジェクト内の既存のすべてのボリュームを表示できます。

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

- **ウェブコンソール経由**

    ![PeL0wrKF1hTHvwbNAZBctTQonZf](https://zdoc-images.s3.us-west-2.amazonaws.com/PeL0wrKF1hTHvwbNAZBctTQonZf.png)

## ボリュームの詳細を確認する\{#check-volume-details}

特定のボリュームの詳細を確認できます。

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

- **ウェブコンソール経由**

    ![NrgXwPhxGhq78NbBfDYcWc6Ened](https://zdoc-images.s3.us-west-2.amazonaws.com/NrgXwPhxGhq78NbBfDYcWc6Ened.png)

## 外部ボリュームの削除\{#delete-an-external-volume}

不要になった外部ボリュームはいつでも削除できます。

外部ボリュームを削除しても、Zilliz Cloud からボリュームのメタデータが削除されるだけであり、データはクラウドオブジェクトストレージ上にそのまま残ります。

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

    <Supademo id="cmo168p180083y90jhb7al4cb" title=""  />

    <Procedures>

    1. 左側のナビゲーションで、**ボリュームs** をクリックします。

    1. **Actions** 列の **...** をクリックし、**Delete** を選択します。

    1. ボリューム名を入力し、**Delete** をクリックします。

    </Procedures>

## 請求\{#billing}

外部ボリュームの作成および利用において、Zilliz Cloud からの請求は発生しません。支払い方法も不要です。

ただし、インポートまたは移行中に Zilliz Cloud がお客様のバケットからデータを読み取る際、クラウドプロバイダーからデータリクエスト料金が請求される場合があります。詳細については、[Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/) または [Google Cloud Storage Pricing](https://cloud.google.com/storage/pricing.) をご覧ください。

## FAQs\{#faqs}

**未払い請求書により組織が凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、管理対象のすべての ボリューム（無料トライアルおよび従量課金制の両方）と、そこに保存されているすべてのファイルが削除され、復元できなくなります。外部ボリュームも凍結され、新しい操作には使用できなくなりますが、お客様自身のバケット内のデータには影響ありません。

ボリュームの使用を継続するには、まず未払いの請求書をすべて精算してください。

**外部ボリュームと、外部ストレージからの直接インポートの違いは何ですか？**

どちらも、お客様自身の S3 または GCS バケットからデータをインポートできます。主な違いは以下の通りです。

- 外部ボリュームでは、認証情報の管理に [storage integration](null) を使用します。認証情報は一度設定すれば、複数のボリュームや操作で再利用できます。データエンジニアはクラウドストレージキーに直接アクセスする必要がありません。

- 直接 [external storage import](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、各インポートリクエストごとに認証情報（アクセスキー、シークレットキー）をインラインで提供する必要があります。これは一回限りのインポートには簡単ですが、認証情報の分離や再利用性は提供されません。

**外部ボリューム作成後に、ストレージ統合やパスを変更できますか？**

いいえ。外部ボリュームの作成後、ストレージ統合やパスは変更できません。異なるストレージ統合やパスを使用するには、新しい外部ボリュームを作成してください。

**アクティブなジョブや外部コレクションから参照されている外部ボリュームを削除できますか？**

いいえ。下流の外部コレクションやアクティブなジョブがボリュームを参照している場合、削除はブロックされます。

**外部ボリュームを使用すると、データ転送料金が請求されますか？**

いいえ。外部ボリュームは、クラスターと同じクラウドプロバイダーおよびリージョンにある必要があります。すべてのデータアクセスが同一リージョン内で完結するため、Zilliz Cloud 上でクロスリージョンのデータ転送料金は発生しません。

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
     <td><p>未払いの <a href="./view-invoice">請求書</a> により組織が凍結されています。ボリュームは新しい操作に使用できません。ボリュームの使用を継続するには、お支払いをお願いします。</p></td>
   </tr>
   <tr>
     <td><p><strong>Error</strong></p></td>
     <td><p><a href="null">storage integration</a> の検証に失敗しました。設定を確認して再試行してください。</p></td>
   </tr>
</table>

