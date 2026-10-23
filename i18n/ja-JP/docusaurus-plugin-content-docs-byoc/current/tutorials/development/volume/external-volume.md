---
title: "外部ボリューム | BYOC"
slug: /external-volume
sidebar_label: "外部ボリューム"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部ボリュームは、ご自身のクラウドオブジェクトストレージ内のバケットまたはパス（AWS S3 など）への読み取り専用参照であり、Zilliz Cloud がデータをコピーまたは移動せずにその場でアクセスできるようにします。 | BYOC"
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

外部ボリュームは、ご自身のクラウドオブジェクトストレージ内のバケットまたはパス（AWS S3 など）への読み取り専用参照であり、Zilliz Cloud がデータをコピーまたは移動せずにその場でアクセスできるようにします。

このページでは、Web コンソールと SDK を使用して外部ボリュームを作成および削除する方法について説明します。

## 考慮事項\{#considerations}

- ボリュームは、プロジェクトのクラウドプロバイダーとリージョンに制限されます。たとえば、プロジェクトが AWS us-west-2 にある場合、ボリュームは AWS us-west-2 にのみ作成できます。

- ボリュームをクラスターで使用するには、クラスターがボリュームと同じクラウドプロバイダーおよびリージョンにある必要があります。

- ボリュームを作成および管理するには、**Project Admin** である必要があります。

- ボリュームは作成後に設定を編集できません。ボリューム設定を変更する場合は、目的の設定で新しいボリュームを作成してください。

- 外部ボリュームの場合、データはご自身のバケットに残ります。そのため、データファイルは外部ボリューム上ではなく、ご自身のクラウドオブジェクトストレージで管理する必要があります。

- 各組織は最大 **100 個の外部ボリューム** を作成できます。

## 事前準備\{#before-you-start}

外部ボリュームを作成する前に、[Amazon S3 バケット](./integrate-with-aws-s3) を統合する必要があります。ストレージ統合は、作成する外部ボリュームと同じクラウドプロバイダーおよびリージョンにある必要があることに注意してください。

## 外部ボリュームを作成する\{#create-an-external-volume}

- **SDK を使用する場合**

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
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

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

    パラメーターの説明は以下の通りです。

    | **パラメーター** | **説明** |
    | --- | --- |
    | `projectId` | ボリュームを作成するプロジェクトの ID です。 |
    | `regionId` | 作成するボリュームのリージョンは、データのインポートまたは移行先として計画しているターゲットクラスターのクラウドプロバイダーおよびリージョンと一致する必要があります。 |
    | `volumeName` | 作成するボリュームの名前は、組織全体で一意である必要があり、64 文字以下で、英字またはアンダースコアで始まり、英字、数字、ハイフン、およびアンダースコアのみを含む必要があります。 |
    | `type` | 外部ボリュームを作成するには、このパラメーターを `EXTERNAL` に設定します。デフォルトは `MANAGED` です。 |
    | `storageIntegrationId` | 参照するストレージ統合の ID です。`type=EXTERNAL` の場合は必須です。選択するストレージ統合は、作成する外部ボリュームと同じ組織およびリージョンに属している必要があります。 |
    | `path` | ストレージパスです。`type=EXTERNAL` の場合は必須です。 |
    | `description`（オプション） | 作成するボリュームの説明です。最大 255 文字です。 |

- **Web コンソールを使用する場合**

    <Supademo id="cmo15qfif005fy90jzr8ov1sd" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. ボリュームページで **+ Volume** をクリックします。

    1. ボリューム設定を指定します。

        以下の表は、外部ボリュームの作成時に使用する各パラメーターについて説明します。

        | **パラメーター** | **説明** |
        | --- | --- |
        | Name | ボリューム名は組織全体で一意である必要があり、64 文字以下で、英字またはアンダースコアで始まり、英字、数字、ハイフン、およびアンダースコアのみを含む必要があります。 |
        | Description | このパラメーターはオプションです。最大 255 文字です。 |
        | Volume Type | ボリュームタイプとして「External」を選択します。 |
        | Cloud Provider & Region | ボリュームのクラウドプロバイダーおよびリージョンは、データのインポートまたは移行先として計画しているターゲットクラスターのクラウドプロバイダーおよびリージョンと一致する必要があります。 |
        | Storage Integration & Path | ストレージ統合（[Amazon S3 バケット](./integrate-with-aws-s3)）は、クラウドストレージへのアクセス設定をカプセル化する認証情報オブジェクトです。<br/>パスは、データが配置されている場所を指すポインターです（例: `folder/`）。 |

    1. **Create** をクリックします。

    </Procedures>

## ボリュームを一覧表示する\{#list-volumes}

プロジェクト内の既存のすべてのボリュームを表示できます。

- **SDK を使用する場合**

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
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

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

- **Web コンソールを使用する場合**

    ![PeL0wrKF1hTHvwbNAZBctTQonZf](https://zdoc-images.s3.us-west-2.amazonaws.com/PeL0wrKF1hTHvwbNAZBctTQonZf.png)

## 外部ボリュームの詳細を表示する\{#describe-external-volume}

特定のボリュームの詳細を確認できます。

- **SDK を使用する場合**

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
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

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

- **Web コンソールを使用する場合**

    ![NrgXwPhxGhq78NbBfDYcWc6Ened](https://zdoc-images.s3.us-west-2.amazonaws.com/NrgXwPhxGhq78NbBfDYcWc6Ened.png)

## 外部ボリュームを削除する\{#delete-an-external-volume}

不要になった外部ボリュームはいつでも削除できます。

外部ボリュームを削除すると、Zilliz Cloud からボリュームのメタデータのみが削除されます。データはご自身のクラウドオブジェクトストレージにそのまま残ります。

- **SDK を使用する場合**

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
    // Note: External Volume management with VolumeManager is not supported by milvus-sdk-go as of client/v3.0.0.
    ```

    </TabItem>

    <TabItem value='rust'>

    ```rust
    // Note: External Volume management with VolumeManager is not supported in milvus-sdk-rust as of v3.0.2.
    ```

    </TabItem>

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

- **Web コンソールを使用する場合**

    <Supademo id="cmo168p180083y90jhb7al4cb" title=""  />

    <Procedures>

    1. 左側のナビゲーションで **Volumes** をクリックします。

    1. **Actions** 列の **...** をクリックし、**Delete** を選択します。

    1. ボリューム名を入力し、**Delete** をクリックします。

    </Procedures>

## FAQ\{#faqs}

**組織が請求書の未払いにより凍結された場合、ボリュームはどうなりますか？**

組織が凍結されると、すべてのマネージドボリューム（無料トライアルと従量課金の両方）とそれらに保存されているすべてのファイルが削除され、復元できません。外部ボリュームも凍結され、新しい操作には使用できませんが、ご自身のバケット内のデータは影響を受けません。

ボリュームの使用を継続するには、まず未払いの請求書をすべて決済してください。

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらも、ご自身の S3 または GCS バケットからデータをインポートできます。主な違いは次のとおりです。

- 外部ボリュームでは、認証情報管理のために [Amazon S3 バケット](./integrate-with-aws-s3) を Zilliz Cloud と統合する必要があります。認証情報は一度設定すると、複数のボリュームと操作で再利用されます。データエンジニアはクラウドストレージのキーに直接アクセスする必要はありません。

- 直接 [外部ストレージからのインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、インポートリクエストごとに認証情報（アクセスキーとシークレットキー）を提供する必要があります。これは 1 回限りのインポートには簡単ですが、認証情報の分離や再利用はできません。

**作成後に外部ボリュームのストレージ統合またはパスを変更できますか？**

いいえ。外部ボリュームの作成後に、ストレージ統合とパスを変更することはできません。別のストレージ統合またはパスを使用する場合は、新しい外部ボリュームを作成してください。

**アクティブなジョブまたは外部コレクションから参照されている外部ボリュームを削除できますか？**

いいえ。ダウンストリームの外部コレクションまたはアクティブなジョブがボリュームを参照している場合、削除はブロックされます。

**外部ボリュームを使用すると、データ転送料金が請求されますか？**

いいえ。外部ボリュームは、クラスターと同じクラウドプロバイダーおよびリージョンにある必要があります。すべてのデータアクセスが同じリージョン内で行われるため、Zilliz Cloud ではクロスリージョンのデータ転送料金は発生しません。

**ボリュームのステータスにはどのような意味がありますか？**

以下の表に、使用可能なボリュームステータスを示します。

<table>
   <tr>
     <th><p><strong>ステータス</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Available</strong></p></td>
     <td><p>ボリュームはアクティブで使用可能です。</p></td>
   </tr>
   <tr>
     <td><p><strong>Frozen</strong></p></td>
     <td><p>組織が<a href="/docs/view-invoice">請求書</a>の未払いにより凍結されています。ボリュームは新しい操作には使用できません。ボリュームの使用を継続するには、請求書をお支払いください。</p></td>
   </tr>
   <tr>
     <td><p><strong>Error</strong></p></td>
     <td><p>ストレージ統合の検証に失敗しました。設定を確認して再試行してください。</p><p>適用可能なストレージ統合は次のとおりです。</p><ul><li><a href="./integrate-with-aws-s3">AWS S3 バケット</a></li></ul></td>
   </tr>
</table>
