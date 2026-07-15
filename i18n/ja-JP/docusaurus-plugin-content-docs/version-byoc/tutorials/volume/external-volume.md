---
title: "外部ボリューム | Cloud"
slug: /external-volume
sidebar_key: external-volume
sidebar_label: "外部ボリューム"
beta: FALSE
notebook: FALSE
description: "外部ボリュームは、お客様のクラウドオブジェクトストレージ（AWS S3 や Google Cloud Storage など）内のバケットやパスへの読み取り専用の参照であり、Zilliz Cloud がデータをコピーまたは移動することなくその場でアクセスできるようにします。 | Cloud"
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

外部ボリュームは、お客様のクラウドオブジェクトストレージ（AWS S3 や Google Cloud Storage など）内のバケットまたはパスへの読み取り専用の参照であり、Zilliz Cloud がデータをコピーまたは移動することなく、その場でデータにアクセスできるようにします。

このページでは、Web コンソールと SDK を使用して外部ボリュームを作成および削除する方法について説明します。

## 考慮事項\{#considerations}

- ボリュームは **AWS** と **Google Cloud** でのみ利用可能です。**Azure** の場合は、[サポートにお問い合わせ](https://support.zilliz.com/) ください。

- ボリュームはプロジェクトのクラウドプロバイダーとリージョンに制限されます。例えば、プロジェクトが AWS us-west-2 にある場合、AWS us-west-2 のボリュームのみを作成できます。

- ボリュームをクラスターで使用するには、クラスターがボリュームと同じクラウドプロバイダーおよびリージョンに存在する必要があります。

- ボリュームを作成および管理するには、**プロジェクト管理者** である必要があります。

- ボリュームが作成されると、その設定を編集することはできません。ボリュームの設定を変更したい場合は、必要な設定で新しいボリュームを作成してください。

- 外部ボリュームでは、データはお客様のバケットに残ります。そのため、データファイルは外部ボリュームではなく、お客様のクラウドオブジェクトストレージで管理する必要があります。

- 各組織は最大 **100 個の外部ボリューム** を作成できます。

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

    <TabItem value='java'>

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

    次の表にパラメーターを説明します。

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
         <td><p>作成するボリュームのリージョンは、データのインポートまたは移行を予定しているターゲットクラスターのクラウドプロバイダーとリージョンと一致している必要があります。</p></td>
       </tr>
       <tr>
         <td><p><code>volumeName</code></p></td>
         <td><p>作成するボリュームの名前は、組織全体で一意である必要があり、64 文字以内で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含む必要があります。</p></td>
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
       <tr>
         <td><p><code>description</code>（オプション）</p></td>
         <td><p>作成するボリュームの説明です。最大 255 文字です。</p></td>
       </tr>
    </table>

- **ウェブコンソール経由**

    <Supademo id="cmo15qfif005fy90jzr8ov1sd" title=""  />

    <Procedures>

    1. 左側のナビゲーションで、**ボリュームs** をクリックします。

    1. ボリュームページで、**+ ボリューム** をクリックします。

    1. ボリュームの設定を行います。

        外部ボリュームの作成時に使用する各パラメーターの説明を次の表に示します。

        <table>
           <tr>
             <th><p><strong>パラメーター</strong></p></th>
             <th><p><strong>説明</strong></p></th>
           </tr>
           <tr>
             <td><p>Name</p></td>
             <td><p>ボリューム名は、組織全体で一意である必要があり、64 文字以内で、文字またはアンダースコアで始まり、文字、数字、ハイフン、アンダースコアのみを含む必要があります。</p></td>
           </tr>
           <tr>
             <td><p>Description</p></td>
             <td><p>このパラメーターはオプションです。最大 255 文字です。</p></td>
           </tr>
           <tr>
             <td><p>ボリューム Type</p></td>
             <td><p>ボリュームタイプとして「External」を選択します。</p></td>
           </tr>
           <tr>
             <td><p>クラウドプロバイダーとリージョン</p></td>
             <td><p>ボリュームのクラウドプロバイダーとリージョンは、データのインポートまたは移行を予定しているターゲットクラスターのクラウドプロバイダーとリージョンと一致している必要があります。</p></td>
           </tr>
           <tr>
             <td><p>ストレージ統合とパス</p></td>
             <td><p>ストレージ統合（<a href="./integrate-with-aws-s3">AWS S3 バケット</a>、<a href="./integrate-with-gcp">Google GCS バケット</a>、または <a href="./integrate-with-azure-blob-storage">Azure BLOB コンテナー</a>）は、クラウドストレージのアクセス設定をカプセル化した認証情報オブジェクトです。</p><p>パスは、データが配置されている場所へのポインターです。（例: <code>folder/</code>）</p></td>
           </tr>
        </table>

    1. **Create** をクリックします。

    </Procedures>

## ボリュームの一覧表示\{#list-volumes}

プロジェクト内のすべての既存ボリュームを表示できます。

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

    <TabItem value='java'>

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

- **ウェブコンソール経由**

    ![PeL0wrKF1hTHvwbNAZBctTQonZf](https://zdoc-images.s3.us-west-2.amazonaws.com/PeL0wrKF1hTHvwbNAZBctTQonZf.png)

## Describe  external volume\{#describe-external-volume}

特定のボリュームの詳細を確認できます。

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

    <TabItem value='java'>

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

- **ウェブコンソール経由**

    ![NrgXwPhxGhq78NbBfDYcWc6Ened](https://zdoc-images.s3.us-west-2.amazonaws.com/NrgXwPhxGhq78NbBfDYcWc6Ened.png)

## 外部ボリュームの削除\{#delete-an-external-volume}

不要になった場合は、いつでも外部ボリュームを削除できます。

外部ボリュームの削除は、Zilliz Cloud からボリュームのメタデータのみを削除します。データはクラウドオブジェクトストレージにそのまま残ります。

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

    <TabItem value='java'>

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

- **ウェブコンソール経由**

    <Supademo id="cmo168p180083y90jhb7al4cb" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **ボリュームs** をクリックします。

    1. **Actions** 列の **...** をクリックし、**Delete** を選択します。

    1. ボリューム名を入力し、**Delete** をクリックします。

    </Procedures>

## 請求\{#billing}

外部ボリュームの作成と使用には、Zilliz Cloud の料金は発生しません。お支払い方法の登録は不要です。

ただし、インポートまたは移行時に Zilliz Cloud がバケットから読み取る際、クラウドプロバイダーがデータリクエスト料金を請求する場合があります。詳細については、[Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/) または [Google Cloud Storage Pricing](https://cloud.google.com/storage/pricing.) を参照してください。

## FAQs\{#faqs}

**請求書の未払いにより組織が凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、管理対象のすべての ボリューム — 無料トライアルおよび従量課金制の両方 — およびそれらに保存されているすべてのファイルが削除され、復元することはできません。外部ボリュームも凍結され、新しい操作には使用できなくなりますが、お客様のバケット内のデータには影響しません。

ボリュームの使用を継続するには、まずすべての未払いの請求書を精算してください。

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらもお客様の S3 または GCS バケットからデータをインポートできます。主な違いは以下の通りです。

- 外部ボリュームでは、[AWS S3 bucket](./integrate-with-aws-s3)、[Google Cloud Storage bucket](./integrate-with-gcp)、または [Microsoft Azure blob storage container](./integrate-with-azure-blob-storage) を Zilliz Cloud と統合して、認証情報の管理を行う必要があります。認証情報は一度設定すれば、複数のボリュームや操作で再利用できます。データエンジニアはクラウドストレージのキーに直接アクセスする必要はありません。

- 直接の [external storage import](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、各インポートリクエストごとに認証情報（アクセスキー、シークレットキー）をインラインで提供する必要があります。これは一度限りのインポートにはシンプルですが、認証情報の分離や再利用性は提供しません。

**外部ボリューム作成後に、ストレージ統合やパスを変更できますか？**

～しない。外部ボリューム作成後、ストレージ統合とパスは変更できません。別のストレージ統合やパスを使用する場合は、新しい外部ボリュームを作成してください。

**アクティブなジョブや外部コレクションから参照されている外部ボリュームを削除できますか？**

～しない。ダウンストリームの外部コレクションまたはアクティブなジョブがボリュームを参照している場合、削除はブロックされます。

**外部ボリュームの使用時にデータ転送料金は請求されますか？**

～しない。外部ボリュームは、クラスターと同じクラウドプロバイダーおよびリージョンに存在する必要があります。すべてのデータアクセスは同一リージョン内で発生するため、Zilliz Cloud ではリージョン間データ転送料金は発生しません。

**ボリュームのステータスはどのような意味ですか？**

以下の表に、考えられるボリュームのステータスを示します。

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
     <td><p>The organization is frozen due to overdue <a href="null">invoices</a>. The volume cannot be used for new operations. Please pay your bill to continue using volumes.</p></td>
   </tr>
   <tr>
     <td><p><strong>Error</strong></p></td>
     <td><p>The <a href="null">storage integration</a> validation failed. Check the configuration and retry.</p></td>
   </tr>
</table>
